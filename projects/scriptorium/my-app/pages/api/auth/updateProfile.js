import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../../utils/jwt'; // Middleware to validate JWT

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verify the token
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { userId } = decoded;

  // Extract user fields from request body
  const { firstName, lastName, email, phoneNumber, profilePicture } = req.body || {};

  try {
    const updateData = {};

    if (firstName !== null && firstName !== undefined) {
      updateData.firstName = firstName;
    }
    if (lastName !== null && lastName !== undefined) {
      updateData.lastName = lastName;
    }
    if (email !== null && email !== undefined) {
      updateData.email = email;
    }
    if (phoneNumber !== null && phoneNumber !== undefined) {
      updateData.phoneNumber = phoneNumber;
    }
    if (profilePicture !== null && profilePicture !== undefined) {
      updateData.profilePicture = profilePicture;
    }

    // Update the user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.status(200).json(user); // Return the updated user data
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
