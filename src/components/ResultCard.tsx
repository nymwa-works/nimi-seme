import { memo } from 'react'
import type { Index } from '../lib/types'

type ResultCardProps = {
  index: Index
  rowIndex: number
}

/**
 * 同じトキポナ表記の行を表示するカード。
 * 各行は `value (head)` 形式で 1 行ずつ並べる。
 * React.memo でメモ化して、同じ行を表示するカードの再描画を抑制する。
 *
 * @param props.index - 検索インデックス。
 * @param props.rowIndex - 表示するキーの `index.keys` 上のインデックス。
 * @returns カードを表す `<article>` 要素。
 */
export const ResultCard = memo(({ index, rowIndex }: ResultCardProps) => {
  const tp = index.keys[rowIndex]
  const start = index.offsets[rowIndex]
  const end = index.offsets[rowIndex + 1]
  const items = []
  for (let i = start; i < end; i++) {
    items.push(<li key={i}>{formatRow(index.values[i], index.heads[i])}</li>)
  }
  return (
    <article>
      <h2 className="font-mono text-2xl font-semibold text-stone-800">{tp}</h2>
      <ul className="mt-2 flex flex-col gap-0.5 pl-3 text-stone-900">
        {items}
      </ul>
    </article>
  )
})

/**
 * 1 行を `value (head)` 形式の文字列に整形する。head が空文字列なら value のみ。
 * head は既に `, ` 区切りの 1 文字列として格納されているので join 不要。
 */
const formatRow = (value: string, head: string): string =>
  head ? `${value} (${head})` : value
