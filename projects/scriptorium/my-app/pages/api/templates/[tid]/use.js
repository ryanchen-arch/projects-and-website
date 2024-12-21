// Returns the just the code portion of the template,
// This is what would lead to the editor to display the code.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
	let { tid } = req.query; // template id
	tid = Number(tid);
	if (!tid) {
		return res.status(400).json({ error: "Missing ID" });
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
		return res.status(200).json({ code: template.code });
	} else {
		res.status(405).json({ message: "Method not allowed" });
	}
}
