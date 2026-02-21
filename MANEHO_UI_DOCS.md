# Maneho.ai UI Documentation

## Overview

Maneho.ai is a free, AI-powered legal and driving companion for Filipino motorists. This is a comprehensive React UI built with Tailwind CSS, Shadcn UI components, and Lucide React icons.

## Design System

### Color Palette (Civic-Focused)
- **Primary**: Deep Blue (#0066FF) - Professional, trustworthy
- **Secondary**: Slate Gray (#5A7C8C) - Calm, stable
- **Accent**: Orange-Red (#FF6600) - Urgency, important alerts
- **Neutrals**: White, grays, dark slate - Clean, civic appearance

### Typography
- **Headings**: Bold, using primary colors for emphasis
- **Body**: Clear, legible sizing suitable for mobile drivers
- **Icons**: Lucide React for consistent iconography

## Components & Views

### 1. **The Lawyer** (Chat Dashboard)
A conversational interface for legal traffic questions.

**Features:**
- Chat bubble interface with user and AI messages
- AI responses include clickable citation tags (e.g., [RA 4136], [JAO 2014-01])
- Prominent "Crisis Mode" button for post-accident checklists
- Real-time chat simulation
- Message input with send functionality

**Key Interactions:**
- Type and send questions about traffic laws
- View citations related to answers
- Trigger Crisis Mode for emergency procedures

---

### 2. **Ticket Decoder**
Image upload interface for analyzing LTO apprehension tickets.

**Features:**
- Drag-and-drop zone with file upload button
- Image file selection and preview
- Mock analysis results showing:
  - Violation name
  - Fine amount range
  - Settlement instructions
- Clean result card display

**Key Interactions:**
- Upload ticket photo
- View decoded violation information
- Get settlement guidance

---

### 3. **Registration Cost Estimator**
Calculate vehicle registration renewal costs.

**Features:**
- Form inputs for:
  - Vehicle Type (Motorcycle, Sedan, SUV, PUV)
  - Model Year
  - Months Late for Registration
- Real-time cost breakdown:
  - Basic Renewal
  - Penalty (calculated per month)
  - Emission Test
  - TPL Insurance
- Total estimate display

**Key Interactions:**
- Select vehicle details
- View cost breakdown
- Plan registration renewal

---

### 4. **License Getter Wizard**
Step-by-step guide for getting or renewing a license.

**Features:**
- Multiple choice selection:
  - Student Permit
  - New License (Pro/Non-Pro)
  - Renewal (Check 10-Year Eligibility)
- Dynamic requirements checklist based on selection
- Checkbox-able requirements to track progress
- Back navigation between steps

**Key Interactions:**
- Select license type
- Review requirements
- Track completion progress
- Proceed to LTO with prepared checklist

---

### 5. **Exam Reviewer** (TDC/CDE)
Practice interface for LTO exam questions.

**Features:**
- Multiple-choice question display
- Interactive answer selection
- Correct/Incorrect feedback
- "Explain Answer (Uses 1 Credit)" button
- AI explanation of correct answers
- Citation-backed explanations

**Key Interactions:**
- Select an answer
- Get instant feedback
- Request explanation with credit usage
- View legal citations

---

### 6. **Argument Script Generator**
Generate polite responses for traffic enforcement interactions.

**Features:**
- Text area for situation description
- AI-generated script using:
  - Proper legal citations
  - Polite, respectful tone
  - Philippine traffic law references (e.g., AO AHS-2008-015, RA 4136)
- Generated script display with citation indicators

**Key Interactions:**
- Describe your traffic situation
- Generate appropriate response
- Copy script for use with enforcers
- Reference law citations

---

## Layout Structure

### Main Layout
```
┌─────────────────────────────────────────────────┐
│         Sticky Top Bar (Mobile Menu)             │
├──────────────────┬──────────────────────────────┤
│   Sidebar        │   Main Content Area          │
│  (64 wide)       │  (Flex-1 responsive)         │
│                  │                              │
│  - Logo          │  - View Header               │
│  - Daily Quota   │  - Active Component          │
│  - Navigation    │  - Scrollable Content        │
│  - Sign Out      │                              │
└──────────────────┴──────────────────────────────┘
```

### Sidebar
- **Fixed on desktop** (md+), **mobile drawer** (sm)
- Sticky positioning with dark overlay on mobile
- Navigation with active state highlighting
- Daily AI quota progress indicator
- Sign out button

### Daily AI Quota
- Displays as progress bar
- Shows X/Y queries used
- Located in sidebar for quick reference
- Also displayed in top bar

## Responsive Design

### Mobile (< 768px)
- Hidden sidebar with toggle menu
- Full-width content
- Stack layout for forms
- Touch-friendly button sizes

### Tablet/Desktop (768px+)
- Visible sidebar
- Two-column layout
- Side-by-side forms
- Optimized spacing

## State Management

Uses React's `useState` for:
- **activeView**: Current displayed view
- **sidebarOpen**: Mobile sidebar visibility
- **Chat messages**: Conversation history
- **Form inputs**: User selections and entries
- **UI state**: Result display, explanations, etc.

## Key Interactions

1. **Navigation**: Click sidebar items to switch views
2. **Mobile Menu**: Hamburger menu toggles sidebar
3. **Forms**: Standard input, select, textarea elements
4. **Chat**: Send messages with Enter key or button
5. **File Upload**: Drag-drop or click to upload
6. **Checklists**: Toggle checkboxes to track progress
7. **Quiz**: Select answers, view results, get explanations

## Accessibility Features

- Semantic HTML (buttons, labels, inputs)
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- Color contrast compliance
- Alt text for icons

## Future Enhancements

1. **Real API Integration**: Connect to actual legal database
2. **User Authentication**: Firebase Auth integration
3. **Persisted State**: Save user progress
4. **Offline Support**: Service worker for offline access
5. **Dark Mode**: Toggle dark theme
6. **Notifications**: Alert user for quota limits
7. **Analytics**: Track user interactions
8. **Sharing**: Share generated scripts and information

## Technical Stack

- **React 18.3.1**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Shadcn UI**: Component library
- **Lucide React**: Icon library
- **Vite**: Build tool
- **Monorepo (Turborepo)**: Package management

## Installation & Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Build for production
pnpm run build

# Run preview
pnpm run preview
```

## File Structure

```
apps/web/src/
├── App.tsx              # Main app with all views and state
├── style.css            # Global styles and CSS variables
├── main.tsx             # Entry point
└── ... other files
```

## Notes

- All functionality is UI-only with mock data
- No backend API calls or tRPC functions
- Simple React state for interactivity
- Responsive design optimized for mobile drivers
- Civic-focused color scheme for trustworthiness
