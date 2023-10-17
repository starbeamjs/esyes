declare module "tsx/esm" {
  import type { LoadHook, ResolveHook } from "node:module";

  export const resolve: ResolveHook;
  export const load: LoadHook;
}
