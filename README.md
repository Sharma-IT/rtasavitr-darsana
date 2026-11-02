# Ṛtasavitṛ Darśana

A Circular-Recursive Ontology of Experience and Its Terminus, by Shubham Sharma.

The site at https://rtasavitr-darsana.netlify.app is a single landing page that serves the work as the original Word document.

## Publishing a new version

Replace the document in `site/` with the new `RD_v<N>.docx` (delete the old one, so exactly one remains) and push to `main`. Netlify builds the page from whatever document it finds: the download link, version, Word's page count and the file size all come from the file itself.

The build fails, and the live site stays as it was, if `site/` holds no document, more than one, or one without Word's page statistics.

## Layout

- `site/index.html` is the page template; `{{file}}`, `{{version}}`, `{{pages}}` and `{{size}}` are filled at build time.
- `build/` holds the dependency-free builder Netlify runs, its tests, and dev-only tooling (Stryker, ESLint) installed with `npm install` inside `build/`.
- `dist/` is the build output and is not committed.
