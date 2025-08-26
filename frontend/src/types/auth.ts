export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'tutor' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'tutor';
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
  expires_in: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
