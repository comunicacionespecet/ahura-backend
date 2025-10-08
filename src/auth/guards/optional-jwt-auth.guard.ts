import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to not throw errors
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Return user if exists, otherwise return undefined (no error thrown)
    return user || undefined;
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Try to authenticate, but don't fail if it doesn't work
    const canActivate = super.canActivate(context);

    if (canActivate instanceof Promise) {
      return canActivate.catch(() => true);
    } else if (canActivate instanceof Observable) {
      return canActivate;
    }

    // If already boolean, return true to allow access
    return true;
  }
}
