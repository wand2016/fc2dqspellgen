import CrcAlgorithm, { Byte, CRC } from "@/interface/algorithm";

const DIV = 0x11021;

const CrcAlgorithmOnDemand: CrcAlgorithm = {
  async next(crc: CRC, data: Byte): Promise<CRC> {
    crc ^= data << 8;
    for (let i = 0; i < 8; ++i) {
      crc <<= 1;
      if (crc & 0x10000) {
        crc ^= DIV;
      }
    }
    return crc;
  },
  // naive実装
  async prev(crc: CRC, data: Byte): Promise<CRC> {
    for (let ret = 0; ret < 65536; ++ret) {
      if ((await this.next(ret, data)) === crc) {
        return ret;
      }
    }
    throw new Error("boo");
  },
};

export default CrcAlgorithmOnDemand;
