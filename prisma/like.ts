import prisma from "./prisma";

export const toggleLikerForPost = async (postId: string, username: string) => {
    try {
        const post = await prisma.post.findUnique({
            where: {
                id: postId
            }
        })

        if (!post) {
            throw new Error('Post not found')
        }

        const isLiker = post.likers.includes(username)

        if (isLiker) {
            await prisma.post.update({
                where: {
                    id: postId
                },
                data: {
                    likers: {
                        set: post.likers.filter((liker) => liker !== username)
                    }
                }
            })
        } else {
            await prisma.post.update({
                where: {
                    id: postId
                },
                data: {
                    likers: {
                        push: username
                    }
                }
            })
        }
    } catch (error) {
        console.error('Error toggling liker for post: ', error)
    }
}