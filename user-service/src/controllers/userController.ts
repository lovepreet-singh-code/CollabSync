import { Request, Response } from 'express';
import User from '../models/User'; // Assuming you have a User model defined

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const newUser = new User({ name, email, password });

    try {
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: 'Error creating user' });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user' });
    }
};