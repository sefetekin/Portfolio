# Servet Efe Tekin: personal site

A cork board of pins. Drag a pin (About, Experience, Projects, Skills, CV,
Contact) into the strip on the right and the board slides over to show that
section's papers. Click or tap a pin to do the same; drag it back out, press
Escape or use "back to the board" to return. Sections are linkable, e.g. `/#projects`.

- Content lives in `src/data/portfolio.ts`; the CV PDF is `public/cv-servet-efetekin.pdf`.
- The board is `src/components/PinBoard.tsx`; each section's papers are in `src/components/Papers.tsx`.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export to out/
```

Deployed on Vercel from `main`.
