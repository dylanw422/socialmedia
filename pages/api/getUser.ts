import { getUser } from "../../prisma/getUser";

export default async function handler(req, res) {
    const { email } = req.query;

    try {
        switch (req.method) {
            case 'GET': {
                try {
                    const user = await getUser(email);
                    res.status(200).json(user);
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ message: 'Error retrieving user information' });
                }
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

