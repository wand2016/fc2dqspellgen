// actually, uint16
export type CRC = number;
// actually, uint8
export type Byte = number;

interface CrcAlgorithm {
  next(crc: CRC, data: Byte): Promise<CRC>;
  prev(crc: CRC, data: Byte): Promise<CRC>;
}

export default CrcAlgorithm;
