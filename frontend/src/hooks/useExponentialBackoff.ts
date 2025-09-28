import { useState, useCallback } from 'react';

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

/**
 * Custom hook for exponential backoff retry logic
 * @param options - Retry configuration options
 * @returns Object with retry function and retry state
 */
export function useExponentialBackoff(options: RetryOptions = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2
  } = options;

  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const calculateDelay = useCallback((attempt: number): number => {
    const delay = baseDelay * Math.pow(backoffFactor, attempt);
    return Math.min(delay, maxDelay);
  }, [baseDelay, backoffFactor, maxDelay]);

  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setIsRetrying(true);
          setRetryCount(attempt);
          
          const delay = calculateDelay(attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const result = await operation();
        setIsRetrying(false);
        setRetryCount(0);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          onRetry?.(attempt + 1, lastError);
        }
      }
    }
    
    setIsRetrying(false);
    setRetryCount(0);
    throw lastError!;
  }, [maxRetries, calculateDelay]);

  return {
    retry,
    retryCount,
    isRetrying,
    maxRetries
  };
}
