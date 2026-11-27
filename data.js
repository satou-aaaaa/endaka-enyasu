// 円高・円安どっちの問題を作る（ブラウザと node の両方で使う）。
// 中身は、日本銀行「教えて！にちぎん」（下の SRC）で確かめたことだけ（2026-11-17 に読んだ）。
//  - 円高は、円1単位で交換できるほかの通貨が多い状態。円安はその逆（1ドル＝100円→80円は円高、→125円は円安）。
//  - 為替相場は、だれかが一方的に決めるのではなく、市場の需要と供給のバランスで決まる。
// 輸出・輸入・旅行の影響は、資料の定義から「何円になるか」をコードで計算して答えを決める（言い切りの説明を足さない）。
// レートと値段はすべて練習用の作り話。実際の相場・予想・投資の助言は出さない。人・会社・お店の名前は出さない。
// 1問は、交換の場面を見て答えを選ぶ。正解したら2段目「円高？円安？」を選ぶ。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ tag なら、どの端末でも同じ問題になる。
// KINDS・言い回しの並びは最後に足すだけにする（並べ替え・削除をすると過去の日の問題が変わる）。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出典（画面の「なぜ」に出す）
  const SRC = {
    g18: ["日本銀行「円高、円安とは何ですか？」（教えて！にちぎん）", "https://www.boj.or.jp/about/education/oshiete/intl/g18.htm"],
    g17: ["日本銀行「為替相場（為替レート）とは何ですか？」（教えて！にちぎん）", "https://www.boj.or.jp/about/education/oshiete/intl/g17.htm"],
  };

  // 2段目「円高？円安？」。どの問題も、前と今のレート（または需要と供給の向き）で決まる。「どちらでもない」は、変わったことに気づけるかを見る選び肢
  const GROUPS = {
    daka: { name: "円高", sub: "1ドルと交換する円が少なくなった（円の値打ちが上がった）" },
    yasu: { name: "円安", sub: "1ドルと交換する円が多くなった（円の値打ちが下がった）" },
    onaji: { name: "どちらでもない", sub: "1ドルと交換する円は変わっていない" }, // 答えにはならない（レートはいつも変わる場面だけ）
  };

  // part:ri:begin（shared-workflows の template/parts/data/ri.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  // part:ri:end
  const pick = (R, a) => a[ri(R, 0, a.length - 1)];
  // part:shuffle:begin（shared-workflows の template/parts/data/shuffle.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function shuffle(R, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = ri(R, 0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  // part:shuffle:end
  // part:pickN:begin（shared-workflows の template/parts/data/pickN.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function pickN(R, a, n) { return shuffle(R, a).slice(0, n); }
  // part:pickN:end
  // 数を「12,000」の形に（端末の言語設定で変わらないように自前で書く）
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const yen = (n) => fmt(n) + "円";
  const MEDIA = ["ニュースの一場面", "社会の授業", "両替所の案内", "旅行の計画", "お店の仕入れ"];
  const RATES = [80, 90, 100, 110, 120, 125, 130, 140, 150, 160];
  // 前のレート a と今のレート b（ちがう2つ）
  function twoRates(R) { const a = pick(R, RATES); let b = pick(R, RATES); if (b === a) b = RATES[(RATES.indexOf(a) + 1 + ri(R, 0, RATES.length - 2)) % RATES.length]; return [a, b]; }
  const dirOf = (a, b) => (b < a ? "daka" : "yasu");
  const was = (a, b) => `1ドル＝${a}円だったのが、1ドル＝${b}円になった。`;
  // 選び肢をそろえる（正解を先頭に入れ、重ならない・0より大きいものだけ n 個）
  function optsOf(R, ans, cands, n) { const out = [ans]; for (const c of cands) { if (out.length >= n) break; if (c && !out.includes(c)) out.push(c); } return shuffle(R, out); }

  // ---- 種類ごとの問題の作り方。R：乱数、lv：むずかしさ。q：問い、opts：選び肢、ans：答え、grp：2段目の答え、v：作った中身の印 ----
  const MK = {
    // 円の値打ちは上がった？下がった？
    atai(R) {
      const [a, b] = twoRates(R), m = ri(R, 0, MEDIA.length - 1), up = b < a;
      const ans = up ? "円の値打ちが上がった" : "円の値打ちが下がった";
      return { media: MEDIA[m], q: was(a, b) + "　円の値打ちは？", opts: shuffle(R, ["円の値打ちが上がった", "円の値打ちが下がった", "円の値打ちは変わらない"]), ans, grp: dirOf(a, b), v: `${a}:${b}:${m}`,
        why: `1ドルと交換するのに要る円が${a}円から${b}円に${up ? "減った" : "増えた"}ので、円の値打ちは${up ? "上がりました（円高）" : "下がりました（円安）"}。` };
    },
    // 円をドルに両替すると何ドル？
    ryogae(R, lv) {
      const [a, b] = twoRates(R), n = pick(R, [20, 50, 100, 200, 300]), y = b * n, m = ri(R, 0, MEDIA.length - 1);
      const c = [y % a === 0 ? y / a : 0, n * 2, Math.round(n / 2), n + 10, n * 10].map((x) => (x > 0 ? x + "ドル" : 0));
      return { media: MEDIA[m], q: `前は1ドル＝${a}円だった。今は1ドル＝${b}円。　今、${yen(y)}をドルに両替すると何ドル？`, opts: optsOf(R, n + "ドル", c, lv === 0 ? 3 : 4), ans: n + "ドル", grp: dirOf(a, b), v: `${a}:${b}:${n}:${m}`,
        why: `${fmt(y)}÷${b}＝${n}なので${n}ドルです。前の1ドル＝${a}円と比べて、1ドルに要る円が${b < a ? "減った" : "増えた"}ので${b < a ? "円高" : "円安"}です。` };
    },
    // ドルの値段は何円？
    nedan(R, lv) {
      const [a, b] = twoRates(R), d = pick(R, [5, 10, 20, 30, 50]), m = ri(R, 0, MEDIA.length - 1), ans = yen(d * b);
      const c = [yen(d * a), yen(d + b), yen(d * b * 10), yen(d * (b + 5))];
      return { media: MEDIA[m], q: `前は1ドル＝${a}円だった。今は1ドル＝${b}円。　${d}ドルの品物は、今、何円？`, opts: optsOf(R, ans, c, lv === 0 ? 3 : 4), ans, grp: dirOf(a, b), v: `${a}:${b}:${d}:${m}`,
        why: `${d}×${b}＝${fmt(d * b)}なので${ans}です（前のレートなら${yen(d * a)}）。1ドルに要る円が${b < a ? "減った" : "増えた"}ので${b < a ? "円高" : "円安"}です。` };
    },
    // 海外旅行：ドルで払うホテル代は、円で何円多く・少なく払う？
    ryoko(R) {
      const [a, b] = twoRates(R), d = pick(R, [80, 100, 120, 150, 200]), diff = d * Math.abs(b - a), m = pick(R, [1, 3]);
      const more = b > a, ans = `${yen(diff)} ${more ? "多く" : "少なく"}払う`;
      const c = [`${yen(diff)} ${more ? "少なく" : "多く"}払う`, "円で払う額は変わらない", `${yen(diff * 2)} ${more ? "多く" : "少なく"}払う`];
      return { media: MEDIA[m], q: `海外旅行のホテルは1泊${d}ドル。${was(a, b)}　前と比べて、円で払う額は？`, opts: optsOf(R, ans, c, 4), ans, grp: dirOf(a, b), v: `${a}:${b}:${d}:${m}`,
        why: `前は${d}×${a}＝${yen(d * a)}、今は${d}×${b}＝${yen(d * b)}。${more ? "円安で、ドルで払う旅行は円で見て高くなります" : "円高で、ドルで払う旅行は円で見て安くなります"}。` };
    },
    // 輸入：ドルで仕入れる品物は、1個何円？
    yunyu(R) {
      const [a, b] = twoRates(R), d = pick(R, [2, 4, 5, 8, 10]), ans = yen(d * b);
      const c = [yen(d * a), yen(d * (2 * b - a)), yen(d * (b + 10)), yen(d * (b - 10)), yen(d * (b + 20)), yen(d * b * 10)].map((x) => (/^-|^0円/.test(x) ? 0 : x));
      return { media: "お店の仕入れ", q: `ある店は、外国から1個${d}ドルの品物を仕入れている。${was(a, b)}　1個の仕入れ値は、今、何円？`, opts: optsOf(R, ans, c, 4), ans, grp: dirOf(a, b), v: `${a}:${b}:${d}`,
        why: `${d}×${b}＝${fmt(d * b)}で${ans}（前は${yen(d * a)}）。${b > a ? "円安で、ドルで払う仕入れは円で見て高くなります" : "円高で、ドルで払う仕入れは円で見て安くなります"}。` };
    },
    // 輸出：ドルで売った代金は、円で何円？
    yushutsu(R) {
      const [a, b] = twoRates(R), d = pick(R, [100, 200, 300, 500, 1000]), m = ri(R, 0, 1), ans = yen(d * b);
      const c = [yen(d * a), yen(d * (2 * b - a)), yen(d * (b + 10)), yen(d * (b - 10)), yen(d * (b + 20)), yen(d * b * 10)].map((x) => (/^-|^0円/.test(x) ? 0 : x));
      return { media: ["ニュースの一場面", "社会の授業"][m], q: `ある会社は、品物を1台${d}ドルで外国に売っている。${was(a, b)}　1台分の代金を円にかえると、今、何円？`, opts: optsOf(R, ans, c, 4), ans, grp: dirOf(a, b), v: `${a}:${b}:${d}:${m}`,
        why: `${d}×${b}＝${fmt(d * b)}で${ans}（前は${yen(d * a)}）。${b > a ? "円安で、ドルで受け取る代金は円で見て多くなります" : "円高で、ドルで受け取る代金は円で見て少なくなります"}。` };
    },
    // 日本に来る旅行者：円のホテル代は何ドル？
    homon(R) {
      const [a, b] = twoRates(R), n = pick(R, [50, 80, 100, 120, 150]), y = b * n, m = pick(R, [0, 3]);
      const c = [y % a === 0 ? y / a : 0, n * 2, Math.round(n / 2), n + 20].map((x) => (x > 0 ? x + "ドル" : 0));
      return { media: MEDIA[m], q: `日本のホテルは1泊${yen(y)}。${was(a, b)}　外国から来た人がドルで考えると、今は1泊何ドル？`, opts: optsOf(R, n + "ドル", c, 4), ans: n + "ドル", grp: dirOf(a, b), v: `${a}:${b}:${n}:${m}`,
        why: `${fmt(y)}÷${b}＝${n}で${n}ドル。${b > a ? "円安で、日本での買い物はドルで見て安くなります" : "円高で、日本での買い物はドルで見て高くなります"}。` };
    },
    // 得をしやすいのは？（円で見て、払う円が減る・受け取る円が増える人）
    toku(R) {
      const [a, b] = twoRates(R), yasu = b > a, sonQ = ri(R, 0, 1) === 1;
      // 円安で得をしやすい：ドルで受け取る（輸出）・円のものを買う外国の人。円高ではその逆
      const W = yasu ? ["外国に品物を売る会社（代金はドルで受け取る）", "日本に来る外国の旅行者"] : ["外国から品物を仕入れる店（代金はドルで払う）", "海外旅行に行く日本の人"];
      const L = yasu ? ["外国から品物を仕入れる店（代金はドルで払う）", "海外旅行に行く日本の人"] : ["外国に品物を売る会社（代金はドルで受け取る）", "日本に来る外国の旅行者"];
      const ans = pick(R, sonQ ? L : W), others = sonQ ? W : L;
      return { media: pick(R, ["ニュースの一場面", "社会の授業"]), q: was(a, b) + `　${sonQ ? "損をしやすい" : "得をしやすい"}のは？`, opts: shuffle(R, [ans, ...others]), ans, grp: dirOf(a, b), v: `${a}:${b}:${sonQ ? 1 : 0}:${ans.slice(0, 4)}`,
        why: `1ドル＝${a}円→${b}円は${yasu ? "円安" : "円高"}。${yasu ? "ドルで受け取る代金は円で多くなり、円の値段は外国の人には安くなります。ドルで払う仕入れや旅行は円で高くなります" : "ドルで払う仕入れや旅行は円で安くなります。ドルで受け取る代金は円で少なくなり、円の値段は外国の人には高くなります"}。` };
    },
    // 需要と供給：どちらを買う人が多い？
    jukyu(R) {
      const SIT = [
        ["円をドルにかえたい人が、ドルを円にかえたい人より多い。", "yasu"],
        ["ドルを円にかえたい人が、円をドルにかえたい人より多い。", "daka"],
        ["外国の会社が日本の品物を買うために、ドルを円にかえる注文がふえた。", "daka"],
        ["日本の店が外国の品物を買うために、円をドルにかえる注文がふえた。", "yasu"],
        ["円を売ってドルを買いたい人がふえた。", "yasu"],
        ["ドルを売って円を買いたい人がふえた。", "daka"],
      ];
      const i = ri(R, 0, SIT.length - 1), [s, g] = SIT[i], m = ri(R, 0, 1);
      const ans = g === "yasu" ? "1ドルと交換する円は多くなりやすい" : "1ドルと交換する円は少なくなりやすい";
      return { media: ["ニュースの一場面", "社会の授業"][m], q: `${s}　ほかの事情が同じなら、レートはどう動きやすい？`, opts: shuffle(R, ["1ドルと交換する円は多くなりやすい", "1ドルと交換する円は少なくなりやすい", "国がいつも同じに決めるので動かない"]), ans, grp: g, v: `${i}:${m}`,
        why: `為替相場は、市場の需要と供給のバランスで決まります。${g === "yasu" ? "円を手ばなしてドルがほしい人が多いと、ドルの値段（1ドルに要る円）が上がりやすく、円安になりやすい" : "ドルを手ばなして円がほしい人が多いと、円の値段が上がり、1ドルに要る円が少なくなりやすい（円高）"}です。` };
    },
    // 両替して、あとでもどすと？
    modosu(R) {
      const [a, b] = twoRates(R), n = pick(R, [100, 200, 500]), y = a * n, back = b * n, diff = Math.abs(back - y), m = ri(R, 0, 1);
      const ans = yen(back), c = [yen(y), yen(y + (back > y ? -diff : diff)), yen(back + diff), yen(back + n * 10), yen(back * 10)].map((x) => (/^-|^0円/.test(x) ? 0 : x));
      return { media: ["両替所の案内", "旅行の計画"][m], q: `1ドル＝${a}円のときに${yen(y)}をドルにかえた（${n}ドル）。そのあと1ドル＝${b}円になったので、${n}ドルを全部円にもどした。　何円になった？`, opts: optsOf(R, ans, c, 4), ans, grp: dirOf(a, b), v: `${a}:${b}:${n}:${m}`,
        why: `${n}×${b}＝${fmt(back)}で${ans}。はじめの${yen(y)}より${yen(diff)}${back > y ? "多い" : "少ない"}です（両替の手数料は考えない）。${b > a ? "円安になると、持っているドルは円で多くなります" : "円高になると、持っているドルは円で少なくなります"}。` };
    },
    // 何％変わる？
    wariai(R) {
      const PAIRS = [[100, 80], [100, 90], [100, 110], [100, 120], [100, 125], [80, 100], [80, 120], [120, 150], [150, 120], [125, 100], [160, 120], [120, 90], [140, 70], [110, 99]];
      const i = ri(R, 0, PAIRS.length - 1), [a, b] = PAIRS[i], p = Math.round((Math.abs(b - a) / a) * 100), d = pick(R, [10, 20, 50]), up = b > a;
      const ans = `${p}%${up ? "上がる" : "下がる"}`, p2 = Math.round((Math.abs(b - a) / b) * 100);
      const c = [`${p}%${up ? "下がる" : "上がる"}`, p2 !== p ? `${p2}%${up ? "上がる" : "下がる"}` : `${p + 5}%${up ? "上がる" : "下がる"}`, "変わらない"];
      return { media: "社会の授業", q: `${was(a, b)}　${d}ドルの品物の円の値段は、何％変わる？`, opts: optsOf(R, ans, c, 4), ans, grp: dirOf(a, b), v: `${i}:${d}`,
        why: `${d}ドルは${yen(d * a)}から${yen(d * b)}に。${fmt(Math.abs(d * (b - a)))}÷${fmt(d * a)}で${p}%${up ? "上がります（円安）" : "下がります（円高）"}。ドルの値段は変わらなくても、円の値段はレートと同じ割合で動きます。` };
    },
  };

  const KINDS = [
    // ---- やさしい ----
    { id: "atai", lv: 0, name: "円の値打ち", src: ["g18"], look: "1ドルを手に入れるのに、前より多くの円が要る？少なくてすむ？",
      key: "1ドルに要る円が少なくなると円高、多くなると円安です。",
      why: "円高は、円1単位で交換できるほかの通貨が多い状態。円安はその逆です。" },
    { id: "ryogae", lv: 0, name: "円をドルに両替", src: ["g18"], look: "円の額を、1ドルの円の数で割ります。",
      key: "円 ÷（1ドルの円の数）＝ ドル",
      why: "円をドルにかえるときは、円の額を「1ドル＝○円」の○で割ります。" },
    { id: "nedan", lv: 0, name: "ドルの値段を円で", src: ["g18"], look: "ドルの額に、1ドルの円の数をかけます。",
      key: "ドル ×（1ドルの円の数）＝ 円",
      why: "ドルの値段を円で考えるときは、ドルの額に「1ドル＝○円」の○をかけます。" },
    // ---- ふつう ----
    { id: "ryoko", lv: 1, name: "海外旅行の支払い", src: ["g18"], look: "前と今の、円で払う額をそれぞれ計算してみましょう。",
      key: "ドル × 1ドルの円の数 を、前と今で比べます。",
      why: "ドルで払う旅行は、円安だと円で見て高く、円高だと安くなります。" },
    { id: "yunyu", lv: 1, name: "輸入の仕入れ値", src: ["g18"], look: "仕入れはドルで払います。今のレートをかけます。",
      key: "1個のドル × 今の1ドルの円の数",
      why: "ドルで払う仕入れ（輸入）は、円安だと円で見て高く、円高だと安くなります。" },
    { id: "yushutsu", lv: 1, name: "輸出の代金", src: ["g18"], look: "代金はドルで受け取ります。今のレートをかけます。",
      key: "1台のドル × 今の1ドルの円の数",
      why: "ドルで受け取る代金（輸出）は、円安だと円で見て多く、円高だと少なくなります。" },
    { id: "homon", lv: 1, name: "日本に来る旅行者", src: ["g18"], look: "円の値段を、今の1ドルの円の数で割ります。",
      key: "円 ÷ 今の1ドルの円の数 ＝ ドル",
      why: "円の値段は、円安だと外国の人にはドルで見て安く、円高だと高くなります。" },
    // ---- むずかしい ----
    { id: "toku", lv: 2, name: "得をする・損をする", src: ["g18"], look: "まず、円高か円安かを決めましょう。次に、ドルで払う人か受け取る人かを考えます。",
      key: "円安：ドルで受け取る・円のものを買う外国の人が得。円高：ドルで払う人が得。",
      why: "同じドルの額でも、レートで円の額が変わります。払う側か受け取る側かで、得と損が分かれます。" },
    { id: "jukyu", lv: 2, name: "レートの決まり方", src: ["g17"], look: "ほしい人が多いものは、値段が上がります。どちらの通貨がほしい人が多い？",
      key: "為替相場は、市場の需要と供給のバランスで決まります。",
      why: "為替相場は、だれかが一方的に決めるのではなく、市場の需要と供給のバランスで決まります。" },
    { id: "modosu", lv: 2, name: "両替して、もどす", src: ["g18"], look: "持っているドルに、もどすときのレートをかけます。",
      key: "ドル × もどすときの1ドルの円の数",
      why: "ドルを持っているあいだに円安になると、円にもどしたとき多く、円高になると少なくなります。" },
    { id: "wariai", lv: 2, name: "値段の変わる割合", src: ["g18"], look: "前の円の値段をもとにして、増えた・減った分の割合を考えます。",
      key: "（今 − 前）÷ 前 × 100 ＝ 変わった％",
      why: "ドルの値段が同じなら、円の値段はレートと同じ割合で変わります。" },
  ];
  for (const k of KINDS) k.make = MK[k.id];
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);

  // part:seedOf:begin（shared-workflows の template/parts/data/seedOf.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  // part:seedOf:end
  // part:rng:begin（shared-workflows の template/parts/data/rng.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // part:rng:end

  // 1問を作る。tag は「種類|種」（例 "atai|2026-11-17:d0"）。同じ tag ならいつも同じ問題
  function make(tag) {
    const [kind] = String(tag).split("|"), k = Object.prototype.hasOwnProperty.call(BY, kind) ? BY[kind] : null;
    if (!k) return null;
    const p = k.make(rng(seedOf(tag)), k.lv);
    return { tag, kind, lv: k.lv, name: k.name, look: k.look, key: k.key, type: "act", rev: false, src: k.src.map((s) => SRC[s]), ...p };
  }
  // 同じ問題かを見分ける鍵（種類・言い方・選び肢の組）
  const keyOf = (P) => `${P.kind}:${P.q}:${P.opts.slice().sort().join("/")}`;

  // 今日の5問（やさしい2・ふつう2・むずかしい1）。種類は重ねない
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), n = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...n, ...h].map((id, i) => `${id}|${date}:d${i}`);
  }
  // 上級の3問（むずかしいだけ・今日の5問のむずかしいとは別の種類）
  function hardTags(date) {
    const dh = dailyTags(date)[4].split("|")[0], R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((id, i) => `${id}|${date}:h${i}`);
  }

  const EYS = { KINDS, BY, GROUPS, LV, SRC, RATES, kindsOf, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = EYS; else root.EYS = EYS;
})(typeof self !== "undefined" ? self : this);
