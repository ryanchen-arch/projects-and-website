// POST: Allow authenticated users to create new template

import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/jwt";
const prisma = new PrismaClient();

export default async function handler(req, res) {
	if (req.method === "POST") {
		// check if user is authenticated
		// userId should come from the JWT

		const token = req.headers.authorization?.split(" ")[1];
		if (!token) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		try {
			const openToken = verifyToken(token);
			const userId = openToken.userId; // THIS COULD BE DIFFERENT DEPENDING ON WHAT ADAM CALLED IT IN THE TOKEN

			// create a new template
			const { title, explanation, code, tags } = req.body;

			if (!title || !explanation || !code || !tags) {
				return res.status(400).json({ error: "Missing required fields" });
			}

			const newTemplate = await prisma.template.create({
				data: {
					userId,
					title,
					explanation,
					code,
					tags,
				},
			});

			return res.status(201).json(newTemplate);
		} catch (error) {
			return res
				.status(401)
				.json({ message: "TOKEN MAY HAVE EXPIRED", error: error.message });
		}
	} else {
		res.status(405).json({ message: "Method not allowed" });
	}
}
