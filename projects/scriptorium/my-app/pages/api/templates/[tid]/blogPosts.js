// GET ALL THE BLOG POSTS THAT CONTAIN THIS TEMPLATE

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
	let { tid, page, limit } = req.query; // template id
	tid = Number(tid);
	page = Number(page) || 1; // default page is 1
	limit = Number(limit) || 10; // default limit is 10
	const offset = (page - 1) * limit;

	const totalCount = await prisma.Post.count({
		where: {
			templateId: tid,
		},
	});

	if (!tid) {
		return res.status(400).json({ error: "Missing ID" });
	}

	if (req.method === "GET") {
		const blogPosts = await prisma.Post.findMany({
			where: {
				templateId: tid,
			},
			skip: offset,
			take: limit,
		});
		if (!blogPosts) {
			return res.status(404).json({ error: "No blog posts found" });
		} else {
			return res.status(200).json({
				data: blogPosts,
				totalCount: totalCount,
				page: page,
				limit: limit,
			});
		}
	}
}
