  import cookie from 'cookie';

  export default function handler(req, res) {
    if (req.method === 'POST') {
      // Clear the JWT cookie
      res.setHeader('Set-Cookie', cookie.serialize('token', '', {
        httpOnly: true, // Ensure the cookie is not accessible via JavaScript
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict', // Helps prevent CSRF attacks
        path: '/', // Cookie will be accessible on all routes
        expires: new Date(0), // Set expiration date in the past
      }));
  
      // Respond to indicate logout success
      return res.status(200).json({ message: 'Logged out successfully' });
    } else {
      // If the method is not POST, return a 405 error
      return res.status(405).json({ error: 'Method not allowed' });
    }
  }
  