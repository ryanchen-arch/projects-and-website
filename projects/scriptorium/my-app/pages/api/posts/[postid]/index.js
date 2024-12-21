import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/utils/jwt"; // Middleware to validate JWT

const prisma = new PrismaClient();

// Main handler function for POST updates and deletion
export default async function handler(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: no token" });
  }

  // Verify the token
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized: invalid token" });
  }

  const { userId } = decoded; // Extract userId from decoded token

  switch (req.method) {
    case "PUT":
      return updatePost(req, res, userId);
    case "DELETE":
      return deletePost(req, res, userId);
    case "GET":
      return getPost(req, res); // Handle GET request for fetching a single post
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// Function to update a blog post
async function updatePost(req, res, userId) {
  const { title, description, tags, templateIds } = req.body;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing post ID" });
  }

  try {
    const post = await prisma.post.findFirst({
      where: { id: Number(id) },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ error: "Unauthorized: You can only update your own posts" });
    }

    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (tags) updateData.tags = tags.join(","); // Save tags as a comma-separated string
    if (templateIds) updateData.templateIds = templateIds.map(Number); // Assuming templateIds is an array of template IDs

    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return res.status(200).json(updatedPost);

  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
}

// Function to delete a blog post
async function deletePost(req, res, userId) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing post ID" });
  }

  try {
    const post = await prisma.post.findFirst({
      where: { id: Number(id) },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ error: "Unauthorized: You can only delete your own posts" });
    }

    await prisma.post.delete({
      where: { id: Number(id) },
    });

    return res.status(204).end(); // No content to return

  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// Function to get a blog post
async function getPost(req, res) {
  const { postId } = req.query;

  // Ensure postId is valid
  const numericPostId = parseInt(postId, 10);
  if (isNaN(numericPostId)) {
    return res.status(400).json({ message: "Invalid blog post ID." });
  }

  try {
    const blogPost = await prisma.post.findFirst({
      where: { id: numericPostId },
      include: {
        Template: true,  // Include related template data
        author: true,    // Include author data
      },
    });

    if (!blogPost) {
      return res.status(404).json({ message: "Blog post not found." });
    }

    // Parse tags into an array
    const tagsArray = blogPost.tags ? blogPost.tags.split(",").map((tag) => tag.trim()) : [];

    // Prepare response data
    const responseData = {
      id: blogPost.id,
      title: blogPost.title,
      description: blogPost.description,
      tags: tagsArray,
      rating: blogPost.rating,
      author: {
        id: blogPost.author.id,
        firstName: blogPost.author.firstName,
        lastName: blogPost.author.lastName,
      },
      template: blogPost.Template ? {
        id: blogPost.Template.id,
        name: blogPost.Template.name,
        content: blogPost.Template.content,  // Replace with actual fields in your Template model
      } : null,
    };

    return res.status(200).json({ post: responseData });
  } catch (error) {
    console.error("Error retrieving blog post:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
