/**
 * 固有名詞のトキポナ・英語対 1 行分の型定義。
 * 「トキポナ表記、英語表記、主辞」の順のタプル。
 */
export type Row = [tp: string, en: string, head: string[]]

/**
 * 検索用に構築済みの索引の型定義。
 *
 * @property keys - ユニークな `tp` を昇順で並べた配列。
 * @property offsets - `keys` が `rows` のどこから始まるかを示す区切り配列。最後の要素は `rows.length`。
 * @property rows - 全エントリを昇順で並べた行配列。
 */
export type Index = {
  keys: string[]
  offsets: number[]
  rows: Row[]
}
