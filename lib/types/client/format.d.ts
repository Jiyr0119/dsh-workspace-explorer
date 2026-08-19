/**
 * 纯格式化工具(浏览器端,无 DOM / 无副作用),供面板与单元测试复用。
 */
/** 人类可读文件大小(空值返回空串)。 */
export declare const fmtSize: (n: number | null | undefined) => string;
/** 浏览器安全的 basename(兼容正斜杠结尾;DSH 内不依赖 node:path)。 */
export declare const basename: (p: string) => string;
/** 取小写扩展名;点开头(隐藏文件)或无扩展名返回空串。 */
export declare const extOf: (name: string) => string;
/** 把 /dsh-we/api/tree 的平铺条目渲染成带缩进与树形连线的文本块(目录拖拽 / 多选批量插入共用)。 */
export declare function formatTreeBlock(name: string, entries: Array<{
    rel: string;
    type: string;
    name: string;
}>, truncated: boolean): string;
