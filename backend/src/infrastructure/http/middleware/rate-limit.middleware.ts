import rateLimit from 'express-rate-limit';

function createRateLimit({
  windowMs,
  max,
  message,
  skipSuccessfulRequests,
}: {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
}) {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        message,
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
  });
}

const publicRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
});

const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true,
});

const protectedRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests, please try again later',
});

export { publicRateLimit, authRateLimit, protectedRateLimit };
