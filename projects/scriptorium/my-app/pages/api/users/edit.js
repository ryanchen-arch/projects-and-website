import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../../utils/jwt'; // Middleware to validate JWT
import { equal } from 'assert';


const prisma = new PrismaClient();


export default async function handler(req, res) {

  if (req.method === 'GET') {
    let { userId } = req.query;
    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });
    res.status(200).json({
			user,
		});
  }

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

  const { userId } = decoded; // Extract userId from decoded token

  
    // Extract user fields from request body
    const { firstName, lastName, email, phoneNumber } = req.body || {}; // Ensure req.body is defined

    // Check if email is being updated and if it already exists
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }

    try {
      // Create an empty object to hold the fields to update
      const updateData = {};
      
      // Conditionally add fields to the updateData object
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

      // Update the user only with the fields that are not null or undefined
      const user = await prisma.user.update({
        where: { id: userId }, // Use the user's ID from the validated token
        data: updateData, // Pass the constructed updateData object
      });
    
      res.status(200).json(updateData); // Return the updated user information
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
}
// modified