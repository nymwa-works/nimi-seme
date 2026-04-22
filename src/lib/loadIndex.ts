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
  const buffer = await res.arrayBuffer()
  const text = await decodeGzipBuffer(buffer)
  const rows = JSON.parse(text) as Row[]
  return buildIndex(rows)
}

/**
 * gzip 形式が想定されるバイト列を UTF-8 文字列に変換する。
 * ブラウザが gzip を自動展開している場合は、単純に文字列としてデコードする。
 */
const decodeGzipBuffer = async (buffer: ArrayBuffer): Promise<string> =>
  isGzipMagic(buffer)
    ? await gzipToString(buffer)
    : new TextDecoder().decode(buffer)

/**
 * バイト列が gzip の magic number (0x1f 0x8b) で始まるかを判定する。
 */
const isGzipMagic = (buffer: ArrayBuffer): boolean => {
  if (buffer.byteLength < 2) {
    return false
  }
  // Unit8Array は ArrayBuffer の一部を読み取るためのビュー。
  // そのため、余計な部分までコピーせず、効率よく先頭 2 バイトを読み取れる。
  const head = new Uint8Array(buffer, 0, 2)
  return head[0] === 0x1f && head[1] === 0x8b
}

/**
 * gzip バイト列を `DecompressionStream` で展開して UTF-8 文字列に変換する。
 */
const gzipToString = async (buffer: ArrayBuffer): Promise<string> =>
  await new Response(gzipToStream(buffer)).text()

/**
 * gzip バイト列を `DecompressionStream` で展開するためのストリームに変換する。
 */
const gzipToStream = (buffer: ArrayBuffer): ReadableStream<Uint8Array> =>
  new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))

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
