import { UserModel, IUser } from '../models/user.model';
import { createRedisClient } from '../config';
import { AppError } from '../utils/response';

const redisClient = createRedisClient();

export const createUser = async (payload: Partial<IUser>): Promise<IUser> => {
    const user = new UserModel(payload);
    await user.save();
    delete (user as any).password; // Remove password before returning
    return user;
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
    return UserModel.findOne({ email });
};

export const findUserById = async (id: string): Promise<IUser | null> => {
    const cacheKey = `user:${id}`;
    const cachedUser = await redisClient.get(cacheKey);

    if (cachedUser) {
        return JSON.parse(cachedUser);
    }

    const user = await UserModel.findById(id);
    if (user) {
        await redisClient.set(cacheKey, JSON.stringify(user), { EX: 60 }); // Set cache with TTL of 60 seconds
    }
    return user;
};

export const updateUser = async (id: string, updates: Partial<IUser>): Promise<IUser | null> => {
    const updatedUser = await UserModel.findByIdAndUpdate(id, updates, { new: true });
    if (updatedUser) {
        const cacheKey = `user:${id}`;
        await redisClient.del(cacheKey); // Invalidate cache
    }
    return updatedUser;
};

export const deleteUser = async (id: string): Promise<IUser | null> => {
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (deletedUser) {
        const cacheKey = `user:${id}`;
        await redisClient.del(cacheKey); // Invalidate cache
    }
    return deletedUser;
};