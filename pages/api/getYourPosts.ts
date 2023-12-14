import { getAllPostsByUser } from "../../prisma/getYourPosts";

export default async function handler(req, res) {
    const { username } = req.query;

  
    try {
      const userPosts = await getAllPostsByUser(username);
      res.status(200).json(userPosts);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
}