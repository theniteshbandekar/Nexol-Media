import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { presentationTool } from "sanity/presentation";

import { schemaTypes } from "./src/sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

const SINGLETONS = ["homePage", "siteSettings"] as const;
type SingletonId = (typeof SINGLETONS)[number];

export default defineConfig({
  name: "nexol-studio",
  title: "Nexol Media · Control Room",
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // Hide singleton types from the global "Create new" menu — they're
    // surfaced as fixed entries in the structure tree below.
    templates: (templates) =>
      templates.filter(
        (t) => !SINGLETONS.includes(t.id as SingletonId)
      ),
  },
  document: {
    // Prevent duplicate / delete on singletons.
    actions: (input, context) => {
      if (SINGLETONS.includes(context.schemaType as SingletonId)) {
        return input.filter(
          ({ action }) => action !== "duplicate" && action !== "delete"
        );
      }
      return input;
    },
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Nexol")
          .items([
            S.listItem()
              .title("Home page")
              .id("homePage")
              .child(
                S.editor()
                  .id("homePage")
                  .schemaType("homePage")
                  .documentId("homePage")
              ),
            S.listItem()
              .title("Site settings")
              .id("siteSettings")
              .child(
                S.editor()
                  .id("siteSettings")
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),
            S.divider(),
            S.documentTypeListItem("caseStudy").title("Case studies"),
            S.documentTypeListItem("blogPost").title("Blog posts"),
            S.documentTypeListItem("blogAuthor").title("Authors"),
            S.documentTypeListItem("service").title("Services"),
            S.divider(),
            S.documentTypeListItem("legalPage").title("Legal pages"),
            S.documentTypeListItem("contactSubmission").title("Contact submissions"),
            S.documentTypeListItem("bookingRequest").title("Bookings"),
          ]),
    }),
    presentationTool({
      previewUrl: {
        // The previewUrl that the Presentation tool opens. Editors click
        // "Presentation" in the Studio sidebar and see the live site with
        // click-to-edit overlays on every section.
        origin:
          typeof window !== "undefined" && window.location.origin
            ? window.location.origin
            : "http://localhost:3000",
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
    }),
    visionTool(),
  ],
});
