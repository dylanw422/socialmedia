import prisma from "./prisma"

export const getAllPosts = async () => {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        return posts
    } catch (err) {
        console.error(err)
        throw err
    }
}