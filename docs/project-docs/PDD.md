# Product Design Document (PDD): Maneho.ai

**Version:** 4.2
**Status:** Approved (Architecture Revision)
**Model:** Free Public Utility (Civic Tech)
**Tech Stack:** Hytel Monorepo (React / Vite / tRPC / Firebase Functions / Firestore / Storage / Vertex AI Vector Search)

---

## 1. Application Overview

**Maneho.ai** is a free, AI-powered companion for Filipino motorists. It simplifies the complex rules of the Land Transportation Office (LTO), traffic laws, and insurance policies into bite-sized, actionable advice.

- **Core Value:** Secure, cited, and up-to-date legal guidance via a RAG-powered chatbot. It eliminates the need to rely on "hearsay" or hire illegal fixers by providing direct access to official LTO Memorandums and Republic Acts.
- **Target Audience:** Student drivers, license renewers, PUV drivers, and private car owners in the Philippines.
- **Mission:** To create a more educated, law-abiding driving community by making legal information accessible to everyone for free.

---

## 2. Sustainability & Infrastructure

To support a production-grade RAG architecture while maintaining the app as a free utility, we utilize a backend-heavy approach for security, cost control, and performance, strictly adhering to the Hytel Monorepo structure.

- **Monorepo Architecture (pnpm & Turborepo):** \* **Frontend (`apps/web`):** React, Vite, Tailwind CSS, and Shadcn UI components for a fast, responsive user interface.
- **Backend (`apps/functions`):** Node 20 / TypeScript running on Firebase Cloud Functions, exposing a type-safe API via **tRPC**.
- **Shared Types (`packages/shared`):** Zod schemas ensuring strict validation between the frontend and backend.

- **Firebase Blaze Plan:** Required to enable Firebase Functions to make outbound network requests to the Vertex AI API.
- **Vertex AI + Firestore RAG Setup (No Pinecone):** \* **Firestore:** Stores canonical LTO documents, chunked text, and metadata (source URL, timestamps, tags).
- **Vertex AI Vector Search:** Stores only the generated feature vectors (embeddings) and minimal metadata (datapoint IDs) to keep the deployed index lightweight.
- **Google Gen AI SDK:** Uses `@google/genai` (v1.41.0) to call `gemini-embedding-001` (3072 dimensions) for embeddings and `gemini-2.5-flash` for the chat generation.

- **Cost Control Strategy:** Vector Search relies on one small index and one public endpoint (an "always-on" cost, kept under $100/month). Everything else—Functions, Gemini tokens, and Storage—is pay-per-use.
- **CI/CD Pipeline:** Fully configured GitHub Actions using Workload Identity Federation (WIF) for secure, keyless deployments to GCP.

---

## 3. Epics & User Stories

### **Epic A: The "License Getter" Wizard (Acquisition & Renewal)**

_Focus: Guiding the user from walking in to getting the card._

- **Story A1:** As a Student Applicant, I want to generate a personalized checklist of requirements for a Student Permit, so that I don't waste time going to the LTO lacking documents.
- **Story A2:** As a User, I want to ask about the difference between "Non-Professional" and "Professional" restrictions in Taglish, so I can apply for the right one based on my livelihood.
- **Story A3:** As a Renewing Driver, I want to check if I am eligible for the 10-Year Validity license based on my violation history, so I can prepare the correct medical requirements.

### **Epic B: The "Lawyer" (Traffic Laws & Violations)**

_Focus: The Core RAG Engine ingestion of RA 4136, JAO 2014-01, and local ordinances._

- **Story B1 (RAG):** As a Driver, I want to type in a violation (e.g., "Swerving"), so that I can verify if it is a legitimate violation and exactly how much the fine is via Vector Search nearest neighbors.
- **Story B2:** As a Driver, I want to know the specific fines for NCAP (No Contact Apprehension) versus physical apprehension, so that I know where and how to pay.
- **Story B3:** As a Motorcycle Rider, I want to know the specific laws on "Top Boxes," "Auxiliary Lights," and "Slippers," so that I don't get wrongly apprehended at checkpoints.
- **Story B4:** As a User, I want the AI to return the answer + citations mapping back to the canonical document stored in Firestore, so I can show the exact law to an enforcer.

### **Epic C: The "Exam Reviewer" (Education)**

_Focus: Helping users pass the Theoretical Driving Course (TDC) and Comprehensive Driver’s Education (CDE)._

- **Story C1:** As a Student, I want to take unlimited practice quizzes generated from the official LTO questionnaire.
- **Story C2:** As a User, I want to click an "Explain Answer" button when I get a question wrong, so the AI can explain the logic behind the rule (Consumes 1 Credit).

### **Epic D: The "Crisis Manager" (Accidents & Insurance)**

_Focus: Emergency workflows and insurance logic._

- **Story D1:** As a Driver involved in a crash, I want a step-by-step "Post-Accident Checklist," so that I don't miss legal steps (e.g., taking photos before moving the car).
- **Story D2 (RAG):** As a Car Owner, I want to upload/paste my Insurance Policy text, so the AI can embed the text, chunk it, and tell me if "Acts of Nature" (Flooding) are covered.

### **Epic E: Admin & Knowledge Management**

_Focus: The backend RAG operations and data freshness._

- **Story E1:** As an Admin, I want to trigger a Firebase Function to ingest LTO PDFs from Cloud Storage, chunk the text, embed it via `gemini-embedding-001`, and upsert to Vector Search.
- **Story E2:** As an Admin, I want to "tag" documents by date in Firestore, so the AI prioritizes 2026 rules over 2018 rules via metadata filtering.

---

## 4. Killer Features (The "Viral" Utilities)

### **1. The "Ticket Decoder" (Vision + RAG)**

- **The Problem:** Handwritten tickets (TOP) are messy and confusing.
- **The Feature:** Users upload a ticket photo to Firebase Storage. The app uses Gemini to extract the text, embeds the query, and performs a Vector Search to retrieve the specific violation fine and settlement instructions.

### **2. The "Argument Script" Generator**

- **The Problem:** Enforcers sometimes invent violations.
- **The Feature:** The user describes the situation in the chat interface built with React.
- **The Output:** The app generates a polite script grounded in retrieval: _"Sir, according to AO AHS-2008-015..."_ ensuring the prompt strictly uses the provided sources.

### **3. The "Registration Cost Estimator"**

- **The Problem:** "How much cash should I bring to the LTO?"
- **The Feature:** A hybrid RAG + Calculator running as a tRPC procedure on `apps/functions`.
- **Output:** Calculates "Basic Renewal + Penalty + Emission Test + TPL" based on retrieved LTO fee tables.

---

## 5. Success Metrics (KPIs)

1. **Backend Security:** 100% of deployment architecture relies on Workload Identity Federation (WIF) with no stored service account keys.
2. **Reliability:** < 1% hallucination rate due to strict RAG grounding using the top 6 retrieved chunks and tight prompts.
3. **Sustainability:** Keeping the Vertex AI Vector Search at one single endpoint and index to minimize "always-on" costs, defaulting to the `gemini-2.5-flash` model for chat to optimize pay-per-use token billing.

---
