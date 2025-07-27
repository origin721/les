import { generateRandomString } from "../../../core/random/generateRandomString";
import { getRandomInRange } from "../../../core/random/getRandomInRange";

export const db_id_generator = () => {
  return `${Date.now()}_${getRandomString()}`;

  function getRandomString() {
    return generateRandomString(getRandomInRange(68, 214))
  }
}