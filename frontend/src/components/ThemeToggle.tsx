import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = storedTheme === "dark" || (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", !isDark);
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="text-white dark:text-yellow-300 text-2xl hover:scale-110 transition-transform"
      aria-label="Toggle theme"
    >
      {isDark ? "💡" : "🌙"}
    </button>
  );
}