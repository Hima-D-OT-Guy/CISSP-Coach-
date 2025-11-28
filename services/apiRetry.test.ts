import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retryWithBackoff } from './apiRetry';

describe('retryWithBackoff', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should return result immediately if operation succeeds', async () => {
        const mockFn = vi.fn().mockResolvedValue('success');
        const result = await retryWithBackoff(mockFn);
        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on 429 error', async () => {
        const mockFn = vi.fn()
            .mockRejectedValueOnce({ status: 429, message: "Rate Limit" })
            .mockResolvedValue('success');

        const promise = retryWithBackoff(mockFn);

        // Advance time to trigger the retry
        await vi.advanceTimersByTimeAsync(2000); // 1000ms + jitter

        const result = await promise;
        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should retry on 503 error', async () => {
        const mockFn = vi.fn()
            .mockRejectedValueOnce({ status: 503, message: "Service Unavailable" })
            .mockResolvedValue('success');

        const promise = retryWithBackoff(mockFn);
        await vi.advanceTimersByTimeAsync(2000);

        const result = await promise;
        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
        const mockFn = vi.fn().mockRejectedValue({ status: 429, message: "Rate Limit" });

        const promise = retryWithBackoff(mockFn, 3); // 3 retries

        // 1st retry: ~1000ms
        await vi.advanceTimersByTimeAsync(2000);
        // 2nd retry: ~2000ms
        await vi.advanceTimersByTimeAsync(3000);
        // 3rd retry: ~4000ms
        await vi.advanceTimersByTimeAsync(5000);

        await expect(promise).rejects.toEqual({ status: 429, message: "Rate Limit" });
        expect(mockFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should not retry on non-transient errors (e.g. 400)', async () => {
        const mockFn = vi.fn().mockRejectedValue({ status: 400, message: "Bad Request" });
        await expect(retryWithBackoff(mockFn)).rejects.toEqual({ status: 400, message: "Bad Request" });
        expect(mockFn).toHaveBeenCalledTimes(1);
    });
});
