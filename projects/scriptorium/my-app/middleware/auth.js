import { verifyToken } from '../../../utils/jwt';

export default function authMiddleware(handler) {
  return async (req, res) => {
    // Extract the token from headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access denied, token missing' });
    }

    // Verify the token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach the user data to the request object
    req.user = decoded;

    // Proceed to the handler
    return handler(req, res);
  };
}
