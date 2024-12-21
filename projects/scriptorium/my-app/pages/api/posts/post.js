import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../utils/jwt"; // Middleware to validate JWT
import { equal } from "assert";

const prisma = new PrismaClient();

export default async function handler(req, res) {
	if (req.method === "POST") {
		return createPost(req, res);
	}
	if (req.method === "GET") {
		return getPosts(req, res);
	}
	// Handle unsupported request methods
	return res.status(405).json({ error: "Method Not Allowed" });
}

// Function to create a blog post
async function createPost(req, res) {
	const { title, description, tags = [], templateId } = req.body; // Default tags to an empty array if not provided

	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		return res.status(401).json({ message: "Unauthorized: no token" });
	}

	// Verify the token

	const decoded = verifyToken(token);
	if (decoded.error) {
		return res.status(401).json({ error: `Unauthorized: ${decoded.error}` });
	}

	const { userId } = decoded; // Extract userId from decoded token

	try {
		const postData = {
			title,
			author: {
				connect: { id: userId }, // Use user ID from the authenticated user
			},
		};

		// Include description and tags only if they are not null
		if (description) {
			postData.description = description;
		}

		if (tags.length > 0) {
			postData.tags = tags.join(","); // Save tags as a comma-separated string
		}

		// Include Template only if it's provided
		if (templateId) {
			postData.Template = { connect: { id: templateId } };
		}

		const post = await prisma.post.create({
			data: postData,
		});

		res.status(201).json(post);
	} catch (error) {
		console.error("Error creating post:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}
// Function to retrieve all blog posts with pagination and search functionality
async function getPosts(req, res) {
	const {
		page = 1,
		limit = 10,
		title,
		content,
		authorID,
		tags,
		code,
		topRated,
		lowestRated,
	} = req.query;

	const pageNumber = parseInt(page, 10);
	const limitNumber = parseInt(limit, 10);

	if (
		isNaN(pageNumber) ||
		pageNumber < 1 ||
		isNaN(limitNumber) ||
		limitNumber < 1
	) {
		return res.status(400).json({ error: "Invalid page or limit" });
	}

	try {
		// Building dynamic search criteria based on the provided query parameters
		const searchCriteria = {
			OR: [],
		};

		if (title) {
			searchCriteria.OR.push({
				title: { contains: title },
			});
		}
		if (content) {
			searchCriteria.OR.push({
				description: { contains: content },
			});
		}
		if (authorID) {
			searchCriteria.OR.push({
				authorID: { equal: authorID },
			});
		}
		//if (tags) {
		//	searchCriteria.OR.push({ tags: { has: tags } });
		//}

		// If no specific search criteria are given, remove the OR filter to fetch all posts
		const whereCondition = searchCriteria.OR.length > 0 ? searchCriteria : {};

		// Fetch paginated posts based on search criteria
		var posts = await prisma.post.findMany({
			where: whereCondition,
			include: {
				Template: true, // Include template details (ensure this matches your Prisma schema)
				author: true, // Include author details
			},
			skip: (pageNumber - 1) * limitNumber,
			take: limitNumber,
		});

		if (topRated === "true") {
			posts = await prisma.post.findMany({
				include: {
					Template: true, // Include template details (ensure this matches your Prisma schema)
					author: true, // Include author details
				},
				orderBy: {
					rating: "desc", // Sort by highest rating
				},
				take: 5, // Limit to top 5 highest-rated posts
			});
		}

		// Fetch the lowest rated posts (if requested)
		if (lowestRated === "true") {
			posts = await prisma.post.findMany({
				include: {
					Template: true, // Include template details (ensure this matches your Prisma schema)
					author: true, // Include author details
				},
				orderBy: {
					rating: "asc", // Sort by lowest rating
				},
				take: 5, // Limit to top 5 lowest-rated posts
			});
		}

		// Count posts that match the search criteria for pagination metadata
		const totalPosts = await prisma.post.count({
			where: whereCondition,
		});

		// Return posts along with pagination metadata
		res.status(200).json({
			posts,
			totalPosts,
			totalPages: Math.ceil(totalPosts / limitNumber),
			currentPage: pageNumber,
		});
	} catch (error) {
		console.error("Error fetching posts:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}
// modified