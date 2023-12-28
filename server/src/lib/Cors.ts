import type { Request } from 'express';
const allowlist = ['http://localhost:5173'];

export class Cors {
  private app = null;

  constructor(app) {
    this.app = app;
    this.handle();
  }

  handle() {
    // this.app.enableCors({
    //   origin: '*',
    //   allowedHeaders: ['Authorization', 'content-type'],
    //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // });
    this.app.enableCors(this.corsOptionsDelegate);
  }

  corsOptionsDelegate(req: Request, callback) {
    let corsOptions;

    // console.log("req.header('Origin')", req.header('Origin'));
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
      //   console.log("req.header('Origin')", req.header('Origin')); //如果你不需要 Cookie 可以设置为 *
      // credentials 与前端的axios 的withCredentials（XMLHttpRequest.withCredentials）
      // 同时 origin必须设置为访问域 才能正常访问，主要是为了 凭证是 Cookie ，授权标头或 TLS 客户端证书

      corsOptions = { origin: req.header('Origin'), credentials: true };
    } else {
      console.log('disable CORS for this request', req.header('Origin'));
      corsOptions = { origin: false }; // disable CORS for this request
    }

    callback(null, corsOptions); // callback expects two parameters: error and options
    return {
      origin: true,
      methods: true,
      allowedHeaders: true,
      exposedHeaders: ['Authorization'],
    };
  }
}
