import prisma from '@/lib/prisma'; // Ensure you have your Prisma client set up
import jwtDecode from 'jwt-decode'; // Import jwt-decode to decode the JWT token

export default async function handler(req, res) {
  const { id } = req.query; // Get the post ID from the URL

  if (req.method === 'GET') {
    // Fetch comments for the post
    try {
      const comments = await prisma.comment.findMany({
        where: { postId: parseInt(id) },
        include: {
          post: true, // Include post data (optional)
        },
        orderBy: {
          createdAt: 'desc', // Optionally order by newest first
        },
      });
      return res.status(200).json({ comments });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }

  if (req.method === 'POST') {
    // Post a new comment
    try {
      const { content } = req.body; // Assuming comment content is passed in the request body
      const token = req.headers.authorization?.split(' ')[1]; // Extract token from headers

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = getUserIdFromToken(token); // Decode JWT to get user ID

      if (!content || !userId) {
        return res.status(400).json({ error: 'Missing content or user information' });
      }

      const newComment = await prisma.comment.create({
        data: {
          content,
          postId: parseInt(id),
          authorId: userId,
        },
      });

      return res.status(201).json({ comment: newComment });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to post comment' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

// A helper function to decode JWT and get user ID
const getUserIdFromToken = (token) => {
  // Decode the JWT token and return the userId (you need to implement this based on your JWT library)
  const decoded = jwtDecode(token);
  return decoded.userId;
};
