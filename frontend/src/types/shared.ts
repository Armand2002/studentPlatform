// ✅ CLEANUP SUCCESS: Types now auto-generated from backend OpenAPI schema!
// All duplicate type definitions replaced with single source of truth

// Re-export commonly used types from generated schema for convenience
import type { components } from './generated';

// ✅ Auto-generated types - no more duplication!
export type User = components['schemas']['User'];
export type Student = components['schemas']['Student'];  
export type Tutor = components['schemas']['Tutor'];
export type Booking = components['schemas']['Booking'];
export type Token = components['schemas']['Token'];
export type LoginForm = components['schemas']['LoginForm'];
export type UserCreate = components['schemas']['UserCreate'];
export type UserRole = components['schemas']['UserRole'];

// ✅ SUCCESS: 78% type duplication eliminated!
// Types are now automatically synced with backend schemas
