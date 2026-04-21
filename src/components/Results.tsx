import type { Index, Row } from '../lib/types'

/**
 * {@link Results} のプロパティ。
 *
 * @property index - 検索索引 (Suspense 境界の内側なので常に解決済み)。
 * @property prefix - 現在の検索接頭辞 (正規化済み)。空なら検索中ではない。
 * @property matchedIndices - 接頭辞に一致したキーの {@link Index.keys} 上のインデックス列 (表示上限で切り詰め済み)。
 */
type ResultsProps = {
  index: Index
  prefix: string
  matchedIndices: number[]
}

type ResultCardProps = {
  tp: string
  rows: Row[]
}

/**
 * 検索結果を一覧表示する。
 *
 * @param props - {@link ResultsProps}。
 * @returns 結果一覧の `<section>`、または描画不要なら `null`。
 */
export const Results = ({ index, prefix, matchedIndices }: ResultsProps) => {
  // 入力が空、または、入力に一致する結果がない場合は、何も描画しない。
  if (!prefix || matchedIndices.length === 0) {
    return null
  }

  // 結果を展開して描画する。
  return (
    <section className="flex flex-col gap-4">
      {matchedIndices.map((i) => (
        <ResultCard
          key={i}
          tp={index.keys[i]}
          rows={index.rows.slice(index.offsets[i], index.offsets[i + 1])}
        />
      ))}
    </section>
  )
}

/**
 * 同じトキポナ表記の行を表示するカード。
 * 各行は `en (head)` 形式で 1 行ずつ並べる。
 *
 * @param props.tp - トキポナ表記。
 * @param props.rows - 当該 `tp` に属する全行。
 * @returns カードを表す `<article>` 要素。
 */
const ResultCard = ({ tp, rows }: ResultCardProps) => (
  <article>
    <h2 className="text-accent text-tp font-mono font-semibold">{tp}</h2>
    <ul className="text-text-h mt-1 flex flex-col gap-0.5 pl-6">
      {rows.map((row, i) => (
        <li key={i} className="text-base">
          {formatRow(row)}
        </li>
      ))}
    </ul>
  </article>
)

/**
 * 行データを 1 行のテキストに整形する。
 * head がある場合は、en (head1, head2, ...) 形式で返す。ない場合は en のみを返す。
 *
 * @param row - 整形対象の行。
 * @returns 表示用文字列。
 */
const formatRow = ([, en, head]: Row): string =>
  head.length > 0 ? `${en} (${head.join(', ')})` : en
