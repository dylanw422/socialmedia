import { repost } from "../../prisma/repost";

export default async function handler(req, res) {
    const { username, repostId } = req.body

    if (!username || !repostId) {
        return res.status(400).json({ error: "Invalid Request. Please provide username and repostId"})
    }

    try {
        await repost(username, repostId)
        return res.status(200).json({ message: 'Reposted'})
    } catch (error) {
        console.error('Error reposting', error)
        return res.status(500).json({ error: 'Internal server error.'})
    }
}