
# DoobieDB Project Knowledge File

## **1. Project Overview**

### **Mission Statement**
DoobieDB is an intelligent cannabis strain database application designed for dispensary inventory management and customer experience. The platform enables users to scan cannabis packages using AI vision technology, manage strain inventory, and browse detailed strain information with rich visual profiles.

### **Core Value Proposition**
- **AI-Powered Scanning**: Use camera + OpenAI Vision to instantly identify strain information from package photos
- **Smart Inventory Management**: Real-time stock tracking with batch operations for dispensary staff  
- **Rich Strain Profiles**: Detailed terpene, effect, and flavor visualizations with confidence ratings
- **Dual-Mode Experience**: Public menu board for customers + authenticated inventory management for staff
- **Progressive Web App**: Full mobile experience with offline capabilities

### **Target Market**
- **Primary**: Cannabis dispensaries needing modern inventory management
- **Secondary**: Cannabis enthusiasts wanting detailed strain information
- **Tertiary**: Budtenders requiring quick strain lookup and customer education tools

---

## **2. User Personas**

### **Dispensary Manager (Sarah, 32)**
**Goals**: Efficient inventory tracking, accurate product information, staff productivity
**Pain Points**: Manual data entry, inconsistent product information, time-consuming stock updates
**Use Cases**: Bulk inventory updates, strain information accuracy verification, real-time stock management

### **Budtender (Marcus, 25)** 
**Goals**: Quick strain lookup, customer education, accurate recommendations
**Pain Points**: Remembering all strain details, slow information access, customer wait times
**Use Cases**: Live strain scanning during customer interactions, effect/flavor explanations, stock checking

### **Cannabis Customer (Lisa, 28)**
**Goals**: Understanding strain effects, finding suitable products, making informed decisions
**Pain Points**: Overwhelming product choices, unclear strain information, inconsistent experiences
**Use Cases**: Browsing available strains, comparing effects/flavors, understanding terpene profiles

---

## **3. Technical Architecture**

### **Frontend Stack**
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.1 for fast development and optimized builds
- **UI Library**: Radix UI + shadcn/ui for accessible, customizable components
- **Styling**: Tailwind CSS 3.4.11 with custom animations and responsive design
- **State Management**: TanStack React Query 5.56.2 for server state + React Context for auth
- **Routing**: React Router DOM 6.26.2 for SPA navigation

### **Backend Infrastructure**
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with email/password and profile management
- **AI Processing**: OpenAI GPT-4 Vision API via Supabase Edge Functions
- **Real-time**: Supabase Realtime for live inventory updates
- **File Storage**: Base64 image handling (no file storage buckets currently)

### **Database Schema**
```sql
-- User profiles with automatic creation trigger
profiles (id, email, full_name, avatar_url, created_at, updated_at)

-- Strain scan history with rich metadata
scans (
  id, user_id, strain_name, strain_type, thc, cbd,
  effects[], flavors[], medical_uses[], terpenes,
  description, image_url, confidence, in_stock,
  scanned_at, created_at
)
```

---

## **4. Core Features & User Stories**

### **Smart Camera Scanning**
**As a budtender**, I want to scan cannabis packages with my phone camera so that I can instantly add accurate strain information to inventory.

**Acceptance Criteria:**
- Full-viewport camera interface opens instantly
- Tap-to-capture with immediate processing animation
- AI analysis with fake progress indicators for user feedback
- 85%+ accuracy confidence scoring
- Graceful fallback for unrecognizable packages

### **Inventory Management**
**As a dispensary manager**, I want to bulk update stock status so that I can efficiently manage large inventory changes.

**Acceptance Criteria:**
- Multi-select strain cards with visual feedback
- Batch "In Stock" / "Out of Stock" operations
- Real-time updates across all connected devices
- Optimistic UI updates with error rollback
- Edit mode toggle for staff vs. customer views

### **Strain Information Dashboard**
**As a customer**, I want to see detailed strain information so that I can make informed purchasing decisions.

**Acceptance Criteria:**
- Rich visual effect and flavor profiles with intensity ratings
- Detailed terpene breakdowns with effect descriptions
- THC/CBD content with confidence indicators
- Mobile-optimized responsive design
- Color-coded visual elements for quick comprehension

### **Smart Search & Filtering**
**As any user**, I want to search and filter strains so that I can quickly find relevant products.

**Acceptance Criteria:**
- Text, voice, and image input support
- Real-time filtering by strain type (Indica/Sativa/Hybrid)
- Sorting by recency, name, THC content
- Generate strain profiles from text descriptions
- No-results state with helpful guidance

---

## **5. API Documentation**

