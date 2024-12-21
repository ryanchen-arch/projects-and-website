// THIS IS OUR SAVE FUNCTIONALITY
// create a new template using existing code and tags
// if i fork while logged in, it should save the template to my account

import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/jwt";
const prisma = new PrismaClient();

export default async function handler(req, res) {
	let { tid } = req.query; // template id
	tid = Number(tid);
	if (!tid) {
		return res.status(400).json({ error: "Missing ID" });
	}

	if (req.method === "POST") {
		const token = req.headers.authorization?.split(" ")[1];
		if (!token) {
			return res.status(401).json({ message: "Unauthorized" });
		}
		try {
			const openToken = verifyToken(token);
			const userId = openToken.userId;

			// create a new template using the information from the tId template

			const template = await prisma.template.findUnique({
				where: {
					id: tid,
				},
			});

			if (!template) {
				return res.status(404).json({ error: "Template not found" });
			}

			const { title, explanation, code, tags } = template;

			const newTemplate = await prisma.template.create({
				data: {
					userId,
					title,
					explanation,
					code,
					tags,
					isFork: true,
					originalTemplateId: tid,
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
