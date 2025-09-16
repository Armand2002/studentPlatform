/**
 * ✅ CLEANUP: Centralized Form State Management
 * Eliminates form handling duplication across 12+ components
 */
import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

export interface FormState<T> {
  data: T;
  loading: boolean;
  success: boolean;
  error: string | null;
}

export interface UseFormOptions {
  resetOnSuccess?: boolean;
  successMessage?: string;
  successDelay?: number;
}

export interface UseFormReturn<T> {
  formState: FormState<T>;
  updateField: (field: keyof T, value: any) => void;
  setFormData: (data: T) => void;
  setLoading: (loading: boolean) => void;
  setSuccess: (success: boolean | string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  handleSubmit: (submitFn: (data: T) => Promise<void>) => (e?: React.FormEvent) => Promise<void>;
  resetForm: (initialData?: T) => void;
}

// ✅ CLEANUP: Centralized form hook (replaces 12+ duplicate form patterns)
export function useForm<T extends Record<string, any>>(
  initialData: T,
  options: UseFormOptions = {}
): UseFormReturn<T> {
  const { resetOnSuccess = false, successMessage = 'Operazione completata con successo', successDelay = 2000 } = options;
  
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccessState] = useState(false);
  const { error, setError, clearError, handleError } = useErrorHandler();

  const updateField = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    clearError(); // Clear error when user types
  }, [clearError]);

  const setFormData = useCallback((newData: T) => {
    setData(newData);
  }, []);

  const setSuccess = useCallback((success: boolean | string) => {
    if (typeof success === 'string') {
      // Custom success message
      setSuccessState(true);
    } else {
      setSuccessState(success);
    }

    if (success && successDelay > 0) {
      setTimeout(() => setSuccessState(false), successDelay);
    }
  }, [successDelay]);

  const handleSubmit = useCallback((submitFn: (data: T) => Promise<void>) => {
    return async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      
      clearError();
      setLoading(true);
      setSuccessState(false);

      try {
        await submitFn(data);
        setSuccess(true);
        
        if (resetOnSuccess) {
          setData(initialData);
        }
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    };
  }, [data, clearError, handleError, setSuccess, resetOnSuccess, initialData]);

  const resetForm = useCallback((newInitialData?: T) => {
    setData(newInitialData || initialData);
    setLoading(false);
    setSuccessState(false);
    clearError();
  }, [initialData, clearError]);

  return {
    formState: { data, loading, success, error },
    updateField,
    setFormData,
    setLoading,
    setSuccess,
    setError,
    clearError,
    handleSubmit,
    resetForm
  };
}

// ✅ CLEANUP: Common form validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[\+]?[1-9]\d{1,14}$/,
  password: /^.{8,}$/, // Minimum 8 characters
} as const;

// ✅ CLEANUP: Common validation functions (replaces 8+ duplicate validators)
export const validateField = {
  required: (value: any, fieldName: string) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} è obbligatorio`;
    }
    return null;
  },

  email: (value: string) => {
    if (value && !VALIDATION_PATTERNS.email.test(value)) {
      return 'Inserisci un indirizzo email valido';
    }
    return null;
  },

  phone: (value: string) => {
    if (value && !VALIDATION_PATTERNS.phone.test(value)) {
      return 'Inserisci un numero di telefono valido';
    }
    return null;
  },

  password: (value: string) => {
    if (value && !VALIDATION_PATTERNS.password.test(value)) {
      return 'La password deve essere di almeno 8 caratteri';
    }
    return null;
  },

  minLength: (value: string, min: number, fieldName: string) => {
    if (value && value.length < min) {
      return `${fieldName} deve essere di almeno ${min} caratteri`;
    }
    return null;
  },

  maxLength: (value: string, max: number, fieldName: string) => {
    if (value && value.length > max) {
      return `${fieldName} non può superare ${max} caratteri`;
    }
    return null;
  }
} as const;
