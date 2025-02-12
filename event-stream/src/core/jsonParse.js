// @ts-check

export function jsonParse(param) {
  try {
    return JSON.parse(param);
  }
  catch(err) {
    return null;
  }
}