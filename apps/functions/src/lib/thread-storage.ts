/**
 * Thread Storage Module
 * Handles persistence of chat threads and messages for the Ask Lawyer feature
 *
 * Data Structure:
 * users/{userId}/threads/{threadId}
 *   - title, createdAt, updatedAt, messageCount
 * users/{userId}/threads/{threadId}/messages/{messageId}
 *   - role, content, citations?, sourceCount?, createdAt
 */

import { getFirestore } from './firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export interface Thread {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

export interface ThreadMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  citations?: Array<{ documentId: string; chunkText: string }>
  sourceCount?: number
  createdAt: string
}

function threadsCol(userId: string) {
  return getFirestore().collection('users').doc(userId).collection('threads')
}

function messagesCol(userId: string, threadId: string) {
  return threadsCol(userId).doc(threadId).collection('messages')
}

/**
 * Create a new chat thread
 */
export async function createThread(userId: string, title?: string): Promise<Thread> {
  const ref = threadsCol(userId).doc()
  const now = new Date()

  await ref.set({
    title: title || 'New conversation',
    createdAt: now,
    updatedAt: now,
    messageCount: 0,
  })

  return {
    id: ref.id,
    title: title || 'New conversation',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    messageCount: 0,
  }
}

/**
 * List threads for a user, ordered by most recently updated
 */
export async function listThreads(userId: string, limit: number = 20): Promise<Thread[]> {
  const snapshot = await threadsCol(userId).orderBy('updatedAt', 'desc').limit(limit).get()

  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      title: data.title || 'Untitled',
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      messageCount: data.messageCount || 0,
    }
  })
}

/**
 * Get all messages in a thread, ordered chronologically
 */
export async function getThreadMessages(
  userId: string,
  threadId: string
): Promise<ThreadMessage[]> {
  const snapshot = await messagesCol(userId, threadId).orderBy('createdAt', 'asc').get()

  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      role: data.role,
      content: data.content,
      citations: data.citations,
      sourceCount: data.sourceCount,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
    }
  })
}

/**
 * Get a single thread's metadata
 */
export async function getThread(userId: string, threadId: string): Promise<Thread | null> {
  const doc = await threadsCol(userId).doc(threadId).get()
  if (!doc.exists) return null

  const data = doc.data()!
  return {
    id: doc.id,
    title: data.title || 'Untitled',
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
    messageCount: data.messageCount || 0,
  }
}

/**
 * Add a message to a thread
 * Auto-titles the thread from the first user message
 */
export async function addMessage(
  userId: string,
  threadId: string,
  message: {
    role: 'user' | 'ai'
    content: string
    citations?: Array<{ documentId: string; chunkText: string }>
    sourceCount?: number
  }
): Promise<{ id: string; createdAt: string }> {
  const now = new Date()
  const ref = messagesCol(userId, threadId).doc()

  await ref.set({
    role: message.role,
    content: message.content,
    citations: message.citations || null,
    sourceCount: message.sourceCount || null,
    createdAt: now,
  })

  // Update thread: bump updatedAt and increment messageCount
  const threadRef = threadsCol(userId).doc(threadId)
  const updateData: Record<string, unknown> = {
    updatedAt: now,
    messageCount: FieldValue.increment(1),
  }

  // Auto-title from first user message
  if (message.role === 'user') {
    const threadDoc = await threadRef.get()
    const currentTitle = threadDoc.data()?.title
    if (currentTitle === 'New conversation') {
      const autoTitle =
        message.content.length > 50 ? message.content.slice(0, 50) + '...' : message.content
      updateData.title = autoTitle
    }
  }

  await threadRef.update(updateData)

  return {
    id: ref.id,
    createdAt: now.toISOString(),
  }
}

/**
 * Rename a thread
 */
export async function renameThread(userId: string, threadId: string, title: string): Promise<void> {
  await threadsCol(userId).doc(threadId).update({
    title,
    updatedAt: new Date(),
  })
}

/**
 * Delete a thread and all its messages
 */
export async function deleteThread(userId: string, threadId: string): Promise<void> {
  const db = getFirestore()
  const messagesRef = messagesCol(userId, threadId)
  const messagesSnapshot = await messagesRef.get()

  // Delete messages in batches of 500
  const batchSize = 500
  const docs = messagesSnapshot.docs
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = db.batch()
    const slice = docs.slice(i, i + batchSize)
    for (const doc of slice) {
      batch.delete(doc.ref)
    }
    await batch.commit()
  }

  // Delete the thread document
  await threadsCol(userId).doc(threadId).delete()
}
