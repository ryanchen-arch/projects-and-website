import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAccessToken } from "@/utils/token";

const CreateTemplate = () => {
	const [title, setTitle] = useState("");
	const [explanation, setExplanation] = useState("");
	const [code, setCode] = useState("");
	const [tags, setTags] = useState("");
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const token = getAccessToken();
		if (!token) {
			console.log("No token found");
			router.push("/templates");
		}
	}, []);

	// Handle template creation
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault(); // Prevent default form submission (page reload)

		// Check if all fields are filled out
		if (!title || !explanation || !code || !tags) {
			setError("All fields are required");
			return;
		}

		setError(null);

		const token = getAccessToken();
		console.log("my token", token);
		try {
			const response = await fetch("/api/templates/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`, // Attach token in Authorization header
				},
				body: JSON.stringify({ title, explanation, code, tags }),
			});

			if (!response.ok) {
				throw new Error("Failed to create template");
			}

			const newTemplate = await response.json();
			console.log("Template created:", newTemplate);

			router.push(`/templates/${newTemplate.id}`);
		} catch (err) {
			setError(err.message || "Error creating template");
		}
	};

	// This was AI genereated to handle the resizing of the text area as the text gets longer
	// Auto resize textarea function
	const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setCode(e.target.value);
		// Auto resize logic
		e.target.style.height = "auto";
		e.target.style.height = `${e.target.scrollHeight}px`;
	};

	return (
		<div className="bg-white text-black min-h-screen p-6">
			<h1 className="text-3xl font-bold mb-6">Create New Template</h1>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Title:
					</label>
					<input
						id="title"
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-400"
					/>
				</div>

				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Tags (comma separated):
					</label>
					<input
						id="tags"
						type="text"
						value={tags}
						onChange={(e) => setTags(e.target.value)}
						className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-400"
					/>
				</div>

				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Explanation:
					</label>
					<input
						id="explanation"
						type="text"
						value={explanation}
						onChange={(e) => setExplanation(e.target.value)}
						className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-400"
					/>
				</div>

				<div>
					{/* Used AI to see how to do the resizing of the text area as the text gets longer*/}
					<label className="block text-sm font-semibold text-black mb-2">
						Code:
					</label>
					<textarea
						id="code"
						value={code}
						onChange={handleCodeChange}
						className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-400 resize-none"
						style={{ minHeight: "100px" }} // Ensure the textarea starts with a minimum height
					/>
				</div>

				{error && <p className="text-red-500 text-sm">{error}</p>}

				<button
					type="submit"
					className="w-full bg-blue-500 text-white p-3 rounded-lg "
				>
					Create Template
				</button>
			</form>
		</div>
	);
};

export default CreateTemplate;
