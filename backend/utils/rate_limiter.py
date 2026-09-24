import time
from collections import deque
from fastapi import HTTPException


class RateLimiter:
    def __init__(self, max_requests: int = 10, window_seconds: int = 3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.timestamps: deque = deque()

    def _clean_expired(self):
        now = time.time()
        while self.timestamps and (now - self.timestamps[0]) > self.window_seconds:
            self.timestamps.popleft()

    def check_and_record(self):
        self._clean_expired()
        if len(self.timestamps) >= self.max_requests:
            oldest = self.timestamps[0]
            reset_in = int(self.window_seconds - (time.time() - oldest))
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "requests_used": len(self.timestamps),
                    "requests_remaining": 0,
                    "reset_in_seconds": reset_in,
                },
            )
        self.timestamps.append(time.time())

    def get_status(self):
        self._clean_expired()
        used = len(self.timestamps)
        remaining = max(0, self.max_requests - used)
        reset_in = 0
        if self.timestamps:
            reset_in = int(self.window_seconds - (time.time() - self.timestamps[0]))
        return {
            "requests_used": used,
            "requests_remaining": remaining,
            "reset_in_seconds": reset_in,
        }


rate_limiter = RateLimiter()
