import { use, useMemo } from 'react'
import { loadIndex } from '../lib/loadIndex'
import { searchByPrefix } from '../lib/search'
import { Results } from './Results'

const RESULT_LIMIT = 200

/**
 * 検索結果を取得して {@link Results} に渡すコンテナ。
 */
export const ResultsContainer = ({ prefix }: { prefix: string }) => {
  const index = use(loadIndex())
  const matchedIndices = useMemo(
    () => searchByPrefix(index, prefix, RESULT_LIMIT),
    [index, prefix],
  )
  return <Results index={index} matchedIndices={matchedIndices} />
}
