# Y Street Coffee

Official website for **Y Street Coffee**, a minimalist coffee bar in Mandurriao, Iloilo City.

## Features

- **Interactive Menu Book**: Classic printed-menu aesthetic with realistic interactive page flips, hot/iced prices, and category jumps.
- **3D Walkthrough Preview**: Interactive Three.js / React Three Fiber storefront walkthrough with support for LiDAR/Polycam 3D scan drops (`public/models/shop-tour.glb`).
- **Grounded Concierge Chat**: Offline instant assistant answering visitor queries on menu items, prices, opening hours, location, and policies.
- **Atmospheric Visuals & Gallery**: Showcasing signature drinks, dishes, and storefront ambiance.
- **Smooth Navigation & FAQ**: Accordion FAQ and fluid Lenis scrolling.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI & Animation**: React 19, Tailwind CSS v4, Framer Motion, Lucide Icons
- **3D**: Three.js, React Three Fiber, Drei, Google Model Viewer
- **Language**: TypeScript

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build & Quality Checks

```bash
npm run lint   # Run ESLint validation
npm run build  # Generate production build
npm run start  # Start production server
```

## Adding a Real 3D Storefront Scan

Place an exported `.glb` file at `public/models/shop-tour.glb`. The Virtual Tour section will automatically detect and render the scan. See [public/models/README.md](public/models/README.md) for capture instructions.
