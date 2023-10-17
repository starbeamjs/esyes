import { register } from "node:module";

register(new URL("./preload.js", import.meta.url));
