import prisma from "./prisma"

export const getAllPostsByUser = async  (username) => {
    try {
        const userPosts = await prisma.post.findMany({
            where: {
                authorUsername: username
            }, 
            orderBy: {
                createdAt: 'asc'
            }
        })

        return userPosts
    } catch (err) {
        console.error(err)
        throw err
    }
}