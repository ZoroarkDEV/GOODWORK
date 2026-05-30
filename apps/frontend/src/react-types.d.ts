/**
 * Type compatibility fix for React 18 → React 19 library mismatch.
 * Resolves "Type 'bigint' is not assignable to type 'ReactNode'" errors
 * caused by duplicate @types/react in the monorepo.
 */