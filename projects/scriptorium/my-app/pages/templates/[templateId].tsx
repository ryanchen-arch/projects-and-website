import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useTemplateContext } from "../templateContext";
import { getAccessToken } from "@/utils/token";
import jwt_decode, { jwtDecode } from "jwt-decode";

const TemplatePage = () => {
	const router = useRouter();
	const { templateId } = router.query;
	const [template, setTemplate] = useState(null);
	const [blogPosts, setBlogPosts] = useState([]); // To store blog posts
	const [error, setError] = useState(null);
	const { setTemplateCode } = useTemplateContext(); // Access the setTemplateCode function from context
	const [userIdFromToken, setUserIdFromToken] = useState<string | null>(null);
	const [isLoggedin, setIsLoggedin] = useState(false);

	// only asked AI what to use and it said jwtDecode
	useEffect(() => {
		interface DecodedToken {
			userId: string;
			role: string;
		}

		const getDecodedToken = (token: string): DecodedToken | null => {
			try {
				const decoded: DecodedToken = jwtDecode(token);
				return decoded;
			} catch (err) {
				console.error(err);
				return null;
			}
		};

		const token = getAccessToken();
		if (token) {
			const decoded = getDecodedToken(token);
			setUserIdFromToken(decoded.userId);
			setIsLoggedin(true);
		}
	}, [router]);

	useEffect(() => {
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
				setTemplate(data.template); // Template data
			} catch (err) {
				setError(err.message || "Error fetching template");
			}
		};

		if (templateId) {
			fetchTemplate();
		}
	}, [templateId]);

	useEffect(() => {
		const fetchBlogPosts = async () => {
			try {
				const response = await fetch(
					`/api/templates/${templateId}/blogPosts?tid=${templateId}&page=1&limit=10`
				);
				if (!response.ok) {
					throw new Error(`Error: ${response.status} ${response.statusText}`);
				}
				const data = await response.json();
				// Filter out hidden blog posts
				setBlogPosts(data.data.filter((post) => !post.isHidden));
			} catch (err) {
				setError(err.message || "Error fetching blog posts");
			}
		};

		if (templateId) {
			fetchBlogPosts();
		}
	}, [templateId]);

	const handleEditClick = () => {
		router.push(`/templates/${templateId}/edit`);
	};

	const handleDeleteClick = () => {
		router.push(`/templates/${templateId}/delete`);
	};

	const handleForkClick = () => {
		router.push(`/templates/${templateId}/fork`);
	};

	//AI was used for errors in this context
	const handleUseClick = () => {
		// Store the template code in the context when "Use Code" is clicked
		if (template && template.code) {
			setTemplateCode(template.code);
			router.push("/editor");
		}
	};

	if (error) return <p className="text-center text-red-500">{error}</p>;
	if (!template)
		return <p className="text-center text-gray-500">No template found</p>;

	return (
		<div className="p-6 bg-white min-h-screen">
			<div className="max-w-4xl mx-auto bg-gray-50 p-6 rounded-lg shadow-md">
				<h2 className="text-2xl font-bold mb-4 text-black">{template.title}</h2>
				{template.isFork && template.originalTemplateId && (
					<p className="text-blue-500 underline">
						Forked from{" "}
						<Link href={`/templates/${template.originalTemplateId}`}>
							template ID: {template.originalTemplateId}
						</Link>
					</p>
				)}
				<p className="text-black mb-4">{template.explanation}</p>
				<div className="mb-4 text-black">
					<strong>Tags:</strong>{" "}
					<span className="text-black">{template.tags}</span>
				</div>
				<textarea
					className="w-full p-4 text-black bg-gray-100 rounded-lg border border-gray-300 resize-none"
					readOnly
					rows={10}
					value={template.code} // this line is part of the context I used ai for
				/>

				<div className="mt-6 flex flex-wrap gap-4">
					{template.userId === userIdFromToken && (
						<>
							<button
								className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
								onClick={handleEditClick}
							>
								Edit Template
							</button>
							<button
								className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
								onClick={handleDeleteClick}
							>
								Delete Template
							</button>
						</>
					)}
					{isLoggedin && (
						<button
							className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
							onClick={handleForkClick}
						>
							Fork Template
						</button>
					)}
					<button
						className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600"
						onClick={handleUseClick}
					>
						Use Code
					</button>
				</div>
			</div>

			<h1 className="text-xl text-black font-bold mt-8 mb-4">
				Blog Posts Mentioning This Template
			</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{blogPosts.map((post) => (
					<button
						key={post.id}
						className="p-4 border rounded-lg shadow hover:shadow-lg transition duration-200 text-left"
					>
						<h4 className="font-bold text-gray-800 mb-2">{post.title}</h4>
						<p className="text-sm text-gray-600">{post.tags}</p>
					</button>
				))}
			</div>
		</div>
	);
};

export default TemplatePage;
