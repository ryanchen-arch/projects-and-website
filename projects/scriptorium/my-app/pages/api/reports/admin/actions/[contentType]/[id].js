//This file will be used for admin related tasks
// Flagging content that is inappropriate
// Passing content that is okay

import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/jwt";
const prisma = new PrismaClient();

export default async function handler(req, res) {
	let { contentType, id, action } = req.query;
	if (!contentType || !id || !action) {
		return res.status(400).json({ error: "Missing ID or TYPE or ACTION" });
	}
	id = Number(id);

	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	try {
		const openToken = verifyToken(token);
		const role = openToken.role;
		if (role !== "ADMIN") {
			return res.status(403).json({ message: "Unauthorized" });
		}
		if (req.method === "PATCH") {
			if (action === "flag") {
				if (contentType === "blogpost") {
					const blogPost = await prisma.Post.findUnique({
						where: {
							id,
						},
					});
					if (!blogPost) {
						return res.status(404).json({ error: "Blog Post not found" });
					}
					const updatedBlogPost = await prisma.Post.update({
						where: {
							id,
						},
						data: {
							isHidden: true,
							reportCount: 0, // so it doesn't reappear on the admin page
						},
					});
					return res.status(200).json(updatedBlogPost);
				} else if (contentType === "comment") {
					const comment = await prisma.comment.findUnique({
						where: {
							id,
						},
					});
					if (!comment) {
						return res.status(404).json({ error: "Comment not found" });
					}
					const updatedComment = await prisma.comment.update({
						where: {
							id,
						},
						data: {
							isHidden: true,
							reportCount: 0, // so it doesn't reappear on the admin page
						},
					});
					return res.status(200).json(updatedComment);
				} else {
					return res.status(400).json({ error: "Invalid content type" });
				}
			} else if (action === "pass") {
				if (contentType === "blogpost") {
					const blogPost = await prisma.Post.findUnique({
						where: {
							id,
						},
					});
					if (!blogPost) {
						return res.status(404).json({ error: "Blog Post not found" });
					}
					const updatedBlogPost = await prisma.Post.update({
						where: {
							id,
						},
						data: {
							reportCount: 0, // so it doesn't reappear on the admin page
						},
					});
					return res.status(200).json(updatedBlogPost);
				} else if (contentType === "comment") {
					const comment = await prisma.comment.findUnique({
						where: {
							id,
						},
					});
					if (!comment) {
						return res.status(404).json({ error: "Comment not found" });
					}
					const updatedComment = await prisma.comment.update({
						where: {
							id,
						},
						data: {
							reportCount: 0, // so it doesn't reappear on the admin page
						},
					});
					return res.status(200).json(updatedComment);
				} else {
					return res.status(400).json({ error: "Invalid content type" });
				}
			} else {
				return res.status(400).json({ error: "Invalid action" });
			}
		} else {
			return res.status(405).json({ message: "Method not allowed" });
		}
	} catch (error) {
		return res.status(401).json({ message: "TOKEN MAY HAVE EXPIRED" });
	}
}
