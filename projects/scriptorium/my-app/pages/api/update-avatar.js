// pages/api/update-avatar.js
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../utils/jwt";  // Assuming you have a JWT utility to verify token

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { avatar } = req.body;  // Extract the avatar URL from the request body

    if (!avatar) {
      return res.status(400).json({ error: "Avatar URL is required" });
    }

    const token = req.headers.authorization?.split(" ")[1];  // Extract token from the Authorization header
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify the token and get the user ID
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized: invalid token" });
    }

    const { userId } = decoded;

    try {
      // Update the user's profile picture in the database
      const user = await prisma.user.update({
        where: { id: userId },
        data: { profilePicture: avatar },  // Update the profile picture field
      });

      return res.status(200).json({ message: "Profile picture updated successfully", profilePicture: user.profilePicture });
    } catch (error) {
      console.error("Error updating avatar:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
