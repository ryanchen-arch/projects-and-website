import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../utils/jwt"; // Middleware to validate JWT

const prisma = new PrismaClient();

export default async function handler(req, res) {
	if (req.method === "POST") {
		const token = req.headers.authorization?.split(" ")[1];
		if (!token) {
			return res.status(401).json({ message: "Unauthorized: no token" });
		}

		// Verify the token
		const decoded = verifyToken(token);
		if (!decoded) {
			return res.status(401).json({ error: "Unauthorized: invalid token" });
		}
		const { content, postId, authorId, parentId } = req.body;

		try {
			const comment = await prisma.comment.create({
				data: {
					content,
					postId,
					authorId,
					parentId,
					reportCount: 0, // Optional, remove if not necessary
					isHidden: false, // Optional, sets visibility for new comments
				},
			});
			res.status(201).json(comment);
		} catch (error) {
			console.error(error); // Log the error for better debugging
			res
				.status(500)
				.json({ error: "Failed to create comment.", message: error.message });
		}
	} else {
		res.setHeader("Allow", ["POST"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
