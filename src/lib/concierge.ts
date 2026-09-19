import { menu, type MenuCategory, type MenuItem } from "./menu";
import { business, faqs } from "./faq";

/**
 * The concierge's "brain". Deterministic and entirely client-side: it only
 * ever answers from the menu, hours, address and FAQ that already live on the
 * site, so it can't invent anything on the shop's behalf. The chat UI doesn't
 * know or care how a reply is produced, so this can later be swapped for a
 * grounded LLM without touching the widget.
 */

export type Hit = { item: MenuItem; category: MenuCategory };

export type Reply = {
  text: string;
  items?: Hit[];
  chips?: string[];
  link?: { label: string; href: string; scrollTo?: string };
};

const DEFAULT_CHIPS = [
  "What's good?",
  "Hours & location",
  "Do you have Wi-Fi?",
  "Show me the matcha",
];

export const OPENING: Reply = {
  text: "Hi! I can help with the menu, prices, hours, where to find us, Wi-Fi — that kind of thing. What are you after?",
  chips: DEFAULT_CHIPS,
};

// Common typos and shorthand seen in real chat, corrected as whole words before
// anything else runs. This catches far more real messages than the matching
// logic below ever could on its own.
const SPELLING_FIXES: [RegExp, string][] = [
  [/\bexpress?o\b/g, "espresso"],
  [/\bespreso\b/g, "espresso"],
  [/\bcapp?uccino\b/g, "cappuccino"],
  [/\bcapuccino\b/g, "cappuccino"],
  [/\bmach?iat+o\b/g, "macchiato"],
  [/\blatt+e\b/g, "latte"],
  [/\bmocc?a\b/g, "mocha"],
  [/\bmatcha+\b/g, "matcha"],
  [/\bmatch\b/g, "matcha"],
  [/\bfrap+e?\b/g, "frappe"],
  [/\bfrapp?uccino\b/g, "frappe"],
  [/\byuzu\b/g, "yuzo"],
  [/\btapa+\b/g, "tapa"],
  [/\bsandwh?i?ch\b/g, "sandwich"],
  [/\bbrekk?y\b/g, "breakfast"],
  [/\bbrekfast\b/g, "breakfast"],
  [/\bcarbonara+\b/g, "carbonara"],
  [/\bwifi?\b/g, "wifi"],
  [/\bwi fi\b/g, "wifi"],
  [/\bweath?er\b/g, "weather"],
  [/\bhrs\b/g, "hours"],
  [/\baddres+s?\b/g, "address"],
  [/\bpls\b/g, "please"],
  [/\bpo\b/g, ""],
];

const normalize = (s: string) => {
  let out = s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9₱ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  for (const [pattern, fix] of SPELLING_FIXES) out = out.replace(pattern, fix);
  return out.replace(/\s+/g, " ").trim();
};

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

// Whole word/phrase, not a substring of a longer word — stops "coffee" from
// tripping "chip" or "hot" from tripping "shot".
const hasWord = (q: string, ...words: string[]) =>
  words.some((w) => new RegExp(`\\b${w.replace(/\s+/g, "\\s+")}\\b`).test(q));

// Levenshtein distance, capped early once it exceeds max (cheap for short words).
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    let rowMin = dp[0];
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      rowMin = Math.min(rowMin, dp[j]);
      prev = tmp;
    }
    if (rowMin > max) return max + 1;
  }
  return dp[b.length];
}

const fuzzyTolerance = (len: number) => (len <= 4 ? 0 : len <= 7 ? 1 : 2);

const fuzzyIncludes = (word: string, target: string) =>
  editDistance(word, target, fuzzyTolerance(Math.max(word.length, target.length))) <=
  fuzzyTolerance(Math.max(word.length, target.length));

// The lowest way to order the item (hot is usually cheaper than iced).
const numericPrice = (item: MenuItem) => {
  const candidates = [item.price, item.hotPrice, item.icedPrice]
    .map((p) => Number(p))
    .filter((n) => n > 0);
  return candidates.length ? Math.min(...candidates) : 0;
};

const allHits = (): Hit[] =>
  menu.flatMap((category) => category.items.map((item) => ({ item, category })));

