Since you've crossed off the heavy lifting—specifically the **Vertex AI Vector Search** and the **RAG-grounded retrieval**—you’re now entering the "Productization" phase. This is where you transform the technical proof-of-concept into a tool that everyday Filipino motorists can actually use.

Here is an expanded version of your To-Do list, adding the specific technical sub-tasks needed for your collaborator to pick up the slack.

---

# 🚀 Expanded Maneho.ai Development To-Do List

## Phase 1: Environment & Project Setup

- [x] **1.1 Initialize the Repository**
- [x] **1.2 Create & Configure Firebase Project**
- [ ] **1.3 Configure Google-Managed Service Accounts**
- [ ] Create `maneho-backend-sa` with `Vertex AI User` and `Firestore User` roles.
- [ ] Grant Service Account Token Creator to the CI/CD runner.

- [ ] **1.4 Configure Workload Identity Federation (WIF)**
- [ ] Map GitHub Actions to the GCP Service Account.

- [x] **1.5 Configure Local Environments**

## Phase 2: Database & Storage Configuration

- [x] **2.1 Initialize Firestore**
- [x] **2.2 Initialize Firebase Storage**
- [x] **2.3 Define Shared Zod Schemas**
- [ ] _Note: Ensure `SourceDocument` schema includes `confidenceScore` and `pageNumber`._

## Phase 3: Vertex AI Vector Search Setup

- [x] **3.1 Enable Google Cloud APIs**
- [x] **3.2 Create the Vector Search Index** (768-dim)
- [x] **3.3 Deploy the Index to an Endpoint**
- [x] **3.4 Add Vertex AI Variables to Backend**

## Phase 4: Backend Orchestration (`apps/functions`)

- [x] **4.1 Build Core AI/RAG Utilities**
- [x] **4.2 Build Epic E: Admin Ingestion Pipeline**
- [x] **4.3 Build Epic B: The "Lawyer"**
- [ ] **4.4 Build the Killer Features APIs**
- [ ] **Ticket Decoder:** Implement `extractTicketText` using Gemini 1.5 Flash (Vision).
- [ ] **Argument Script:** Create prompt templates for "Respectful Contestation" based on RA 4136.
- [ ] **Cost Estimator:** Build a pure-function calculator for LTO fees (MVUC, Penalty, TPL).

- [ ] **4.5 Build Epic A & C: Education and Wizards**
- [ ] **Quiz Engine:** Create a logic-puller for Firestore `quiz_questions` collection.

## Phase 5: Frontend Development (`apps/web`)

- [ ] **5.1 Setup Authentication & Quotas**
- [ ] Implement Firebase Auth (Google Sign-in).
- [ ] **User Throttling:** Create a Firestore `user_usage` counter to limit free RAG queries.

- [x] **5.2 Build the Core Chat UI** (Flat LTO single-column design)
- [ ] **5.3 Build Killer Feature UIs**
- [ ] **Image Upload:** Create a dropzone for traffic tickets (TOP).
- [ ] **Cost Dashboard:** Build a sharp, flat UI to display fee breakdowns.
- [ ] **Copy-to-Clipboard:** Add buttons for the "Argument Scripts" to use in the field.

- [ ] **5.4 Build Education & Wizard UIs**
- [ ] **License Wizard:** A multi-step form for Student/Non-Pro/Pro requirements.
- [ ] **Reviewer UI:** A mobile-first flashcard/quiz interface.

## Phase 6: CI/CD & Deployment

- [x] **6.1 Validate the Build Locally**
- [ ] **6.2 Deploy to Development & Staging**
- [ ] Set up GitHub Action: `deploy-functions.yml`.
- [ ] Set up GitHub Action: `deploy-web.yml` (Firebase Hosting).

- [ ] **6.3 Promote to Production**

---

### 🎨 Design Direction for your Collaborator

When they start on **Phase 5.3**, remind them of the "LTO Flat" aesthetic:

- **Primary Color:** `#0038A8` (Philippine Blue).
- **Accent Color:** `#FCD116` (Philippine Sun Yellow) - _use sparingly for warnings/important notices._
- **Typography:** Bold, clean sans-serif (Inter or Roboto).
- **UI Style:** Zero border-radius (sharp corners) or very slight `rounded-sm`. No heavy shadows.

### 💡 Next Step for you

Would you like me to write a **`COLLABORATOR_HANDOFF.md`** file that explains the exact structure of your new RAG logic and how they should call the tRPC endpoints for the remaining features?
