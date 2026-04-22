/**
 * 入力文字列を検索用の接頭辞に正規化する。
 *
 * @param input - ユーザーが入力した生の文字列。
 * @returns 正規化された接頭辞。空入力なら空文字列。
 */
export const normalizePrefix = (input: string): string => {
  // 先頭の空白を削除する。末尾の空白は残す。
  const leftTrimmed = input.replace(/^\s+/, '')
  // 先頭の空白を削除した後、空文字列なら空文字列を返す。
  // 先頭の空白を削除してから文字列ということは、そもそも空白しか入力されていないということ。
  if (!leftTrimmed) {
    return ''
  }
  // 末尾の空白があるかどうかを確認する。
  const hasTrailingSpace = /\s$/.test(leftTrimmed)
  // タイトルケースにする。
  const tokens = toTitleCase(leftTrimmed)
  // 末尾の空白があった場合は、正規化された接頭辞の末尾に空白を追加する。
  // こうすることで、"A A " のような入力に対して、"A A" がヒットしないようになる。
  return hasTrailingSpace ? tokens + ' ' : tokens
}

/**
 * 単語ごとに分割して、先頭を大文字、残りを小文字にする。
 * 最後に、単語をスペースで結合する。
 *
 * @example toTitleCase("  foo  bar ") // "Foo Bar"
 * @param input - 入力文字列。
 * @returns 単語ごとにタイトルケースに変換された文字列。
 */
const toTitleCase = (input: string): string =>
  input
    .trim()
    .split(/\s+/)
    .map((t) => t[0].toUpperCase() + t.slice(1).toLowerCase())
    .join(' ')
