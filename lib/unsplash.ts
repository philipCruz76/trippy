import { ImageResult } from "@/types/unsplash.types";
import { createApi } from "unsplash-js";

const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY!,
  fetch,
});

function formatImageResult(data: any): ImageResult {
  const { total, results } = data;
  const result = {
    images: [],
    total,
    page: 1,
    per_page: 10,
  };

  result.images = results.map((item: any) => {
    const { id, description, urls, user } = item;
    const cur = {
      id,
      url: urls["small"],
      description: description,
      creator: {
        username: user.username,
        link: user["links"]["html"],
      },
    };
    return cur;
  });

  return result;
}

export async function getUnsplashImage(prompt: string) {
  return new Promise<ImageResult>((resolve, reject) => {
    unsplash.search
      .getPhotos({
        query: prompt,
        page: 1,
        perPage: 10,
        orientation: "portrait",
        orderBy: "relevant",
        plus:"none",
      })
      .then((result) => {
        switch (result.type) {
          case "error":
            console.log("error occurred: ", result.errors[0]);
            reject(result.errors[0]);
          case "success":
            const photo = result.response;
            resolve(formatImageResult(photo));
        }
      });
  });
}
