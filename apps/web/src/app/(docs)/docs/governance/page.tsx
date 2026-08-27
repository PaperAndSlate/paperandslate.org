import { DocsTaxonomyPage } from "../../../../components/docs-taxonomy-page";
import { docs } from "../../../../lib/docs";
export default function Governance() {
  return <DocsTaxonomyPage documents={docs} taxonomy="governance" title="Governance" />;
}
