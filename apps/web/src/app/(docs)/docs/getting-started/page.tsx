import { DocsTaxonomyPage } from "../../../../components/docs-taxonomy-page";
import { docs } from "../../../../lib/docs";
export default function GettingStarted() {
  return <DocsTaxonomyPage documents={docs} taxonomy="getting-started" title="Getting started" />;
}
