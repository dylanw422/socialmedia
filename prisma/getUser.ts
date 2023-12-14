import prisma from "./prisma";

export const getUser = async (email) => {
    try {
        const user = await prisma.users.findUnique({
            where: {
                email: email
            }
        });

        return user;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

