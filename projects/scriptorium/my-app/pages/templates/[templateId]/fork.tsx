import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAccessToken } from "@/utils/token";

const ForkTemplatePage = () => {
	const router = useRouter();
	const { templateId } = router.query;

	const [template, setTemplate] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchTemplate = async () => {
			setError(null);

			try {
				const response = await fetch(
					`/api/templates/${templateId}/getTemplate`
				);
				if (!response.ok) throw new Error("Error fetching template");

				const data = await response.json();
				setTemplate(data.template);
			} catch (err) {
				setError(err.message);
			}
		};

		if (templateId) {
			fetchTemplate();
		}
	}, [templateId]);

	// Handle forking the template
	const handleFork = async () => {
		const token = getAccessToken();

		setError(null);

		try {
			const response = await fetch(`/api/templates/${templateId}/fork`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`, // Attach token in Authorization header
				},
			});

			if (!response.ok) throw new Error("Failed to fork template");

			const newTemplate = await response.json();
			console.log("Forked template:", newTemplate);

			// Redirect to the newly created forked template page
			router.push(`/templates/${newTemplate.id}`);
		} catch (err) {
			setError(err.message || "Error forking template");
		}
	};

	if (error) return <p className="text-center text-red-500">{error}</p>;
	if (!template)
		return <p className="text-center text-black">No template found</p>;

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
				<h1 className="text-2xl font-bold mb-6 text-black">Fork Template</h1>

				{/* Confirmation Section */}
				<div className="mb-6">
					<p className="text-black mb-4">
						Are you sure you want to fork this template?
					</p>
					<div className="flex gap-4">
						<button
							onClick={handleFork}
							className="px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Yes, Fork
						</button>
						<button
							onClick={() => router.push(`/templates/${templateId}`)}
							className="px-6 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600"
						>
							No, Cancel
						</button>
					</div>
				</div>

				<hr className="my-6" />

				<div>
					<h2 className="text-xl font-bold text-gray-800 mb-4">
						{template.title}
					</h2>
					{template.isFork && (
						<p className="text-blue-500 mb-4">
							Forked from template{" "}
							<span className="underline">{template.originalTemplateId}</span>
						</p>
					)}
					<p className="text-black mb-4">{template.explanation}</p>
					<div className="mb-4, text-black">
						<strong>Tags:</strong>{" "}
						<span className="text-sm text-black">{template.tags}</span>
					</div>
					<textarea
						className="w-full p-4 bg-gray-100 text-black rounded-lg border border-gray-300 resize-none"
						readOnly
						rows={10}
						value={template.code}
					/>
				</div>
			</div>
		</div>
	);
};

export default ForkTemplatePage;