const findByName = (name: string): Hit | undefined =>
  allHits().find((h) => h.item.name.toLowerCase() === name.toLowerCase());

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  espresso: ["espresso", "americano", "cappuccino", "macchiato", "cold brew", "coffee", "brew", "latte"],
  matcha: ["matcha"],
  "non-coffee": ["non coffee", "noncoffee", "without coffee", "no coffee", "chocolate drink", "hot chocolate", "hot choco", "choco"],
  frappe: ["frappe", "blended"],
  tea: ["tea", "teas", "iced tea"],
  mains: ["pasta", "rice", "meal", "meals", "burger", "burgers", "carbonara", "pesto", "lunch", "dinner"],
  breakfast: ["breakfast", "brunch", "pancake", "pancakes", "waffle", "waffles", "toast", "muffin", "tapa"],
  snacks: ["snack", "snacks", "bites", "wedges", "tenders", "skewers", "grilled cheese", "sandwich", "fries"],
};

function matchCategory(q: string): MenuCategory | undefined {
  let best: { cat: MenuCategory; len: number } | undefined;
  for (const cat of menu) {
    for (const kw of CATEGORY_KEYWORDS[cat.id] ?? []) {
      if (q.includes(kw) && (!best || kw.length > best.len)) best = { cat, len: kw.length };
    }
  }
  return best?.cat;
}

const GENERIC_WORDS = new Set([
  "iced", "hot", "coffee", "tea", "matcha", "latte", "chocolate", "frappe",
  "chicken", "beef", "breakfast", "series", "based", "with", "and", "the",
]);

