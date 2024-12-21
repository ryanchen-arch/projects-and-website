import jwt from 'jsonwebtoken';

// Function to generate a JWT token
export const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,  // Make sure JWT_SECRET is defined in your .env file
    { expiresIn: '1h' }      // Token expiry time (adjust as needed)
  );
};

// Function to verify a JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
