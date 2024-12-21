// this will be used to get a specific report by id

import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/jwt";
const prisma = new PrismaClient();

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
		if (role !== "ADMIN") {
			return res.status(403).json({ message: "Unauthorized" });
		}
		if (req.method === "GET") {
			const report = await prisma.report.findUnique({
				where: {
					id,
				},
			});
			if (!report) {
				return res.status(404).json({ error: "Report not found" });
			}
			return res.status(200).json(report);
		} else {
			return res.status(405).json({ error: "Method not allowed" });
		}
	} catch (error) {
		return res.status(401).json({ message: "TOKEN MAY HAVE EXPIRED" });
	}
}
