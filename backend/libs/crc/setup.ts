import sqlite3 from "sqlite3";
import { open } from "sqlite";
import CrcAlgorithmOnDemand from "./src/impl/algorithm-on-demand";

type Chunk = number[];

(async () => {
  const database = await open({
    filename: "lookup-table.db",
    driver: sqlite3.cached.Database,
  });

  await database.run("CREATE TABLE lookup (crc INT, data INT, next INT)");

  const CHUNK_LENGTH = 256;
  const chunks = makeLookupTableOnMemoryChunking(CHUNK_LENGTH);

  await database.run("BEGIN");

  try {
    const placeholder = [...Array(CHUNK_LENGTH).keys()]
      .map((_) => "(?,?,?)")
      .join(",");
    const stmt = await database.prepare(
      `INSERT INTO lookup VALUES${placeholder}`
    );

    console.log("inserting...");
    for await (const chunk of chunks) {
      await stmt.run(chunk);
    }
    console.log("insert done");
    await stmt.finalize();
    await database.run("COMMIT");
  } catch (e) {
    console.log(e);
    await database.run("ROLLBACK");
  }

  console.log("indexing...");
  await database.run("CREATE INDEX next_index on lookup(crc, data);");
  await database.run("CREATE INDEX prev_index on lookup(next, data);");
  console.log("indexing done");

  console.log(await database.get("SELECT count(*) FROM lookup"));
})();

async function* makeLookupTableOnMemoryChunking(chunkLength: number) {
  const lookupTable = makeLookupTableOnMemory();
  const chunkNumber = (65536 * 256) / chunkLength;
  for (let chunkIndex = 0; chunkIndex < chunkNumber; ++chunkIndex) {
    let chunk: Chunk = [];
    for await (const tuple of take(lookupTable, chunkLength)) {
      chunk = chunk.concat(tuple);
    }
    yield chunk;
  }
}

async function* take<T>(
  asyncGenerator: AsyncGenerator<T>,
  chunkLength: number
): AsyncGenerator<T> {
  for (let i = 0; i < chunkLength; ++i) {
    const value = await asyncGenerator.next();
    if (value.done) {
      break;
    }
    yield value.value;
  }
}

async function* makeLookupTableOnMemory() {
  for (let data = 0; data < 256; ++data) {
    for (let crc = 0; crc < 65536; ++crc) {
      yield [crc, data, await CrcAlgorithmOnDemand.next(crc, data)];
    }
  }
}
