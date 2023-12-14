import { clearNewMentions } from "../../prisma/clearNewMentions";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  
    try {
      const { username } = req.body;
  
      if (!username) {
        return res.status(400).json({ message: 'Bad Request. userId is required.' });
      }
  
      const updatedUser = await clearNewMentions(username);
  
      return res.status(200).json({ message: 'newMentions array cleared successfully', user: updatedUser });
    } catch (error) {
      console.error('Error:', error.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }