import { generateRandomString } from "./generateRandomString";
import { getRandomInRange } from "./getRandomInRange";

export function gen_pass() {
  return generateRandomString(getRandomInRange(100, 130));
}