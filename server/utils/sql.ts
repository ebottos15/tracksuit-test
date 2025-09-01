const cache = new Map<string, string>();
import { join } from "jsr:@std/path/join";

/**
 * Load the contents of an SQL file from disk, with simple in-memory caching.
 * If the SQL text has already been loaded for the given path, the cached
 * version is returned. Otherwise the file is read from disk, cached, and
 * then returned.
 *
 * @param pathFromProjectRoot - path to the SQL file from the project root
 * @returns
 */
export async function loadSql(pathFromProjectRoot: string): Promise<string> {
  let sql = cache.get(join(Deno.cwd(), pathFromProjectRoot));
  if (!sql) {
    sql = await Deno.readTextFile(pathFromProjectRoot);
    cache.set(pathFromProjectRoot, sql);
  }
  return sql;
}
