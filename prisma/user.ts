import prisma from "./prisma"

export const createUser = async (email, name, username) => {
    try {
        const user = await prisma.users.create({
            data: {
                email,
                name,
                username,
                followers: [username],
                following: [username]
            }
        })
        return user
    } catch (err) {
        console.error(err)
        throw err
    }
}