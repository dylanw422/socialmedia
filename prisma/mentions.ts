import prisma from "./prisma";

export const addMention = async ({ username, data }) => {
    // Find the user by username
    const user = await prisma.users.findUnique({
      where: { username },
    });
  
    if (!user) {
      throw new Error(`User with username ${username} not found.`);
    }
  
    // Add the data to both mentions and newMentions arrays
    const updatedUser = await prisma.users.update({
      where: { username: user.username },
      data: {
        mentions: [...user.mentions, data],
        newMentions: [...user.newMentions, data],
      },
    });
  
    return updatedUser;
};
