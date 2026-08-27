import { DocsTaxonomyPage } from "../../../../components/docs-taxonomy-page";
import { docs } from "../../../../lib/docs";
export default function Concepts() {
  return <DocsTaxonomyPage documents={docs} taxonomy="concepts" title="Concepts" />;
}
