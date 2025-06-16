
# Tone Management Implementation Plan

## Overview
This feature allows users to customize the tone/persona used for product description generation. Users can create, manage, and switch between different tones that match their personality or customer base.

## 3-Step Implementation Plan

### Step 1: Database Schema & Profile Management
**Goal**: Set up database structure to store user tones and preferences

**Tasks**:
- Create `user_tones` table to store custom tones
- Add `default_tone_id` field to profiles table
- Create database functions for tone management
- Set up RLS policies for tone data

**Database Changes**:
```sql
-- Create user_tones table
CREATE TABLE public.user_tones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  persona_prompt TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add default_tone_id to profiles
ALTER TABLE public.profiles ADD COLUMN default_tone_id UUID REFERENCES public.user_tones(id);

-- Create built-in system tones
INSERT INTO public.user_tones (id, user_id, name, description, persona_prompt, is_default) VALUES
('00000000-0000-0000-0000-000000000001', NULL, 'Professional', 'Clean, informative, professional tone', 'Write in a professional, informative tone suitable for a medical dispensary. Be factual and helpful.', TRUE),
('00000000-0000-0000-0000-000000000002', NULL, 'Casual & Fun', 'Relaxed, friendly, conversational', 'Write in a casual, fun, and friendly tone. Use emojis and relatable language that appeals to younger customers.'),
('00000000-0000-0000-0000-000000000003', NULL, 'Educational', 'Detailed, scientific, educational', 'Write in an educational tone focusing on the science and benefits. Include detailed information about effects and compounds.');
```

### Step 2: Profile Popup & Tone Management UI
**Goal**: Create user interface for managing tones

**Components to Create**:
- `ProfilePopup.tsx` - Main profile management popup
- `ToneManager.tsx` - Component for managing user tones
- `ToneEditor.tsx` - Form for creating/editing tones
- `TonePreview.tsx` - Preview how descriptions look with different tones

**Features**:
- View all available tones (system + user created)
- Create new custom tones
- Edit existing user tones
- Delete user tones (not system tones)
- Set default tone for descriptions
- Preview tone changes

### Step 3: Integration with Description Generation
**Goal**: Apply selected tones to description generation

**Integration Points**:
- Update `regenerate-description` edge function to use tone
- Modify `StrainDescriptionForm` to show current tone
- Add tone selection to description regeneration
- Update existing descriptions with new tone (batch update)

**Edge Function Changes**:
- Accept `tone_id` parameter
- Fetch tone details from database
- Apply persona prompt to OpenAI requests
- Handle fallback to default tone

## Data Flow
1. User opens profile popup
2. User manages tones (create/edit/delete/set default)
3. When regenerating descriptions, system uses user's default tone
4. User can override tone for specific regenerations
5. All descriptions maintain consistency with selected tone

## Technical Considerations
- System tones cannot be deleted (user_id = NULL)
- Each user can have multiple custom tones
- Default tone preference stored in profile
- Tone changes apply to future generations, not retroactively
- Edge function handles tone lookup and application
- Graceful fallback if tone is deleted or unavailable

## Future Enhancements
- Tone sharing between users
- Pre-built tone templates
- A/B testing different tones
- Analytics on tone effectiveness
- Bulk description updates with new tones
