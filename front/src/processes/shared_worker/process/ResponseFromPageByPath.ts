import type { PATHS } from "../../../local_back";
import type { Port } from "./sharedWorkerLastPortsRef";

export type UtilByTypeResponseFromPageItem = CreateResponseFromPageByPathValue & {
 //lastMessage: string;
 //idRequest: string;
  portSuccessResponse: Set<Port>;
};

type ResponseFromPageByPath = Record<
  keyof typeof PATHS,
  UtilByTypeResponseFromPageItem
>;

export const responseFromPageByPath: ResponseFromPageByPath = { }

type CreateResponseFromPageByPathValue = {
  lastMessage: string;
  idRequest: string;
};

export function createResponseFromPageByPath(
  path: keyof typeof PATHS,
  value: CreateResponseFromPageByPathValue
) {
  responseFromPageByPath[path] = {
    ...value,
    portSuccessResponse: new Set()
  }
}