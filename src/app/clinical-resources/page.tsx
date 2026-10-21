import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { CtaBand, SubHero } from "@/components/shared/page-sections";
import { ResourceLibrary } from "@/components/shared/resource-library";

export const metadata: Metadata = {
  title: "Clinical Resources",
  description:
    "IFUs, spec sheets, whitepapers, video guides and published clinical studies on ICG fluorescence imaging.",
};

export default function ClinicalResourcesPage() {
  return (
    <main id="main">
      <SubHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Clinical Impact", href: "/clinical-applications" },
          { label: "Clinical Resources" },
        ]}
        tag="Resource library"
        title="Clinical Evidence, Research & Regulatory Documentation"
        summary="Find instructions for use, specification sheets, whitepapers, video guides and key published studies in one place. Filter by type or search by keyword to find what you need."
      />

      <section className="section section--tight" id="library" aria-labelledby="lib-title">
        <div className="wrap">
          <h2 className="sr-only" id="lib-title">
            Resource library
          </h2>
          <ResourceLibrary />
          <p className="evidence-note">
            <BookOpen className="i" aria-hidden="true" /> Clinical studies are independent, peer-reviewed publications on
            ICG fluorescence imaging, linked through PubMed. IFUs and spec sheets refer to the current product revision.
          </p>
        </div>
      </section>

      <CtaBand
        title="Can't find a document?"
        text="Our clinical and regulatory team can share additional technical files on request."
        primary={{ label: "Contact our team", href: "/contact#form" }}
        secondary={{ label: "View systems", href: "/products" }}
      />
    </main>
  );
}
