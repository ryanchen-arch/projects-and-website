// THIS FILE WAS AI GENERATED AND ONLY USED FOR TESTING PURPOSES (so that i can test things that require login without implementing a login system)
import { useEffect, useState } from "react";
import {
	setAccessToken,
	getAccessToken,
	setRefreshToken,
	clearTokens,
} from "../utils/token";
import { useRouter } from "next/router";

const SimulateLogin = ({ children }) => {
	const router = useRouter();
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const simulateLogin = async () => {
		const email = "admin@example.com"; // Hardcoded credentials
		const password = "yourAdminPassword";

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			if (!response.ok) {
				throw new Error("Login failed");
			}

			const data = await response.json();
			setAccessToken(data.token); // Store access token in localStorage
			setRefreshToken("dummy-refresh-token"); // Optional, depending on your needs
			setIsLoggedIn(true); // Set logged-in state
		} catch (error) {
			console.error("Error during simulated login:", error.message);
			router.push("/login"); // Redirect to login page if needed
		}
	};

	useEffect(() => {
		// clear the localStorage on every run for testing purposes
		clearTokens();

		// Check if already logged in
		const token = getAccessToken();
		if (!token) {
			simulateLogin(); // Perform simulated login
		} else {
			setIsLoggedIn(true); // Already logged in
		}
	}, []);

	// Don't render children until login is complete
	if (!isLoggedIn) {
		return <p>Loading...</p>;
	}

	return <>{children}</>;
};

export default SimulateLogin;
