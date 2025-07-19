import { create_counter_generator } from "../../core/create_counter_generator";
import { generateRandomString } from "../../core/random/generateRandomString";
import { getRandomInRange } from "../../core/random/getRandomInRange";

const _workerGeneratorIds = create_counter_generator();

export const workerGeneratorIds = () => {
  return `${Date.now()}_${_workerGeneratorIds()}_${getRandomString()}`;

  function getRandomString() {
    return generateRandomString(getRandomInRange(8, 14))
  }
}