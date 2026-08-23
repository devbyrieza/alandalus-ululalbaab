const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// Remove BOM if present
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
  fs.writeFileSync(schemaPath, content, 'utf8');
  console.log("BOM removed from schema.prisma");
} else {
  console.log("No BOM found in schema.prisma");
}
