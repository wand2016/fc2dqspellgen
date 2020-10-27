import CrcAlgorithmOnDemand from "@/impl/algorithm-on-demand";
import { Byte, CRC } from "@/interface/algorithm";
import each from "jest-each";

each([
  [0, 255, 7920],
  [7928, 255, 5391],
  [45045, 255, 45045],
  [24554, 255, 24554],
]).test("next", async (init: CRC, data: Byte, nextExpected: CRC) => {
  const next: CRC = await CrcAlgorithmOnDemand.next(init, data);
  expect(next).toBe(nextExpected);
});

each([
  [7920, 255, 0],
  [5391, 255, 7928],
  [45045, 255, 45045],
  [24554, 255, 24554],
]).test("prev", async (init: CRC, data: Byte, prevExpected: CRC) => {
  const prev: CRC = await CrcAlgorithmOnDemand.prev(init, data);
  expect(prev).toBe(prevExpected);
});
