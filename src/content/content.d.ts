// Vite raw-import shim: `import md from "./x.md?raw"` yields the file's text.
declare module "*.md?raw" {
  const src: string;
  export default src;
}
