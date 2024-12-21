import { PrismaClient } from "@prisma/client";
import { comparePassword } from "../../../utils/hash";
import { generateToken } from "../../../utils/jwt";
const prisma = new PrismaClient();

export default async function handler(req, res) {
	if (req.method !== "POST")
		return res.status(405).json({ error: "Method not allowed" });

	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: "Email and password are required" });
	}

	try {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return res.status(401).json({ error: "User not found" });
		}

		// Compare the entered password with the hashed password
		const isPasswordValid = await comparePassword(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Generate a JWT token
		const token = generateToken(user.id, user.role);

		// Send back the token and user details
		res.status(200).json({
			message: "Logged in successfully",
			token,
			user: {
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "An error occurred during login" });
	}
}
