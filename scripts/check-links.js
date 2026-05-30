#!/usr/bin/env node
/**
 * Scan all HTML files for local relative links and check for 404 risks.
 *
 * Usage:
 *   cd d:/cc安装/projects/cable-catalog
 *   node scripts/check-links.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Collect all files that exist in the project
function collectAllFiles(dir, base = '') {
  const results = new Set();
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = base + entry.name;
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      results.add(rel + '/');
      const sub = collectAllFiles(path.join(dir, entry.name), rel + '/');
      sub.forEach(f => results.add(f));
    } else if (entry.isFile() && !entry.name.startsWith('.')) {
      results.add(rel);
    }
  }
  return results;
}

// Extract local hrefs from HTML content
function extractLocalLinks(content) {
  const links = [];
  // Match href="..." and src="..."
  const re = /(?:href|src)="([^"#][^"]*)"/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const url = m[1];
    // Skip external URLs, anchors, mailto, tel, data, javascript
    if (url.startsWith('http') || url.startsWith('https') ||
        url.startsWith('mailto:') || url.startsWith('tel:') ||
        url.startsWith('data:') || url.startsWith('javascript:') ||
        url.startsWith('#') || url.startsWith('{') ||
        url.startsWith('//')) {  // protocol-relative URLs
      continue;
    }
    // Skip absolute paths (like / or /amperon-cables/) — they work on web servers
    if (url.startsWith('/')) continue;
    // Resolve relative path
    const cleanUrl = url.split('?')[0].split('#')[0]; // strip query/hash
    links.push({ raw: url, clean: cleanUrl });
  }
  return links;
}

function main() {
  const allFiles = collectAllFiles(ROOT);
  const htmlFiles = [...allFiles].filter(f => f.endsWith('.html'));

  console.log(`Checking ${htmlFiles.length} HTML files...\n`);

  let totalOk = 0;
  const issues = [];

  for (const relPath of htmlFiles) {
    const filePath = path.join(ROOT, relPath);
    const dir = path.dirname(relPath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const links = extractLocalLinks(content);

    for (const link of links) {
      // Resolve the link against the file's directory
      const resolved = path.normalize(path.join(dir, link.clean)).replace(/\\/g, '/');

      // Normalize: strip leading ./ for matching against allFiles (which uses bare relative paths)
      const normalizedResolved = resolved.replace(/^\.\//, '').replace(/^\.$/, '');

      if (!allFiles.has(resolved) && !allFiles.has(normalizedResolved)) {
        // Check if it resolves as a directory — try index.html in that directory
        const candidates = [
          normalizedResolved ? normalizedResolved + '/index.html' : 'index.html',
          normalizedResolved ? normalizedResolved + 'index.html' : 'index.html',
          resolved.replace(/\/?$/, '/index.html').replace(/^\.\//, ''),
        ];
        const found = candidates.some(c => allFiles.has(c) || allFiles.has(c.replace(/^\.\//, '')));
        if (found) {
          totalOk++;
          continue;
        }
        // Check with .html extension
        const withHtml = resolved + '.html';
        if (allFiles.has(withHtml)) {
          totalOk++;
          continue;
        }
        // Check if it's an anchor-only link on current page
        if (link.raw.startsWith('#') || link.raw === '') {
          totalOk++;
          continue;
        }

        issues.push({
          file: relPath,
          link: link.raw,
          resolved: resolved
        });
      } else {
        totalOk++;
      }
    }
  }

  if (issues.length === 0) {
    console.log(`\x1b[32m✓ All ${totalOk} local links resolve successfully.\x1b[0m`);
  } else {
    console.log(`\x1b[33m${issues.length} potential broken links found:\x1b[0m\n`);
    for (const issue of issues) {
      console.log(`  ${issue.file}`);
      console.log(`    href="${issue.link}"`);
      console.log(`    → ${issue.resolved} (NOT FOUND)\n`);
    }
  }

  console.log(`\nTotal links checked: ${totalOk + issues.length}`);
  console.log(`OK: ${totalOk}`);
  console.log(`Issues: ${issues.length}`);
}

main();
