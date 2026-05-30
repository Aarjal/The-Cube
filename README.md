# THE CUBE

An immersive Next.js experience that turns a Rubik's Cube into a cinematic, scroll-driven motion piece. The project combines authentic cube mechanics, animated beat text, particle effects, and a premium dark visual style.

## Features

- Scroll-synced Rubik's Cube animation
- Authentic cube move logic and face rotation handling
- Dynamic beat overlays with titles and subtitles
- Loading screen with motion-based progress
- Particle effects layered behind the cube
- Premium, minimal UI built with Tailwind CSS and Framer Motion

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion

## Project Structure

- `src/app` — app shell, layout, global styles, and homepage
- `src/components/RubiksCubeSequence.tsx` — scroll experience, beat overlays, and rendering loop
- `src/lib/cubeEngine.ts` — cube state, move definitions, and scroll-to-cube mapping
- `src/lib/cubeRenderer.ts` — canvas rendering and particle drawing

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm


## How It Works

The homepage is split into three parts:

1. A full-screen intro section
2. A scrollable cube sequence with animated beat messages
3. A closing outro section

As you scroll, the cube advances through a predefined move sequence and the overlay text updates to match each turn.

## Customization

- Edit the cube moves and timing in `src/lib/cubeEngine.ts`
- Update the on-screen messages in `src/components/RubiksCubeSequence.tsx`
- Adjust the visual design in `src/app/globals.css` and the Tailwind classes in the components

## Deployment

This project can be deployed like any standard Next.js app.

```bash
npm run build
npm run start
```

Or deploy it to a platform such as Vercel.

## License

No license has been specified yet.
