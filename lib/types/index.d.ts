import type { Context } from 'cordis';
import z from '@deepseek-ai/schemastery';
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
/** 内容搜索命中(片段窗口内的行文本;start/end 为匹配区间,相对 text)。 */
export interface SearchHit {
    rel: string;
    name: string;
    line: number;
    text: string;
    start: number;
    end: number;
}
/** 内容搜索结果。 */
export interface SearchResult {
    ok: boolean;
    error?: string;
    hits: SearchHit[];
    scanned: number;
    truncated: boolean;
}
/** 内容搜索可调上限(测试用;生产走默认常量)。 */
export interface SearchOptions {
    maxHits?: number;
    maxFiles?: number;
    maxFileBytes?: number;
    maxPerFile?: number;
}
/**
 * 插件持久化配置(DSH 0.1.7+ settings 域)。
 *
 * 声明在 Host 入口上后,DSH 会把带 `.volatile()` 的字段投影为「可热编辑」表单:
 * - 持久化到当前 Profile 的组合配置(重启后依然生效);
 * - Web 设置页 / 插件管理器可直接编辑,无需重挂载插件;
 * - 客户端经 `configForms.get('workspace-explorer')` 读写同一份值。
 *
 * 字段集合必须与客户端 WsCfg(面板设置)一一对应,顺序即展示顺序。
 */
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    hideNoise: z<boolean, boolean, "volatile-defined">;
    showSize: z<boolean, boolean, "volatile-defined">;
    refStyle: z<"relative" | "absolute", "relative" | "absolute", "volatile-defined">;
    peekLines: z<60 | 30 | 120, 60 | 30 | 120, "volatile-defined">;
    width: z<320 | 384 | 480, 320 | 384 | 480, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    hideNoise: z<boolean, boolean, "volatile-defined">;
    showSize: z<boolean, boolean, "volatile-defined">;
    refStyle: z<"relative" | "absolute", "relative" | "absolute", "volatile-defined">;
    peekLines: z<60 | 30 | 120, 60 | 30 | 120, "volatile-defined">;
    width: z<320 | 384 | 480, 320 | 384 | 480, "volatile-defined">;
}>>, "plain">;
declare const _default: {
    inject: string[];
    Config: z<Schemastery.ObjectS<NoInfer<{
        hideNoise: z<boolean, boolean, "volatile-defined">;
        showSize: z<boolean, boolean, "volatile-defined">;
        refStyle: z<"relative" | "absolute", "relative" | "absolute", "volatile-defined">;
        peekLines: z<60 | 30 | 120, 60 | 30 | 120, "volatile-defined">;
        width: z<320 | 384 | 480, 320 | 384 | 480, "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        hideNoise: z<boolean, boolean, "volatile-defined">;
        showSize: z<boolean, boolean, "volatile-defined">;
        refStyle: z<"relative" | "absolute", "relative" | "absolute", "volatile-defined">;
        peekLines: z<60 | 30 | 120, 60 | 30 | 120, "volatile-defined">;
        width: z<320 | 384 | 480, 320 | 384 | 480, "volatile-defined">;
    }>>, "plain">;
    apply(ctx: Context, config?: Record<string, unknown>): void;
};
export default _default;
