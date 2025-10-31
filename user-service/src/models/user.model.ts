import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, default: 'user' },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to hash password if it is modified
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export const UserModel = mongoose.model<IUser>('User', userSchema);