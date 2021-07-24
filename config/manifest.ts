type Font = string | { name: string, weights: number[] };

export type PageManifest = {
  title: string;
  description?: string,
  head?: {
    googleFonts?: Font[];
  };
};
