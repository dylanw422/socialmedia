import { getAllPosts } from "../../prisma/getAllPosts";

export default async function handler(req, res) {
    try {
        switch(req.method) {
            case 'GET': {
                try {
                    const allPosts = await getAllPosts()
                    return res.status(200).json(allPosts)
                } catch(err) {
                    console.error(err)
                }
            }
        }
    } catch(err) {
        console.error(err)
        return res.status(500).json({ ...err, message: err.message})
    }
}