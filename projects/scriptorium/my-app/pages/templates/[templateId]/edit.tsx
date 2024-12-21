import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAccessToken } from "@/utils/token";

const EditTemplate = () => {
	const router = useRouter();
	const { templateId } = router.query;

	// State for template data and form fields
	const [template, setTemplate] = useState(null);
	const [title, setTitle] = useState("");
	const [explanation, setExplanation] = useState("");
	const [code, setCode] = useState("");
	const [tags, setTags] = useState("");
	const [error, setError] = useState(null);

	useEffect(() => {
		// Fetch template data after login
		const token = getAccessToken();
		if (!token) {
			router.push("/"); // Redirect to login page if token is not set
		}

		const fetchTemplate = async () => {
			setError(null);

			try {
				const response = await fetch(
					`/api/templates/${templateId}/getTemplate`
				);
				if (!response.ok) {
					throw new Error(`Error: ${response.status} ${response.statusText}`);
				}

				const data = await response.json();
				setTemplate(data.template);
				setTitle(data.template.title);
				setExplanation(data.template.explanation);
				setCode(data.template.code);
				setTags(data.template.tags);
			} catch (err) {
				setError(err.message || "Error fetching template");
			}
		};

		if (templateId) {
			fetchTemplate();
		}
	}, [templateId]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		try {
			const token = getAccessToken();
			const response = await fetch(`/api/templates/${templateId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`, // Attach token to the request
				},
				body: JSON.stringify({ title, explanation, code, tags }),
			});

			if (!response.ok) {
				throw new Error("Failed to update template");
			}

			const updatedTemplate = await response.json();
			router.push(`/templates/${updatedTemplate.id}`); // Redirect to updated template
		} catch (err) {
			setError(err.message || "Error updating template");
		}
	};

	if (!template)
		return <p className="text-center text-black">No template found</p>;

	return (
		<div className="min-h-screen bg-white p-6">
			<div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
				<h1 className="text-2xl font-bold mb-6 text-black">Edit Template</h1>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-black mb-1">
							Title:
						</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="w-full bg-gray-100 text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-black mb-1">
							Explanation:
						</label>
						<input
							type="text"
							value={explanation}
							onChange={(e) => setExplanation(e.target.value)}
							className="w-full bg-gray-100 text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-black mb-1">
							Code:
						</label>
						<textarea
							value={code}
							onChange={(e) => setCode(e.target.value)}
							className="w-full bg-gray-100 text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
							rows={10}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-black mb-1">
							Tags:
						</label>
						<input
							type="text"
							value={tags}
							onChange={(e) => setTags(e.target.value)}
							className="w-full bg-gray-100 text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					<div className="flex justify-end gap-4">
						<button
							type="submit"
							className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Save Changes
						</button>
					</div>
				</form>

				{error && <p className="text-red-500 mt-4">{error}</p>}
			</div>
		</div>
	);
};

export default EditTemplate;
