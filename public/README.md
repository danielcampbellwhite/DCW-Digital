# Public assets

Static files served from the site root (`/`).

| File | Purpose | Action before launch |
| --- | --- | --- |
| `favicon.svg` | Brand favicon (DCW monogram) | Optional: refine |
| `daniel-campbell-white-cv.pdf` | The downloadable CV linked from the nav, hero and CTAs | **Replace this placeholder with the real CV** |

The Open Graph / social share image is generated dynamically at
`src/app/opengraph-image.tsx` — there is no static `og.png` to maintain.

Add real project screenshots and a professional headshot here when available,
then swap the gradient placeholders (`ProjectVisual`, About page) for
`next/image` components pointing at them.
