import prisma from "./prisma"

export const deletePost = async (id) => {
    try {
        const deletedPost = await prisma.post.delete({
            where: {
                id: id
            }
        })

        const postsToDelete = await prisma.post.findMany({
            where: {
                repostId: id
            }
        })

        if (postsToDelete.length === 0) {
            console.log('No posts to delete')
        } else {
            await prisma.post.deleteMany({
                where: {
                    repostId: id
                }
            })
        }

        return { deletedPost, postsToDelete }
    } catch (err) {
        console.error(err)
        throw err
    }
    
}