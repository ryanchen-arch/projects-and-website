import React, { useState, ChangeEvent } from "react";

interface ReportButtonProps {
	contentType: "blogpost" | "comment";
	id: number;
}

const ReportButton: React.FC<ReportButtonProps> = ({ contentType, id }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [explanation, setExplanation] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	const handleOpenModal = () => {
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setExplanation("");
		setErrorMessage("");
	};

	const handleExplanationChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		setExplanation(event.target.value);
	};

	const handleSubmitReport = async () => {
		if (!explanation.trim()) {
			setErrorMessage("Explanation is required.");
			return;
		}

		try {
			const response = await fetch(
				`/api/reports/submitReport/${contentType}/${id}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ explanation }),
				}
			);

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to submit report");
			}
		} catch (error: any) {
			setErrorMessage(error.message || "An error occurred.");
		}
	};

	return (
		<>
			{/* Report Button */}
			<button
				onClick={handleOpenModal}
				className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
			>
				Report
			</button>

			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white p-6 rounded shadow-md w-96">
						<h2 className="text-lg font-bold mb-4">Report {contentType}</h2>

						<textarea
							className="w-full p-2 border rounded mb-4"
							rows={4}
							placeholder="Explain why you are reporting this..."
							value={explanation}
							onChange={handleExplanationChange}
						></textarea>

						{errorMessage && (
							<p className="text-red-500 text-sm mb-4">{errorMessage}</p>
						)}

						{/* Buttons */}
						<div className="flex justify-end gap-2">
							<button
								onClick={handleCloseModal}
								className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
							>
								Cancel
							</button>
							<button
								onClick={handleSubmitReport}
								className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
							>
								Submit
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default ReportButton;
