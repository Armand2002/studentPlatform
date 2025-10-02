'use client'

/**
 * ✅ CLEANUP: Centralized Error Handling
 * Eliminates error handling duplication across 15+ components
 */
import { useState } from 'react';
import { isAxiosError } from 'axios';

export interface ErrorState {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  handleError: (err: unknown) => void;
}

// ✅ CLEANUP: Centralized error handling hook (replaces 15+ duplicate implementations)
export function useErrorHandler(): ErrorState {
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const handleError = (err: unknown) => {
    console.error('Error occurred:', err);
    
    let message = 'Si è verificato un errore imprevisto';
    
    if (isAxiosError(err)) {
      const status = err.response?.status;
      const data = err.response?.data;
      
      if (status === 401) {
        message = 'Sessione scaduta. Effettua nuovamente il login';
      } else if (status === 403) {
        message = 'Non hai i permessi per eseguire questa operazione';
      } else if (status === 404) {
        message = 'Risorsa non trovata';
      } else if (status && status >= 500) {
        message = 'Errore del server. Riprova più tardi';
      } else if (data?.detail) {
        // Backend provides user-friendly error messages
        message = typeof data.detail === 'string' ? data.detail : message;
      }
    } else if (err instanceof Error) {
      message = err.message;
    }
    
    setError(message);
  };

  return {
    error,
    setError,
    clearError,
    handleError
  };
}

// ✅ CLEANUP: Centralized API error parser (replaces 10+ duplicate functions)
export function parseApiError(err: unknown): string {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data;
    
    if (status === 401) return 'Credenziali non valide';
    if (status === 403) return 'Accesso negato';
    if (status === 404) return 'Risorsa non trovata';
    if (status && status >= 500) return 'Errore del server, riprova più tardi';
    
    if (data?.detail) {
      return typeof data.detail === 'string' ? data.detail : 'Errore di validazione';
    }
  } else if (err instanceof Error) {
    return err.message;
  }
  
  return 'Errore imprevisto';
}

// ✅ CLEANUP: Common error messages (replaces hardcoded strings in 20+ files)
export const ERROR_MESSAGES = {
  NETWORK: 'Errore di connessione. Controlla la tua connessione internet',
  UNAUTHORIZED: 'Sessione scaduta. Effettua nuovamente il login',
  FORBIDDEN: 'Non hai i permessi per eseguire questa operazione',
  NOT_FOUND: 'Risorsa non trovata',
  SERVER_ERROR: 'Errore del server. Riprova più tardi',
  VALIDATION: 'Dati non validi. Controlla i campi inseriti',
  GENERIC: 'Si è verificato un errore imprevisto'
} as const;
