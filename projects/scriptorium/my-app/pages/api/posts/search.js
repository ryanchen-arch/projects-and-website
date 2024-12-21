import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
	if (req.method === "GET") {
		return getPosts(req, res);
	} else {
		return res.status(405).json({ message: "Method Not Allowed" });
	}
}

// Function to retrieve posts and comments sorted by ratings
async function getPosts(req, res) {
	let { search, page, limit, sortBy } = req.query;

	page = Number(page) || 1; // default page is 1
	limit = Number(limit) || 10; // default limit is 10
	const offset = (page - 1) * limit;

	try {
		// Define sorting order based on `sortBy` query
		const order = sortBy === "lowestRated" ? "asc" : "desc";

		// Handle case where no search term is provided
		if (!search) {
			const posts = await prisma.post.findMany({
				skip: offset,
				take: limit,
				orderBy: {
					rating: order, // Sort by rating (highest or lowest)
				},
				include: {
					Template: true,
					author: true,
					comments: {
						orderBy: {
							rating: order, // Sort comments by rating
						},
					},
				},
			});

			const totalCount = await prisma.post.count();
			return res.status(200).json({
				data: posts,
				totalCount,
				page,
				limit,
			});
		}

		// Handle case where search term is provided
		const posts = await prisma.post.findMany({
            where: {
              OR: [
                {
                  title: {
                    contains: search,
                  },
                },
                {
                  description: {
                    contains: search,
                  },
                },
                {
                  tags: {
                    contains: search,
                  },
                },
                {
                  Template: {
                    code: {
                      contains: search, // Filter by `code` in related `Template`
                    },
                  },
                },
              ],
            },
            skip: offset,
            take: limit,
            orderBy: {
              rating: order, // Sort posts by rating (highest or lowest)
            },
            include: {
              Template: true,
              author: true,
              comments: {
                orderBy: {
                  rating: order, // Sort comments by rating
                },
              },
            },
          });
          
          const totalCount = await prisma.post.count({
            where: {
              OR: [
                {
                  title: {
                    contains: search,
                  },
                },
                {
                  description: {
                    contains: search,
                  },
                },
                {
                  tags: {
                    contains: search,
                  },
                },
                {
                  Template: {
                    code: {
                      contains: search, // Correct filtering by code in Template relation
                    },
                  },
                },
              ],
            },
          });
          

		return res.status(200).json({
			data: posts,
			totalCount,
			page,
			limit,
		});
	} catch (error) {
		console.error("Error fetching posts:", error);
		return res.status(500).json({ message: "Internal Server Error", error: error.message });
	}
}
