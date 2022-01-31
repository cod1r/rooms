function getStringLength(str: string | Array<string>): number {
  // @ts-ignore
  return [...str].length;
}

export { getStringLength };