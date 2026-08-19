/**
 * 纯格式化工具(浏览器端,无 DOM / 无副作用),供面板与单元测试复用。
 */

/** 人类可读文件大小(空值返回空串)。 */
export const fmtSize = (n: number | null | undefined): string => {
  if (n == null) return ''
  if (n < 1024) return `${n} B`
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1048576).toFixed(1)} MB`
}

/** 浏览器安全的 basename(兼容正斜杠结尾;DSH 内不依赖 node:path)。 */
export const basename = (p: string): string => { const s = p.replace(/\/+$/, ''); const i = s.lastIndexOf('/'); return i >= 0 ? s.slice(i + 1) : s }

/** 取小写扩展名;点开头(隐藏文件)或无扩展名返回空串。 */
export const extOf = (name: string): string => { const i = name.lastIndexOf('.'); return i <= 0 ? '' : name.slice(i + 1).toLowerCase() }

/** 目录树文本节点。 */
interface TreeFormatNode { name: string; type: string; children: TreeFormatNode[] }

/** 把 /dsh-we/api/tree 的平铺条目渲染成带缩进与树形连线的文本块(目录拖拽 / 多选批量插入共用)。 */
export function formatTreeBlock(name: string, entries: Array<{ rel: string; type: string; name: string }>, truncated: boolean): string {
  const root: TreeFormatNode = { name, type: 'directory', children: [] }
  const map = new Map<string, TreeFormatNode>([['', root]])
  for (const e of entries) {
    const segs = e.rel.split('/')
    const node: TreeFormatNode = { name: e.name, type: e.type, children: [] }
    map.set(e.rel, node)
    const parent = segs.length > 1 ? segs.slice(0, -1).join('/') : ''
    map.get(parent)?.children.push(node)
  }
  const out: string[] = []
  const walk = (node: TreeFormatNode, prefix: string, isLast: boolean, isRoot: boolean): void => {
    if (isRoot) {
      out.push(`${node.name}/`)
    } else {
      out.push(`${prefix}${isLast ? '└── ' : '├── '}${node.name}${node.type === 'directory' ? '/' : ''}`)
      prefix += isLast ? '    ' : '│   '
    }
    node.children.forEach((c, i) => walk(c, prefix, i === node.children.length - 1, false))
  }
  walk(root, '', true, true)
  if (truncated) out.push('…')
  return out.join('\n')
}