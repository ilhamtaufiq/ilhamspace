export const formatStatCount = (value: number): string =>
  new Intl.NumberFormat("en-US").format(value);