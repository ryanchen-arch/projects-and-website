import prisma from '@/lib/prisma'; // Ensure you have your Prisma client set up
import jwtDecode from 'jwt-decode'; // Import jwt-decode to decode the JWT token

export default async function handler(req, res) {
  const { id } = req.query; // Get the post ID from the URL

  if (req.method === 'PATCH') {
    const { type } = req.body; // "upvote" or "downvote"
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from headers

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = getUserIdFromToken(token); // Decode JWT to get user ID

    if (!type || (type !== 'upvote' && type !== 'downvote')) {
      return res.status(400).json({ error: 'Invalid rating type' });
    }

    try {
      // Retrieve the post using the postId
      const post = await prisma.post.findUnique({
        where: { id: parseInt(id) },
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Determine the new rating based on the type of vote
      let newRating = post.rating;

      if (type === 'upvote') {
        newRating += 1;
      } else if (type === 'downvote') {
        newRating -= 1;
      }

      // Update the rating for the post in the database
      const updatedPost = await prisma.post.update({
        where: { id: parseInt(id) },
        data: {
          rating: newRating,
        },
      });

      return res.status(200).json({ newRating: updatedPost.rating });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update rating' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

// A helper function to decode JWT and get user ID
const getUserIdFromToken = (token) => {
  // Decode the JWT token and return the userId
  const decoded = jwtDecode(token);
  return decoded.userId;
};
