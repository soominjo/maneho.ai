/**
 * Format document ID into a professional, readable title
 * Strips folder prefixes, chunk suffixes, and replaces underscores with spaces
 *
 * Examples:
 * - "07-local-ordinances_MMDA_Resolution_16-01_NCAP_Guidelines_chunk_2"
 *   → "MMDA Resolution 16-01 NCAP Guidelines"
 * - "05-fees-and-penalties_fines-schedule_chunk_0"
 *   → "fines-schedule"
 */
export function formatDocTitle(documentId: string): string {
  // Step 1: Remove folder prefix (everything before first underscore followed by uppercase letter or number)
  // Pattern: removes "XX-folder-name_" prefix
  let title = documentId.replace(/^\d+-[a-z-]+_/, '')

  // Step 2: Remove chunk suffix (e.g., "_chunk_0", "_chunk_123")
  title = title.replace(/_chunk_\d+$/, '')

  // Step 3: Replace underscores with spaces
  title = title.replace(/_/g, ' ')

  // Step 4: Convert to title case (capitalize first letter of each word)
  title = title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  return title
}
