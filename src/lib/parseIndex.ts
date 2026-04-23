import type { Index } from './types'

/**
 * TSV を走査し、{@link Index} を構築する。
 */
export const parseIndex = (text: string): Index => {
  const keys: string[] = []
  const values: string[] = []
  const heads: string[] = []
  const offsets: number[] = []
  const len = text.length
  let prevTp: string | undefined
  let lineStart = 0
  let rowIndex = 0

  // while ループで、O(n) でテキストを走査する。
  // javascript の indexOf と slice は速い。
  while (lineStart < len) {
    let lineEnd = text.indexOf('\n', lineStart)
    if (lineEnd === -1) {
      lineEnd = len
    }
    if (lineEnd > lineStart) {
      const tab1 = text.indexOf('\t', lineStart)
      const tab2 = text.indexOf('\t', tab1 + 1)
      const tp = text.slice(lineStart, tab1)
      const value = text.slice(tab1 + 1, tab2)
      const head = text.slice(tab2 + 1, lineEnd)

      // トキポナのキーが変わった時にオフセットを記録する。
      if (tp !== prevTp) {
        keys.push(tp)
        offsets.push(rowIndex)
        prevTp = tp
      }
      values.push(value)
      heads.push(head)
      rowIndex++
    }
    lineStart = lineEnd + 1
  }
  // 最後のキーの次の位置を最後のオフセットとして記録する。
  offsets.push(rowIndex)
  return { keys, values, heads, offsets: Int32Array.from(offsets) }
}
