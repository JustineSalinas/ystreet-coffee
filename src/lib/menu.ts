export type MenuItem = {
  name: string;
  price: string;
  hotPrice?: string;
  icedPrice?: string;
  description?: string;
  image?: string;
};

export type MenuCategory = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  items: MenuItem[];
};

export const menu: MenuCategory[] = [
  {
    id: "espresso",
    title: "Espresso Bar",
    subtitle: "Pulled to order, no shortcuts",
    image: "/images/barista-1.jpg",
    items: [
      { name: "Espresso", price: "80" },
      { name: "Americano", price: "", hotPrice: "130", icedPrice: "140" },
      { name: "Orange Americano", price: "160" },
      { name: "Cappuccino", price: "", hotPrice: "140", icedPrice: "150" },
      {
        name: "Latte",
        price: "",
        hotPrice: "150",
        icedPrice: "160",
        image: "/images/latte-and-machine.jpg",
        description: "Espresso combined with velvety textured milk.",
      },
      { name: "Mocha", price: "", hotPrice: "170", icedPrice: "175" },
      { name: "White Mocha", price: "", hotPrice: "170", icedPrice: "180" },
      { name: "Caramel Macchiato", price: "", hotPrice: "170", icedPrice: "180" },
      { name: "Spanish Latte", price: "", hotPrice: "170", icedPrice: "180" },
      { name: "Cold Brew", price: "160" },
      { name: "Spritzy Americano", price: "160" },
      { name: "Yuzo Espresso", price: "160" },
    ],
  },
  {
    id: "matcha",
    title: "Matcha Series",
    subtitle: "Stone-ground, whisked fresh",
    image: "/images/drink-matcha-hand.jpg",
    items: [
      {
        name: "Matcha",
        price: "",
        hotPrice: "180",
        icedPrice: "190",
        image: "/images/drink-matcha-hand.jpg",
        description: "Stone-ground ceremonial green tea whisked fresh with milk.",
      },
      { name: "Dirty Matcha", price: "220" },
      { name: "Strawberry Matcha", price: "210" },
      { name: "Chocolate Matcha", price: "210" },
      { name: "Matcha Frappe", price: "200" },
    ],
  },
  {
    id: "non-coffee",
    title: "Non-Coffee Drinks",
    image: "/images/counter-drinks.jpg",
    items: [
      { name: "Chocolate", price: "", hotPrice: "170", icedPrice: "180" },
      { name: "White Chocolate", price: "", hotPrice: "170", icedPrice: "180" },
      { name: "Strawberry Frappe", price: "195" },
      { name: "Chocolate Frappe", price: "195" },
    ],
  },
  {
    id: "frappe",
    title: "Coffee-Based Frappe",
    image: "/images/latte-and-machine.jpg",
    items: [
      { name: "Toffee Nut", price: "195" },
      { name: "Chocolate Macadamia", price: "195" },
      { name: "Mocha", price: "195" },
      { name: "Salted Caramel", price: "195" },
      { name: "Choco Butternut", price: "195" },
      { name: "Caramel", price: "195" },
    ],
  },
  {
    id: "tea",
    title: "Tea",
    subtitle: "Freshly brewed iced, or steeped hot",
    image: "/images/drinks-and-treats.jpg",
    items: [
      { name: "Passionfruit Iced Tea", price: "160" },
      { name: "Black Iced Tea", price: "140" },
      { name: "Strawberry Iced Tea", price: "160" },
      { name: "Peach Iced Tea", price: "160" },
      { name: "Peppermint Hot Tea", price: "110" },
      { name: "Premium Ceylon Hot Tea", price: "100" },
      { name: "English Breakfast Hot Tea", price: "110" },
    ],
  },
  {
    id: "mains",
    title: "Rice Meals & Pasta",
    image: "/images/interior-wide.jpg",
    items: [
      { name: "Carbonara", price: "230", description: "Classic carbonara finished with crispy bacon." },
      { name: "Chicken Pesto", price: "230", description: "Grilled chicken paired with basil pesto pasta." },
      { name: "Italian Pasta", price: "230", description: "Comforting tomato pasta topped with homemade meatballs." },
      { name: "Beef Burger", price: "190", description: "Juicy beef patty with cheese, lettuce, and tomato." },
      { name: "Chicken Burger", price: "170", description: "Golden fried chicken with homemade buns and house sauce." },
    ],
  },
  {
    id: "breakfast",
    title: "Breakfast",
    subtitle: "Served all day",
    image: "/images/breakfast-plate.jpg",
    items: [
      { name: "Sausage & Egg Muffin", price: "185", description: "Savory sausage, egg, and melted cheese in a toasted muffin." },
      { name: "Filipino Breakfast", price: "300", description: "Steamed rice, eggs, and local favorites for a hearty start." },
      { name: "French Toast", price: "170", description: "Golden toast dusted with sugar, served with syrup." },
      { name: "Classic Trio", price: "250", description: "Pancakes, bacon, and eggs cooked just right." },
      { name: "American Breakfast", price: "330", description: "Waffles, eggs, sausage, and breakfast potatoes.", image: "/images/breakfast-plate.jpg" },
    ],
  },
  {
    id: "snacks",
    title: "Snacks & Bites",
    image: "/images/grilled-cheese.jpg",
    items: [
      { name: "Potato Wedges", price: "200", description: "Crispy seasoned wedges served with ketchup.", image: "/images/potato-wedges.jpg" },
      { name: "Honey Buffalo Tenders", price: "270", description: "Crispy chicken strips glazed with buffalo sauce and homemade ranch dip." },
      { name: "Chicken Skewers", price: "240", description: "Grilled chicken skewers served with rice and dip." },
      { name: "Beef Tapa", price: "270", description: "Tender beef tapa with egg, and rice." },
      { name: "Grilled Cheese", price: "200", description: "Toasted french loaf filled with gooey melted cheese.", image: "/images/grilled-cheese.jpg" },
    ],
  },
];
