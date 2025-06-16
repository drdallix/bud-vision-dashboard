
# DoobieDB - Cannabis Strain Management Application

## Project Overview

DoobieDB is a progressive web application (PWA) for cannabis strain inventory management and discovery. It combines AI-powered strain analysis with real-time inventory tracking, designed for both dispensary staff and cannabis enthusiasts.

### Core Features
- **AI Strain Generation**: Generate detailed strain profiles from text descriptions or images using OpenAI
- **Real-time Inventory Management**: Live stock updates across all connected devices
- **Strain Showcase**: Visual presentation mode for customer-facing displays
- **Smart Search & Filtering**: Multi-modal search with voice and image input
- **Progressive Web App**: Full offline capabilities with service worker

## Technical Stack

### Frontend
- React 18.3.1 with TypeScript
- Vite for build tooling
- Tailwind CSS + shadcn/ui components
- TanStack React Query for state management
- React Router for navigation

### Backend
- Supabase (PostgreSQL + Real-time + Auth)
- OpenAI GPT-4 Vision API via Supabase Edge Functions
- Row Level Security (RLS) for data protection

### Key Dependencies
- @supabase/supabase-js: Database and auth
- @tanstack/react-query: Server state management
- lucide-react: Icon library
- recharts: Data visualization
- next-themes: Theme management

## Application Architecture

### Main Routes
- `/` - Main application (Index.tsx)
- `/auth` - Authentication page
- `*` - 404 Not Found page

### Core Components Structure

#### Pages
- `src/pages/Index.tsx` - Main application container with tab navigation
- `src/pages/Auth.tsx` - Login/signup page
- `src/pages/NotFound.tsx` - 404 error page

#### Layout Components
- `src/components/Layout/Header.tsx` - Top navigation with user menu
- `src/components/Layout/Navigation.tsx` - Desktop tab navigation
- `src/components/Layout/MobileNavigation.tsx` - Mobile bottom navigation
- `src/components/Layout/QuickStats.tsx` - Statistics display

#### Core Feature Components

##### Strain Browsing (`src/components/BrowseStrains/`)
- `index.tsx` - Main browse container (89 lines)
- `SearchBar.tsx` - Search with voice input
- `FilterControls.tsx` - Type and sort filtering
- `BatchActions.tsx` - Multi-select operations
- `StrainCard.tsx` - Individual strain display
- `components/SafeStrainGrid.tsx` - Grid layout with error handling
- `components/BrowseHeader.tsx` - Browse page header
- `hooks/useBrowseFilters.ts` - Filter state management
- `hooks/useStrainSelection.ts` - Multi-select logic
- `hooks/useInventoryActions.ts` - Batch operations

##### Smart Input System (`src/components/SmartOmnibar/`)
- `index.tsx` - Main omnibar orchestrator
- `AIAnalysis.tsx` - OpenAI API integration
- `VoiceInput.tsx` - Speech recognition
- `ImageUpload.tsx` - Camera integration
- `GenerationProgress.tsx` - AI processing feedback
- `useGenerationLogic.tsx` - Generation state management

##### Strain Dashboard (`src/components/StrainDashboard/`)
- `index.tsx` - Main strain details view
- `StrainHeader.tsx` - Strain name and basic info
- `StrainEffects.tsx` - Effect profiles display
- `StrainFlavors.tsx` - Flavor profiles display
- `StrainTerpenes.tsx` - Terpene information
- `StrainCannabinoids.tsx` - THC/CBD content
- `StrainVisualCard.tsx` - Visual summary card

##### Strain Showcase (`src/components/StrainShowcase/`)
- `index.tsx` - Main showcase container
- `ShowcaseSlide.tsx` - Individual strain slide
- `FullscreenButton.tsx` - Fullscreen toggle
- `FullscreenSceneManager.tsx` - Fullscreen orchestration
- `PlaybackControls.tsx` - Auto-advance controls
- `ShowcaseFilters.tsx` - Showcase filtering

#### Data Layer

##### Services (`src/services/`)
- `strainService.ts` - Database operations
- `priceService.ts` - Price management
- `cacheService.ts` - Local caching

##### Data Hooks (`src/data/hooks/`)
- `useStrainData.ts` - Core strain data fetching
- `useStrainFiltering.ts` - Client-side filtering logic

##### Application Hooks (`src/hooks/`)
- `useScans.ts` - Scan history management
- `useRealtimeStrains.ts` - Real-time subscriptions
- `useInventoryManagement.ts` - Stock operations
- `useBulkStrainPrices.ts` - Price data fetching
- `useStrainPrices.ts` - Individual strain pricing

##### State Management (`src/stores/`)
- `useStrainStore.ts` - Centralized strain state
- `useRealtimeStrainStore.ts` - Real-time enabled store
- `usePriceStore.ts` - Price state management

#### Type Definitions (`src/types/`)
- `strain.ts` - Core strain interfaces
- `price.ts` - Pricing structures
- `speech.d.ts` - Voice recognition types

