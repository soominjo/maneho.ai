/**
 * Legal Reference Parser
 * Extracts legal references from AI response text
 * Identifies: Republic Acts, Administrative Orders, Memoranda, Resolutions
 */

import { BookOpen, Scale, FileText, ClipboardList } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ReferenceType = 'RA' | 'AdminOrder' | 'Memo' | 'Resolution' | 'Circular' | 'Unknown'

export interface ParsedReference {
  type: ReferenceType
  title: string // e.g., "RA 4136 Section 56"
  fullMatch: string // Original matched text
  startIndex: number // Position in original text
  endIndex: number // End position in original text
  icon: LucideIcon // Corresponding Lucide icon
}

/**
 * Regex patterns for different legal reference types
 */
const legalPatterns = [
  {
    name: 'RA' as const,
    pattern: /\b(RA|Republic Act)\s+(\d+)(?:\s+(Section|Article|Chapter)\s+(\d+(?:[a-z])?)?)?/gi,
    formatter: (match: string) => {
      // Extract just the RA number and section if present
      const raMatch = match.match(/RA\s+(\d+)(?:\s+Section\s+(\d+))?/i)
      if (raMatch) {
        const raNum = raMatch[1]
        const section = raMatch[2]
        return section ? `RA ${raNum} Section ${section}` : `RA ${raNum}`
      }
      return match
    },
  },
  {
    name: 'AdminOrder' as const,
    pattern: /\b(?:Administrative\s+)?Order\s+No\.\s+(\d+-\d+|\d+)/gi,
    formatter: (match: string) => {
      const match2 = match.match(/No\.\s+(\d+-\d+|\d+)/i)
      return match2 ? `Admin Order No. ${match2[1]}` : match
    },
  },
  {
    name: 'Memo' as const,
    pattern: /\bLTO\s+(?:Memorandum|Memo)\s+(\d+-\d+)/gi,
    formatter: (match: string) => {
      const match2 = match.match(/(\d+-\d+)/i)
      return match2 ? `LTO Memorandum ${match2[1]}` : match
    },
  },
  {
    name: 'Circular' as const,
    pattern: /\bLTO\s+Circular\s+(\d+-\d+)/gi,
    formatter: (match: string) => {
      const match2 = match.match(/(\d+-\d+)/i)
      return match2 ? `LTO Circular ${match2[1]}` : match
    },
  },
  {
    name: 'Resolution' as const,
    pattern: /\b(?:MMDA|LTO|City|Municipal)\s+Resolution\s+(?:No\.\s+)?([A-Z0-9-]+)/gi,
    formatter: (match: string) => {
      const match2 = match.match(/Resolution\s+(?:No\.\s+)?([A-Z0-9-]+)/i)
      return match2 ? `Resolution No. ${match2[1]}` : match
    },
  },
]

/**
 * Map reference type to Lucide icon
 */
function getIconForType(type: ReferenceType): LucideIcon {
  const iconMap: Record<ReferenceType, LucideIcon> = {
    RA: Scale, // Legal/law
    AdminOrder: FileText, // Administrative documents
    Memo: ClipboardList, // Memo/notice
    Resolution: BookOpen, // Reference/documentation
    Circular: ClipboardList, // Circular notice
    Unknown: BookOpen, // Default to book
  }
  return iconMap[type] || BookOpen
}

/**
 * Parse legal references from text
 * @param text AI response text to parse
 * @returns Array of parsed legal references
 */
export function parseLegalReferences(text: string): ParsedReference[] {
  if (!text || text.length === 0) return []

  const references: ParsedReference[] = []
  const seen = new Set<string>() // Track duplicates

  for (const patternObj of legalPatterns) {
    const pattern = patternObj.pattern
    let match

    // Create a fresh regex with global flag for each search
    const globalPattern = new RegExp(pattern.source, 'gi')

    while ((match = globalPattern.exec(text)) !== null) {
      const fullMatch = match[0]
      const title = patternObj.formatter(fullMatch)

      // Skip if we've already added this exact reference
      if (seen.has(title)) continue
      seen.add(title)

      references.push({
        type: patternObj.name,
        title,
        fullMatch,
        startIndex: match.index,
        endIndex: match.index + fullMatch.length,
        icon: getIconForType(patternObj.name),
      })
    }
  }

  // Sort by position in text
  return references.sort((a, b) => a.startIndex - b.startIndex)
}

/**
 * Highlight legal references in text (for future use)
 * Returns text with reference positions marked
 */
export function highlightReferences(
  text: string,
  references: ParsedReference[]
): Array<{ text: string; isReference: boolean; reference?: ParsedReference }> {
  if (references.length === 0) {
    return [{ text, isReference: false }]
  }

  const segments: Array<{ text: string; isReference: boolean; reference?: ParsedReference }> = []
  let lastIndex = 0

  for (const ref of references) {
    if (ref.startIndex > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, ref.startIndex),
        isReference: false,
      })
    }

    segments.push({
      text: text.substring(ref.startIndex, ref.endIndex),
      isReference: true,
      reference: ref,
    })

    lastIndex = ref.endIndex
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      isReference: false,
    })
  }

  return segments
}

/**
 * Extract unique legal reference titles (for UI display)
 */
export function getUniqueTitles(references: ParsedReference[]): string[] {
  return Array.from(new Set(references.map(r => r.title)))
}
