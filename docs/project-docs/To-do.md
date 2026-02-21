# Maneho.ai Development To-Do List

## Phase 1: Environment & Project Setup (Including GCP 101 IAM)

_Goal: Initialize the monorepo, connect Firebase, configure underlying Google-managed builder accounts, and set up WIF for secure CI/CD._

- [ ] **1.1 Initialize the Repository**
- [ ] Clone the Hytel boilerplate repository.
- [ ] Run `pnpm install` in the root directory to install all dependencies.
- [ ] Verify the workspace by running `pnpm dev` and `pnpm precheck`.

- [ ] **1.2 Create & Configure Firebase Project**
- [ ] Go to the Firebase Console and create a new project (`maneho-ai`).
- [ ] **Upgrade to the Blaze Plan** (required for outbound Vertex AI API requests).
- [ ] Register a Web App in Firebase to generate your frontend config keys.
- [ ] Run `firebase login` (or `firebase login --reauth`) and `firebase use --add maneho-ai` to link your local CLI.

- [ ] **1.3 Configure Google-Managed Service Accounts (Google Cloud 101 Setup)**
- [ ] In the Google Cloud Console, navigate to **IAM & Admin > IAM**. (Make sure you check the box to "Include Google-provided role grants").

- [ ] **For the Cloud Build Service Account** (`[PROJECT_NUMBER]@cloudbuild.gserviceaccount.com`):

- [ ] Grant `roles/run.admin` (to create/manage Cloud Run services).

- [ ] Grant `roles/artifactregistry.repoAdmin` (to read/write container images).

- [ ] Grant `roles/logging.logWriter` (to write build logs).

- [ ] Grant `roles/iam.serviceAccountUser` on the specific _Runtime_ Service Account your function will run as (e.g., App Engine default SA or custom backend SA).

- [ ] **For the Compute Engine Default Service Account** (`[PROJECT_NUMBER]-compute@developer.gserviceaccount.com`):

- [ ] Grant `roles/storage.objectViewer` (to read source code from Cloud Storage).

- [ ] Grant `roles/logging.logWriter`.

- [ ] Grant `roles/run.admin`.

- [ ] Grant `roles/artifactregistry.repoAdmin`.

- [ ] _(Fallback Fix)_ If APIs fail silently, manually grant `roles/cloudfunctions.serviceAgent` to `service-[PROJECT_NUMBER]@gcf-admin-robot.iam.gserviceaccount.com` and `roles/cloudbuild.serviceAgent` to `service-[PROJECT_NUMBER]@gcp-sa-cloudbuild.iam.gserviceaccount.com`.

- [ ] **1.4 Configure Workload Identity Federation (WIF)**
- [ ] Open `scripts/setup-wif.sh` and update `PROJECT_ID`, `GITHUB_ORG`, and `GITHUB_REPO` with your actual values.
- [ ] Run `bash scripts/setup-wif.sh` via Google Cloud Shell.
- [ ] Copy the outputted `WORKLOAD_IDENTITY_PROVIDER` and `SERVICE_ACCOUNT_EMAIL`.
- [ ] Go to your GitHub Repo Settings > Secrets and Variables > Actions, and add: `GCP_PROJECT_ID`, `GCP_SA_EMAIL`, and `GCP_WORKLOAD_IDENTITY_PROVIDER`.

- [ ] **1.5 Configure Local Environments**
- [ ] Copy `.env.example` to `.env` at the root and inside `apps/web`.
- [ ] Populate the `VITE_FIREBASE_*` variables with your Firebase Web App config.

## Phase 2: Database & Storage Configuration

_Goal: Set up the canonical document storage in Firestore and the raw PDF repository in Cloud Storage._

- [ ] **2.1 Initialize Firestore**
- [ ] Enable Firestore Database in the Firebase Console (Start in Production Mode).
- [ ] Define basic Firestore security rules allowing read access to users and write access only to the Admin service account.

- [ ] **2.2 Initialize Firebase Storage**
- [ ] Enable Firebase Storage in the console.
- [ ] Create a folder named `lto-memorandums/`.
- [ ] Upload your existing downloaded LTO PDF files into this folder.

- [ ] **2.3 Define Shared Zod Schemas (`packages/shared`)**
- [ ] Navigate to `packages/shared/src/schemas/`.
- [ ] Create `chat.ts`: Define `AskLawyerSchema` (user query string) and `TicketDecoderSchema` (image URL).
- [ ] Create `admin.ts`: Define `IngestDocumentSchema` (Storage URI, metadata tags).
- [ ] Run `pnpm build` in `packages/shared` to export the types.

## Phase 3: Vertex AI Vector Search Setup

_Goal: Provision the infrastructure for RAG embeddings and nearest-neighbor search._

- [ ] **3.1 Enable Google Cloud APIs**
- [ ] In GCP console, enable the **Vertex AI API** (`aiplatform.googleapis.com`).

- [ ] **3.2 Create the Vector Search Index**
- [ ] Go to Vertex AI > Vector Search in the GCP Console.
- [ ] Create a new index. **Crucial:** Set dimensions to `3072` to match the `gemini-embedding-001` model.
- [ ] Note down the `Index ID` (format: `projects/.../locations/.../indexes/...`).

- [ ] **3.3 Deploy the Index to an Endpoint**
- [ ] Create a **Public Endpoint** for the index (to keep costs low and architecture simple).
- [ ] Deploy your created index to this endpoint.
- [ ] Note down the `Endpoint ID` and the `deployedIndexId`.

