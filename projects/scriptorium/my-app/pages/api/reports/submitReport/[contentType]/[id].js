// Allows anyone to report BlogPost or Comment
// Must also give an explanation

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
	let { contentType, id } = req.query;
	id = Number(id);
	if (!contentType || !id) {
		return res.status(400).json({ error: "MISSING ID or TYPE" });
	}
	if (req.method === "POST") {
		const { explanation } = req.body;
		if (!explanation) {
			return res.status(400).json({ error: "Missing explanation" });
		}
		// Create Report and update the report count of the content
		if (contentType === "blogpost") {
			// Check if the blog post exists
			const blogPost = await prisma.Post.findUnique({
				where: {
					id,
				},
			});
			if (!blogPost) {
				return res.status(404).json({ error: "Blog Post not found" });
			}
			//Create report
			const report = await prisma.report.create({
				data: {
					explanation,
					contentType: contentType,
					postId: id,
				},
			});
			// Increment the report count of the blog post
			const updateReportCount = await prisma.Post.update({
				where: {
					id: id,
				},
				data: {
					reportCount: {
						increment: 1,
					},
				},
			});
			return res.status(201).json(report);
		} else if (contentType === "comment") {
			// Check if the comment exists
			const comment = await prisma.Comment.findUnique({
				where: {
					id,
				},
			});
			if (!comment) {
				return res.status(404).json({ error: "Comment not found" });
			}
			//create report
			const report = await prisma.report.create({
				data: {
					explanation,
					contentType: contentType,
					commentId: id,
				},
			});
			// Increment the report count of the comment
			const updateReportCount = await prisma.Comment.update({
				where: {
					id: id,
				},
				data: {
					reportCount: {
						increment: 1,
					},
				},
			});
			return res.status(201).json(report);
		} else {
			return res.status(400).json({ error: "Invalid content type" });
		}
	} else {
		return res.status(405).json({ error: "Method not allowed" });
	}
}
