import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAccessToken } from "@/utils/token";

const DeleteTemplatePage = () => {
	const router = useRouter();
	const { templateId } = router.query;

	const [template, setTemplate] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		const token = getAccessToken();
		if (!token) {
			console.log("No token found, not logged in");
			router.push("/");
		}

		const fetchData = async () => {
			setError(null);

			try {
				if (templateId) {
					const response = await fetch(
						`/api/templates/${templateId}/getTemplate`
					);
					if (!response.ok) throw new Error("Error fetching template");

					const data = await response.json();
					setTemplate(data.template);
				}
			} catch (err) {
				setError(err.message);
			}
		};

		fetchData();
	}, [templateId]);

	// Handle template deletion
	const handleDelete = async () => {
		const token = getAccessToken();
		setError(null);

		try {
			const response = await fetch(`/api/templates/${templateId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) throw new Error("Failed to delete template");

			router.push("/");
		} catch (err) {
			setError(err.message || "Error deleting template");
		}
	};

	// Handle cancel action
	const handleCancel = () => {
		router.push(`/templates/${templateId}`);
	};

	if (error) return <p className="text-center text-red-500">{error}</p>;
	if (!template)
		return <p className="text-center text-black">No template found</p>;

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
				<h1 className="text-2xl font-bold text-black mb-4">Delete Template</h1>
				<p className="text-black mb-6">
					Are you sure you want to delete the following template? This action
					cannot be undone.
				</p>

				{/* AI was used to help with textArea design */}
				<div className="p-4">
					<h2 className="text-lg font-semibold text-black">{template.title}</h2>
					{template.isForked && (
						<p className="text-sm text-black">
							Forked from template ID: {template.originalTemplateId}
						</p>
					)}
					<p className="text-black mt-2">{template.explanation}</p>
					<div className="mt-4 text-black">
						<strong>Tags:</strong>{" "}
						<span className="text-sm text-black">{template.tags}</span>
					</div>
					<textarea
						readOnly
						className="w-full mt-4 p-2 text-black bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700"
						rows={6}
						value={template.code}
					></textarea>
				</div>

				<div className="flex gap-4">
					<button
						onClick={handleDelete}
						className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 disabled:opacity-50"
					>
						Yes, Delete
					</button>
					<button
						onClick={handleCancel}
						className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg shadow hover:bg-gray-400 disabled:opacity-50"
					>
						No, Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

export default DeleteTemplatePage;