- [ ] **3.4 Add Vertex AI Variables to Backend**
- [ ] In `apps/functions/`, configure environment variables for `VECTOR_INDEX_RESOURCE_NAME`, `VECTOR_ENDPOINT_RESOURCE_NAME`, and `VECTOR_DEPLOYED_INDEX_ID`.

## Phase 4: Backend Orchestration (`apps/functions`)

_Goal: Build the tRPC API, document ingestion pipeline, and Gemini chat logic._

- [ ] **4.1 Install AI & Auth Dependencies**
- [ ] In `apps/functions`, run: `pnpm add @google/genai google-auth-library firebase-admin pdf-parse` (pdf-parse to extract text from your uploaded PDFs).

- [ ] **4.2 Build Core Vertex/Gemini Utilities**
- [ ] Create `src/lib/env.ts` to safely export environment variables.
- [ ] Create `src/lib/auth.ts` using `GoogleAuth` to generate bearer tokens for Vector Search REST calls.
- [ ] Create `src/lib/embeddings.ts` using `@google/genai` to call `gemini-embedding-001`.
- [ ] Create `src/lib/vectorSearch.ts` with `upsertDatapoints` and `findNeighbors` REST fetch functions.

- [ ] **4.3 Build the Ingestion Pipeline (Admin Router)**
- [ ] Create `src/trpc/routers/admin.ts`.
- [ ] Write an `ingestDocument` mutation:
- Downloads PDF from Firebase Storage.
- Extracts text and chunks it (e.g., `chunkText(raw, 1200)`).
- Calls `embedTexts` to get 3072-dimensional vectors.
- Saves the text chunks to Firestore (`docs/{docId}/chunks/{chunkId}`).
- Calls `upsertDatapoints` to push the vectors and Firestore IDs to Vector Search.

- [ ] **4.4 Build "The Lawyer" Chat API (Chat Router)**
- [ ] Create `src/trpc/routers/chat.ts`.
- [ ] Write the `askLawyer` mutation:
- Embeds the user's question via `gemini-embedding-001`.
- Queries `findNeighbors` for the top 6 vectors.
- Fetches the actual text chunks from Firestore using the retrieved IDs.
- Prompts `gemini-2.5-flash` with the context block, system prompt ("You are a Philippine traffic law assistant..."), and user query.
- Returns the generated answer and citations.

- [ ] **4.5 Build "The Ticket Decoder" API**
- [ ] In `chat.ts`, write a `decodeTicket` mutation that accepts an image URL.
- [ ] Pass the image to `gemini-2.5-flash` using multimodal capabilities to extract the handwritten violation code.
- [ ] Automatically pass the extracted violation text to the `askLawyer` RAG pipeline to get the fine amount.

## Phase 5: Frontend Development (`apps/web`)

_Goal: Build the user interface using React, Tailwind, Shadcn UI, and tRPC._

- [ ] **5.1 Setup Firebase Client SDK**
- [ ] Ensure `apps/web/src/lib/firebase.ts` exports `db` (Firestore), `auth` (Firebase Auth), and `storage` (Firebase Storage).

- [ ] **5.2 Build UI Components (`packages/ui`)**
- [ ] If not existing, add required Shadcn components to `packages/ui` (e.g., Input, Textarea, ScrollArea, Avatar).

- [ ] **5.3 Build the Chat Interface**
- [ ] In `apps/web/src/`, create a `ChatDashboard` component.
- [ ] Use `trpc.chat.askLawyer.useMutation()` to send messages to the backend.
- [ ] Map the returned response to a Chat Bubble UI, ensuring citations (Source URLs/Docs) are displayed clearly as clickable tags or footnotes.

- [ ] **5.4 Build the Ticket Upload Interface**
- [ ] Create a component that allows a user to upload an image of their ticket or take a photo via mobile.
- [ ] Upload the file directly to Firebase Storage using the Client SDK.
- [ ] Get the download URL, then pass it to `trpc.chat.decodeTicket.useMutation()`.
- [ ] Display the extracted violation and fine cost to the user.

- [ ] **5.5 Implement Daily Quota System (Optional/Sustainability)**
- [ ] Hook up Firebase Auth so users can log in.
- [ ] In the frontend and backend, check a `users/{userId}` Firestore document to ensure they haven't exceeded 20 queries a day.

## Phase 6: CI/CD & Deployment

_Goal: Safely push code to Dev, Stage, and Production environments._

- [ ] **6.1 Validate the Build Locally**
- [ ] Run `pnpm format` to clean code.
- [ ] Run `pnpm precheck` to ensure ESLint, TypeScript compilation, and Vitest tests all pass.

- [ ] **6.2 Deploy to Development**
- [ ] Commit your code and push to the `dev` branch.
- [ ] Navigate to the Actions tab in GitHub to watch `deploy-dev.yml` authenticate via WIF and push to Firebase Hosting and Functions.
- [ ] Test the live `dev` URL.

- [ ] **6.3 Promote to Staging & Production**
- [ ] Create a Pull Request from `dev` to `stage`. Merge to trigger `deploy-stage.yml`.
- [ ] QA the RAG accuracy in the Staging environment.
- [ ] Open the GitHub Actions tab, manually select the **Deploy to Main (Production)** workflow, type `production`, and execute to launch Maneho.ai to the public.
