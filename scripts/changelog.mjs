// Builds src/content/docs/system/changelog.mdx from the app repo's git history (read-only).
// Usage: node scripts/changelog.mjs [path-to-app-repo]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const repo = process.argv[2] ?? '/Users/pylot/Downloads/herocloud-github';
const out = execFileSync('git', ['-C', repo, 'log', '--no-merges', '--format=%h\x1f%ad\x1f%s', '--date=short'], { encoding: 'utf8', maxBuffer: 1 << 26 });
const kinds = { feat: 'Features', fix: 'Fixes', refactor: 'Improvements', perf: 'Improvements', style: 'Improvements' };
const skip = /^(chore|docs|test|ci|build|wip)\b|^merge|^initial/i;
const months = {};
for (const line of out.split('\n').filter(Boolean)) {
  const [hash, date, subject] = line.split('\x1f');
  if (skip.test(subject)) continue;
  const m = subject.match(/^([a-z]+)(?:\(([^)]+)\))?!?:\s*(.+)$/i);
  const type = m ? m[1].toLowerCase() : 'other';
  const scope = m?.[2] ?? '';
  const text = (m ? m[3] : subject).replace(/[<>{}]/g, '').replace(/\|/g, '/').trim();
  const kind = kinds[type] ?? 'Other changes';
  const ym = date.slice(0, 7);
  ((months[ym] ??= {})[kind] ??= []).push({ date, hash, scope, text: text.charAt(0).toUpperCase() + text.slice(1) });
}
const order = ['Features', 'Fixes', 'Improvements', 'Other changes'];
const label = (ym) => new Date(ym + '-01T00:00:00Z').toLocaleString('en', { month: 'long', year: 'numeric', timeZone: 'UTC' });
let md = `---\ntitle: "Changelog"\ndescription: "What changed in HeroCloud, month by month, taken from the code history."\n---\nimport { Badge } from '@astrojs/starlight/components';\n\nThis page is generated from the commit history of the HeroCloud app (merge and housekeeping commits left out). A change listed here is **not** proof that a feature is connected to the real API: the status on each feature page stays the source of truth. Last generated ${new Date().toISOString().slice(0, 10)}.\n\n`;
const ms = Object.keys(months).sort().reverse();
md += `## Summary\n\n| Month | Features | Fixes | Improvements | Other |\n| --- | ---: | ---: | ---: | ---: |\n`;
for (const ym of ms) md += `| ${label(ym)} | ${months[ym].Features?.length ?? 0} | ${months[ym].Fixes?.length ?? 0} | ${months[ym].Improvements?.length ?? 0} | ${months[ym]['Other changes']?.length ?? 0} |\n`;
for (const ym of ms) {
  md += `\n## ${label(ym)}\n`;
  for (const k of order) {
    const items = months[ym][k];
    if (!items) continue;
    const fold = k === 'Other changes';
    md += fold ? `\n<details>\n<summary>${k} (${items.length}) · internal notes and untyped commits</summary>\n\n` : `\n### ${k} (${items.length})\n\n`;
    for (const i of items.sort((a, b) => b.date.localeCompare(a.date))) md += `- \`${i.hash}\` \`${i.date}\` ${i.scope ? `**${i.scope}** · ` : ''}${i.text}\n`;
    if (fold) md += `\n</details>\n`;
  }
}
fs.writeFileSync('src/content/docs/system/changelog.mdx', md);
console.log('months', ms.length);
