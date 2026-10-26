# Servet Efe Tekin: personal site

A cork board of pins. Drag a pin (About, Experience, Projects, Skills, CV,
Contact) into the strip on the right and the board slides over to show that
section's papers. Click or tap a pin to do the same; drag it back out, press
Escape or use "back to the board" to return. Experience and Research open as
boards of their own: drop a role or project on their right-hand strip to focus
it, and its bullet points and photos appear as separate pins you can move.
Every level is linkable, e.g. `/#projects` or `/#experience/squarepoint-quant`.

- Content lives in `src/data/portfolio.ts`; the CV PDF is `public/cv-servet-efetekin.pdf`.
- Photos for a role or research project go in `public/` and are listed in that entry's `images` array; until then placeholders are shown.
- `src/components/DragBoard.tsx` is the reusable board (pins, drop zone, slide); `PinBoard.tsx` stacks the levels; `Papers.tsx` holds the section pages and `Detail.tsx` the focused pins.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export to out/
```

Deployed on Vercel from `main`.
