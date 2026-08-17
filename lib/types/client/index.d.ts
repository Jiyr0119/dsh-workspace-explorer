interface CtxLike {
    get(name: string): unknown;
    effect(fn: () => () => void): void;
}
export declare const inject: string[];
export declare function apply(ctx: CtxLike): void;
export {};
