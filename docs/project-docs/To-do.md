# Comprehensive Maneho.ai Development To-Do List

## Phase 1: Environment & Project Setup (Including GCP 101 IAM)

*Goal: Initialize the monorepo, connect Firebase, configure underlying Google-managed builder accounts, and set up WIF for secure CI/CD.*

* [ ] **1.1 Initialize the Repository**
* [ ] Clone the Hytel boilerplate repository.
* [ ] Run `pnpm install` in the root directory.
* [ ] Verify the workspace by running `pnpm dev` and `pnpm precheck`.


* [ ] **1.2 Create & Configure Firebase Project**
* [ ] Go to the Firebase Console and create a new project (`maneho-ai`).
* [ ] **Upgrade to the Blaze Plan** (required for outbound Vertex AI API requests).


* [ ] Register a Web App in Firebase to generate your frontend config keys.
* [ ] Run `firebase login` and `firebase use --add maneho-ai` to link your local CLI.


* [ ] **1.3 Configure Google-Managed Service Accounts (Google Cloud 101 Setup)**
* [ ] In the Google Cloud Console, navigate to **IAM & Admin > IAM**.
* [ ] **For the Cloud Build Service Account** (`[PROJECT_NUMBER]@cloudbuild.gserviceaccount.com`):
* [ ] Grant `roles/run.admin`, `roles/artifactregistry.repoAdmin`, and `roles/logging.logWriter`.
* [ ] Grant `roles/iam.serviceAccountUser` on the specific *Runtime* Service Account your function will run as.


* [ ] **For the Compute Engine Default Service Account** (`[PROJECT_NUMBER]-compute@developer.gserviceaccount.com`):
* [ ] Grant `roles/storage.objectViewer`, `roles/logging.logWriter`, `roles/run.admin`, and `roles/artifactregistry.repoAdmin`.




* [ ] **1.4 Configure Workload Identity Federation (WIF)**
* [ ] Open `scripts/setup-wif.sh` and update variables.
* [ ] Run `bash scripts/setup-wif.sh` via Google Cloud Shell.
* [ ] Go to your GitHub Repo Settings > Secrets and Variables > Actions, and add: `GCP_PROJECT_ID`, `GCP_SA_EMAIL`, and `GCP_WORKLOAD_IDENTITY_PROVIDER`.


* [ ] **1.5 Configure Local Environments**
* [ ] Copy `.env.example` to `.env`.
* [ ] Populate the `VITE_FIREBASE_*` variables with your Firebase Web App config.



## Phase 2: Database & Storage Configuration

*Goal: Set up the canonical document storage in Firestore and the raw PDF repository in Cloud Storage.*

* [ ] **2.1 Initialize Firestore**
* [ ] Enable Firestore Database in the Firebase Console.
* [ ] Create basic security rules (Users = Read, Admins = Write).


* [ ] **2.2 Initialize Firebase Storage**
* [ ] Enable Firebase Storage.
* [ ] Create a folder named `lto-documents/` for raw PDFs (LTO memorandums, JAO, RA 4136).


* [ ] **2.3 Define Shared Zod Schemas (`packages/shared`)**
* [ ] Define schemas for all features bridging frontend and backend:


* `AskLawyerSchema` (string query).
* `TicketDecoderSchema` (image URL).
* `CostEstimatorSchema` (vehicle details, registration delay).
* `ExamQuizSchema` (quiz category).
* 
`IngestDocumentSchema` (Storage URI, metadata tags like year/date).







## Phase 3: Vertex AI Vector Search Setup

*Goal: Provision the infrastructure for RAG embeddings and nearest-neighbor search.*

* [ ] **3.1 Enable Google Cloud APIs**
* [ ] Enable the **Vertex AI API** (`aiplatform.googleapis.com`) in the GCP console.


* [ ] **3.2 Create the Vector Search Index**
* [ ] Go to Vertex AI > Vector Search.
* [ ] Create a new index with dimensions set to `3072` (matching `gemini-embedding-001`).




* [ ] **3.3 Deploy the Index to an Endpoint**
* [ ] Create a **single Public Endpoint** to strictly control the "always-on" VM costs.


* [ ] Deploy the index to the endpoint and note the `Index ID`, `Endpoint ID`, and `deployedIndexId`.


* [ ] **3.4 Add Vertex AI Variables to Backend**
* [ ] Add the IDs to your `apps/functions/.env` file.



