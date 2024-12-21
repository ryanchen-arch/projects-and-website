// returns the comments with the highest number of reports descending

import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/jwt";
const prisma = new PrismaClient();

export default async function handler(req, res) {
	if (req.method === "GET") {
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

			// get pagination parameters from query
			let { page, limit } = req.query;
			page = Number(page) || 1; // default page is 1
			limit = Number(limit) || 10; // default limit is 10

			//calculate offset
			const offset = (page - 1) * limit;

			const reportedComments = await prisma.Comment.findMany({
				where: {
					reportCount: {
						gt: 0,
					},
				},
				orderBy: {
					reportCount: "desc",
				},
				skip: offset,
				take: limit,
			});
			// totalCount and return statement below were generated using GITHUB COPILOT
			const totalCount = await prisma.Comment.count({
				where: {
					reportCount: {
						gt: 0,
					},
				},
			});
			return res.status(200).json({
				data: reportedComments,
				totalCount: totalCount,
				page: page,
				limit: limit,
			});
		} catch (error) {
			return res.status(401).json({ message: "TOKEN MAY HAVE EXPIRED" });
		}
	} else {
		res.status(405).json({ message: "Method not allowed" });
	}
}
