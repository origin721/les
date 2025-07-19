type Port = {
  postMessage: (p: string) => unknown;
}

export const sharedWorkerLastPortsRef = {
  current: null as null | Port[]
}