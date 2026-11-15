const fs = require('node:fs/promises');
const path = require('node:path');

const root = __dirname;
const output = path.join(root, 'dist');
const publicFiles = [
  'index.html',
  'contacts.html',
  'prices.html',
  'styles.css',
  'script.js',
  'header-polish.css',
  'services-polish.css',
];

async function build() {
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });

  for (const file of publicFiles) {
    await fs.copyFile(path.join(root, file), path.join(output, file));
  }

  await fs.cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
  console.log('Static site built in dist/');
}

build().catch((error) => {
  console.error('Static site build failed:', error);
  process.exitCode = 1;
});
