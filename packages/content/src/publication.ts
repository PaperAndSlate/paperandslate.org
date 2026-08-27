import type { NewsArticle, ProjectRelease } from "./models";

/**
 * Public availability is evaluated against one explicit UTC calendar date.
 * Release jobs should set PUBLICATION_AS_OF so a build can be reproduced; the
 * local default keeps development useful without making the application read
 * the clock in multiple places.
 */
export const PUBLICATION_CLOCK_DEFAULT = "2026-08-27";

function validDate(value: string | undefined): value is `${number}-${number}-${number}` {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function publicationClock(asOf = process.env.PUBLICATION_AS_OF): string {
  if (asOf === undefined) return PUBLICATION_CLOCK_DEFAULT;
  if (!validDate(asOf)) throw new Error(`Invalid PUBLICATION_AS_OF: ${asOf}`);
  return asOf;
}

export function isOnOrBeforePublicationClock(
  date: string | undefined,
  asOf = publicationClock(),
): boolean {
  return Boolean(date && validDate(date) && date <= asOf);
}

/** Published, corrected, and scheduled-past records are public; withdrawn, superseded, and archived records never are. */
export function isPublicNewsAt(item: NewsArticle, asOf = publicationClock()): boolean {
  return (
    (item.status === "published" || item.status === "corrected" || item.status === "scheduled") &&
    isOnOrBeforePublicationClock(item.date, asOf)
  );
}

export function publicNewsAt(items: NewsArticle[], asOf = publicationClock()): NewsArticle[] {
  return items.filter((item) => isPublicNewsAt(item, asOf));
}

export function isPublicReleaseAt(release: ProjectRelease, asOf = publicationClock()): boolean {
  return release.status === "available" && isOnOrBeforePublicationClock(release.releasedOn, asOf);
}

export function publicReleasesAt(
  releases: ProjectRelease[],
  asOf = publicationClock(),
): ProjectRelease[] {
  return releases.filter((release) => isPublicReleaseAt(release, asOf));
}
