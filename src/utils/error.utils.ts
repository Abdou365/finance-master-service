import { NextFunction } from 'express';

export const withError = (fn: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };
};

export const withTryCatch = (mainFn, secFn) => {
  return () => {
    try {
      mainFn();
    } catch (error) {
      secFn();
      throw new Error('Error');
    }
  };
};
