import { ImageResponse } from "next/og";

import { getPost, formatPostDateLong } from "@/lib/blog";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const alt = "Nexol Media essay";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  const category = post?.category ?? "Essay";
  const title = post?.title ?? "Notes from Nexol";
  const authorName = post?.author.name ?? "Nexol Media";
  const date = post ? formatPostDateLong(post.publishedAt) : "";
  const read = post ? `${post.readTimeMinutes} min read` : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FAFAFA",
          padding: 80,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            color: "#52525B",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#D6F23A",
            }}
          />
          Nexol Media · {category}
        </div>

        <div
          style={{
            marginTop: 64,
            fontSize: title.length > 60 ? 72 : 88,
            fontWeight: 700,
            color: "#0A0A0B",
            letterSpacing: "-0.02em",
            lineHeight: 1.04,
            maxWidth: 1040,
            display: "flex",
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #E8E8EA",
            paddingTop: 28,
            fontSize: 22,
            color: "#52525B",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          <div>
            <span style={{ color: "#0A0A0B" }}>{authorName}</span>
            {date ? ` · ${date}` : ""}
            {read ? ` · ${read}` : ""}
          </div>
          <div>nexolmedia.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
