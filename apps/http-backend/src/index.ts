import express from 'express';
import jwt from "jsonwebtoken"
import { JWT_SECRET } from '@repo/backend-common/config';
import middleware from './middleware';
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from '@repo/common/types'
import { db } from '@repo/db/db';
import bcrypt from 'bcryptjs'

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/signup', async (req, res) => {

    try {
        const parsedData = CreateUserSchema.safeParse(req.body)
        if (!parsedData.success) {
            return res.json({
                message: 'Incorrect Inputs'
            })
        }

        const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

        const newUser = await db.user.create({
            data: {
                email: parsedData.data.email,
                password: hashedPassword,
                name: parsedData.data.name
            }
        })

        return res.status(200).json({
            message: 'User created successfully',
            newUser
        })

    } catch (err) {
        console.error(err)
        return res.status(500).json({
            message: 'User SignUp Failed! OR User Already Exists'
        })
    }
})

app.post('/signin', async (req, res) => {
    try {

        const parsedData = SignInSchema.safeParse(req.body)
        if (!parsedData.success) {
            return res.json({
                message: 'Incorrect Inputs'
            })
        }

        const user = await db.user.findFirst({
            where: {
                email: parsedData.data.email,
            }
        })

        if (!user) {
            return res.json({
                message: "Invalid Email"
            })
        }

        const isPasswordValid = await bcrypt.compare(parsedData.data.password, user.password)

        if (!isPasswordValid) {
            return res.json({
                message: "Invalid Password!"
            })
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);

        return res.json({
            message: 'Sign-In SuccessFull',
            userId: user.id,
            token: token
        })

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Sign-In Failed!'
        })
    }


})

app.post('/room', middleware, async (req, res) => {
    try {
        const parsedData = CreateRoomSchema.safeParse(req.body)
        if (!parsedData.success) {
            return res.json({
                message: 'Incorrect Inputs'
            })
        }

        const userId = req.userId;

        const newRoom = await db.room.create({
            data: {
                slug: parsedData.data.name as string,
                adminId: userId ?? "",
            }
        })
        res.json({
            roomId: newRoom.id
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Room Already Exists!!'
        })
    }


})

app.listen(3000, () => {
    console.log('Server Running on PORT:3000')
})