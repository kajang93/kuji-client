const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../src/api');
const files = fs.readdirSync(apiDir).filter(f => f.endsWith('.ts') && f !== 'client.ts');

files.forEach(file => {
  const filePath = path.join(apiDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add API_HOST to imports from client.ts
  content = content.replace(/import\s+{\s*getHeaders\s*}\s+from\s+["'](\.\/client)["'];?/, 'import { getHeaders, API_HOST } from "$1";');

  // Change const API_BASE_URL = "/api/..." to `${API_HOST}/api/...`
  content = content.replace(/const\s+API_BASE_URL\s*=\s*['"](\/api\/[^'"]+)['"];?/, 'const API_BASE_URL = `${API_HOST}$1`;');

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
