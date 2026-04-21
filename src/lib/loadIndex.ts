import type { Index, Row } from './types'

/** {@link loadIndex} の結果を使い回すためのモジュールスコープキャッシュ。 */
let index: Promise<Index> | null = null

/**
 * 索引ファイルをダウンロードして {@link Index} としてパースする。
 *
 * @remarks
 * 初回呼び出し時にのみ fetch を発行し、以降は同一 Promise を返す。
 * React の `use()` に直接渡してもレンダーごとに参照が変わらないため、
 * Suspense が再度サスペンドすることなく resolve 済みの値を取り出せる。
 *
 * @returns パース済みの索引を解決する Promise。
 * @throws HTTP レスポンスが `ok` でない場合、Promise は reject される。
 */
export const loadIndex = (): Promise<Index> =>
  (index ??= fetchIndex('proper_nouns.json.gz'))

/**
 * 指定パスの gzip 圧縮 JSON を fetch し {@link Index} に型付けして返す。
 *
 * @remarks
 * 本番の GitHub Pages は `.gz` ファイルに `Content-Encoding: gzip` を付けず
 * 生のバイト列として返すため、`DecompressionStream('gzip')` で自前展開する。
 * Vite dev server (sirv) は逆に `Content-Encoding: gzip` を自動付与し、
 * ブラウザが HTTP レイヤで透過展開してしまう。
 * 両環境に対応するため、レスポンスボディ先頭が gzip の magic number
 * (0x1f 0x8b) かどうかで判定し、必要なときだけ展開する。
 * `DecompressionStream('gzip')` は主要ブラウザ
 * (Chrome 80+, Safari 16.4+, Firefox 113+) で利用可能。
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
  const buffer = await res.arrayBuffer()
  // ブラウザが `Content-Encoding: gzip` を解釈して gzip を自動展開することがある。
  // そのため、入力が json 文字列か、gzip のバイト列かを判定して処理する。
  const text = isGzipMagic(buffer)
    ? await gzipToString(buffer)
    : new TextDecoder().decode(buffer)
  const rows = JSON.parse(text) as Row[]
  return buildIndex(rows)
}

/**
 * バイト列が gzip の magic number (0x1f 0x8b) で始まるかを判定する。
 */
const isGzipMagic = (buffer: ArrayBuffer): boolean => {
  if (buffer.byteLength < 2) return false
  const head = new Uint8Array(buffer, 0, 2)
  return head[0] === 0x1f && head[1] === 0x8b
}

/**
 * gzip バイト列を `DecompressionStream` で展開して UTF-8 文字列に変換する。
 */
const gzipToString = async (buffer: ArrayBuffer): Promise<string> => {
  const stream = new Blob([buffer])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'))
  return await new Response(stream).text()
}

/**
 * json データをもとに {@link Index} を構築する。
 *
 * @param rows - `[tp, en, heads]` の 3 要素タプル配列。
 * @returns 検索用索引。
 */
const buildIndex = (rows: Row[]): Index => {
  const keys: string[] = []
  const offsets: number[] = []
  for (let i = 0; i < rows.length; i++) {
    // キーが変わったタイミングで、キーとその開始位置を記録する。
    if (i === 0 || rows[i][0] !== rows[i - 1][0]) {
      keys.push(rows[i][0])
      offsets.push(i)
    }
  }
  // 最後のキーの次の位置を記録する。最後のキーの終了位置を探すために使用する。
  offsets.push(rows.length)
  return { keys, offsets, rows }
}
