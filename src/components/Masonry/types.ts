export interface MasonryItem {
  css: string;
  height: number;
}

export interface GridItem extends MasonryItem {
  x: number;
  y: number;
  width: number;
  height: number;
}