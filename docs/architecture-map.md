
# DoobieDB Architecture Map

## Overview
DoobieDB is a cannabis strain management application with AI-powered strain analysis. This document maps the complete architecture, data flows, and component interactions.

## Main Application Structure

### Entry Point: src/pages/Index.tsx
- **Role**: Main application container and state orchestrator
- **Key State**: 
  - `activeTab`: Controls which view is shown (browse/details/showcase)
  - `currentStrain`: Selected strain object for details view
  - `settingsOpen`: Settings dialog state
- **User Interactions**:
  - Tab navigation between browse, details, showcase
  - Strain selection from any view switches to details tab
  - Settings access via header
- **Data Flow**: Receives strain objects from child components and manages global navigation state

## Module 1: Smart Omnibar (AI Input System)

### Core Components
- **src/components/SmartOmnibar/index.tsx**: Main orchestrator
- **src/components/SmartOmnibar/useGenerationLogic.tsx**: Generation state management
- **src/components/SmartOmnibar/AIAnalysis.tsx**: OpenAI API integration

### User Interaction Flow
1. User types text query OR uploads image
2. User clicks generate button
3. `useGenerationLogic` manages animation states
4. `AIAnalysis.tsx` calls Supabase edge function
5. Result converted to Strain object
6. Strain passed to parent via `onStrainGenerated` callback

### Data Flow Issues Identified
- **CRITICAL**: `AIAnalysis.tsx` calls `getDeterministicTHCRange()` and overrides AI-generated THC
- **ISSUE**: Description may be getting overwritten by local processing
- **ARCHITECTURE FLAW**: Multiple THC calculation sources

## Module 2: Browse Strains (Inventory Management)

### Core Components
- **src/components/BrowseStrains/index.tsx**: Main container (89 lines - well organized)
- **src/components/BrowseStrains/components/SafeStrainGrid.tsx**: Grid layout
- **src/components/BrowseStrains/StrainCard.tsx**: Individual strain display
- **src/components/BrowseStrains/hooks/useStrainSelection.ts**: Multi-select logic

### Data Sources
- **Primary**: `useRealtimeStrainStore()` for live strain data
- **Filtering**: `useStrainFiltering()` for client-side filtering
- **Pricing**: `useBulkStrainPrices()` for price data

### User Interactions
1. Search/filter strains
2. Multi-select for batch operations
3. Individual strain editing
4. Stock status toggling
5. Price editing via quick modal

### Architecture Issues
- **DUPLICATE LOGIC**: Multiple pricing data sources
- **INCONSISTENT STATE**: Optimistic updates vs real-time updates
- **COMPLEX DEPENDENCIES**: Too many hooks in single component

## Module 3: Strain Dashboard (Detail View)

### Core Components
- **src/components/StrainDashboard/index.tsx**: Main container
- **src/components/StrainDashboard/StrainHeader.tsx**: Name and basic info
- **src/components/StrainDashboard/StrainEffects.tsx**: Effect profiles
- **src/components/StrainDashboard/StrainFlavors.tsx**: Flavor profiles

### Data Dependencies
- **Input**: Single `Strain` object from parent
- **Display**: Renders strain properties directly
- **Editing**: Uses StrainEditor modal system

### User Interactions
1. View strain details
2. Edit strain via modal
3. Toggle stock status
4. Edit pricing information

## Module 4: Strain Showcase (Public Display)

### Core Components
- **src/components/StrainShowcase/index.tsx**: Main container
- **src/components/StrainShowcase/ShowcaseSlide.tsx**: Individual slides
- **src/components/StrainShowcase/components/ShowcaseCarousel.tsx**: Carousel logic

### Data Sources
- **Primary**: `useRealtimeStrainStore(true)` for all strains
- **Filtering**: Client-side filtering for in-stock only
- **Real-time**: Live updates for stock changes

### User Interactions
1. Auto-advance slideshow
2. Manual navigation
3. Fullscreen mode
4. Strain selection for details

## Critical Data Flow: Strain Object Generation

### Current Flow (PROBLEMATIC)
```
User Input → SmartOmnibar → AIAnalysis.tsx → Supabase Edge Function → OpenAI API
                ↓
    getDeterministicTHCRange() override
                ↓ 
    Local processing & conversion
                ↓
    Database save via useScans.ts
                ↓
    Real-time update triggers UI refresh
```

### Issues in Current Flow
1. **Description Override**: `AIAnalysis.tsx` may be modifying AI-generated descriptions
2. **THC Override**: Local THC calculation overrides AI values
3. **Multiple Conversions**: Data converted multiple times before save
4. **Inconsistent Sources**: Different components use different data sources

## Supabase Edge Functions Architecture

### analyze-strain Function Flow
```
index.ts → openai.ts → return_strain_profile tool → Database save
```

### Key Files
- **supabase/functions/analyze-strain/index.ts**: Main handler
- **supabase/functions/analyze-strain/openai.ts**: OpenAI integration (267 lines - NEEDS REFACTORING)
- **supabase/functions/regenerate-description/index.ts**: Description regeneration

### Data Transformations
1. User input → OpenAI prompt
2. OpenAI response → StrainProfile type
3. StrainProfile → Database scan record
4. Database record → UI Strain object

## State Management Architecture

### Multiple Store Pattern (PROBLEMATIC)
- **useStrainStore**: Base strain operations
- **useRealtimeStrainStore**: Adds real-time subscriptions
- **usePriceStore**: Price-specific state
- **useStrainData**: Core data fetching

### Issues
- **State Fragmentation**: Data spread across multiple stores
- **Inconsistent Updates**: Different update mechanisms
- **Complex Dependencies**: Circular dependencies between stores

## Database Schema Issues

### Strain Data Storage
```sql
scans (
  id, user_id, strain_name, strain_type, thc, cbd,
  effects[], flavors[], description, confidence,
  in_stock, scanned_at, created_at
)
```

### Conversion Issues
- **DatabaseScan** → **Strain** object conversion
- **Legacy support** for old data formats
- **Type inconsistencies** between database and UI

## Critical Problems Identified

### 1. Description Generation Issues
- AI-generated descriptions may be overwritten by local processing
- Multiple description sources causing inconsistencies
- Edge function changes not reflected in UI

### 2. Duplicate Logic
- THC calculation in multiple places
- Price fetching in multiple components
- Strain conversion logic scattered

### 3. State Management Chaos
- Too many stores and hooks
- Inconsistent real-time update handling
- Complex data flow between components

### 4. Component Architecture
- Some components too large (openai.ts at 267 lines)
- Mixed concerns within single files
- Inconsistent prop interfaces

## Recommended Fixes

### Immediate (Critical)
1. Fix description generation flow
2. Consolidate THC calculation logic
3. Add comprehensive logging to AI generation
4. Ensure edge function changes are properly applied

### Short Term
1. Refactor openai.ts into smaller files
2. Consolidate state management
3. Standardize data conversion patterns
4. Implement consistent error handling

### Long Term
1. Complete state management refactor
2. Component size reduction
3. Standardized data flow patterns
4. Comprehensive testing strategy

## Data Flow Diagrams

### Strain Generation Flow
```
User Input → SmartOmnibar → AIAnalysis → Edge Function → OpenAI → Database → Real-time → UI Update
```

### Strain Display Flow
```
Database → Real-time Subscription → Store → Component → UI Render
```

### Strain Editing Flow
```
User Edit → Modal → Editor Hook → Database Update → Real-time → Store Update → UI Refresh
```

This architecture map reveals significant issues that need immediate attention, particularly around description generation and state management consistency.
