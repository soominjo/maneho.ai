/**
 * Derives the Firebase Storage path for a PDF document from its documentId.
 *
 * documentId format: {folder}_{filename_without_ext}_chunk_{n}
 * Example: "07-local-ordinances_MMDA_Resolution_16-01_NCAP_Guidelines_chunk_2"
 *          → "lto-documents/07-local-ordinances/MMDA_Resolution_16-01_NCAP_Guidelines.pdf"
 */
export function getDocStoragePath(documentId: string): string {
  const folderMatch = documentId.match(/^(\d+-[a-z-]+)_/)
  const folder = folderMatch ? folderMatch[1] : ''

  const filename = documentId.replace(/^\d+-[a-z-]+_/, '').replace(/_chunk_\d+$/, '')

  return folder ? `lto-documents/${folder}/${filename}.pdf` : `lto-documents/${filename}.pdf`
}
