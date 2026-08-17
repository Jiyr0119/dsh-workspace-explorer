import type { Context } from 'cordis';
/** 请求面(结构子集:URL/method/headers + 异步 body 迭代)。 */
export interface WsHttpRequest {
    url?: string;
    method?: string;
    headers: Record<string, string | string[] | undefined>;
    [Symbol.asyncIterator](): AsyncIterator<string | Uint8Array>;
}
/** 响应面(结构子集:status/header/body 写)。 */
export interface WsHttpResponse {
    statusCode: number;
    writeHead(status: number, headers?: Record<string, string>): void;
    end(body?: string | Uint8Array): void;
}
/** 一行目录条目。 */
export interface WsEntry {
    name: string;
    type: 'directory' | 'file';
    path: string;
    rel: string;
    size: number | null;
}
/** cordis Context 增强:webServer 路由注册面(镜像 @deepseek-ai/dsh-host-webserver 的 WebRoute)。 */
declare module 'cordis' {
    interface Context {
        webServer: {
            register(route: {
                kind: 'exact' | 'prefix';
                path: string;
                handler: (req: WsHttpRequest, res: WsHttpResponse) => void | Promise<void>;
            }): () => void;
        };
    }
}
declare const _default: {
    inject: string[];
    apply(ctx: Context): void;
};
export default _default;
