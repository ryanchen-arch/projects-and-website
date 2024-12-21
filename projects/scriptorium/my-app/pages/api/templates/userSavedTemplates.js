//GET: retrieves all templates made/forked by this user
// IF PARAMS ARE GIVEN ONLY GIVES RESULTS THAT REFLECT PARAMS
// IF NO PARAMS THEN RETURNS ALL TEMPLATES USER HAS

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
			const userId = openToken.userId; // THIS COULD BE DIFFERENT DEPENDING ON WHAT ADAM CALLED IT IN THE TOKEN

			let { search, page, limit } = req.query;
			page = Number(page) || 1; // default page is 1
			limit = Number(limit) || 10; // default limit is 10
			const offset = (page - 1) * limit;

			const totalCount = await prisma.template.count({
				where: {
					userId,
				},
			});

			// chekc ifg anything was included in teh search
			// if not then return the templates that have been made by the user
			if (!search) {
				const templates = await prisma.template.findMany({
					where: {
						userId,
					},
					skip: offset,
					take: limit,
				});
				return res.status(200).json(templates);
			} else {
				const templates = await prisma.template.findMany({
					where: {
						userId,
						OR: [
							{
								title: {
									contains: search,
								},
							},
							{
								explanation: {
									contains: search,
								},
							},
							{
								code: {
									contains: search,
								},
							},
							{
								tags: {
									contains: search,
								},
							},
						],
					},
					skip: offset,
					take: limit,
				});
				return res.status(200).json({
					data: templates,
					totalCount: totalCount,
					page: page,
					limit: limit,
				});
			}
		} catch (error) {
			return res
				.status(401)
				.json({ message: "TOKEN MAY HAVE EXPIRED", error: error.message });
		}
	} else {
		res.status(405).json({ message: "Method not allowed" });
	}
}
