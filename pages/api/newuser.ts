import { createUser } from "../../prisma/user";

export default async function handler(req,res) {
  try {
    switch (req.method) {
      case 'POST': {
          const {email, displayName, username} = req.body

          try {
            const user = await createUser(email, displayName, username)
            return res.json(user)
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

