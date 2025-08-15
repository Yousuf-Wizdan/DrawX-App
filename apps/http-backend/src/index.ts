import express from 'express';
import jwt from "jsonwebtoken"
import { JWT_SECRET } from '@repo/backend-common/config';
import middleware from './middleware';
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from '@repo/common/types'
import { db } from '@repo/db/db';

const app = express();

app.post('/signup', async (req, res) => {

    try {
        const parsedData = CreateUserSchema.safeParse(req.body)
        if (!parsedData.success) {
            return res.json({
                message: 'Incorrect Inputs'
            })
        }

        const newUser = await db.user.create({
            data: {
                email: parsedData.data.email,
                password: parsedData.data.password,
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
            message: 'User SignUp Failed!'
        })
    }
})

app.post('/signin', (req, res) => {
    const data = SignInSchema.safeParse(req.body)
    if (!data.success) {
        return res.json({
            message: 'Incorrect Inputs'
        })
    }

})

app.post('/signin', (req, res) => {
    const data = SignInSchema.safeParse(req.body)
    if (!data.success) {
        return res.json({
            message: 'Incorrect Inputs'
        })
    }

    const userId = 1;
    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    res.json({
        token
    })
})

app.post('/room', middleware, (req, res) => {
    const data = CreateRoomSchema.safeParse(req.body)
    if (!data.success) {
        return res.json({
            message: 'Incorrect Inputs'
        })
    }

    // db call
    res.json({
        roomId: 123
    })

})

app.listen(3000, () => {
    console.log('Server Running on PORT:3000')
})