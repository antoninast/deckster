export interface UserProfile {
    id?: number;
    login: string;
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


