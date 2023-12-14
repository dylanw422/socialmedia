import prisma from "./prisma";

export const clearNewMentions = async(username) => {
    const clearMentions = await prisma.users.update({
        where: {username: username},
        data: {
            newMentions: []
        }
    })

    return clearMentions
}