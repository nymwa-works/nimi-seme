import type { Index, Row } from './types'

/** {@link loadIndex} の結果を使い回すためのモジュールスコープでのキャッシュ。 */
let index: Promise<Index> | null = null

/**
 * 索引ファイルをダウンロードして {@link Index} としてパースする。
 * 最初の呼び出しのみ fetch を行い、2回目以降はキャッシュされた Promise を返す。
 *
 * @returns パース済みの索引を解決する Promise。
 * @throws HTTP レスポンスが `ok` でない場合、Promise は reject される。
 */
export const loadIndex = (): Promise<Index> =>
  (index ??= fetchIndex('proper_nouns.json.gz'))

/**
 * gzip 圧縮された JSON を fetch し {@link Index} に型付けして返す。
 *
 * @param path - `document.baseURI` を基準とした相対 URL。
 * @returns パース済みの索引。
 * @throws HTTP レスポンスが `ok` でない場合。
 */
const fetchIndex = async (path: string): Promise<Index> => {
  const url = new URL(path, document.baseURI)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(
      `Failed to fetch ${url.toString()}: ${res.status.toString()}`,
    )
  }
  if (!res.body) {
    throw new Error(`Response body is empty: ${url.toString()}`)
  }
  const text = await decodeBodyToText(res.body)
  return parseAndBuild(text)
}

/**
 * レスポンスボディの先頭 2 バイトから gzip かどうか判定し、
 * 必要なら {@link DecompressionStream} で展開しつつテキスト化する。
 *
 * ブラウザが `Content-Encoding: gzip` を解釈して自動展開するケース
 * (Vite dev server) と、生 gzip が返るケース (GitHub Pages) の両対応。
 */
const decodeBodyToText = async (
  body: ReadableStream<Uint8Array>,
): Promise<string> => {
  const reader = body.getReader()
  const first = await reader.read()
  if (first.done) {
    return ''
  }
  const head = first.value
  const gzip = head.length >= 2 && head[0] === 0x1f && head[1] === 0x8b
  // 先頭チャンクを読み切ってしまったため、先頭チャンク + 残りを繋ぎ直した
  // ストリームを構築する。生成した時点から解凍を開始できる。
  // Response を経由するのは DOM lib の ReadableStream/DecompressionStream の
  // 型変位が噛み合わない (BufferSource vs Uint8Array) のを回避するため。
  const rebuilt = new Response(
    new ReadableStream({
      start: (ctrl) => ctrl.enqueue(head),
      pull: async (ctrl) => {
        const { done, value } = await reader.read()
        if (done) {
          ctrl.close()
        } else {
          ctrl.enqueue(value)
        }
      },
      cancel: (reason) => reader.cancel(reason),
    }),
  ).body
  if (!rebuilt) {
    return ''
  }
  const stream = gzip
    ? rebuilt.pipeThrough(new DecompressionStream('gzip'))
    : rebuilt
  return await new Response(stream).text()
}

/**
 * TSV を走査し、{@link Index} を構築する。
 */
const parseAndBuild = (text: string): Index => {
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
