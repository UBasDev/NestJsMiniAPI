import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    //Eğer `true` dönerse, enpointe eklenen ilgili Guard çalışmayacak ve kullanıcılara erişmesi için izin VERECEKTİR
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]); //`isPublic` metadatasını yakalamak için önce içerisinde kullanıldığı Controllerın handlerına bakacak, ardından da Controller classına bakacaktır. Eğer bunlardan birisinde `isPublic` metadatasını bulursa `true` dönecek
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
