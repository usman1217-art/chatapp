import { useState } from "react";
import { useAppTheme } from "../../context/ThemeContext";

function SpiderEasterEgg() {
  const { colorScheme } = useAppTheme();
  
  // Start hanging near the top left
  const [position, setPosition] = useState({ top: 5, left: 15 });
  const [webs, setWebs] = useState([]);
  
  if (colorScheme !== "spiderman") return null;

  const moveSpider = (e) => {
    e.stopPropagation();
    // Generate a web at the current clicked location
    const newWeb = {
      id: Date.now(),
      top: position.top,
      left: position.left,
    };
    setWebs((prev) => [...prev, newWeb]);

    // Remove the web after 2 seconds
    setTimeout(() => {
      setWebs((prev) => prev.filter((w) => w.id !== newWeb.id));
    }, 2000);

    // Randomize left position between 5% and 95%
    const randomLeft = Math.floor(Math.random() * 90) + 5;
    // Randomize top position so it stays hanging near the ceiling (0% to 20%)
    const randomTop = Math.floor(Math.random() * 20) + 2; 
    setPosition({ top: randomTop, left: randomLeft });
  };

  return (
    <>
      {/* Render the fading webs */}
      {webs.map(web => (
        <div 
          key={web.id}
          className="absolute z-[9998] pointer-events-none"
          style={{ 
            top: `${web.top}%`, 
            left: `${web.left}%`,
            transform: 'translate(-50%, -50%)',
            animation: 'fade-out 2s ease-in-out forwards'
          }}
        >
          {/* SVG Web so it's guaranteed to show reliably across all devices */}
          <svg className="w-12 h-12 text-slate-300 dark:text-slate-500 opacity-60 drop-shadow-md" viewBox="0 0 512 512" fill="currentColor">
            <path d="M256,0C114.6,0,0,114.6,0,256s114.6,256,256,256s256-114.6,256-256S397.4,0,256,0z M256,472c-119.3,0-216-96.7-216-216S136.7,40,256,40s216,96.7,216,216S375.3,472,256,472z" opacity="0.3"/>
            <path d="M256,80C158.8,80,80,158.8,80,256s78.8,176,176,176s176-78.8,176-176S353.2,80,256,80z M256,392c-75.1,0-136-60.9-136-136S180.9,120,256,120s136,60.9,136,136S331.1,392,256,392z"/>
            <path d="M256,160c-53,0-96,43-96,96s43,96,96,96s96-43,96-96S309,160,256,160z M256,312c-30.9,0-56-25.1-56-56s25.1-56,56-56s56,25.1,56,56S286.9,312,256,312z"/>
            <polygon points="256,216 227.7,227.7 216,256 227.7,284.3 256,296 284.3,284.3 296,256 284.3,227.7"/>
            <path d="M495,240H272V17h-32v223H17v32h223v223h32V272h223V240z"/>
            <path d="M428.1,70.5L267.3,231.3l-22.6-22.6L405.5,47.9l-45.3-45.3L199.4,163.4l22.6,22.6l160.8-160.8l56.5,56.5L278.6,242.6l22.6,22.6L461.9,104.5L428.1,70.5z"/>
            <path d="M106.5,47.9L83.9,70.5l160.8,160.8l22.6-22.6L106.5,47.9z"/>
            <path d="M70.5,428.1L231.3,267.3l-22.6-22.6L47.9,405.5L70.5,428.1z"/>
            <path d="M405.5,464.1L244.7,303.3l22.6-22.6l160.8,160.8L405.5,464.1z"/>
          </svg>
        </div>
      ))}

      <div 
        className="absolute z-[9999] transition-all duration-[1200ms] ease-in-out cursor-pointer drop-shadow-2xl"
        style={{ top: `${position.top}%`, left: `${position.left}%` }}
        onClick={moveSpider}
        title="Catch the spider!"
      >
        {/* Spider web thread hanging from the ceiling */}
        <div className="absolute w-[1.5px] bg-slate-400/50 dark:bg-white/30 -top-[1000px] h-[1000px] left-1/2 -translate-x-1/2" />
        
        {/* The SVG Spider Image - 100% reliable rendering and sized smaller */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-6 h-6 text-slate-900 dark:text-red-500 transform hover:scale-110 transition-transform -translate-y-1 -translate-x-1/2 left-1/2 absolute top-0 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" 
          fill="currentColor"
        >
          <path d="M12 2c-.6 0-1 .4-1 1v1.3C9.2 4.9 8 6.3 8 8v1h-.3C6.7 9 5.8 8.1 5.8 7c0-.6-.4-1-1-1s-1 .4-1 1c0 1.9 1.3 3.5 3 3.9v.3L5 13c-.4.4-.4 1 0 1.4.2.2.5.3.7.3s.5-.1.7-.3l2-2v.8C8 16.4 9.8 18 12 18s4-1.6 4-3.8v-.8l2 2c.2.2.5.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4l-1.8-1.8v-.3c1.7-.4 3-2 3-3.9 0-.6-.4-1-1-1s-1 .4-1 1c0 1.1-.9 2-2 2h-.3V8c0-1.7-1.2-3.1-3-3.7V3c0-.6-.4-1-1-1zm-1 6h2v3h-2V8zm0 5h2v1c0 1.1-.9 2-2 2s-2-.9-2-2v-1h2z"/>
        </svg>
      </div>
    </>
  );
}

export default SpiderEasterEgg;
