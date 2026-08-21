interface CtxLike {
    get(name: string): unknown;
    effect(fn: () => () => void): void;
    inject(deps: string[], callback: (scope: unknown) => unknown): void;
}
export declare const inject: string[];
export declare function apply(ctx: CtxLike): void;
export {};
