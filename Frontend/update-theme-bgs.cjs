const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let content = fs.readFileSync(cssPath, 'utf8');

// Replace :root (Monochrome) backgrounds
content = content.replace(
  /--app-bg-image-light: radial-gradient[^;]+;/g,
  `--app-bg-image-light: url('https://images.unsplash.com/photo-1518640467707-6811f4a4ab75?q=80&w=2000&auto=format&fit=crop');`
);
content = content.replace(
  /--app-bg-image-dark: radial-gradient[^;]+;/g,
  `--app-bg-image-dark: url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop');`
);

// Add to [data-theme="neon"]
const neonBg = `  --app-bg-image-light: url('https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2000&auto=format&fit=crop');\n  --app-bg-image-dark: url('https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2000&auto=format&fit=crop');\n}\n`;
content = content.replace(/--theme-950: #170535;\n}/g, `--theme-950: #170535;\n${neonBg}`);

// Add to [data-theme="ocean"]
const oceanBg = `  --app-bg-image-light: url('https://images.unsplash.com/photo-1498092651296-641e88c3b057?q=80&w=2000&auto=format&fit=crop');\n  --app-bg-image-dark: url('https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?q=80&w=2000&auto=format&fit=crop');\n}\n`;
content = content.replace(/--theme-950: #042f2e;\n}/g, `--theme-950: #042f2e;\n${oceanBg}`);

// Add to [data-theme="sunset"]
const sunsetBg = `  --app-bg-image-light: url('https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=2000&auto=format&fit=crop');\n  --app-bg-image-dark: url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2000&auto=format&fit=crop');\n}\n`;
content = content.replace(/--theme-950: #431407;\n}/g, `--theme-950: #431407;\n${sunsetBg}`);

// Add @keyframes fade-out if not exists
if (!content.includes('@keyframes fade-out')) {
  content = content.replace(
    /@keyframes scale-up \{[\s\S]*?\}/g,
    `@keyframes scale-up {\n    from { opacity: 0; transform: scale(0.92); }\n    to { opacity: 1; transform: scale(1); }\n  }\n  @keyframes fade-out {\n    0% { opacity: 1; transform: scale(1); }\n    100% { opacity: 0; transform: scale(1.5); }\n  }`
  );
}

fs.writeFileSync(cssPath, content, 'utf8');
console.log('Backgrounds updated successfully!');
