declare module "cfonts" {
  export interface CFontsOptions {
    font?: string;
    align?: "left" | "center" | "right";
    colors?: string[];
    background?: string;
    letterSpacing?: number;
    lineHeight?: number;
    space?: boolean;
    maxLength?: number;
    gradient?: boolean | string[];
    independentGradient?: boolean;
    transitionGradient?: boolean;
    env?: "node" | "browser";
  }

  export function render(text: string, options?: CFontsOptions): { string: string; array: string[] };
  export function say(text: string, options?: CFontsOptions): void;
}
