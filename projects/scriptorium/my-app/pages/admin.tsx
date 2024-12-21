import React, { useState, useEffect } from "react";
import { getAccessToken } from "@/utils/token";
import { useRouter } from "next/router";

const AdminPage = () => {
	const router = useRouter();

	const [selectedOption, setSelectedOption] = useState("reportedPosts");
	const [reportsData, setReportsData] = useState([]);
	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [limit] = useState(10);

	// Handle dropdown selection
	const handleOptionChange = (event) => {
		setSelectedOption(event.target.value);
		setCurrentPage(1);
	};

	useEffect(() => {
		const fetchReports = async () => {
			setError(null);

			let endpoint = "";

			switch (selectedOption) {
				case "reportedPosts":
					endpoint = `/api/reports/admin/getReports/blogReports?page=${currentPage}&limit=${limit}`;
					break;
				case "reportedComments":
					endpoint = `/api/reports/admin/getReports/commentReports?page=${currentPage}&limit=${limit}`;
					break;
				default:
					endpoint = `/api/reports/admin/getReports/blogReports?page=${currentPage}&limit=${limit}`;
					break;
			}

			const token = getAccessToken();
			if (!token) {
				console.log("Token not found, not authorized");
				router.push("/");
				return;
			}

			try {
				const response = await fetch(endpoint, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});
				if (!response.ok) {
					throw new Error(`Error: ${response.status} ${response.statusText}`);
				}
				const data = await response.json();
				setReportsData(data.data);
				setTotalCount(data.totalCount); // Set total count for pagination
			} catch (err) {
				setError(err.message || "Error fetching reports");
			}
		};

		fetchReports();
	}, [selectedOption, currentPage, limit, router]);

	const totalPages = Math.ceil(totalCount / limit);

	const goToNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	const goToPreviousPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleReportClick = (id) => {
		const contentType =
			selectedOption === "reportedPosts" ? "blogpost" : "comment";
		router.push(`/admin/${contentType}/${id}`);
	};

	return (
		<div className="min-h-screen bg-white p-6">
			<div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
				<h2 className="text-3xl font-semibold text-black mb-6">Admin Page</h2>

				{/* Used AI to ask questions about the dropdown*/}
				<div className="mb-6">
					<label className="text-lg font-medium text-black">
						Select Report Type:
					</label>
					<select
						id="reportType"
						value={selectedOption}
						onChange={handleOptionChange}
						className="mt-2 block w-full p-3 text-black bg-gray-100 border border-gray-300 rounded-lg"
					>
						<option value="reportedPosts">Reported Posts</option>
						<option value="reportedComments">Reported Comments</option>
					</select>
				</div>

				{error && <p className="text-center text-red-500">{error}</p>}

				{reportsData && reportsData.length > 0 ? (
					<div>
						<h3 className="text-2xl font-semibold text-black mb-4">Reports:</h3>
						<div className="space-y-4">
							{/* asked AI on how to do the key */}
							{reportsData.map((report) => (
								<button
									key={report.id}
									onClick={() => handleReportClick(report.id)} // Pass only the ID, contentType is determined inside the function
									className="w-full p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100"
								>
									<div className="flex justify-between">
										<p className="text-lg font-medium text-black">
											{report.title}
										</p>
										<p className="text-sm text-black">
											{report.reportCount} Reports
										</p>
									</div>
								</button>
							))}
						</div>

						<div className="mt-6 flex justify-between items-center">
							<button
								onClick={goToPreviousPage}
								disabled={currentPage === 1}
								className="px-6 py-2 bg-gray-300 text-black rounded-lg shadow hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
							>
								Previous
							</button>
							<span className="text-black">
								Page {currentPage} of {totalPages}
							</span>
							<button
								onClick={goToNextPage}
								disabled={currentPage === totalPages}
								className="px-6 py-2 bg-gray-300 text-black rounded-lg shadow hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
							>
								Next
							</button>
						</div>
					</div>
				) : (
					<p className="text-center text-black">No reports available</p>
				)}
			</div>
		</div>
	);
};

export default AdminPage;
