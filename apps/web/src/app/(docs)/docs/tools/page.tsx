import { DocsTaxonomyPage } from "../../../../components/docs-taxonomy-page";
import { docs } from "../../../../lib/docs";
export default function Tools() {
  return <DocsTaxonomyPage documents={docs} taxonomy="tools" title="Tools" />;
}
