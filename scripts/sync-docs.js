// Copies the public docs listed in content/docs/index.js from the sibling voult repos,
// rewriting links between them to /docs/<slug>. Usage: npm run docs:sync [-- <voult.dev dir>]
const fs = require('fs');
const path = require('path');
const docs = require('../content/docs');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const out = path.join(__dirname, '..', 'content', 'docs');
const bySrc = new Map(docs.map((d) => [path.join(root, d.src), d.slug]));
const npm = (pkg) => `https://www.npmjs.com/package/@voult/${pkg === 'voult-sdk' ? 'sdk' : pkg}`;

for (const d of docs) {
  const file = path.join(root, d.src);
  const md = fs.readFileSync(file, 'utf8').replace(/\[([^\]]+)\]\((\.{1,2}\/[^)#\s]*)(#[^)\s]*)?\)/g, (all, text, href, hash = '') => {
    const target = path.resolve(path.dirname(file), href);
    if (bySrc.has(target)) return `[${text}](/docs/${bySrc.get(target)}${hash})`;
    const pkg = target.match(/voult-sdk\/packages\/([^/]+)\/?$/);
    if (pkg) return `[${text}](${npm(pkg[1])})`;
    return text; // internal doc that isn't published: keep the words, drop the link
  });
  fs.writeFileSync(path.join(out, `${d.slug}.md`), md);
  console.log(`${d.src} → content/docs/${d.slug}.md`);
}
