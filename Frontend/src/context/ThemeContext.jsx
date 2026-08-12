import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check localStorage, default to dark mode if nothing is set yet
  const [theme, setTheme] = useState(localStorage.getItem("app-theme") || "dark");
  const [colorScheme, setColorScheme] = useState(localStorage.getItem("app-color-scheme") || "monochrome");

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    
    root.setAttribute("data-theme", colorScheme);
    
    localStorage.setItem("app-theme", theme);
    localStorage.setItem("app-color-scheme", colorScheme);
  }, [theme, colorScheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colorScheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);