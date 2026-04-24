import type { Index } from '../lib/types'
import { ResultCard } from './ResultCard'

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

  // 結果を展開して描画する。index と rowIndex は参照/値が安定しているため、
  // React.memo で包んだ ResultCard は一致するキーのカードを再レンダリングせずに済む。
  return (
    <section className="flex flex-col gap-4">
      {matchedIndices.map((i) => (
        <ResultCard key={i} index={index} rowIndex={i} />
      ))}
    </section>
  )
}
