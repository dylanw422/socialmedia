import { newPost } from "../../prisma/newPost";

export default async function handler(req,res) {
  try {
    switch (req.method) {
      case 'POST': {
          const { authorUsername, content } = req.body

          try {
            const createPost = await newPost(authorUsername, content);
            if (newPost) {
                return res.status(201).json(createPost)
            } else {
                return res.status(404).json({ message: 'Failed to create post' })
            }
          } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Internal Server Error'})
          }
      }
    }
  } catch (err) {
    return res.json(500).json({ ...err, message: err.message})
  }
}