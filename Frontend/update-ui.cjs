const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Fix Avatars to use default ui-avatars (which uses vibrant name-based colors)
    // Removing the forced black/white background so it looks much better
    content = content.replace(/&background=000&color=fff/g, '');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated avatars in:', file);
    }
});

// Update MessageBubble manually for the exact class names
const messageBubblePath = path.join(srcDir, 'components', 'chat', 'MessageBubble.jsx');
let mbContent = fs.readFileSync(messageBubblePath, 'utf8');

// The `own` message block
const targetClasses = `own
            ? "bg-white text-black rounded-br-sm shadow-[0_0_15px_rgba(255,255,255,0.2)] backdrop-blur-md font-medium border border-white/20"
            : "glass border-white/10 text-slate-100 rounded-bl-sm"`;

const newClasses = `own
            ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 rounded-br-sm shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.2)] backdrop-blur-md font-bold border border-slate-700 dark:border-white/20"
            : "glass border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-bl-sm"`;

mbContent = mbContent.replace(targetClasses, newClasses);
fs.writeFileSync(messageBubblePath, mbContent, 'utf8');
console.log('Updated MessageBubble classes!');
