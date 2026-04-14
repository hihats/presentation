/**
 * generate-index.mjs
 *
 * dist/ ディレクトリ内の Marp スライド (.md) をスキャンし、
 * カード型のインデックスページ (dist/index.html) を生成する。
 *
 * - 各 .md のフロントマターから title / description を取得
 * - 同名の .png をサムネイルとして利用
 * - 外部依存なし (Node.js 標準モジュールのみ)
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, basename, extname } from "node:path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DIST_DIR = process.argv[2] || "dist";
const SITE_TITLE = "@hihats presentations";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** YAML フロントマターからキーを取得 (簡易パーサー) */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const frontmatter = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^(\w[\w-]*):\s*(.+)/);
    if (m) {
      frontmatter[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
    }
  }
  return frontmatter;
}

/** HTML エスケープ */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const files = readdirSync(DIST_DIR);

// .md ファイルを収集 (demo/ 配下は除外)
const slides = files
  .filter((f) => extname(f) === ".md")
  .map((mdFile) => {
    const stem = basename(mdFile, ".md");
    const mdPath = join(DIST_DIR, mdFile);
    const content = readFileSync(mdPath, "utf-8");
    const fm = parseFrontmatter(content);

    const htmlFile = `${stem}.html`;
    const pngFile = `${stem}.png`;
    const hasHtml = files.includes(htmlFile);
    const hasPng = files.includes(pngFile);

    return {
      stem,
      title: fm.title || stem,
      description: fm.description || "",
      htmlFile: hasHtml ? htmlFile : null,
      pngFile: hasPng ? pngFile : null,
      mdFile,
    };
  })
  .filter((s) => s.htmlFile); // HTML が存在するもののみ

// タイトルの五十音順 (日本語考慮) でソート
slides.sort((a, b) => a.title.localeCompare(b.title, "ja"));

// ---------------------------------------------------------------------------
// HTML 生成
// ---------------------------------------------------------------------------

const cards = slides
  .map((s) => {
    const thumbHtml = s.pngFile
      ? `<div class="thumb"><img src="${escapeHtml(s.pngFile)}" alt="${escapeHtml(s.title)}" loading="lazy"></div>`
      : `<div class="thumb"><div class="thumb-placeholder">${escapeHtml(s.title)}</div></div>`;

    return `
      <a class="card" href="${escapeHtml(s.htmlFile)}">
        ${thumbHtml}
        <div class="info">
          <h2>${escapeHtml(s.title)}</h2>
          <span class="path">${escapeHtml(s.mdFile)}</span>
        </div>
      </a>`;
  })
  .join("\n");

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(SITE_TITLE)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: Raleway, HelveticaNeue, "Helvetica Neue", Helvetica, Arial, sans-serif;
      background: #fff;
      color: #222;
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header {
      background: #fff;
      color: #222;
      padding: 3rem 1.5rem 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    header h1 {
      font-size: 2.4rem;
      font-weight: 300;
      letter-spacing: -1px;
    }
    header p {
      margin-top: .3rem;
      font-size: .85rem;
      color: #999;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
      max-width: 1200px;
      margin: 1.5rem auto 3rem;
      padding: 0 1.5rem;
      flex: 1;
    }

    .card {
      display: flex;
      flex-direction: column;
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: transform .15s, box-shadow .15s;
    }
    .card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(0,0,0,.08);
    }

    .thumb {
      position: relative;
      width: 100%;
      padding-top: 56.25%;
      background: #f5f5f5;
      overflow: hidden;
    }
    .thumb img {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      object-fit: cover;
    }
    .thumb-placeholder {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .9rem;
      color: #999;
      padding: 1rem;
      text-align: center;
    }

    .info {
      padding: .9rem 1rem;
    }
    .info h2 {
      font-size: .95rem;
      font-weight: 400;
      color: #222;
      line-height: 1.4;
    }
    .info .path {
      display: block;
      margin-top: .3rem;
      font-size: .75rem;
      color: #bbb;
    }

    footer {
      background: #313131;
      text-align: center;
      padding: 1.2rem 1rem;
      font-size: .75rem;
    }
    footer a {
      color: #fff;
      text-decoration: none;
    }
    footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(SITE_TITLE)}</h1>
    <p>${slides.length} slides</p>
  </header>
  <div class="grid">
    ${cards}
  </div>
  <footer><a href="https://hihats.pro">hihats.pro</a></footer>
  <script>
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      document.querySelectorAll('a.card').forEach(a => {
        a.href = a.href.replace(/\\.html$/, '.md');
      });
    }
  </script>
</body>
</html>
`;

const outPath = join(DIST_DIR, "index.html");
writeFileSync(outPath, html, "utf-8");

console.log(`✅ Generated ${outPath} with ${slides.length} slide(s)`);
