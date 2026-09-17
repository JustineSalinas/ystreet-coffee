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

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9₱ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

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
  espresso: ["espresso", "americano", "cappuccino", "macchiato", "cold brew", "coffee", "brew"],
  matcha: ["matcha"],
  "non-coffee": ["non coffee", "noncoffee", "without coffee", "no coffee", "chocolate drink", "hot chocolate", "hot choco", "choco"],
  frappe: ["frappe", "frappuccino", "blended", "frappes"],
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

  // Fall back to distinctive single words ("carbonara", "yuzo", "tapa").
  const words = q.split(" ").filter((w) => w.length >= 4);
  const generic = new Set(["iced", "hot", "coffee", "tea", "matcha", "latte", "chocolate", "frappe", "chicken", "beef", "breakfast", "series", "based"]);
  const scored = hits
    .map((h) => {
      const nameWords = h.item.name.toLowerCase().split(/[\s&]+/);
      const score = words.filter((w) => !generic.has(w) && nameWords.some((n) => n.startsWith(w))).length;
      return { h, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((x) => x.h);
}

function pick(names: string[]): Hit[] {
  return names.map(findByName).filter((h): h is Hit => !!h);
}

function recommend(q: string): Reply {
  const menuChip = "Open the menu";
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
  if (has(q, "sweet", "dessert", "treat", "sugar")) {
    return {
      text: "On the sweeter side:",
      items: pick(["White Mocha", "Choco Butternut", "Strawberry Matcha", "Caramel Macchiato"]),
      chips: ["Something strong", "Something cold", menuChip],
    };
  }
  if (has(q, "strong", "caffeine", "tired", "sleepy", "wake", "energy", "kick")) {
    return {
      text: "When you need the caffeine to do its job:",
      items: pick(["Espresso", "Cold Brew", "Dirty Matcha", "Americano"]),
      chips: ["Something sweet", "Something cold", menuChip],
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

function priceFilter(q: string, category?: MenuCategory): Reply | undefined {
  const m = q.match(/(?:under|below|less than|max|up to|within|budget of)\s*₱?\s*(\d{2,4})/);
  const cheap = has(q, "cheap", "cheapest", "budget", "affordable", "lowest");
  if (!m && !cheap) return undefined;

  const limit = m ? Number(m[1]) : 160;
  const pool = category
    ? category.items.map((item) => ({ item, category }))
    : allHits();
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
      text: category
        ? `Nothing in ${category.title} is ${limit}PHP or under — the most affordable start at ${from}PHP:`
        : `Nothing comes in at ${limit}PHP or under. The most affordable is the Espresso at 80PHP.`,
      items: category ? cheapest : pick(["Espresso"]),
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
  if (/^(hi|hello|hey|yo|good (morning|afternoon|evening)|kumusta|kamusta)\b/.test(q)) {
    return {
      text: "Hello! Ask me about the menu, prices, hours, or how to find the shop.",
      chips: DEFAULT_CHIPS,
    };
  }
  if (has(q, "thank", "salamat")) {
    return { text: "Anytime. See you at Y Street!", chips: ["What's good?", "Hours & location"] };
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
  if (has(q, "wifi", "wi fi", "internet", "charg", "outlet", "socket", "plug", "laptop", "study", "work", "remote")) {
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
  if (has(q, "pet", "dog", "cat", "outside food", "bring food", "own food", "smok")) {
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

  const wantsPick = has(q, "recommend", "suggest", "whats good", "what is good", "best", "popular", "favourite", "favorite", "must try", "signature", "something ");
  const hasMood = has(q, "caffeine", "tired", "sleepy", "wake", "energy", "hungry", "sweet", "rainy", "chilly", "hot day", "humid", "refresh");
  if (wantsPick || hasMood) {
    return recommend(q);
  }

  const items = matchItems(q);
  const askingForCategory = has(q, "show", "list", "all", "what do you have", "options", "menu", "kinds", "types");
  if (items.length && !(askingForCategory && category)) {
    const one = items.length === 1;
    return {
      text: one
        ? `${items[0].item.name} — ${items[0].item.description ?? `from our ${items[0].category.title.toLowerCase()}.`}`
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
