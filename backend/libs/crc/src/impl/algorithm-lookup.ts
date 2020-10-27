import CrcAlgorithm, { Byte, CRC } from "@/interface/algorithm";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const CrcAlgorithmLookup: CrcAlgorithm = {
  async next(crc: CRC, data: Byte): Promise<CRC> {
    const db = await database();
    const got = await db.get<{
      next: number;
    }>("SELECT next FROM lookup WHERE crc = ? AND data = ?", [crc, data]);
    return got?.next ?? -1;
  },
  async prev(crc: CRC, data: Byte): Promise<CRC> {
    const db = await database();
    const got = await db.get<{
      crc: number;
    }>("SELECT crc FROM lookup WHERE next = ? AND data = ?", [
      //
      crc,
      data,
    ]);
    return got?.crc ?? -1;
  },
};

const database = (() => {
  return async () => {
    return await open({
      filename: "lookup-table.db",
      driver: sqlite3.cached.Database,
    });
  };
})();

export default CrcAlgorithmLookup;
