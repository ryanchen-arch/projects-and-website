import React, { useState, useEffect } from "react";
import "@/styles/globals.css";
import Link from "next/link";
import { useRouter } from "next/router";
import ThemeToggle from "./ThemeToggle"; // Import the ThemeToggle component
import { TemplateProvider } from "./templateContext"; // Import the provider
import SimulateLogin from "./simulateLogin"; // Import the simulateLogin component

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null); // Set initial state for user
  const [theme, setTheme] = useState("light");
  const [isDropdownVisible, setDropdownVisible] = useState(false); // State for dropdown visibility

  // Use useEffect to check for user and theme from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) setTheme(savedTheme);

      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser)); // Retrieve and parse the user details from localStorage
      }
    }
  }, []);

  // Set the theme and store it in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme); // Save the theme in localStorage
    }
  }, [theme]);

  // Logout function to clear user and token
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user"); // Remove user from localStorage
    localStorage.removeItem("userID");
    localStorage.removeItem("token");
    setUser(null); // Update the user state to null
    setDropdownVisible(false); // Close the dropdown
    router.push("/login");
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <SimulateLogin>
        <TemplateProvider>
          <nav className="bg-white text-black shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold">Scriptorium</h1>
                </div>

                {/* Links */}
                <div className="flex space-x-4">
                  <Link
                    href="/"
                    className="text-lg hover:text-blue-600 transition duration-300"
                  >
                    Home
                  </Link>

                  <Link
                    href="/BlogPostsList"
                    className="text-lg hover:text-blue-600 dark:hover:text-blue-400 transition duration-300"
                  >
                    Blog
                  </Link>
                  <Link
                    href="/templateList"
                    className="text-lg hover:text-blue-600 transition duration-300"
                  >
                    Templates
                  </Link>
                  <Link
                    href="/myTemplatesPage"
                    className="text-lg hover:text-blue-600 transition duration-300"
                  >
                    My Templates
                  </Link>
                  <Link
                    href="/admin"
                    className="text-lg hover:text-blue-600 transition duration-300"
                  >
                    Admin
                  </Link>

                  {/* Login/Register or User Dropdown */}
                  {user ? (
                    <div className="relative dropdown-container">
                      <button
                        className="flex items-center space-x-2"
                        onClick={toggleDropdown}
                      >
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <span className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white">
                            {user.firstName[0]} {/* Show first letter of first name */}
                          </span>
                        )}
                        <span>
                          {user.firstName} {user.lastName} ▼
                        </span>
                      </button>
                      {isDropdownVisible && (
                        <div className="absolute right-0 mt-2 w-48 bg-white text-black border border-gray-300 rounded-lg shadow-lg z-10">
                          <Link
                            href="/profile"
                            className="block px-4 py-2 hover:bg-gray-100"
                          >
                            Edit Profile
                          </Link>
                          <button
                            onClick={logout}
                            className="w-full text-left block px-4 py-2 hover:bg-gray-100"
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="text-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 font-medium transition duration-300"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="text-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 font-medium transition duration-300"
                      >
                        Register
                      </Link>
                    </>
                  )}

                  {/* Theme Toggle */}
                  <ThemeToggle setTheme={setTheme} />
                </div>
              </div>
            </div>
          </nav>
          <Component {...pageProps} />
        </TemplateProvider>
      </SimulateLogin>
    </>
  );
}
