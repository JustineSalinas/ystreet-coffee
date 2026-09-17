export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: "When are you open?",
    a: "Every day, 10AM to 10PM — including weekends.",
  },
  {
    q: "Where exactly are you, and is there parking?",
    a: "Villa Alegre Subd., Brgy. Buhang, Taft North St., Mandurriao, Iloilo City. Look for the white building with the tall arched windows — there's parking right out front.",
  },
  {
    q: "Do you have Wi-Fi and charging?",
    a: "Yes. Free Wi-Fi and charging outlets, so you're welcome to settle in with a laptop or a book.",
  },
  {
    q: "Is it a good spot to study or work?",
    a: "Regulars think so — it's quiet, the seating is comfortable for long stays, and mornings are the calmest if you want the place mostly to yourself.",
  },
  {
    q: "Do you serve food, or just coffee?",
    a: "A full menu: espresso drinks, matcha, frappes, tea, rice meals and pasta, all-day breakfast, and snacks. Flip through the menu book above for everything with prices.",
  },
  {
    q: "Can I bring outside food or my pet?",
    a: "Outside food isn't allowed, and pets aren't permitted inside the shop.",
  },
  {
    q: "How can I get in touch?",
    a: "Email ystreetcoffee@gmail.com, or message us on Instagram at @ystreetcoffee.",
  },
];

export const business = {
  name: "Y Street Coffee",
  hours: "Open daily, 10AM – 10PM",
  address:
    "Villa Alegre Subd., Brgy. Buhang, Taft North St., Mandurriao, Iloilo City, Philippines, 5000",
  email: "ystreetcoffee@gmail.com",
  instagram: "@ystreetcoffee",
  instagramUrl: "https://www.instagram.com/ystreetcoffee",
  directionsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(
      "Y Street Coffee, Villa Alegre Subd., Brgy. Buhang, Taft North St., Mandurriao, Iloilo City, Philippines, 5000"
    ),
};
