export function toJson(param: string) {
  try {
    const json = JSON.parse(param);
    if(json instanceof Object) return json;
  }
  catch(err) {
  }
  return null;
};