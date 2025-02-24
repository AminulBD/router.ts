export declare type RouteParameters = {
  [key: string]: string | undefined;
};

export declare type Context = {
  params: RouteParameters;
  [key: string]: unknown;
};

export declare type HttpMethod =
  | "get"
  | "head"
  | "post"
  | "put"
  | "delete"
  | "connect"
  | "options"
  | "trace"
  | "patch";

export declare type Routes = {
  path: string;
  method: HttpMethod;
  handler: (req: Request, ctx: Context) => Response;
};

export default class Router {
  static routes: Routes[] = [];

  static add(
    methods: HttpMethod[] | HttpMethod,
    path: string,
    handler: (req: Request, ctx: Context) => Response,
  ) {
    methods = Array.isArray(methods) ? methods : [methods];
    path = path.replace(/\/$/, "");
    path = path.startsWith("/") ? path : `/${path}`;

    methods.forEach((method) => {
      Router.routes.push({ path, method, handler });
    });
  }

  static handle(req: Request): Response {
    const method = req.method.toLowerCase() as HttpMethod;
    const url = req.url.replace(/\/$/, "");

    let params: RouteParameters = {};
    const route = Router.routes.find((route) => {
      if (route.method !== method) {
        return false;
      }

      const match = (new URLPattern({ pathname: route.path })).exec(url);
      if (!match) {
        return false;
      }

      params = match.pathname.groups;

      return true;
    });

    if (!route) {
      return new Response("Not Found", { status: 404 });
    }

    return route.handler(req, {
      params,
    });
  }
}
