import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { verifyToken } from "@/utils/jwt";

export default async function handler(req, res) {
	let { id } = req.query;
	id = Number(id);
	if (!id) {
		return res.status(400).json({ error: "Missing ID" });
	}

	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	try {
		const openToken = verifyToken(token);
		const role = openToken.role;
		if (role === "VISITOR") {
			return res.status(403).json({ message: role });
		}
		if (req.method === "PATCH") {
			const post = await prisma.post.findUnique({
				where: {
					id,
				},
			});
			if (!post) {
				return res.status(404).json({ error: "Post not found" });
			}
			const { action } = req.query;
			if (action == "upvote") {
				const updatedPost = await prisma.post.update({
					where: {
						id,
					},
					data: {
						rating: post.rating + 1,
					},
				});
				return res.status(200).json(updatedPost);
			} else if (action == "downvote") {
				const updatedPost = await prisma.post.update({
					where: {
						id,
					},
					data: {
						rating: post.rating - 1,
					},
				});
				return res.status(200).json(updatedPost);
			} else {
				return res.status(400).json({ error: "Invalid action" });
			}
		} else {
			return res.status(405).json({ error: "Method not allowed" });
		}
	} catch (error) {
		return res.status(401).json({ message: "TOKEN MAY HAVE EXPIRED" });
	}
}
