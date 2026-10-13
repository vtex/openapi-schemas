/**
 * Generate the Bruno workspace file that links every collection in BrunoCollections/.
 *
 * A workspace is an OpenCollection document (`info.type: workspace`) holding a list of
 * {name, path} entries pointing at collection directories. Opening it in Bruno loads all
 * of them at once, instead of picking each API folder by hand.
 *
 * The emitter below mirrors generateYamlContent() in Bruno's own utils/workspace-config,
 * so regenerating here produces the same bytes the app writes when it edits the workspace.
 * Pass the workspace directory as the first argument; it defaults to BrunoCollections/.
 */
const fs = require('fs');
const path = require('path');
const { parseCollection } = require('@usebruno/filestore');

const WORKSPACE_NAME = 'VTEX API Collections';
const DIR = path.resolve(process.argv[2] || path.join(__dirname, '..'));

// Same escaping rule as the app: always double-quote, backslashes and quotes escaped.
const quote = (value) => {
  if (typeof value !== 'string') return `"${String(value)}"`;
  if (value === '') return '""';
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
};

const collections = fs
  .readdirSync(DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith('_'))
  .filter((e) => fs.existsSync(path.join(DIR, e.name, 'opencollection.yml')))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((e) => {
    // Take the display name from the collection itself rather than the directory name,
    // so a renamed collection keeps a truthful label in the workspace.
    const raw = fs.readFileSync(path.join(DIR, e.name, 'opencollection.yml'), 'utf8');
    const { brunoConfig } = parseCollection(raw, { format: 'yml' });
    // Paths are stored relative to the workspace, posix-style, so the file stays portable.
    return { name: brunoConfig.name || e.name, path: e.name };
  });

const lines = [`opencollection: 1.0.0`, 'info:', `  name: ${quote(WORKSPACE_NAME)}`, `  type: workspace`, ''];
lines.push('collections:');
for (const c of collections) {
  lines.push(`  - name: ${quote(c.name)}`);
  lines.push(`    path: ${quote(c.path)}`);
}
lines.push('', 'specs:', '', "docs: ''", '');

fs.writeFileSync(path.join(DIR, 'workspace.yml'), lines.join('\n'));
console.log(`workspace.yml -> ${collections.length} collections linked`);
