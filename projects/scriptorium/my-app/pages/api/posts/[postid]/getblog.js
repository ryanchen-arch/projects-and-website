import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  let { id } = req.query; // Blog post id
  id = Number(id);

  if (!id) {
    return res.status(400).json({ message: "Missing ID" });
  }

  if (req.method === "GET") {
    try {
      const post = await prisma.post.findUnique({
        where: {
          id: id,
        },
        include: {
          author: true, // Include author details
          Template: true, // Include associated template (if any)
        },
      });

      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      return res.status(200).json({ post });
    } catch (error) {
      console.error("Error retrieving blog post:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
