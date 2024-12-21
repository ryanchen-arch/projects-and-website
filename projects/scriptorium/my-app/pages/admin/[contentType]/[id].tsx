import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAccessToken } from "@/utils/token";

const ReportDetailPage = () => {
	const router = useRouter();
	const { contentType, id } = router.query;

	const [reports, setReports] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	// Fetch reports on page load
	useEffect(() => {
		if (!contentType || !id) return;

		const fetchReports = async () => {
			setIsLoading(true);
			setError(null);

			const token = getAccessToken();
			if (!token) {
				console.log("Token not found, not authorized");
				router.push("/"); // Redirect if no token is found
				return;
			}

			try {
				const response = await fetch(
					`/api/reports/admin/reportsByContent/${contentType}/${id}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!response.ok) {
					throw new Error(`Error: ${response.status} ${response.statusText}`);
				}

				const data = await response.json();
				setReports(data);
			} catch (err) {
				setError(err.message || "Error fetching report details");
			} finally {
				setIsLoading(false);
			}
		};

		fetchReports();
	}, [contentType, id, router]);

	const handleContentAction = async (action) => {
		const token = getAccessToken();
		if (!token) {
			console.log("Token not found, not authorized");
			router.push("/");
			return;
		}

		try {
			const response = await fetch(
				`/api/reports/admin/actions/${contentType}/${id}?action=${action}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				throw new Error(`Error: ${response.status} ${response.statusText}`);
			}

			alert(
				`Content has been ${
					action === "flag" ? "flagged" : "passed"
				} successfully.`
			);
			router.push("/admin");
		} catch (err) {
			setError(err.message || "Error performing action");
		}
	};

	return (
		<div className="min-h-screen bg-white p-6">
			<div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
				<h2 className="text-2xl font-bold text-gray-800 mb-6">
					Report Details
				</h2>

				{/* Display Loading state */}
				{isLoading && <p className="text-center text-gray-500">Loading...</p>}

				{/* Display Error message */}
				{error && <p className="text-center text-red-500">{error}</p>}

				{/* Display the report details */}
				{reports.length > 0 ? (
					<div>
						<div className="flex gap-4 mb-6">
							<button
								onClick={() => handleContentAction("pass")}
								className="px-6 py-2 bg-green text-white font-semibold rounded-lg shadow hover:bg-green-600"
							>
								Pass
							</button>
							<button
								onClick={() => handleContentAction("flag")}
								className="px-6 py-2 bg-red text-white font-semibold rounded-lg shadow hover:bg-red-600"
							>
								Flag
							</button>
							<button
								className="px-6 py-2 bg-gray-300 text-black font-semibold rounded-lg shadow hover:bg-gray-400"
								onClick={() => router.push("/")}
							>
								Go To Content
							</button>
						</div>

						<h3 className="text-lg font-semibold text-black mb-4">
							Reports for this Content:
						</h3>
						<ul className="space-y-4">
							{reports.map((report) => (
								<li
									key={report.id}
									className="p-4 bg-gray-50 rounded-lg border border-gray-200"
								>
									<p className="text-sm text-black">
										<strong>Report ID:</strong> {report.id}
									</p>
									<p className="text-sm text-black mt-1">
										{report.explanation}
									</p>
								</li>
							))}
						</ul>
					</div>
				) : (
					!isLoading && (
						<p className="text-center text-black">
							No reports found for this content.
						</p>
					)
				)}
			</div>
		</div>
	);
};

export default ReportDetailPage;
