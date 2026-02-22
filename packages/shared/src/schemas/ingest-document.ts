import { z } from 'zod'

export const IngestDocumentSchema = z.object({
  storageUri: z.string().url('Invalid Cloud Storage URI'),
  documentType: z.enum(['memorandum', 'jao', 'ra4136', 'fee-table', 'regulation']),
  tags: z
    .object({
      year: z.number().int().min(1990).optional(),
      date: z.string().datetime().optional(),
      jurisdiction: z.string().optional(),
    })
    .optional(),
})

export type IngestDocument = z.infer<typeof IngestDocumentSchema>
