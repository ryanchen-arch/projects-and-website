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
      const userId = openToken.userId; // Assuming this is how the user ID is stored in the token

      let { search, page, limit, sortBy } = req.query;
      page = Number(page) || 1; // Default page is 1
      limit = Number(limit) || 10; // Default limit is 10
      const offset = (page - 1) * limit;

      // Define sorting order based on `sortBy` query
      const order = sortBy === "lowestRated" ? "asc" : "desc";

      // Count the total number of posts by the user
      const totalCount = await prisma.post.count({
        where: {
          authorId: userId, // Assuming `authorId` is the field for the user who created the post
        },
      });

      // If no search is provided, return all posts by the user
      if (!search) {
        const posts = await prisma.post.findMany({
          where: {
            authorId: userId,
          },
          skip: offset,
          take: limit,
          orderBy: {
            rating: order, // Sort by rating (highest or lowest)
          },
          include: {
            Template: true, // Include template if needed
            author: true,
            comments: {
              orderBy: {
                rating: order, // Sort comments by rating
              },
            },
          },
        });
        return res.status(200).json({
          data: posts,
          totalCount,
          page,
          limit,
        });
      } else {
        // Search with the given parameters
        const posts = await prisma.post.findMany({
          where: {
            authorId: userId,
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
                    contains: search,
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
            Template: true, // Include template if needed
            author: true,
            comments: {
              orderBy: {
                rating: order, // Sort comments by rating
              },
            },
          },
        });
        return res.status(200).json({
          data: posts,
          totalCount,
          page,
          limit,
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
