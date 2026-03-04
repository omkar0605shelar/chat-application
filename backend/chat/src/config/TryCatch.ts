import type { NextFunction, RequestHandler, Request, Response } from "express";

const TryCatch = (handler: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      console.log("Error in TryCatch:", error);
      res.status(500).json({
        message: error.message || "Internal Server Error"
      })
    }
  }
}

export default TryCatch;