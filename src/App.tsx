import { Suspense, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { ResultsContainer } from './components/ResultsContainer'
import { SearchBar } from './components/SearchBar'
import { loadIndex } from './lib/loadIndex'
import { normalizePrefix } from './lib/normalize'

const PLACEHOLDER_LOADING = '≡＞ω＜≡'
const PLACEHOLDER_READY = '≡╹ω╹≡'

const App = () => {
  const [query, setQuery] = useState('')
  const prefix = useMemo(() => normalizePrefix(query), [query])
  const [ready, setReady] = useState(false)
  // 検索結果の更新は優先度を下げる。
  // 入力のレスポンスが良くなり、ユーザー体験が向上する。
  const deferredPrefix = useDeferredValue(prefix)

  useEffect(() => {
    loadIndex().finally(() => setReady(true))
  }, [])

  return (
    <div className="border-border mx-auto flex min-h-svh max-w-180 flex-col border-x">
      <div className="flex grow flex-col gap-6 px-6 pt-8 pb-16">
        <AppHeader />
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={ready ? PLACEHOLDER_READY : PLACEHOLDER_LOADING}
        />
        <Suspense fallback={null}>
          <ResultsContainer prefix={deferredPrefix} />
        </Suspense>
      </div>
    </div>
  )
}

export default App
