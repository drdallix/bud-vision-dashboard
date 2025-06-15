
# Strain Editor Specification Document

## Overview
A comprehensive strain editing interface that allows budtenders to modify strain information, manage inventory status, set pricing, and regenerate AI-powered descriptions with human guidance.

## Core Features

### 1. Basic Strain Information Editing
- **Strain Name**: Editable text field with validation
- **Strain Type**: Radio buttons or dropdown (Indica, Sativa, Hybrid)
- **THC Percentage**: Number input with validation (0-100%)
- **CBD Percentage**: Number input with validation (0-100%)
- **In Stock Status**: Toggle switch with immediate visual feedback

### 2. Pricing Management
- **Current Price**: Dropdown with preset values ($30, $40, $50, $60, $80, $100, $120, $200, $300)
- **Was Price** (optional): Same preset dropdown for sale pricing
- **Multiple Price Points**: Ability to add multiple pricing tiers
- **Price History**: View previously set prices
- **Bulk Pricing**: Set prices across multiple strains

### 3. AI-Powered Description Regeneration
- **Current Description Display**: Show existing strain description
- **Human Guidance Input**: Large text area for budtender notes/corrections
- **Regeneration Trigger**: Button to regenerate description using AI
- **Description History**: View previous descriptions and revert if needed
- **Approval Workflow**: Preview new description before saving

### 4. Effect & Flavor Profile Management
- **Effect Profiles**: 
  - Visual chips showing current effects
  - Add/remove individual effects
  - Intensity sliders (1-5 scale)
  - Color coding for effect categories
- **Flavor Profiles**:
  - Similar interface to effects
  - Flavor intensity controls
  - Visual flavor wheel or grid selection

### 5. Advanced Features
- **Terpene Information**: Optional detailed terpene breakdown
- **Medical Uses**: Checkboxes for common medical applications
- **Batch Editing**: Select multiple strains for bulk operations
- **Change Tracking**: Audit trail of who changed what and when
- **Validation**: Prevent invalid combinations or missing required fields

## User Interface Design Principles

### 1. Progressive Disclosure
- Start with basic info (name, type, THC, stock status)
- Expandable sections for advanced features
- Clean, uncluttered initial view

### 2. Immediate Feedback
- Real-time validation
- Optimistic UI updates
- Clear success/error states
- Loading states for AI operations

### 3. Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Touch-friendly on mobile

## Technical Requirements

### 1. Data Validation
- Client-side validation for immediate feedback
- Server-side validation for security
- Type safety throughout the stack
- Rollback capability for failed operations

### 2. State Management
- Optimistic updates with rollback
- Conflict resolution for concurrent edits
- Auto-save functionality
- Change detection and dirty state tracking

### 3. API Integration
- RESTful endpoints for CRUD operations
- AI service integration for description generation
- Batch operation support
- Error handling and retry logic

### 4. Performance
- Debounced auto-save
- Lazy loading for large strain lists
- Efficient re-rendering
- Image optimization for strain photos

## User Workflows

### 1. Quick Edit Workflow
1. User clicks edit button on strain card
2. Inline editing mode activates
3. User makes changes (stock status, price)
4. Changes auto-save on blur/enter
5. Visual confirmation of save

### 2. Detailed Edit Workflow
1. User opens full strain editor
2. Tabbed interface shows different aspects
3. User modifies multiple fields
4. Preview changes before saving
5. Batch save with validation

### 3. AI Description Regeneration Workflow
1. User provides guidance text
2. System shows current vs. proposed description
3. User can iterate with additional guidance
4. Final approval and save process

## Error Handling & Edge Cases

### 1. Network Issues
- Offline capability for viewing
- Queue changes when offline
- Sync when connection restored
- Conflict resolution strategies

### 2. Concurrent Editing
- Lock mechanism for active edits
- Merge conflict resolution
- Last-writer-wins with warnings
- Change notification system

### 3. Data Integrity
- Prevent invalid price combinations
- THC/CBD percentage validation
- Required field enforcement
- Referential integrity checks

## Success Metrics
- Reduced time to update strain information
- Decreased validation errors
- Improved user satisfaction scores
- Reduced support requests for editing issues

## Implementation Phases

### Phase 1: Core Editing
- Basic strain info editing
- Stock status management
- Simple pricing
- Form validation

### Phase 2: Enhanced Features
- AI description regeneration
- Effect/flavor profile editing
- Batch operations
- Change history

### Phase 3: Advanced Features
- Terpene management
- Advanced validation
- Conflict resolution
- Performance optimizations

## Phase 1 Implementation Details

### Components to Create
1. `StrainEditModal` - Main modal for editing strain details
2. `StrainBasicInfoForm` - Form for name, type, THC/CBD percentages
3. `StrainPricingForm` - Pricing management component
4. `StrainStockToggle` - Enhanced stock status control
5. `useStrainEditor` - Hook for strain editing logic

### User Experience Flow
1. User clicks "Edit" button on strain card
2. Modal opens with current strain data
3. Tabbed interface shows Basic Info and Pricing
4. Real-time validation and save feedback
5. Changes persist with optimistic updates