## Database Schema

### Tables
```sql
-- User profiles
profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp,
  updated_at timestamp
)

-- Strain scans/records
scans (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  strain_name text,
  strain_type text,
  thc numeric,
  cbd numeric,
  effects text[],
  flavors text[],
  medical_uses text[],
  terpenes jsonb,
  description text,
  image_url text,
  confidence integer,
  in_stock boolean,
  scanned_at timestamp,
  created_at timestamp
)

-- Price points
price_points (
  id uuid PRIMARY KEY,
  strain_id uuid REFERENCES scans(id),
  amount text,
  now_price numeric,
  was_price numeric,
  created_at timestamp,
  updated_at timestamp
)
```

### Row Level Security (RLS)
- Users can only access their own strain records
- Price data follows strain ownership
- Profile data is user-specific

## AI Integration

### Supabase Edge Functions
- `analyze-strain` - Main AI analysis function
- `cannabis-chat` - AI sommelier chat
- `regenerate-description` - Description updates

### OpenAI Integration
- Model: GPT-4 Vision API
- Handles both text and image inputs
- Returns structured strain data
- Includes confidence scoring

### AI Analysis Flow
1. User inputs text or image via SmartOmnibar
2. useGenerationLogic hook manages state
3. AIAnalysis.tsx calls Supabase edge function
4. Edge function processes with OpenAI
5. Result converted to Strain interface
6. Strain saved to database
7. Real-time updates trigger UI refresh

## State Management Patterns

### React Query Usage
- Server state via TanStack React Query
- Optimistic updates for better UX
- Background refetching and caching
- Error handling with toast notifications

### Real-time Updates
- Supabase real-time subscriptions
- Automatic UI updates on data changes
- Channel management with proper cleanup
- Multi-device synchronization

### Local State
- React Context for authentication
- Component-level useState for UI state
- Custom hooks for reusable logic

## Navigation Flow

### Tab Structure (Index.tsx)
- `showcase` - Public strain display (default for non-authenticated)
- `browse` - Strain inventory management (default for authenticated)
- `details` - Individual strain information

### Strain Selection Flow
1. User selects strain from browse or showcase
2. `setCurrentStrain()` called with strain data
3. `setActiveTab('details')` switches to details view
4. StrainDashboard renders with strain prop

### Authentication Flow
1. AuthProvider wraps entire app
2. useAuth hook provides user state
3. Conditional rendering based on auth status
4. Automatic redirect to appropriate default tab

## Key Business Logic

### THC Calculation
- Deterministic THC ranges based on strain name
- Ensures consistent values across sessions
- Range: 21-30% for recreational focus
- Implemented in `utils/thcGenerator.ts`

### Stock Management
- Individual strain stock toggle
- Batch operations for multiple strains
- Real-time sync across all devices
- Optimistic UI updates with rollback

### Price Management
- Multiple price points per strain
- Current (now) and previous (was) pricing
- Bulk price editing capabilities
- Historical price tracking

## Error Handling

### Error Boundaries
- StrainErrorBoundary for strain-specific errors
- Graceful fallbacks for failed operations
- User-friendly error messages

### API Error Handling
- Toast notifications for user feedback
- Automatic retry mechanisms
- Fallback data for failed AI requests

## Performance Optimizations

### Code Splitting
- Lazy loading for route components
- Dynamic imports for heavy components
- Reduced initial bundle size

### Caching Strategy
- React Query cache with stale-while-revalidate
- Service worker for offline capabilities
- Local storage for user preferences

### Real-time Efficiency
- Targeted subscriptions by user/data type
- Proper channel cleanup on unmount
- Debounced updates to prevent spam

## Development Patterns

### Component Structure
- Maximum 100 lines per component
- Single responsibility principle
- Custom hooks for business logic
- Consistent prop interfaces

### File Organization
- Feature-based folder structure
- Separate hooks, components, and utilities
- Index files for clean imports
- Type definitions co-located with usage

### Code Standards
- TypeScript strict mode
- Consistent naming conventions
- Proper error handling
- Comprehensive prop typing

## Deployment & Infrastructure

### Progressive Web App
- Service worker registration
- App manifest for installation
- Offline-first design
- Mobile-responsive interface

### Environment Configuration
- Supabase URL and keys
- OpenAI API key via edge functions
- Development vs production settings

## Known Issues & Technical Debt

### Current Limitations
- Base64 image storage (no file buckets)
- Limited offline functionality
- Some mobile camera compatibility issues

### Refactoring Opportunities
- Large component decomposition needed
- Improved error boundary coverage
- Enhanced testing infrastructure

## Future Roadmap

### Short Term
- Enhanced mobile camera support
- Improved offline capabilities
- Performance optimizations

### Long Term
- Multi-location support
- Advanced analytics
- Third-party integrations
- White-label solutions

---

This knowledge file serves as the definitive guide to DoobieDB's architecture, patterns, and implementation details. It should be updated as the codebase evolves.
