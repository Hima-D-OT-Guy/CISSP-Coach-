/**
 * Retries a promise-returning function with exponential backoff.
 * Useful for handling API rate limits (429) or temporary network errors.
 * 
 * @param fn The async function to retry.
 * @param maxRetries Maximum number of retries (default: 3).
 * @param initialDelay Initial delay in ms (default: 1000).
 * @returns The result of the function.
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    initialDelay = 1000
): Promise<T> {
    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Check if it's a retryable error
            // 429: Too Many Requests
            // 503: Service Unavailable
            // 500: Internal Server Error (sometimes retryable)
            // Network errors often don't have a status but might have a message
            const status = error.status || error.response?.status;
            const isRetryable = status === 429 ||
                status === 503 ||
                status === 500 ||
                error.message?.includes('network') ||
                error.message?.includes('fetch');

            if (!isRetryable) {
                throw error; // Don't retry if it's a permanent error (e.g., 400 Bad Request, 401 Unauthorized)
            }

            if (i === maxRetries) {
                throw error; // Max retries reached
            }

            // Wait with exponential backoff + jitter
            const delay = initialDelay * Math.pow(2, i) + (Math.random() * 100);
            console.log(`[Retry] Attempt ${i + 1}/${maxRetries} failed. Retrying in ${Math.round(delay)}ms... Error: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}
