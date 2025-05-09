export interface UserProfile {
    id?: number;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    lastLogin: Date | null;
    updatedAt: Date | null;
}