import { renderJsonLd } from "@/lib/schema";

type Schema = Record<string, unknown>;

export function JsonLd({ schema }: { schema: Schema | Schema[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: renderJsonLd(schema) }}
    />
  );
}
