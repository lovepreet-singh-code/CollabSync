import { Request, Response } from 'express';
import { createUser as createUserSvc, findUserById, updateUser as updateUserSvc, deleteUser as deleteUserSvc } from '../services/user.service';
import { success, error } from '../utils/response';

export const createUser = async (req: Request, res: Response) => {
    try {
        const user = await createUserSvc(req.body);
        return success(res, { ...user.toObject(), password: undefined }, 'User created successfully', 201);
    } catch (err: any) {
        return error(res, err.message || 'Error creating user', 400);
    }
};

export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await findUserById(id);
        if (!user) return error(res, 'User not found', 404);
        return success(res, { ...user.toObject(), password: undefined }, 'User fetched successfully');
    } catch (err: any) {
        return error(res, err.message || 'Error fetching user', 500);
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const updated = await updateUserSvc(id, req.body);
        if (!updated) return error(res, 'User not found', 404);
        return success(res, { ...updated.toObject(), password: undefined }, 'User updated successfully');
    } catch (err: any) {
        return error(res, err.message || 'Error updating user', 400);
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deleted = await deleteUserSvc(id);
        if (!deleted) return error(res, 'User not found', 404);
        return success(res, { id }, 'User deleted successfully');
    } catch (err: any) {
        return error(res, err.message || 'Error deleting user', 400);
    }
};