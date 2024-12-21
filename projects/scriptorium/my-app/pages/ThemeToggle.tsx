import { Dispatch, SetStateAction, useState, useEffect } from "react";

interface ThemeToggleProps {
  setTheme: Dispatch<SetStateAction<string>>;
}

export default function ThemeToggle({ setTheme }: ThemeToggleProps) {
  const [isBrowser, setIsBrowser] = useState(false);

  // Ensure that the component is running in the browser before accessing `document`
  useEffect(() => {
    setIsBrowser(true); // Set this to true only after the component mounts in the browser
  }, []);

  const toggleTheme = () => {
    if (isBrowser) {
      const newTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
      setTheme(newTheme);

      // Apply the theme to the document root
      document.documentElement.classList.toggle("dark", newTheme === "dark");

      // Store the theme preference in localStorage
      localStorage.setItem("theme", newTheme);
    }
  };

  if (!isBrowser) {
    return null; // Return null or a loading state until the component is mounted in the browser
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-800 text-white"
      title={`Switch to ${document.documentElement.classList.contains("dark") ? "light" : "dark"} mode`}
    >
      {document.documentElement.classList.contains("dark") ? "☀️" : "🌙"}
    </button>
  );
}
