import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'RefreshTokenSecretKeyExample',
      passReqToCallback: true, //Refresh tokenı ürettikten sonra hashlayarak databasee göndereceğimiz için, üretildikten sonra destroy edilmesini engelleriz. JWT tokenlar, default olarak üretildikten sonra DESTROY edilirler!
    });
  }
  validate(req: Request, payload: any) {
    const refreshToken =
      req.get('authorization').replace('Bearer', '').trim() ||
      req.get('Authorization').replace('Bearer', '').trim();
    return {
      ...payload,
      refreshToken,
    };
    /**
     Buradan dönecek örnek bir değer:
     {
      sub: 13,
      email: xxx@gmail.com,
      refreshToken: nljnsad8912
     }
     */
  }
}
