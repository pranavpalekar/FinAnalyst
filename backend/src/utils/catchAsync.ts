import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper function to catch async errors and pass them to Express error handler
 * Eliminates the need for try-catch blocks in route handlers
 * 
 * @param fn - Async function to wrap
 * @returns Express middleware function
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync; 