import prisma from "./prisma";

export const getUserByUsername = async (username) => {
    try {
        const user = await prisma.users.findUnique({
            where: {
                username: username
            }
        });

        return user;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

