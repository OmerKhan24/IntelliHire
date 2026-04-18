"""
Global DeepSeek API rate limiter.
Shared semaphore to prevent concurrent API calls from overwhelming the rate limit.
Max 3 concurrent calls across all services (ATS scoring, report gen, interview AI, chatbot).
"""
import asyncio
import logging
import time

logger = logging.getLogger(__name__)

# Max concurrent DeepSeek API calls globally
_semaphore = None
_MIN_INTERVAL = 0.5  # Min seconds between API calls
_last_call_time = 0.0
_lock = None

MAX_CONCURRENT = 3


def _get_semaphore():
    global _semaphore
    if _semaphore is None:
        _semaphore = asyncio.Semaphore(MAX_CONCURRENT)
    return _semaphore


def _get_lock():
    global _lock
    if _lock is None:
        _lock = asyncio.Lock()
    return _lock


async def acquire():
    """Acquire a slot for a DeepSeek API call. Awaits until a slot is free."""
    global _last_call_time
    sem = _get_semaphore()
    await sem.acquire()
    # Enforce minimum interval between calls
    lock = _get_lock()
    async with lock:
        now = time.monotonic()
        elapsed = now - _last_call_time
        if elapsed < _MIN_INTERVAL:
            await asyncio.sleep(_MIN_INTERVAL - elapsed)
        _last_call_time = time.monotonic()
    logger.debug("DeepSeek rate limiter: slot acquired")


def release():
    """Release a slot after API call completes."""
    sem = _get_semaphore()
    sem.release()
    logger.debug("DeepSeek rate limiter: slot released")


class RateLimitedCall:
    """Context manager for rate-limited DeepSeek API calls."""
    async def __aenter__(self):
        await acquire()
        return self

    async def __aexit__(self, *args):
        release()
