const fs = require("fs");
const path = require("path");

const srcDir = process.cwd();
const distDir = path.join(srcDir, "dist");

console.log("Starting production build...");

// Create or clean dist folder
if (fs.existsSync(distDir)) {
  console.log("Cleaning existing dist directory...");
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Define specific files to include
const includeFiles = [
  "index.html",
  "amenity-detail.html",
  "privacy-policy.html",
  "terms-of-use.html",
  "unit-detail.html",
  "download-brochure.html",
  "styles.css",
  "script.js",
  "sitemap.xml",
  "robots.txt",
  "Vrundavan Brochure.pdf"
];

// Read all files in root to copy assets (images, videos, etc.)
const files = fs.readdirSync(srcDir);
let copyCount = 0;

files.forEach((file) => {
  const filePath = path.join(srcDir, file);
  const ext = path.extname(file).toLowerCase();

  // Determine if this file is a production asset
  const isImageOrVideo = [".png", ".jpeg", ".jpg", ".mp4"].includes(ext);
  const isIncludedFile = includeFiles.includes(file);

  if ((isImageOrVideo || isIncludedFile) && fs.statSync(filePath).isFile()) {
    const destPath = path.join(distDir, file);
    fs.copyFileSync(filePath, destPath);
    console.log(`- Copied: ${file}`);
    copyCount++;
  }
});

console.log(`\nSuccess! Compiled ${copyCount} assets into the "dist" folder.`);
console.log("You can now upload ONLY the \"dist\" folder to Netlify.");
