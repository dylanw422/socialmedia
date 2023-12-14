import prisma from "./prisma";

export const getAllUsers = async () => {
    try {
        const users = await prisma.users.findMany({
            orderBy: {
                username: 'asc'
            }
        })

        return users
    } catch (err) {
        console.error(err)
        throw err
    }
}