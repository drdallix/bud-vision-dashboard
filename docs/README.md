
# DoobieDB - Cannabis Strain Database

## Project Overview
DoobieDB is a cannabis strain database application that allows users to scan, browse, and manage cannabis strain information for dispensary use.

## Current Architecture Issues
Based on code analysis, here are the main readability and maintainability issues:

### 1. **File Organization Problems**
- Large, monolithic components (BrowseStrains/index.tsx is 219 lines)
- Mixed concerns within single files
- Inconsistent file naming and structure
- Re-export files that just point to other files

### 2. **Component Complexity**
- Components handling too many responsibilities
- Complex prop drilling
- Mixed UI and business logic
- Inconsistent state management patterns

### 3. **Type System Issues**
- Complex type conversions between database and UI
- Legacy type support creating confusion
- Inconsistent data flow patterns

### 4. **Utility Function Scattered Logic**
- Business logic mixed with utility functions
- Inconsistent naming conventions
- Complex conversion functions that are hard to follow

## Next Steps
See `refactor-plan.md` for detailed refactoring strategy.
