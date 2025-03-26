# Spinning Emoji Generator

A Next.js application that creates animated GIFs featuring spinning emojis with orbital animations. Built with Three.js and React.

## Features

- Create animated GIFs with spinning emojis
- Customizable animation parameters (speed, size, rotation)
- Multiple orbiting elements with different behaviors
- Smooth animations with configurable frame rates
- Easy to modify for different emoji themes (desert, cowboy, etc.)

## Current Theme: Desert Scene

The current version (v1) features a desert-themed animation with:
- A central spinning cactus (🌵)
- Orbiting desert elements (🦎, 🦂, 🌞)
- Rotating tumbleweeds (🌾)

## Tech Stack

- Next.js 14 (App Router)
- React
- Three.js
- TypeScript
- Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

Click the "Record GIF" button to generate a 3-second animated GIF of the current scene.