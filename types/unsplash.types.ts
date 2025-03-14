export type UnsplashImage = {
  id: string;
  url: string;
  description: string;
  aspect?: number;
  creator?: {
    username: string;
    link: string;
  };
};

export type ImageResult = {
  images: UnsplashImage[];
  total: number;
  page?: number;
  per_page?: number;
};
