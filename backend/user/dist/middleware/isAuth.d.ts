import type { Request, Response, NextFunction } from 'express';
import type { IUSer } from '../model/User.js';
export interface AuthenticatedRequest extends Request {
    user?: IUSer | null;
}
export declare const isAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=isAuth.d.ts.map