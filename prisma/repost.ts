import prisma from "./prisma"

export const repost = async (username: string, repostId: string) => {
    try {
        const user = await prisma.users.findUnique({
            where: {
                username: username
            }
        })
    
        if (!user) {
            console.log('user not found')
            return null
        }

        const post = await prisma.post.findUnique({
            where: {
                id: repostId
            }
        })
        
        const isReposter = post.reposters.includes(username)

        if (isReposter) {
            const newPost = await prisma.post.findFirst({
                where: {
                    repostId: repostId
                }
            })

            if (newPost) {
                await prisma.post.delete({
                    where: {
                        id: newPost.id
                    }
                })
            }

            await prisma.post.update({
                where: {
                    id: repostId
                },
                data: {
                    reposters: {
                        set: post.reposters.filter((reposter) => reposter !== username)
                    }
                }
            })
            
        } else {
            await prisma.post.update({
                where: {
                    id: repostId
                },
                data: {
                    reposters: {
                        push: username
                    }
                }
            })

            await prisma.post.create({
                data: {
                    authorId: user.id,
                    authorUsername: user.username,
                    authorDisplayName: user.name,
                    authorUrl: user.url,
                    content: '',
                    createdAt: new Date(),
                    repostId: repostId
                }
            })
        }
    } catch (err) {
        console.error(err)
        throw err
    }
}