function matchItems(q: string): Hit[] {
  const hits = allHits();
  const exact = hits.filter((h) => q.includes(h.item.name.toLowerCase()));
  if (exact.length) {
    // "spanish latte" should not also return "Latte".
    return exact.filter(
      (h) =>
        !exact.some(
          (o) =>
            o !== h &&
            o.item.name.length > h.item.name.length &&
            o.item.name.toLowerCase().includes(h.item.name.toLowerCase())
        )
    );
  }

  // Fall back to distinctive words, tolerating small typos ("carbonarra",
  // "espreso", "machiato") rather than requiring an exact prefix.
  const words = q.split(" ").filter((w) => w.length >= 4 && !GENERIC_WORDS.has(w));
  if (!words.length) return [];
  const scored = hits
    .map((h) => {
      const nameWords = h.item.name.toLowerCase().split(/[\s&]+/);
      const score = words.filter((w) =>
        nameWords.some((n) => n.startsWith(w) || fuzzyIncludes(w, n))
      ).length;
      return { h, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((x) => x.h);
}

function pick(names: string[]): Hit[] {
  return names.map(findByName).filter((h): h is Hit => !!h);
}

// A handful of picks per category for "what's good in your matcha series"-type
// questions, so a category doesn't get ignored in favour of the generic list.
const CATEGORY_PICKS: Record<string, string[]> = {
  espresso: ["Spanish Latte", "Cold Brew", "Caramel Macchiato"],
  matcha: ["Dirty Matcha", "Strawberry Matcha", "Matcha"],
  "non-coffee": ["White Chocolate", "Strawberry Frappe"],
  frappe: ["Salted Caramel", "Toffee Nut"],
  tea: ["Passionfruit Iced Tea", "Peach Iced Tea"],
  mains: ["Carbonara", "Chicken Pesto"],
  breakfast: ["American Breakfast", "French Toast"],
  snacks: ["Honey Buffalo Tenders", "Grilled Cheese"],
};

function recommendInCategory(category: MenuCategory): Reply {
  const names = CATEGORY_PICKS[category.id] ?? category.items.slice(0, 3).map((i) => i.name);
  return {
    text: `From ${category.title}, these are the ones people ask for most:`,
    items: pick(names),
    chips: [`Show me all of ${category.title.split(" ")[0]}`, "What's good?", "Open the menu"],
  };
}

function recommend(q: string): Reply {
  const menuChip = "Open the menu";
  const negative = hasWord(q, "not", "no", "dont", "isnt", "arent", "less", "skip", "avoid", "without");

  // "recommend a matcha" / "what's good in the tea" should stay in that category.
  const category = matchCategory(q);
  if (category) return recommendInCategory(category);

  // "not sweet" / "no sugar" should steer away from the sweet picks, not into them.
  if (negative && has(q, "sweet", "sugar")) {
    return {
      text: "Not a sweet tooth? These lean more roasty than sugary:",
      items: pick(["Espresso", "Americano", "Cold Brew", "English Breakfast Hot Tea"]),
      chips: ["Something strong", "Something cold", menuChip],
    };
  }
  // "cold weather" must win over "cold" below.
  if (has(q, "rainy", "cold weather", "warm me", "hot drink", "cozy", "cosy", "chilly", "something warm")) {
    return {
      text: "Warm and comforting — try one of these hot:",
      items: pick(["Spanish Latte", "Cappuccino", "Matcha", "Chocolate"]),
      chips: ["Something sweet", "Something to eat", menuChip],
    };
  }
  if (has(q, "iced", "cold", "hot day", "hot out", "humid", "refresh", "summer", "cool")) {
    return {
      text: "For something cold, these are the ones people come back for:",
      items: pick(["Spanish Latte", "Strawberry Matcha", "Passionfruit Iced Tea", "Cold Brew"]),
      chips: ["Something sweet", "Something strong", menuChip],
    };
  }
  if (!negative && has(q, "sweet", "dessert", "treat", "sugar")) {
    return {
      text: "On the sweeter side:",
      items: pick(["White Mocha", "Choco Butternut", "Strawberry Matcha", "Caramel Macchiato"]),
      chips: ["Something strong", "Something cold", menuChip],
    };
  }
  if (has(q, "strong", "caffeine", "tired", "sleepy", "wake", "energy", "kick", "bitter")) {
    return {
      text: "When you need the caffeine to do its job:",
      items: pick(["Espresso", "Cold Brew", "Dirty Matcha", "Americano"]),
      chips: ["Something sweet", "Something cold", menuChip],
    };
  }
  if (hasWord(q, "quick", "fast", "grab and go", "takeout", "take out", "to go")) {
    return {
      text: "Quick to make and easy to take with you:",
      items: pick(["Espresso", "Cold Brew", "Americano", "Grilled Cheese"]),
      chips: ["Something cold", "Something to eat", menuChip],
    };
  }
  if (has(q, "eat", "food", "hungry", "meal", "lunch", "dinner", "snack")) {
    return {
      text: "Regulars rave about the tenders and the grilled cheese. A few favourites:",
      items: pick(["Honey Buffalo Tenders", "Grilled Cheese", "Carbonara", "American Breakfast"]),
      chips: ["Show me breakfast", "Show me snacks", menuChip],
    };
  }
  return {
    text: "Going by what guests mention most: the Spanish Latte, the matcha (Dirty Matcha if you want coffee in it), and the chicken tenders.",
    items: pick(["Spanish Latte", "Dirty Matcha", "Honey Buffalo Tenders", "Grilled Cheese"]),
    chips: ["Something cold", "Something sweet", "Something to eat", menuChip],
  };
}

// The priciest way to order the item, mirroring numericPrice's "lowest" logic
// (iced/hot variants can differ, so "most expensive" should reflect the top end).
const numericPriceHigh = (item: MenuItem) => {
  const candidates = [item.price, item.hotPrice, item.icedPrice]
    .map((p) => Number(p))
    .filter((n) => n > 0);
  return candidates.length ? Math.max(...candidates) : 0;
};

const DRINK_CATEGORIES = new Set(["espresso", "matcha", "non-coffee", "frappe", "tea"]);
const FOOD_CATEGORIES = new Set(["mains", "breakfast", "snacks"]);

// "cheapest drink" or "most expensive food" without a specific category still
// needs scoping — otherwise a price search silently mixes drinks and meals,
// which reads as wrong even though nothing crashed (e.g. "most expensive
// drink" returning the 330PHP breakfast plate).
function scopedPool(q: string, category?: MenuCategory): Hit[] {
  if (category) return category.items.map((item) => ({ item, category }));
  if (has(q, "drink", "beverage", "coffee", "sip"))
    return allHits().filter((h) => DRINK_CATEGORIES.has(h.category.id));
  if (has(q, "food", "meal", "dish", "eat", "snack"))
    return allHits().filter((h) => FOOD_CATEGORIES.has(h.category.id));
  return allHits();
}

function priciestFilter(q: string, category?: MenuCategory): Reply | undefined {
  if (
    !has(q, "expensive", "priciest", "costliest", "premium", "pricey") &&
    !(has(q, "highest", "top") && has(q, "price", "priced", "cost"))
  ) {
    return undefined;
  }

  const pool = scopedPool(q, category);
  const hits = pool
    .filter((h) => numericPriceHigh(h.item) > 0)
    .sort((a, b) => numericPriceHigh(b.item) - numericPriceHigh(a.item))
    .slice(0, 5);

  if (!hits.length) return undefined;

  const scope = category ? ` in ${category.title}` : "";
  const one = hits.length === 1;
  return {
    text: one
      ? `That'd be the ${hits[0].item.name} at ${numericPriceHigh(hits[0].item)}PHP.`
      : `The priciest${scope}:`,
    items: hits,
    chips: ["What's cheapest?", "What's good?", "Open the menu"],
  };
}

function priceFilter(q: string, category?: MenuCategory): Reply | undefined {
  const m = q.match(/(?:under|below|less than|max|up to|within|budget of)\s*₱?\s*(\d{2,4})/);
  const cheap = has(q, "cheap", "cheapest", "budget", "affordable", "lowest");
  if (!m && !cheap) return undefined;

  const limit = m ? Number(m[1]) : 160;
  const pool = scopedPool(q, category);
  const hits = pool
    .filter((h) => numericPrice(h.item) > 0 && numericPrice(h.item) <= limit)
    .sort((a, b) => numericPrice(a.item) - numericPrice(b.item))
    .slice(0, 8);

  const scope = category ? ` from ${category.title}` : "";
  if (!hits.length) {
    const cheapest = pool
      .filter((h) => numericPrice(h.item) > 0)
      .sort((a, b) => numericPrice(a.item) - numericPrice(b.item))
      .slice(0, 3);
    const from = cheapest[0] ? numericPrice(cheapest[0].item) : 0;
    return {
      text: cheapest.length
        ? `Nothing${category ? ` in ${category.title}` : ""} is ${limit}PHP or under — the most affordable start${cheapest.length > 1 ? "" : "s"} at ${from}PHP:`
        : `Nothing comes in at ${limit}PHP or under.`,
      items: cheapest,
      chips: ["Under 150", "Show me tea", "Open the menu"],
    };
  }
  return {
    text: `Here's what${scope} comes in at ${limit}PHP or under:`,
    items: hits,
    chips: ["What's good?", "Open the menu"],
  };
}

export function answer(raw: string): Reply {
  const q = normalize(raw);
  if (!q) return OPENING;

  /* --- small talk --- */
  if (/^(hi|hello|hey|yo|sup|howdy|good ?(morning|afternoon|evening|day)|kumusta|kamusta|magandang)\b/.test(q)) {
    return {
      text: "Hello! Ask me about the menu, prices, hours, or how to find the shop.",
      chips: DEFAULT_CHIPS,
    };
  }
  if (has(q, "thank", "salamat")) {
    return { text: "Anytime. See you at Y Street!", chips: ["What's good?", "Hours & location"] };
  }
  if (has(q, "what can you do", "help me", "what do you do", "how does this work", "what are you")) {
    return {
      text: "I know the full menu with prices, hours, directions, Wi-Fi, and the house rules — ask me anything along those lines.",
      chips: DEFAULT_CHIPS,
    };
  }
  if (has(q, "are you") && has(q, "real", "human", "ai", "bot", "robot")) {
    return {
      text: "I'm an automated concierge — quick with the menu and the practical stuff. For anything I can't answer, the team's a message away.",
      chips: DEFAULT_CHIPS,
    };
  }

  /* --- practical info --- */
  const asksHours = has(q, "hour", "open", "close", "closing", "what time", "until", "sunday", "weekend", "holiday");
  const asksWhere = has(q, "where", "location", "address", "direction", "map", "find you", "how to get", "located", "parking", "park");
  if (asksHours && asksWhere) {
    return {
      text: `${business.hours}. We're at ${business.address} — the white building with the tall arched windows on Taft North, with parking out front.`,
      link: { label: "Get directions", href: business.directionsUrl },
      chips: ["Do you have Wi-Fi?", "What's good?"],
    };
  }
  if (asksHours) {
    return {
      text: `${business.hours}, including weekends.`,
      chips: ["Where are you?", "Do you have Wi-Fi?", "What's good?"],
    };
  }
  if (asksWhere) {
    return {
      text: `${business.address}. Look for the white building with the tall arched windows on Taft North — there's parking right out front.`,
      link: { label: "Get directions", href: business.directionsUrl },
      chips: ["What are your hours?", "Do you have Wi-Fi?"],
    };
  }
  if (has(q, "wifi", "internet", "charg", "outlet", "socket", "plug", "laptop", "study", "work", "remote")) {
    return {
      text: "Yes — free Wi-Fi and charging outlets, and regulars say it's a quiet spot for working. Mornings are the calmest.",
      chips: ["What are your hours?", "Something strong", "Where are you?"],
    };
  }
  if (has(q, "contact", "email", "instagram", "message", "dm", "phone", "call", "number", "reach")) {
    return {
      text: `Email ${business.email}, or message ${business.instagram} on Instagram.`,
      link: { label: "Open Instagram", href: business.instagramUrl },
      chips: ["Where are you?", "What's good?"],
    };
  }
  if (hasWord(q, "pet", "dog", "cat") || has(q, "outside food", "bring food", "own food", "smok")) {
    return {
      text: "Outside food isn't allowed, and pets aren't permitted inside the shop.",
      chips: ["Do you serve food?", "What are your hours?"],
    };
  }
  if (has(q, "reserv", "book a table", "booking", "event", "party", "cater", "deliver", "grab", "foodpanda", "gcash", "card")) {
    return {
      text: `That's one for the team directly — email ${business.email} or DM ${business.instagram} and they'll sort you out.`,
      link: { label: "Message on Instagram", href: business.instagramUrl },
      chips: ["What's good?", "Hours & location"],
    };
  }

  /* --- menu --- */
  const category = matchCategory(q);

  const priced = priceFilter(q, category);
  if (priced) return priced;

  const priciest = priciestFilter(q, category);
  if (priciest) return priciest;

  const wantsPick = has(q, "recommend", "suggest", "whats good", "what is good", "best", "popular", "favourite", "favorite", "must try", "signature", "bestseller", "number one", "something ") || hasWord(q, "top");
  const hasMood = has(q, "caffeine", "tired", "sleepy", "wake", "energy", "hungry", "sweet", "rainy", "chilly", "hot day", "humid", "refresh", "bitter", "quick", "cold", "cool", "iced", "warm") || hasWord(q, "fast");
  if (wantsPick || hasMood) {
    return recommend(q);
  }

  const items = matchItems(q);
  const askingForCategory = has(q, "show", "list", "all", "what do you have", "options", "menu", "kinds", "types");
  if (items.length && !(askingForCategory && category)) {
    const one = items.length === 1;
    const comparing = items.length > 1 && has(q, " or ", " vs ", " versus ", "compare", "difference");
    return {
      text: one
        ? `${items[0].item.name} — ${items[0].item.description ?? `from our ${items[0].category.title.toLowerCase()}.`}`
        : comparing
          ? "Here's how they compare:"
          : "Here's what matches:",
      items,
      chips: [
        `Show me ${items[0].category.title.split(" ")[0].toLowerCase()}`,
        "What's good?",
        "Open the menu",
      ],
    };
  }

  if (category) {
    return {
      text: `${category.title}${category.subtitle ? ` — ${category.subtitle.toLowerCase()}` : ""}:`,
      items: category.items.map((item) => ({ item, category })),
      chips: ["Something cheaper", "Recommend me one", "Open the menu"],
      link: { label: "See it in the menu", href: "#menu", scrollTo: "#menu" },
    };
  }

  if (has(q, "serve", "food", "eat", "menu", "drink", "sell")) {
    return {
      text: "The menu covers espresso drinks, matcha, frappes, tea, rice meals and pasta, all-day breakfast, and snacks. Which sounds good?",
      chips: ["Show me espresso", "Show me matcha", "Show me breakfast", "Show me snacks"],
      link: { label: "Open the menu", href: "#menu", scrollTo: "#menu" },
    };
  }

  /* --- FAQ safety net --- */
  const stop = new Set(["have", "your", "there", "exactly", "what", "when", "where", "does", "just", "good", "spot", "with", "that", "this", "from", "they", "them", "some", "about", "also", "bring", "serve", "food", "coffee", "study", "work", "touch"]);
  const faq = faqs.find((f) =>
    normalize(f.q)
      .split(" ")
      .filter((w) => w.length > 3 && !stop.has(w))
      .some((w) => q.includes(w))
  );
  if (faq) return { text: faq.a, chips: DEFAULT_CHIPS };

  return {
    text: `I'm best with the menu, prices, hours, and where to find the shop. For anything else, the team's quickest to reach at ${business.email} or ${business.instagram}.`,
    link: { label: "Message on Instagram", href: business.instagramUrl },
    chips: DEFAULT_CHIPS,
  };
}
