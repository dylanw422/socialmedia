import { deletePost } from "../../prisma/deletePost";

export default async function handler(req, res) {
    const { postId } = req.query;
  
    if (req.method === 'DELETE') {
      try {
        const deletedPost = await deletePost(postId);
  
        res.status(200).json({
          message: 'Post deleted successfully',
          deletedPost,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          message: 'Internal Server Error',
        });
      }
    } else {
      res.status(405).json({
        message: 'Method Not Allowed',
      });
    }
  }