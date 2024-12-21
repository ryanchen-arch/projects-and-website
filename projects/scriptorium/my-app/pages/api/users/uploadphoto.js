import { PrismaClient } from '@prisma/client';
import upload from '../../../utils/multer'; // Import Multer configuration
import { verifyToken } from '../../../utils/jwt'; // Middleware to validate JWT


const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
};

export default function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { userId } = decoded;

  upload.single('profilePicture')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const profilePictureUrl = req.file ? `/uploads/${req.file.filename}` : null; // Fallback URL

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          profilePicture: profilePictureUrl,
        },
      });

      res.status(200).json(profilePictureUrl);
    } catch (error) {
      console.error('Error updating user profile picture:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}
