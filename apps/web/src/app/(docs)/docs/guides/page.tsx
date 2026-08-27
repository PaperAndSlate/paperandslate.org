import { DocsTaxonomyPage } from "../../../../components/docs-taxonomy-page";
import { docs } from "../../../../lib/docs";
export default function Guides() {
  return <DocsTaxonomyPage documents={docs} taxonomy="guides" title="Guides" />;
}
