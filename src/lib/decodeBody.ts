/**
 * gzip 圧縮されている可能性のあるレスポンスボディをテキスト化する。
 */
export const decodeBodyToText = async (
  body: ReadableStream<Uint8Array>,
): Promise<string> => {
  const { head, stream } = await peekHead(body)
  if (!head) {
    return ''
  }
  return await streamToText(stream, isGzipMagic(head))
}

/**
 * ストリームの先頭チャンクを取り出し、先頭チャンクを再 enqueue した新しいストリームと合わせて返す。
 */
const peekHead = async (
  body: ReadableStream<Uint8Array>,
): Promise<{
  head: Uint8Array | null
  stream: ReadableStream<Uint8Array>
}> => {
  const reader = body.getReader()
  const first = await reader.read()
  if (first.done) {
    return { head: null, stream: body }
  }
  return {
    head: first.value,
    stream: prependChunk(first.value, reader),
  }
}

/**
 * 先頭チャンクを差し込んだ {@link ReadableStream} を作る。
 * 以降は与えられた reader からチャンクを流す。
 */
const prependChunk = (
  head: Uint8Array,
  reader: ReadableStreamDefaultReader<Uint8Array>,
): ReadableStream<Uint8Array> => streamFrom(generateStream(head, reader))

/**
 * 先頭チャンクを yield してから reader を読み切るジェネレータ。
 * finally で必ずリソースを解放するようにする。
 */
async function* generateStream(
  head: Uint8Array,
  reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<Uint8Array, void, unknown> {
  try {
    yield head
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        return
      }
      yield value
    }
  } finally {
    void reader.cancel()
  }
}

// TypeScript の型検査に通すための型アサーション。
// ReadableStream.from は AsyncIterable からストリームを作成する。
const streamFrom = (
  ReadableStream as unknown as {
    from: <T>(iter: AsyncIterable<T>) => ReadableStream<T>
  }
).from

/** チャンクの先頭 2 バイトが gzip のマジックナンバー (`1f 8b`) かを判定する。 */
const isGzipMagic = (chunk: Uint8Array): boolean =>
  chunk.length >= 2 && chunk[0] === 0x1f && chunk[1] === 0x8b

/**
 * ストリームを gzip 展開しながらテキスト化する。
 * すでに gzip 展開されている場合はそのままテキスト化する。
 */
const streamToText = async (
  stream: ReadableStream<Uint8Array>,
  gzip: boolean,
): Promise<string> => {
  // 圧縮されていない場合はそのままテキスト化する。
  if (!gzip) {
    return await new Response(stream).text()
  }
  // 解凍してからテキスト化する。
  // TypeScript の型検査に通すため、Response を経由して DecompressionStream を使う。
  const body = new Response(stream).body
  if (!body) {
    return ''
  }
  return await new Response(
    body.pipeThrough(new DecompressionStream('gzip')),
  ).text()
}
