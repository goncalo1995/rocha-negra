export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string;
    createdAt: string;
    updatedAt: string;
}
export interface UserPreferences {
    id: string;
    userId: string;
    preferenceKey: string;
    preferenceValue: Object;
    createdAt: string;
    updatedAt: string;
}