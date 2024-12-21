// UPDATE OR DELETE TEMPLATES
// INSURE THAT THE USERID MATCHES THAT OF THE TEMPLATE OWNER

import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/jwt";
const prisma = new PrismaClient();

export default async function handler(req, res) {
	let { tid } = req.query; // template id
	tid = Number(tid);
	if (!tid) {
		return res.status(400).json({ error: "Missing ID" });
	}

	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	if (req.method === "PUT" || req.method === "DELETE") {
		try {
			const openToken = verifyToken(token);
			const userId = openToken.userId;

			const template = await prisma.template.findUnique({
				where: {
					id: tid,
				},
			});

			if (!template) {
				return res.status(404).json({ error: "Template not found" });
			}

			if (template.userId !== userId) {
				return res.status(403).json({ error: "Unauthorized" });
			}

			if (req.method === "PUT") {
				const { title, explanation, code, tags } = req.body;
				if (!title || !explanation || !code || !tags) {
					return res.status(400).json({ error: "Missing required fields" });
				}

				const updatedTemplate = await prisma.template.update({
					where: {
						id: tid,
					},
					data: {
						title,
						explanation,
						code,
						tags,
					},
				});
				return res.status(200).json(updatedTemplate);
			} else if (req.method === "DELETE") {
				await prisma.template.delete({
					where: {
						id: tid,
					},
				});
				return res.status(200).json({ message: "Template deleted" });
			}
		} catch (error) {
			return res.status(401).json({ message: "TOKEN MAY HAVE EXPIRED" });
		}
	} else {
		res.status(405).json({ message: "Method not allowed" });
	}
}
