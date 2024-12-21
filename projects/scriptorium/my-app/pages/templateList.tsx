import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

const TemplatesList = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [templates, setTemplates] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [error, setError] = useState(null);

	const LIMIT = 10;
	const router = useRouter();

	const fetchTemplates = async (search = "", page = 1, limit = LIMIT) => {
		setError(null);

		try {
			const response = await fetch(
				`/api/templates/search?search=${encodeURIComponent(
					search
				)}&page=${page}&limit=${limit}`
			);

			if (!response.ok) {
				throw new Error(`Error: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();

			setTemplates(data.data); // Assuming API returns `data` with templates
			setTotalPages(Math.ceil(data.totalCount / limit)); // Calculate total pages
		} catch (err) {
			setError(err.message || "Error fetching templates");
		}
	};

	useEffect(() => {
		fetchTemplates(searchTerm, currentPage);
	}, [searchTerm, currentPage]);

	const handleSearch = (e) => {
		e.preventDefault();
		setCurrentPage(1); // Reset to the first page on new search
		fetchTemplates(searchTerm, 1);
	};

	const handlePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	const handleTemplateClick = (templateId) => {
		router.push(`/templates/${templateId}`);
	};

	const handleCreateTemplate = () => {
		router.push("/templates/create-template");
	};

	// Check for templateId in the URL to display Template details
	const { templateId } = router.query;

	return (
		<div className="bg-white text-gray-900 max-w-7xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">Templates</h1>

			{/* Used AI to help build search bar*/}
			<form onSubmit={handleSearch} className="flex mb-6">
				<input
					type="text"
					placeholder="Search templates..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-l-md flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<button
					type="submit"
					className="px-6 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					Search
				</button>
			</form>

			<button
				onClick={handleCreateTemplate}
				className="mb-6 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
			>
				Create New Template
			</button>

			{error && <p className="text-red-500">{error}</p>}

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{templates.map((template) => (
					<button
						key={template.id}
						onClick={() => handleTemplateClick(template.id)}
						className="p-6 border border-gray-200 rounded-lg shadow-md hover:bg-gray-50"
					>
						<h3 className="text-xl font-semibold mb-2">{template.title}</h3>
						<p className="text-gray-700 mb-2">{template.explanation}</p>
						<p className="text-sm text-gray-500">Tags: {template.tags}</p>
					</button>
				))}
			</div>

			{/* used AI to help make these buttons look nice */}
			<div className="mt-6 flex items-center justify-between">
				<button
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
				>
					Previous
				</button>
				<span className="text-lg">
					Page {currentPage} of {totalPages}
				</span>
				<button
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
				>
					Next
				</button>
			</div>
		</div>
	);
};

export default TemplatesList;
