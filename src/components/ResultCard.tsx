import { memo } from 'react'
import type { Index } from '../lib/types'

type ResultCardProps = {
  index: Index
  rowIndex: number
}

/**
 * 同じトキポナ表記の行を表示するカード。
 * 各行は `value (head)` 形式で 1 行ずつ並べる。
 *
 * index 参照と rowIndex が同じであれば出力も同じなので React.memo でメモ化する。
 * 親が prefix ごとに再レンダリングされても、キーが残っているカードの再描画を抑制できる。
 *
 * 列指向 Index なので表示に必要な列 (values, heads) は直接インデックスアクセスで取れ、
 * 中間の slice/map や Row タプルの分解は発生しない。
 *
 * @param props.index - 検索索引 (参照は不変)。
 * @param props.rowIndex - 表示するキーの `index.keys` 上のインデックス。
 * @returns カードを表す `<article>` 要素。
 */
export const ResultCard = memo(({ index, rowIndex }: ResultCardProps) => {
  const tp = index.keys[rowIndex]
  const start = index.offsets[rowIndex]
  const end = index.offsets[rowIndex + 1]
  const items = []
  for (let i = start; i < end; i++) {
    items.push(
      <li key={i} className="text-base">
        {formatRow(index.values[i], index.heads[i])}
      </li>,
    )
  }
  return (
    <article>
      <h2 className="font-mono text-2xl font-semibold text-stone-800">{tp}</h2>
      <ul className="mt-1 flex flex-col gap-0.5 pl-6 text-stone-900">{items}</ul>
    </article>
  )
})

/**
 * 1 行を `value (head)` 形式の文字列に整形する。head が空文字列なら value のみ。
 * head は既に `, ` 区切りの 1 文字列として格納されているので join 不要。
 */
const formatRow = (value: string, head: string): string =>
  head ? `${value} (${head})` : value