### **Supabase Edge Functions**

#### **`analyze-strain`**
**Endpoint**: `POST /functions/v1/analyze-strain`
**Purpose**: AI-powered strain analysis from images or text

**Request Body:**
```typescript
{
  imageData?: string; // Base64 encoded image
  textQuery?: string; // Strain name or description
}
```

**Response:**
```typescript
{
  name: string;
  type: 'Indica' | 'Sativa' | 'Hybrid';
  thc: number;
  cbd: number;
  effects: string[];
  flavors: string[];
  terpenes: Array<{
    name: string;
    percentage: number;
    effects: string;
  }>;
  medicalUses: string[];
  description: string;
  confidence: number; // 0-100
}
```

### **Database Operations (via StrainService)**

#### **Authentication Required Endpoints**
- `getAllStrains()`: Fetch all strains for authenticated users
- `getUserStrains(userId)`: Fetch user-specific strain history
- `createStrain(strainData)`: Add new strain to database
- `updateStockStatus(strainId, userId, inStock)`: Toggle single strain stock
- `batchUpdateStock(strainIds, userId, inStock)`: Bulk stock operations

#### **Public Endpoints**
- Public users can view only `in_stock: true` strains
- No authentication required for browsing available inventory

---

## **6. Data Models & Types**

### **Core Strain Interface**
```typescript
interface Strain {
  id: string;
  name: string;
  type: 'Indica' | 'Sativa' | 'Hybrid';
  thc: number; // Always 21%+ for recreational focus
  effectProfiles: EffectProfile[];
  flavorProfiles: FlavorProfile[];
  terpenes?: Terpene[];
  description: string;
  scannedAt: string;
  confidence: number;
  inStock: boolean;
  userId: string;
}
```

### **Visual Profile System**
```typescript
interface EffectProfile {
  name: string;
  intensity: number; // 1-5 scale
  emoji: string;
  color: string;
}

interface FlavorProfile {
  name: string;
  intensity: number; // 1-5 scale  
  emoji: string;
  color: string;
}
```

---

## **7. Development Environment Setup**

### **Prerequisites**
- Node.js 18+ with npm/yarn/bun
- Supabase account with project created
- OpenAI API key for strain analysis

