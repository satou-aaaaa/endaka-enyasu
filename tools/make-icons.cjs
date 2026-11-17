// アプリのアイコン（icon-192.png・icon-512.png）を作る。紺の地に、円とドルの2枚の硬貨と、行き来する矢印。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#123554"/>
      <circle cx="34" cy="40" r="22" fill="#f6d77a"/><text x="34" y="49" font-size="26" font-weight="900" text-anchor="middle" fill="#123554" font-family="sans-serif">¥</text>
      <circle cx="66" cy="64" r="22" fill="#fffdf7"/><text x="66" y="73" font-size="26" font-weight="900" text-anchor="middle" fill="#123554" font-family="sans-serif">$</text>
      <path d="M62 22 q18 2 20 18" stroke="#fffdf7" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M38 82 q-18 -2 -20 -18" stroke="#f6d77a" stroke-width="5" fill="none" stroke-linecap="round"/></svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
