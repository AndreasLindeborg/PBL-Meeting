export default function ThemeToggle() {
    const toggleDarkMode = () => {
      document.documentElement.classList.toggle("dark");
    };
  
    return (
      <button
        onClick={toggleDarkMode}
        className="mt-4 px-3 py-2 rounded bg-gray-800 text-white"
      >
        Toggle Dark Mode
      </button>
    );
  }