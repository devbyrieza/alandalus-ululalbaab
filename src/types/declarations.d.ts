// Type declarations for global side-effect imports and asset files
declare module "*.css" {
  const content: { [className: string]: string } | string;
  export default content;
}

declare module "*.scss" {
  const content: { [className: string]: string } | string;
  export default content;
}

declare module "*.sass" {
  const content: { [className: string]: string } | string;
  export default content;
}
