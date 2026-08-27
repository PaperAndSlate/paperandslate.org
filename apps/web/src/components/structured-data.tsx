export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Paper & Slate",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    description: "Paper & Slate is an open education initiative of Glasscow LLC.",
    parentOrganization: { "@type": "Organization", name: "Glasscow LLC" },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
