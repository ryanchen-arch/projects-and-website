import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAccessToken } from "@/utils/token";

const MyTemplatesPage = () => {
	const router = useRouter();

	// State variables
	const [templates, setTemplates] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);

	// Fetch templates after login
	useEffect(() => {
		const token = getAccessToken();
		if (!token) {
			console.log("No token found, Not logged in");
			router.push("/"); // Redirect to login page if token is not set
		}

		const fetchTemplates = async () => {
			setError(null);

			try {
				const response = await fetch("/api/templates/userSavedTemplates", {
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) throw new Error("Error fetching templates");

				const data = await response.json();
				setTemplates(data); // Save templates to state
			} catch (err) {
				setError(err.message);
			}
		};

		fetchTemplates();
	}, [router]);

	// Handle template button
	const handleTemplateClick = (templateId: string) => {
		router.push(`/templates/${templateId}`);
	};

	if (error) return <p className="text-red-500">{error}</p>;

	return (
		<div className="bg-white text-black min-h-screen">
			<div className="max-w-7xl mx-auto p-6">
				<h1 className="text-3xl font-bold mb-6">My Templates</h1>

				<div>
					<h2 className="text-2xl font-semibold mb-4">Your Saved Templates</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{templates.length === 0 ? (
							<p className="text-black">
								You don't have any saved templates yet.
							</p>
						) : (
							templates.map((template) => (
								<button
									key={template.id}
									onClick={() => handleTemplateClick(template.id)}
									className="p-6 border border-gray-200 rounded-lg shadow-md hover:bg-gray-50"
								>
									<h3 className="text-xl font-semibold mb-2">
										{template.title}
									</h3>
									<p className="text-black mb-2">{template.explanation}</p>
									<p className="text-sm text-black">Tags: {template.tags}</p>
								</button>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MyTemplatesPage;
