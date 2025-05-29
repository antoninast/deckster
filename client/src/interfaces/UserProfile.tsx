export interface UserProfile {
    id?: number;
    username: string;  // Changed from 'login'
    email: string;
    password: string;
    fullName?: string;
    profilePicture?: string;
    createdAt: Date;
    updatedAt: Date | null;
    lastLogin: Date | null;
    securityQuestion?: string;
    securityAnswer?: string;
}