export interface ApiResponse<TResult = undefined> {
  code: number;
  message: string;
  result?: TResult;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  nativeLanguage: string;
  learningGoal: string;
  targetLevel: string;
}

export interface RegisterResult {
  id: number;
  username: string;
  email: string;
  emailVerified: boolean;
  verificationOtp?: string;
}

export type RegisterResponse = ApiResponse<RegisterResult>;

export interface VerifyEmailOtpRequest {
  email: string;
  otp: string;
}

export type VerifyEmailOtpResponse = ApiResponse;

export interface ResendVerificationOtpRequest {
  email: string;
}

export interface ResendVerificationOtpResult {
  verificationOtp?: string;
}

export type ResendVerificationOtpResponse = ApiResponse<ResendVerificationOtpResult>;

export interface LoginResult {
  token: string;
  userId: number;
  username: string;
  fullName?: string;
  role: 'LEARNER' | 'CONTENT' | 'ADMIN';
  permissions?: string[];
}

export type LoginResponse = ApiResponse<LoginResult>;

export interface ApiErrorShape {
  status?: number;
  code?: number;
  message: string;
  result?: Record<string, unknown>;
}
