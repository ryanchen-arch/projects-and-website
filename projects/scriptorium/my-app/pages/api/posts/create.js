import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../utils/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    return createPost(req, res);
  }
  return res.status(405).json({ error: "Method Not Allowed" });
}

// Function to create a blog post
async function createPost(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: no token" });
  }

  try {
    // Verify token and decode user ID
    const decoded = verifyToken(token);
    const userId = decoded?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    // Extract data from request body
    const { title, description, tags, templateId, rating } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    // Ensure tags is an array (if it's not, set it to an empty array)
    const formattedTags = Array.isArray(tags) ? tags : tags ? [tags] : [];

    // Set a default rating to 0 if not provided
    const postData = {
      title,
      description,
      tags: formattedTags.length > 0 ? formattedTags.join(",") : null, // Save tags as a comma-separated string
      rating: rating !== undefined ? rating : 0, // Default to 0 if no rating is provided
      author: {
        connect: { id: userId },
      },
    };

    // Include template if provided
    if (templateId) {
      postData.Template = { connect: { id: templateId } };
    }

    // Create the blog post
    const newPost = await prisma.post.create({
      data: postData,
    });

    return res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
