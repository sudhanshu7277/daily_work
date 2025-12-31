import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { RoleService } from '../services/auth/role.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const roleService = inject(RoleService);
  const user = roleService.getUser();

  if (user) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.soeid}`, // or real token if you have one
        'X-Role': user.role,
        'X-SOEID': user.soeid
      }
    });
    return next(authReq);
  }

  return next(req);
};







// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { RoleService } from '../services/auth/role.service';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const roleService = inject(RoleService);
//   const user = roleService.getUser();

//   if (user) {
//     const authReq = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${user.soeid}`, // or your token
//         'X-Role': user.role
//       }
//     });
//     return next(authReq);
//   }

//   return next(req);
// };