// Renders content/docs/*.md once at startup. Re-run `npm run docs:sync` and restart to pick up changes.
const fs = require('fs');
const path = require('path');
const { Marked } = require('marked');
const manifest = require('../content/docs');

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function render(md) {
  const seen = new Map();
  const toc = [];
  let hasDiagram = false;
  const marked = new Marked({
    renderer: {
      // GitHub-style ids, so the docs' own #anchor links keep working.
      heading({ tokens, depth, text }) {
        const base = text.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\w\- ]/g, '').replace(/ /g, '-');
        const n = seen.get(base) || 0;
        seen.set(base, n + 1);
        const id = n ? `${base}-${n}` : base;
        const html = this.parser.parseInline(tokens);
        if (depth === 2) toc.push({ id, html });
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}">${html}</a></h${depth}>\n`;
      },
      code({ text, lang }) {
        if (lang === 'mermaid') {
          hasDiagram = true;
          return `<pre class="mermaid">${escape(text)}</pre>\n`;
        }
        return false; // default renderer
      },
      table(token) {
        return `<div class="docs-table">${this.constructor.prototype.table.call(this, token)}</div>`;
      },
    },
  });
  return { html: marked.parse(md), toc, hasDiagram };
}

const pages = manifest.map((d) => ({
  ...d,
  ...render(fs.readFileSync(path.join(__dirname, '..', 'content', 'docs', `${d.slug}.md`), 'utf8')),
}));

module.exports = { pages };
