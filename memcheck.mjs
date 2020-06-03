import * as WebMKLC from "./webmkl-c.mjs";

setInterval(() => {
  console.debug("pointer = %s", WebMKLC.calloc(1024, 1));
}, 100);
