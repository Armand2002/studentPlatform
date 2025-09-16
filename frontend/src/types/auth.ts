// ✅ CLEANUP SUCCESS: Replaced with auto-generated types from backend!
import type { User, Token, LoginForm, UserCreate } from './shared';

// ✅ Using backend-generated types - no more duplication
export type { User };

export interface LoginCredentials {
  email: string;
  password: string;
}

// ✅ DEPRECATED: Use backend LoginForm instead
export type LoginData = LoginForm;

// ✅ DEPRECATED: Use backend UserCreate instead  
export type RegisterData = UserCreate;

// ✅ Using backend Token schema
export type AuthResponse = Token & {
  user: User;
  expires_in: number;
};

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
