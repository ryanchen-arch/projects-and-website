// gets all the reports for specific conntent type and id

import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/jwt";
const prisma = new PrismaClient();

export default async function handler(req, res) {
	let { contentType, id } = req.query;
	id = Number(id);
	if (!id || !contentType) {
		return res.status(400).json({ error: "Missing ID or TYPE" });
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
			let reports;
			if (contentType === "blogpost") {
				reports = await prisma.report.findMany({
					where: {
						contentType,
						postId: id,
					},
				});
			} else if (contentType === "comment") {
				reports = await prisma.report.findMany({
					where: {
						contentType,
						commentId: id,
					},
				});
			} else {
				return res.status(400).json({ error: "Invalid content type" });
			}

			if (!reports) {
				return res.status(404).json({ error: "Reports not found" });
			}
			return res.status(200).json(reports);
		} else {
			return res.status(405).json({ error: "Method not allowed" });
		}
	} catch (error) {
		return res
			.status(401)
			.json({ message: "TOKEN MAY HAVE EXPIRED", error: error.message });
	}
}
