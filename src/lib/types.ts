/**
 * 配信ファイルの 1 行 (`[tp キー, en, 主辞の配列]` のタプル)。
 * トキポナキー、英語表記、付く主辞の順。
 */
export type Row = [tp: string, en: string, head: string[]]

/**
 * 検索用に構築済みの索引。
 *
 * @remarks
 * 配信データはキー昇順・同一キー連続で並んでいるため、
 * 入力行 `rows` をそのまま保持し、ユニークキー列 `keys` とその
 * 各グループの開始位置 `offsets` を横に持つ形に分解する。
 * キー `keys[i]` に属する行は `rows.slice(offsets[i], offsets[i+1])`。
 * 209K 件ぶんのオブジェクト / 配列を新規生成しないため、
 * 読み込みの山場だった regroup 処理がほぼゼロコストになる。
 *
 * @property keys - ユニークな `tp` を昇順で並べた配列 (prefix 検索用)。
 * @property offsets - `keys` と平行な区切り配列。長さは `keys.length + 1` で
 *                    最後の要素は `rows.length` (番兵)。
 * @property rows - 全エントリを昇順で並べた行配列 (入力そのまま保持)。
 */
export type Index = {
  keys: string[]
  offsets: number[]
  rows: Row[]
}
