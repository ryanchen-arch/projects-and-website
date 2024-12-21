import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const {
    query: { postId },
  } = req;

  if (req.method === 'GET') {
    try {
      const comments = await prisma.comment.findMany({
        where: {
          postId,
        },
      });
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ error: error});
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
