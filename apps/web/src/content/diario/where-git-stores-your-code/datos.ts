// Content of this article's optional <Dato /> panels. Every line accepts inline HTML.
// All facts are verified: the hashes with `git hash-object`, the history with Git's own documentation and
// release notes (technical/hash-function-transition, RelNotes 2.13) and with CWI's SHAttered announcement.

export const historia = [
  `<strong>1995.</strong> The US NIST publishes SHA-1 as a federal standard (FIPS 180-1). The NSA designed it.`,
  `<strong>2005.</strong> Git is born, and it uses SHA-1 to name every object.`,
  `<strong>2017.</strong> On February 23, CWI (Netherlands) and Google present <em>SHAttered</em>: two different PDFs with the same SHA-1, after about 2<sup>63</sup> computations. It was the first collision of full SHA-1.`,
  `<strong>2017, Git 2.13.</strong> Git adopts by default a SHA-1 variant that detects this kind of attack, written by Marc Stevens (CWI) and Dan Shumow (Microsoft).`,
  `<strong>Today.</strong> Git can already use SHA-256 with <code>git init --object-format=sha256</code>, but SHA-1 is still the default and the two kinds of repository can't be mixed.`,
];

export const curiosos = [
  `The empty file has its own hash: <code>e69de29bb2d1d6434b8b29ae775ad8c2e48c5391</code>. Every repository in the world computes it the same way.`,
  `An empty <em>tree</em> (a folder with nothing in it) has one too: <code>4b825dc642cb6eb9a060e54bf8d69288fbee4904</code>.`,
  `There are 2<sup>160</sup> possible hashes, about 1.46 × 10<sup>48</sup>. For two objects to likely collide by chance you'd need on the order of 2<sup>80</sup> objects, close to 10<sup>24</sup>.`,
  `By default Git shows only 7 characters of the hash (like <code>b0ab984</code>). You can change that with <code>core.abbrev</code>.`,
];

export const usos = [
  `<strong>pnpm</strong> stores each file of your dependencies only once, in 256 two-character folders, just like Git. The name is the (SHA-512) hash of the content, and if two projects use the same file, they share it.`,
  `<strong>package-lock.json and pnpm-lock.yaml</strong> keep an <code>integrity: sha512-…</code> field with each package's hash. If what you download doesn't match, the install stops.`,
  `<strong>Docker</strong> identifies every image and every layer by its <em>digest</em>, a <code>sha256:…</code> hash.`,
  `<strong>Express</strong> uses the <code>etag</code> package, which summarizes each response body with SHA-1 so the browser can tell whether it changed.`,
  `<strong>This site.</strong> The files in <code>/_astro/</code> carry a hash of their content in the name (<code>imagen.BPAdz6L0_ZiTh3H.jpg</code>), so the browser can keep them for a year without risk of showing an old version.`,
  `<strong>BitTorrent and IPFS</strong> ask for content by its hash: "give me whatever has this fingerprint", no matter who has it.`,
];
