import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

import type { IUser } from '../model/User.js';

dotenv.config();

export interface AuthenticatedRequest extends Request{
  user?: IUser | null;
}

export const isAuth = async(req: AuthenticatedRequest, res: Response, next: NextFunction):Promise<void> => {
  try{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
      res.status(401).json({
        message: "Please Login - No auth header."
      })
      return;
    }

    const token = authHeader.split(" ")[1] as any;

    const decodedValue = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload

    if(!decodedValue || !decodedValue.id){
      res.status(401).json({
        message: "Invalid token"
      })
      return;
    }

    req.user = {
      _id: decodedValue.id,
      email: decodedValue.email
    } as any;
    
    next();
  }
  catch(error){
    res.status(401).json({
      message: "Please login - JWT error"
    })
  }
}

