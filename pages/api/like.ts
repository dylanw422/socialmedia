import { toggleLikerForPost } from "../../prisma/like";

export default async function handler(req, res) {
    const { postId, username } = req.body

    if (!postId || !username) {
        return res.status(400).json({ error: "Invalid request. Please provide postId and Username"})
    }

    try {
        await toggleLikerForPost(postId, username)
        return res.status(200).json({ message: 'Liker toggled successfully'})
    } catch (error) {
        console.error('Error toggling liker:', error)
        return res.status(500).json({ error: 'Internal server error.'})
    }
}