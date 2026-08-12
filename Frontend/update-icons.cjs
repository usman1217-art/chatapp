const fs = require('fs');
const path = require('path');

const sidebarPath = path.join(__dirname, 'src', 'components', 'chat', 'ChatSidebar.jsx');
let content = fs.readFileSync(sidebarPath, 'utf8');

const icons = {
  monochrome: '<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22A10 10 0 1012 2v20z" /></svg>',
  neon: '<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>',
  sunset: '<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>',
  ocean: '<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C12 2 6 9 6 13C6 16.3137 8.68629 19 12 19C15.3137 19 18 16.3137 18 13C18 9 12 2 12 2Z" /></svg>',
  odyssey: '<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>',
  spiderman: '<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>'
};

const darkLightIcon = '<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>';

// Ensure buttons use flex layouts so the SVG and text align
content = content.replace(/className={`text-left/g, "className={`flex items-center gap-2 text-left");
content = content.replace(/className="text-left/g, 'className="flex items-center gap-2 text-left');

// Replace the emojis
content = content.replace(/⚫ Monochrome/g, `${icons.monochrome} Monochrome`);
content = content.replace(/🔮 Midnight Neon/g, `${icons.neon} Midnight Neon`);
content = content.replace(/🌅 Sunset Glow/g, `${icons.sunset} Sunset Glow`);
content = content.replace(/🌊 Ocean Breeze/g, `${icons.ocean} Ocean Breeze`);
content = content.replace(/🚀 Space Odyssey/g, `${icons.odyssey} Space Odyssey`);
content = content.replace(/🕷️ Spider-Man/g, `${icons.spiderman} Spider-Man`);

content = content.replace(/{theme === "dark" \? "☀️ Light Mode" : "🌙 Dark Mode"}/g, 
  `{theme === "dark" ? <><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Light Mode</> : <><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> Dark Mode</>}`
);

fs.writeFileSync(sidebarPath, content, 'utf8');
console.log('Icons updated successfully!');
