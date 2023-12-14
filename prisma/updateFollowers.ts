import prisma from "./prisma";

export const updateFollowers = async (username: string, usernameToAdd: string) => {
    try {
        const user = await prisma.users.findUnique({
            where: {
                username: username
            }
        });

        const otherUser = await prisma.users.findUnique({
            where: {
                username: usernameToAdd
            }
        })

        if (user.following.includes(usernameToAdd)) {
            const updatedUser = await prisma.users.update({
                where: {
                    username: username
                },
                data: {
                    following: {
                        set: user.following.filter(u => u !== usernameToAdd)
                    }
                }
            });

            const updatedOtherUser = await prisma.users.update({
                where: {
                    username: usernameToAdd
                },
                data: {
                    followers: {
                        set: otherUser.following.filter(u => u !== username)
                    }
                }
            })
            return {updatedUser, updatedOtherUser}
        }

        const updatedUser = await prisma.users.update({
            where: {
                username: username
            },
            data: {
                following: {
                    push: usernameToAdd
                }
            }
        });

        const updatedOtherUser = await prisma.users.update({
            where: {
                username: usernameToAdd
            },
            data: {
                followers: {
                    push: username
                }
            }
        });

        return { updatedUser, updatedOtherUser };
    } catch (err) {
        console.error(err);
        throw err;
    }
};
