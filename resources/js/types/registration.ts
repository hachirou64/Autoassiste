// Types pour l'inscription simplifiée par email (OTP)

export interface EmailRegistrationRequest {
    email: string;
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
    password?: string; // Optionnel - peut être demandé après vérification
    fullName?: string; // Optionnel
}

export interface EmailRegistrationResponse {
    success: boolean;
    message: string;
    requiresOtp?: boolean;
    expiresAt?: string;
}

export interface OtpVerificationResponse {
    success: boolean;
    message: string;
    token?: string; // Pour compléter l'inscription
}

export interface RegistrationFormData {
    step: 'email' | 'verify' | 'complete';
    email: string;
    otp: string;
    fullName: string;
    phone: string;
    password: string;
    passwordConfirmation: string;
}

export const REGISTRATION_STEPS = [
    { id: 'email', label: 'Email' },
    { id: 'verify', label: 'Vérification' },
    { id: 'complete', label: 'Compte' },
] as const;

