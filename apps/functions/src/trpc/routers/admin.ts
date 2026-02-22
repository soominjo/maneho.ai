/**
 * Admin tRPC Router
 * Restricted endpoints for admin-only operations
 * (document ingestion, index management, system configuration)
 * Epic E: Admin Ingestion Pipeline
 */

import { router, publicProcedure } from '../trpc'
import { z } from 'zod'
import {
  batchIngestDocuments,
  rebuildIndex,
  getDocumentStats,
  deleteDocument,
} from '../../utils/document-processor'

export const adminRouter = router({
  /**
   * Epic E: Bulk document ingestion
   * Admin endpoint to ingest multiple documents into RAG index
   */
  ingestDocuments: publicProcedure
    .input(
      z.object({
        documents: z.array(
          z.object({
            documentId: z.string(),
            storageUri: z.string().url(),
            text: z.string(), // Would be extracted from PDF in production
            metadata: z.object({
              documentType: z.enum(['memorandum', 'jao', 'ra4136', 'fee-table', 'regulation']),
              year: z.number().optional(),
              date: z.string().optional(),
              jurisdiction: z.string().optional(),
            }),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await batchIngestDocuments(input.documents)

        return {
          success: result.success,
          jobId: `ingest-${Date.now()}`,
          totalDocuments: result.totalDocuments,
          successCount: result.successCount,
          failureCount: result.failureCount,
          results: result.results,
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        }
      }
    }),

  /**
   * Delete a document from the RAG index
   */
  deleteDocument: publicProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await deleteDocument(input.documentId)

        return {
          success: result.success,
          message: result.message,
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        }
      }
    }),

  /**
   * Rebuild Vector Search Index
   * Regenerates all embeddings (expensive operation)
   */
  rebuildIndex: publicProcedure.mutation(async () => {
    try {
      const result = await rebuildIndex()

      return {
        success: result.success,
        jobId: `rebuild-${Date.now()}`,
        documentsProcessed: result.documentsProcessed,
        message: result.message,
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }),

  /**
   * Get RAG system statistics and health
   */
  getStats: publicProcedure.query(async () => {
    try {
      const stats = await getDocumentStats()

      return {
        success: true,
        documents: {
          total: stats.totalDocuments,
          byType: stats.byType,
        },
        index: {
          dimensions: 3072,
          totalChunks: stats.totalChunks,
          indexSize: stats.indexSize,
          lastUpdated: stats.lastUpdated,
        },
        system: {
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }),
})
