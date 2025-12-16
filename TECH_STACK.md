# CareSense AI - Technology Stack

This document details the complete technology stack used to build CareSense AI.

## Core Framework & Runtime
- **React 19**: The latest library for building user interfaces.
- **TypeScript 5.8**: Ensures type safety and scalability across the codebase.
- **Vite 6**: Next-generation frontend tooling for ultra-fast development and optimized production builds.

## AI & Backend
- **Azure OpenAI Service**: Powers the core intelligence of the application.
  - **Model**: deployed GPT-4 class model.
  - **SDK**: `openai` Node.js library (used in a client-side adaptation for this demo).
  - **Function**: Performs symptom analysis, risk classification, and actionable wellness planning.

## Styling & UI
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
  - *Implementation*: Currently loaded via CDN for lightweight portability.
  - *Theme*: Custom color palette (Teal/Indigo/Rose/Amber) defined in `index.html` configuration.
- **Custom SVG Icons**: Lightweight, dependency-free icon set located in `components/icons.tsx`, optimized for performance.
- **Glassmorphism**: Custom CSS classes for visual depth and transparency effects.

## State & Data Management
- **React Hooks**: `useState`, `useEffect`, `useCallback` for managing application lifecycle.
- **LocalStorage**: Used for persisting the "Risk Trend" history locally on the user's device (privacy-focused).

## Infrastructure & Deployment
- **Vercel**: Optimized for deploying React/Vite applications.
- **Git**: Version control (hosted on GitHub).

## Project Structure
- **/components**: Reusable UI components (ResultScreen, InputScreen, etc.).
- **/services**: External API integrations (Azure OpenAI logic).
- **/dist**: Production build artifacts.
