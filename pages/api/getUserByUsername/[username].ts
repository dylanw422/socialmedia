// pages/api/getUserByUsername/[username].ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getUserByUsername } from '../../../prisma/getUserByUsername';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query;

  try {
    if (typeof username !== 'string') {
      return res.status(400).json({ message: 'Invalid username parameter' });
    }

    const user = await getUserByUsername(username);

    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
