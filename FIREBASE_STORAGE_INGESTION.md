# Firebase Storage Document Ingestion

## Quick Start

```bash
pnpm run ingest
```

That's it! The script will:

1. Connect to Firebase Storage
2. Find all documents in `lto-documents/` folder
3. Read each document
4. Generate embeddings (Vertex AI)
5. Store in Firestore + Vector Search Index
6. Report success

---

## How It Works

### Upload Documents

1. Go to [Firebase Console - Storage](https://console.firebase.google.com/project/maneho-ai/storage)
2. Create folder: `lto-documents`
3. Upload your `.txt` files there

**Supported files:**

```
lto-documents/
├── traffic-violations.txt
├── vehicle-registration.txt
├── drivers-license.txt
├── vehicle-inspection.txt
└── accident-procedures.txt
```

### Document Configuration

Each filename maps to document metadata automatically:

| Filename                   | Type                     | Year | Location    |
| -------------------------- | ------------------------ | ---- | ----------- |
| `traffic-violations.txt`   | LTO_TRAFFIC_VIOLATION    | 2024 | Philippines |
| `vehicle-registration.txt` | LTO_VEHICLE_REGISTRATION | 2024 | Philippines |
| `drivers-license.txt`      | LTO_DRIVERS_LICENSE      | 2024 | Philippines |
| `vehicle-inspection.txt`   | LTO_VEHICLE_INSPECTION   | 2024 | Philippines |
| `accident-procedures.txt`  | LTO_ACCIDENT_PROCEDURES  | 2024 | Philippines |

---

## Usage

### Step 1: Upload Documents to Firebase Storage

```bash
# Via Firebase Console
1. Go to Storage tab
2. Create folder: lto-documents
3. Upload your .txt files
```

### Step 2: Run Ingestion

```bash
cd d:\RAG\maneho.ai\apps\functions
pnpm run ingest
```

**Expected output:**

```
📚 Starting Firebase Storage Document Ingestion...

🔍 Searching for documents in gs://maneho-ai.appspot.com/lto-documents/

📄 Found 5 files:

✅ traffic-violations.txt (5234 chars)
✅ vehicle-registration.txt (4123 chars)
✅ drivers-license.txt (6789 chars)
✅ vehicle-inspection.txt (3456 chars)
✅ accident-procedures.txt (2345 chars)

🔄 Ingesting 5 documents...

[Firestore] ✓ Stored document metadata: traffic-violations
[Firestore] ✓ Stored 12 chunks for document: traffic-violations
...

✅ Ingestion Complete!

Total Documents: 5
Successful: 5
Failed: 0
Success Rate: 100.0%

🎉 All documents ingested successfully!
```

### Step 3: Test the RAG System

```bash
node test-rag-simple.js
```

Now it will return answers based on your uploaded documents!

---

## Adding Custom Documents

To add new document types, edit `src/scripts/ingest-firebase-storage.ts`:

```typescript
const DOCUMENT_CONFIGS: Record<string, DocumentConfig> = {
  'my-custom-document.txt': {
    name: 'My Custom Document',
    type: 'MY_CUSTOM_TYPE',
    year: 2024,
    jurisdiction: 'Philippines',
  },
  // ... other documents
}
```

Then upload the file to Firebase Storage and run `pnpm run ingest`.

---

## What Gets Ingested

For each document, the system:

1. **Reads** the entire text from Firebase Storage
2. **Chunks** into 1000-character blocks with 200-character overlap
3. **Embeds** each chunk using Vertex AI (3072 dimensions)
4. **Stores** in Firestore with metadata
5. **Indexes** in Vector Search for fast semantic search

**Example:**

- Input: 10,000 character document
- Output: ~12-15 chunks → 12-15 embeddings → Searchable in Vector Search

---

## Troubleshooting

### "No documents found in Firebase Storage"

**Solution:**

1. Go to Firebase Console > Storage
2. Verify bucket is: `maneho-ai.appspot.com`
3. Create folder: `lto-documents/`
4. Upload `.txt` files
5. Run again: `pnpm run ingest`

### "Failed to download document"

**Solution:**

- Check file permissions in Firebase Storage
- Ensure service account has `Storage Object Viewer` role
- Verify file is in `lto-documents/` folder

### "Ingestion failed - PERMISSION_DENIED"

**Solution:**

- Verify `GOOGLE_APPLICATION_CREDENTIALS` is set (or use `gcloud auth application-default login`)
- Check IAM roles:
  - Cloud Datastore User (Firestore)
  - Storage Object Viewer (Firebase Storage)
  - Vertex AI User (Embeddings)

---

## Performance

| Size         | Chunks | Time        |
| ------------ | ------ | ----------- |
| 5,000 chars  | 5-7    | ~30 seconds |
| 10,000 chars | 10-15  | ~1 minute   |
| 50,000 chars | 50-70  | ~5 minutes  |

Rate limiting: 500ms delay between documents to avoid API throttling.

---

## Next Steps

1. ✅ Upload documents to Firebase Storage
2. ✅ Run `pnpm run ingest`
3. ✅ Test with `node test-rag-simple.js`
4. ✅ Verify answers include your content

Your RAG system is now powered by your actual LTO documents! 🎉