## Phase 4: Backend Orchestration (`apps/functions`)

*Goal: Build the tRPC API endpoints for all Epics and Killer Features.*

* [ ] **4.1 Build Core AI/RAG Utilities**
* [ ] Install dependencies (`@google/genai`, `firebase-admin`, etc.).
* [ ] Create utility to call `gemini-embedding-001`.


* [ ] Create utility for Vector Search REST API (`upsertDatapoints`, `findNeighbors`).


* [ ] **4.2 Build Epic E: Admin Ingestion Pipeline**
* [ ] Create `trpc/routers/admin.ts`.
* [ ] Write `ingestDocument`: Pulls from Cloud Storage -> chunks text -> embeds -> saves to Firestore with Date Tags -> upserts to Vector Search.




* [ ] **4.3 Build Epic B & Epic D: The "Lawyer" & "Crisis Manager"**
* [ ] Create `trpc/routers/rag.ts`.
* [ ] Write `askLawyer`: Standard RAG pipeline returning answers + specific citations mapped back to Firestore.


* [ ] Write `analyzeInsurance`: Accepts pasted insurance text, chunks/embeds it temporarily, and analyzes coverage (e.g., Acts of Nature).




* [ ] **4.4 Build the Killer Features APIs**
* [ ] **Killer Feature 1: Ticket Decoder**: Write an endpoint that takes a Firebase Storage image URL, uses Gemini Vision to OCR the handwritten TOP ticket, and runs a Vector Search to retrieve the fine amount.


* [ ] **Killer Feature 2: Argument Script Generator**: Write an endpoint that takes a user's situational description and generates a polite, RAG-grounded script to read to enforcers (e.g., citing AO AHS-2008-015).


* [ ] **Killer Feature 3: Registration Cost Estimator**: Write a hybrid endpoint that retrieves LTO fee tables via RAG and uses a backend Calculator script to estimate total renewal costs (Basic + Penalty + Emission + TPL).




* [ ] **4.5 Build Epic A & C: Education and Wizards**
* [ ] Write `getLicenseChecklist`: Generates personalized student/renewal requirements based on user parameters.


* [ ] Write `generateQuiz`: Pulls from LTO question bank in Firestore.


* [ ] Write `explainAnswer`: Uses Gemini to explain the logic behind a traffic rule (deducts 1 credit).





## Phase 5: Frontend Development (`apps/web`)

*Goal: Build the user interfaces for the Epics and Killer Features using React and Shadcn UI.*

* [ ] **5.1 Setup Authentication & Quotas**
* [ ] Implement Firebase Auth.
* [ ] Build a user profile context that tracks the daily limit of **20 AI interactions per day**.




* [ ] **5.2 Build the Core Chat UI ("The Lawyer" & "Crisis Manager")**
* [ ] Create a chat dashboard.
* [ ] Render AI responses with clear, clickable citations routing to the source documents.


* [ ] Add a "Crisis Mode" button for the Post-Accident Checklist.




* [ ] **5.3 Build Killer Feature UIs**
* [ ] **Ticket Decoder UI**: Image upload component that uploads to Firebase Storage, then calls the decoder tRPC mutation.


* [ ] **Argument Script UI**: A specific prompt template UI that formats the user's situation and returns the conversational script.


* [ ] **Cost Estimator UI**: A form capturing Vehicle Type, Model Year, and Months Late to send to the calculator endpoint.




* [ ] **5.4 Build Education & Wizard UIs**
* [ ] **License Wizard**: Step-by-step form determining if they need Student, Pro, Non-Pro, or 10-Year Validity requirements.


* [ ] **Exam Reviewer**: Interactive quiz UI with an "Explain Answer" button.





## Phase 6: CI/CD & Deployment

*Goal: Safely push code to Dev, Stage, and Production environments.*

* [ ] **6.1 Validate the Build Locally**
* [ ] Run `pnpm format` and `pnpm precheck`.


* [ ] **6.2 Deploy to Development & Staging**
* [ ] Commit to the `dev` branch to trigger `deploy-dev.yml` (authenticates via WIF).


* [ ] Create a PR from `dev` to `stage` to test the RAG grounding and hallucination rate (< 1% target).




* [ ] **6.3 Promote to Production**
* [ ] Open GitHub Actions, select the **Deploy to Main (Production)** workflow, and type `production` to launch.
