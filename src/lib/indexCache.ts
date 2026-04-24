import { openDB, type IDBPDatabase } from 'idb'
import type { Index } from './types'

/**
 * IndexedDB に使用するデータベース名、オブジェクトストア名、キー名などの定数定義。
 */
const DB_NAME = 'nimi-seme'
const STORE = 'index'
const KEY = 'current'

/** IndexedDB のスキーマバージョン */
const DB_VERSION = 1

/** キャッシュフォーマットやデータ構造のバージョン。 */
const CACHE_VERSION = 1

/** IndexedDB のキャッシュ。 */
let dbPromise: Promise<IDBPDatabase> | null = null

/** キャッシュに保存するエントリーの型定義。 */
type Entry = { version: number; index: Index }

/**
 * キャッシュから {@link Index} を取り出す。
 */
export const getCachedIndex = async (): Promise<Index | null> => {
  try {
    const db = await openDb()
    const entry = (await db.get(STORE, KEY)) as Entry | undefined
    return isValidCacheEntry(entry) ? entry.index : null
  } catch {
    // 読み取れなかった場合は null を返す。
    return null
  }
}

/**
 * {@link Index} をキャッシュに保存する。
 */
export const setCachedIndex = async (index: Index): Promise<void> => {
  try {
    const db = await openDb()
    await db.put(STORE, createCacheEntry(index), KEY)
  } catch {
    // 保存に失敗しても特に問題はないので、エラーは無視する。
  }
}

/** キャッシュエントリを作成する。 */
const createCacheEntry = (index: Index): Entry => ({
  version: CACHE_VERSION,
  index,
})

/** エントリが現行バージョンかを判定する型ガード。 */
const isValidCacheEntry = (entry: Entry | undefined): entry is Entry =>
  !!entry && entry.version === CACHE_VERSION

/**
 * データベースを開く。初回はオブジェクトストアを作成する。
 * 失敗時はハンドルをクリアして、次回呼び出しで再試行できるようにする。
 */
const openDb = (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(STORE)
      },
    }).catch((e) => {
      dbPromise = null
      throw e
    })
  }
  return dbPromise
}
