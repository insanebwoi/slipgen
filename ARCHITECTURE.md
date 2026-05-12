# 🏗️ SlipGen Architecture Overview

This document outlines the high-level architecture and design patterns used in SlipGen to ensure performance, security, and scalability.

## 🚀 1. Tech Stack
- **Core**: Next.js 16 (App Router) + React 19.
- **Styling**: Tailwind CSS 4.0 (Modern, utility-first).
- **Backend**: Supabase (Postgres, Auth, Storage).
- **State**: Zustand (Atomic, client-side store for the Editor).
- **PDF/Image**: `jspdf` + `html-to-image` (Client-side rendering to save server costs).

## 📂 2. Directory Structure
- `src/app/`: File-based routing and Server Components.
- `src/components/`: Reusable UI components (Atomic design).
- `src/lib/`: Core business logic (Layout Engine, Template Definitions).
- `src/lib/supabase/`: Unified client/server auth helpers.
- `supabase/migrations/`: Version-controlled database schema.

## 🔐 3. Security Design
- **Auth**: Google OAuth + Email/Password via Supabase.
- **Database (RLS)**: Row Level Security ensures users can only read/edit their own profiles and event logs.
- **Rate Limiting**: Custom implementation in `src/lib/rate-limit.ts` to prevent brute-force attacks on Auth actions.
- **Environment**: Strict separation of Public (`NEXT_PUBLIC_`) and Private environment variables.

## 🎨 4. Layout & Rendering Engine
- **Template System**: Located in `src/lib/templates.ts`. Decouples design from data.
- **Smart Packing**: `src/lib/layout-engine.ts` calculates optimal grid spacing for A4/A3/13x19 paper to minimize waste (30%+ savings).
- **Rasterization**: Uses a dual-pass SVG-foreignObject pipeline to ensure high-DPI (300 DPI) exports work on mobile (iOS/Android).

## 📉 5. Data Flow
1. **User Sign-in**: Google Auth → Supabase Trigger → `profiles` table.
2. **Editor State**: User inputs student data → Zustand Store → Real-time CSS Grid preview.
3. **Export**: DOM → `html-to-image` (Raster) → `jspdf` (Blob) → Client-side Download.

## 📈 6. Performance Optimizations
- **Font Loading**: Pre-connected to Google Fonts; uses `next/font` for local caching and CLS prevention.
- **SEO**: Dynamic JSON-LD (Schema.org) for SoftwareApplication, FAQ, and Organization to boost search rankings.
- **Image Handling**: Client-side compression before processing to keep exports under 2MB.

---
*Created by Antigravity AI for SlipGen.*
