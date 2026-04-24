import type { Index } from '../lib/types'
import { ResultCard } from './ResultCard'

/**
 * {@link Results} のプロパティ。
 *
 * @property index - 検索インデックス。
 * @property prefix - 現在の検索接頭辞。
 * @property matchedIndices - 接頭辞に一致したキーの {@link Index.keys} 上のインデックス列。
 */
type ResultsProps = {
  index: Index
  matchedIndices: number[]
}

/**
 * 検索結果を一覧表示する。
 *
 * @param props - {@link ResultsProps}。
 * @returns 結果一覧の `<section>`、または描画不要なら `null`。
 */
export const Results = ({ index, matchedIndices }: ResultsProps) => {
  // 入力が空、または、入力に一致する結果がない場合は、何も描画しない。
  if (matchedIndices.length === 0) {
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
