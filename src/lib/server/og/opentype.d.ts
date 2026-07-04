declare module "opentype.js" {
  export type Font = {
    getAdvanceWidth: (text: string, fontSize: number) => number;
    getPath: (
      text: string,
      x: number,
      y: number,
      fontSize: number,
    ) => {
      toPathData: (decimalPlaces?: number) => string;
    };
  };

  export function parse(buffer: Buffer): Font;

  const opentype: {
    parse: (buffer: Buffer) => Font;
  };

  export default opentype;
}