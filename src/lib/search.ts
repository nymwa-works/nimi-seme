import type { Index } from './types'

/**
 * 接頭辞をクエリとしてインデックス列の検索を行う。
 * 開始位置を二分探索で求め、終了位置かlimitに達するまで走査する。
 *
 * @param index - 索引。
 * @param prefix - 接頭辞 (正規化済みを想定)。
 * @param limit - 返却するキーの上限数。
 * @returns 接頭辞に一致したキーのインデックス列 (先頭 `limit` 件まで)。
 */
export const searchByPrefix = (
  index: Index,
  prefix: string,
  limit: number,
): number[] => {
  // 入力が空の場合は空配列を返す。
  if (!prefix) {
    return []
  }
  const keys = index.keys
  const start = lowerBound(keys, prefix)

  // 接頭辞が一致する間だけ、最大 limit 件までインデックスを拾う。
  const result: number[] = []
  for (let i = start; i < keys.length; i++) {
    // keys[i] が prefix で始まらない場合、break。
    if (!keys[i].startsWith(prefix)) {
      break
    }
    // limit 件集まったら break。
    if (result.length >= limit) {
      break
    }
    result.push(i)
  }
  return result
}

/**
 * ソート済みの文字列の配列で、target 以上となる最小のインデックスを二分探索で求める。
 *
 * @param keys - 昇順ソート済みのキー列。
 * @param target - 探索対象の文字列。
 * @returns `keys[i] >= target` を満たす最小の `i` (該当無しなら `keys.length`)。
 */
const lowerBound = (keys: string[], target: string): number => {
  const search = (left: number, right: number): number => {
    // 探索範囲が1要素の場合は、確定。
    if (left >= right) {
      return left
    }
    // 中間の位置を計算する。（切り捨て）
    const mid = (left + right) >>> 1
    // 中間の要素が target より小さい場合は、それより右側を探索。
    // そうでない場合は、反対側を探索。
    return keys[mid] < target ? search(mid + 1, right) : search(left, mid)
  }
  return search(0, keys.length)
}
