/**
 * {@link SearchBar} のプロパティ。
 *
 * @property value - 現在の入力文字列 (制御コンポーネント)。
 * @property onChange - 入力が変化したときに呼ばれるコールバック。
 * @property placeholder - 空欄時に表示するプレースホルダ文言。
 */
type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * 検索入力欄コンポーネント。
 * 単一の `<input>` を `value` / `onChange` で制御し、
 * スペルチェックや自動大文字化を無効化してトキポナ固有名詞の入力を妨げないようにする。
 *
 * @param props - {@link Props}。
 * @returns 検索入力欄を含む `<section>` 要素。
 */
export const SearchBar = ({ value, onChange, placeholder }: Props) => (
  <section className="flex">
    <input
      type="text"
      className="border-border bg-bg text-text-h focus:border-accent/50 flex-1 rounded-lg border-2 p-3 font-mono text-lg transition-colors outline-none"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
      spellCheck={false}
      autoCapitalize="off"
    />
  </section>
)
