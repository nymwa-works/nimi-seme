import { decodeBodyToText } from './decodeBody'
import { getCachedIndex, setCachedIndex } from './indexCache'
import { parseIndex } from './parseIndex'
import type { Index } from './types'

/** 固有名詞データセットのパス */
const DATA_PATH = 'proper_nouns_for_nimi_seme.tsv.gz'

/** {@link loadIndex} の結果を使い回すためのモジュールスコープでのキャッシュ。 */
let index: Promise<Index> | null = null

/**
 * 索引ファイルをダウンロードして {@link Index} としてパースする。
 *
 * 解決フロー:
 * 1. モジュール内キャッシュ
 * 2. IndexedDB キャッシュ (前回訪問時に保存された構築済みインデックス)
 * 3. fetch + 解凍 + インデックス構築
 *
 * @returns 構築済みの索引を解決する Promise。
 * @throws HTTP レスポンスが `ok` でない場合、Promise は reject される。
 */
export const loadIndex = (): Promise<Index> => (index ??= resolveIndex())

/**
 * IndexedDB にあればキャッシュから、なければインデックスを fetch する。
 */
const resolveIndex = async (): Promise<Index> => {
  // キャッシュがあればそれを返す。
  const cached = await getCachedIndex()
  if (cached) {
    return cached
  }
  // なければ、fetch して構築する。完了後はキャッシュに保存しておく。
  const fresh = await fetchIndex(DATA_PATH)
  // 保存は非同期で走らせてユーザーを待たせない。
  // void 演算子で、返り値の Promise を捨てることを明示する。
  void setCachedIndex(fresh)
  return fresh
}

/**
 * gzip 圧縮された TSV を fetch し {@link Index} を構築して返す。
 *
 * @param path - `document.baseURI` を基準とした相対 URL。
 * @returns パース済みの索引。
 * @throws HTTP レスポンスが `ok` でない場合、またはボディが空の場合。
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
  return parseIndex(text)
}
