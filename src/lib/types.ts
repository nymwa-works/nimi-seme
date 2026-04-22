/**
 * 検索用の索引の型定義。
 *
 * @property keys - トキポナの固有名詞を昇順・重複なしで並べた配列。検索の二分探索の対象。
 * @property values - 各エントリーの英語表記。
 * @property heads - 各エントリーのトキポナ固有名詞の前に付く主辞 (複数ある場合は `, ` 区切りの 1 文字列)。
 * @property offsets - `keys` が `values`/`heads` のどこから始まるかの区切り配列。
 * 長さは `keys.length + 1` で、末尾は `values.length`。
 * `keys[i]` に属する行は `[offsets[i], offsets[i + 1])` の範囲で `values` / `heads` を参照する。
 */
export type Index = {
  keys: string[]
  values: string[]
  heads: string[]
  offsets: Int32Array // メモリ効率のために Int32Array で用いる。
}