### **Installation Steps**
```bash
# Clone repository
git clone [repository-url]
cd doobiedb

# Install dependencies  
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### **Environment Configuration**
**Supabase Secrets Required:**
- `OPENAI_API_KEY`: For AI strain analysis
- `SUPABASE_URL`: Project URL (auto-configured)
- `SUPABASE_ANON_KEY`: Public API key (auto-configured)
- `SUPABASE_SERVICE_ROLE_KEY`: Admin API access
- `SUPABASE_DB_URL`: Direct database connection

---

## **8. Testing & Quality Guidelines**

### **Code Standards**
- **Maximum 100 lines per component** for readability
- **Single responsibility principle** - one concern per file
- **TypeScript strict mode** with proper type definitions
- **Consistent naming**: PascalCase components, camelCase functions
- **Custom hooks** for reusable business logic

### **Component Structure Pattern**
```typescript
// 1. External imports
// 2. Internal imports  
// 3. Type definitions
// 4. Component implementation with:
//    - Hooks first
//    - State declarations
//    - Effect handling
//    - Event handlers
//    - Render logic
// 5. Default export
```

### **Testing Strategy**
- **Unit Tests**: Custom hooks and utility functions
- **Integration Tests**: Component interactions with mocked services
- **E2E Tests**: Critical user flows (scan → save → browse)
- **Manual Testing**: Camera functionality across devices
- **Performance Testing**: Real-time updates and optimistic UI

---

## **9. Deployment & Infrastructure**

### **Lovable Platform Deployment**
- **Staging**: Automatic deployment from main branch
- **Production**: Manual deployment trigger from Lovable interface
- **Custom Domain**: Available with paid Lovable plan
- **Environment**: Serverless with global CDN

### **Progressive Web App Features**
- **Service Worker**: Automatic caching and offline support
- **App Manifest**: Home screen installation on mobile
- **Responsive Design**: Mobile-first with desktop optimization
- **Dark Theme**: System preference detection with manual toggle

### **Performance Optimizations**
- **Code Splitting**: Lazy loading for route-based chunks
- **Image Optimization**: Base64 compression for scan images
- **Caching Strategy**: React Query with stale-while-revalidate
- **Real-time Efficiency**: Supabase channel management with proper cleanup

---

## **10. Security & Compliance**

### **Data Protection**
- **Row Level Security**: Database access restricted by user authentication
- **Input Validation**: Zod schemas for type-safe data processing
- **XSS Prevention**: Sanitized user inputs and React's built-in protection
- **API Security**: Supabase handles authentication tokens and session management

### **Cannabis Industry Compliance**
- **No Personal Medical Data**: Focus on product information only
- **Age Verification**: Authentication required for full access
- **Product Information Accuracy**: AI confidence scoring for transparency
- **Inventory Tracking**: Audit trail through scan history timestamps

### **Privacy Considerations**
- **Image Processing**: Images processed via AI but not permanently stored
- **User Data**: Minimal collection - email and scan history only
- **Data Retention**: User can delete scan history through settings
- **Analytics**: No third-party tracking - self-contained application

---

## **11. Known Issues & Technical Debt**

### **Current Limitations**
- **Camera Support**: Some Android devices may have compatibility issues
- **Offline Mode**: Limited functionality without internet connection
- **Image Storage**: No permanent image storage - Base64 only
- **Batch Operations**: Large batch operations may have performance impact

### **Technical Debt**
- **Legacy Type Support**: Maintaining backward compatibility during migration
- **Component Size**: Some dashboard components still need decomposition
- **Error Handling**: Need more comprehensive error boundary implementation
- **Testing Coverage**: Unit tests needed for critical business logic

---

## **12. Future Roadmap**

### **Short Term (1-3 months)**
- **Enhanced Camera**: Better mobile camera support and image processing
- **Offline Capabilities**: Service worker improvements for offline scanning
- **Performance**: Optimize real-time updates and batch operations
- **Testing**: Comprehensive test suite implementation

### **Medium Term (3-6 months)**
- **Analytics Dashboard**: Usage patterns and inventory insights
- **Integration APIs**: Connect with POS systems and e-commerce platforms
- **Advanced Search**: ML-powered strain recommendations
- **Multi-location**: Support for dispensary chains

### **Long Term (6+ months)**
- **White Label**: Customizable branding for different dispensaries
- **Compliance Tools**: Automated regulatory reporting features
- **Customer Profiles**: Personalized strain recommendations
- **Supply Chain**: Integration with cultivation and distribution tracking

---

## **13. Component Architecture Details**

### **Smart Omnibar System**
The heart of the application's input handling:
- **SmartOmnibar/index.tsx**: Main orchestrator for all input types
- **VoiceInput.tsx**: Speech recognition with Web Speech API
- **ImageUpload.tsx**: Camera trigger and image handling
- **CameraModal.tsx**: Full-screen camera interface with instant processing
- **AIAnalysis.tsx**: OpenAI API integration for strain analysis

### **Browse & Inventory System**
Clean, focused components for strain management:
- **BrowseStrains/index.tsx**: Main container (89 lines - well-organized)
- **hooks/**: `useBrowseFilters`, `useStrainSelection`, `useInventoryActions`
- **components/**: `StrainGrid`, `BrowseHeader` for focused responsibilities
- **FilterControls.tsx**: Advanced filtering and sorting
- **BatchActions.tsx**: Multi-select operations for inventory management

### **Data Layer Architecture**
Centralized, clean data management:
- **services/strainService.ts**: All database operations
- **data/converters/**: Type conversions between database and UI
- **data/hooks/**: `useStrainData`, `useStrainFiltering` for consistent patterns
- **hooks/**: Application-level hooks that use data layer

---

## **14. Workflow Documentation**

### **Image Scan Workflow**
1. User taps camera icon → `CameraModal` opens fullscreen
2. User taps screen → Photo captured as base64 dataURL
3. Modal switches to "processing" mode with animated progress
4. `analyzeStrainWithAI(imageData)` called with OpenAI Vision API
5. AI returns strain data → converted to `Strain` interface
6. Strain saved to database → real-time updates trigger
7. User redirected to strain details dashboard

### **Text/Voice Workflow**
1. User types or speaks input → `SmartOmnibar` receives text
2. On Enter/submit → `analyzeStrainWithAI(undefined, textQuery)` called
3. AI generates strain from description → same conversion process
4. Strain saved and displayed → consistent with image workflow

### **Inventory Management Workflow**
1. Staff enters edit mode → batch selection enabled
2. Multi-select strains → visual feedback with selection count
3. Batch operation (In Stock/Out of Stock) → optimistic UI updates
4. Database updates via `batchUpdateStock()` → real-time sync
5. Error handling with rollback → consistent user experience

---

This knowledge file serves as the single source of truth for DoobieDB development, covering everything from user needs to technical implementation details. It should be updated as the project evolves and new features are added.

**Last Updated**: 2025-06-15
**Version**: 1.0
**Maintained By**: DoobieDB Development Team
