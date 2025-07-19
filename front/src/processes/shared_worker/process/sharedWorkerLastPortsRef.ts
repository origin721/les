type Port = {
  postMessage: (p: string) => unknown;
}

export const sharedWorkerLastPortsAll = new Set<Port>();

export const sharedWorkerLastPortsActive = new Set<Port>();