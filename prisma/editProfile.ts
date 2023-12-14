import prisma from "./prisma";

export const editProfile = async (username: string, newUsername: string, newName: string, newUrl: string, newBanner: string) => {
    try {
        const editedProfile = await prisma.users.update({
            where: {
                username: username
            },
            data: {
                username: newUsername,
                name: newName,
                url: newUrl,
                banner: newBanner
            }
        })

        const editedAuthorusername = await prisma.post.updateMany({
            where: {
                authorUsername: username
            },
            data: {
                authorUsername: newUsername,
                authorDisplayName: newName,
                authorUrl: newUrl
            }
        })

        const updateInFollowersArrays = await prisma.users.updateMany({
            where: {
                followers: {
                    has: username
                }
            },
            data: {
                followers: {
                    set: [newUsername]
                }
            }
        })

        return { editedProfile, editedAuthorusername, updateInFollowersArrays }
    } catch (err) {
        console.error(err)
        throw err
    }
}