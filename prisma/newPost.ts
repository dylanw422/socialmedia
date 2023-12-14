import prisma from "./prisma"

export const newPost = async (authorUsername, content) => {
    try {
        const user = await prisma.users.findUnique({
            where: {
                username: authorUsername
            }
        })

        if (!user) {
            console.log('user not found')
            return null
        }

        const newPost = await prisma.post.create({
            data: {
                authorId: user.id,
                authorUsername: user.username,
                authorDisplayName: user.name,
                authorUrl: user.url,
                content,
                createdAt: new Date(),
                verifiedAuthor: user.verified
            }
        })

        return newPost
    } catch (err) {
        console.error(err)
        throw err
    }
}