import { DocsTaxonomyPage } from "../../../../components/docs-taxonomy-page";
import { docs } from "../../../../lib/docs";
export default function Reference() {
  return <DocsTaxonomyPage documents={docs} taxonomy="reference" title="Reference" />;
}
