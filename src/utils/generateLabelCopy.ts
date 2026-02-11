/**
 * Generates the Controlled Label Copy for a song.
 * Only includes publishers administered by Tribes.
 *
 * Format:
 * © {year} {Publisher1} ({PRO1}) / {Publisher2} ({PRO2}) (adm. at TribesRightsManagement.com). All rights reserved. Used by permission.
 */

interface LabelCopyPublisher {
  name: string;
  pro: string;
  tribes_administered: boolean;
}

interface LabelCopyInput {
  year: string | number | null;
  publishers: LabelCopyPublisher[];
}

export function generateLabelCopy(input: LabelCopyInput): string | null {
  const { year, publishers } = input;

  const tribesPublishers = publishers.filter(p => p.tribes_administered);
  if (tribesPublishers.length === 0) return null;

  const publisherString = tribesPublishers
    .map(p => `${p.name} (${p.pro})`)
    .join(" / ");

  const yearStr = year || "—";

  return `© ${yearStr} ${publisherString} (adm. at TribesRightsManagement.com). All rights reserved.`;
}

/**
 * Generate label copy from Queue JSONB data (current_data).
 */
export function generateLabelCopyFromQueueData(songData: any): string | null {
  const writers = songData?.writers || [];
  const year = songData?.publication_year;

  const allPublishers: LabelCopyPublisher[] = [];
  for (const writer of writers) {
    for (const pub of (writer.publishers || [])) {
      if (pub.tribes_administered) {
        if (!allPublishers.some(p => p.name === pub.name)) {
          allPublishers.push({
            name: pub.name,
            pro: pub.pro,
            tribes_administered: true,
          });
        }
      }
    }
  }

  return generateLabelCopy({ year, publishers: allPublishers });
}

/**
 * Generate label copy from canonical database records (songs + song_ownership + publishers).
 */
export function generateLabelCopyFromSongData(song: {
  metadata: any;
  ownership: Array<{
    tribes_administered: boolean;
    publisher: { name: string; pro: string } | null;
  }>;
}): string | null {
  const year = song.metadata?.publication_year;

  const publishers: LabelCopyPublisher[] = [];
  for (const o of (song.ownership || [])) {
    if (o.tribes_administered && o.publisher) {
      if (!publishers.some(p => p.name === o.publisher!.name)) {
        publishers.push({
          name: o.publisher.name,
          pro: o.publisher.pro,
          tribes_administered: true,
        });
      }
    }
  }

  return generateLabelCopy({ year, publishers });
}
