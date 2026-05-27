import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nexol Media",
    short_name: "Nexol",
    description:
      "Polished videos and real growth for Tech, AI, and Design creators.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAFA",
    theme_color: "#D6F23A",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
