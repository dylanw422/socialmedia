import { getAllUsers } from "../../prisma/getAllUsers";

export default async function handler(req, res) {
    try {
        switch (req.method) {
            case 'GET':
                try {
                    const allUsers = await getAllUsers();
                    return res.status(200).json(allUsers);
                } catch (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
                }
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}