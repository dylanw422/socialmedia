import { editProfile } from "../../prisma/editProfile";

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const { username, newUsername, newName, newUrl, newBanner } = req.body

        try {
            const updatedUser = await editProfile(username, newUsername, newName, newUrl, newBanner)

            res.status(200).json({
                message: 'User updated',
                updatedUser
            })
        } catch (err) {
            console.error(err)
            res.status(500).json({
                message: 'Internal Server Error',
                error: err.message
            })
        }
    } else {
        res.status(405).json({
            message: 'Method Not Allowed'
        })
    }
}