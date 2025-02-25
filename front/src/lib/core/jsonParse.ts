
export function jsonParse(param: any) {
  try {
    return JSON.parse(param);
  }
  catch(err) {
    return null;
  }
}