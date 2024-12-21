// USED to retrieve the template by its id
// Use cases are for blogposts that need to show a template.
// or if we watn to show a selected template.

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
	let { tid } = req.query; // template id
	tid = Number(tid);
	if (!tid) {
		return res.status(400).json({ message: "Missing ID" });
	}

	if (req.method === "GET") {
		const template = await prisma.template.findUnique({
			where: {
				id: tid,
			},
		});
		if (!template) {
			return res.status(404).json({ error: "Template not found" });
		}
		return res.status(200).json({ template });
	} else {
		res.status(405).json({ message: "Method not allowed" });
	}
}
