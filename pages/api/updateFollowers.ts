import { updateFollowers } from "../../prisma/updateFollowers";

export default async function handler(req, res) {
    try {
        if (req.method === 'POST') {
            const { username, usernameToAdd } = req.body;
            if (!username || !usernameToAdd) {
                return res.status(400).json({ error: 'Both username and usernameToAdd are required' });
            }

            const updatedUser = await updateFollowers(username, usernameToAdd);
            return res.status(200).json(updatedUser);
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}