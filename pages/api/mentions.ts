import { addMention } from "../../prisma/mentions";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  
    try {
      const { username, data } = req.body;
  
      if (!username || !data) {
        return res.status(400).json({ message: 'Bad Request. Username and data are required.' });
      }
  
      const updatedUser = await addMention({ username, data });
  
      return res.status(200).json({ message: 'Mention added successfully', user: updatedUser });
    } catch (error) {
      console.error('Error:', error.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
}