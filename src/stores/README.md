# Pinia Stores

This directory contains all Pinia stores for the StudyCircle application, organized by the 6 core concepts.

## Store Structure

Each store follows the Composition API pattern with:
- **State**: Reactive data using `ref()`
- **Getters**: Computed properties using `computed()`
- **Actions**: Methods for state manipulation

## Available Stores

### 1. `useAuthStore` - Authentication
- **Purpose**: User authentication and session management
- **Key State**: `currentUser`, `currentSession`, `isAuthenticated`
- **Key Actions**: `setUser()`, `setSession()`, `clearAuth()`
- **Persistence**: Auto-saves to localStorage

### 2. `useUserProfileStore` - User Profiles
- **Purpose**: User profile information management
- **Key State**: `currentProfile`, `profiles`
- **Key Actions**: `setCurrentProfile()`, `updateProfile()`, `addProfile()`

### 3. `useCommunityStore` - Communities
- **Purpose**: Community and membership management
- **Key State**: `communities`, `memberships`, `currentCommunity`
- **Key Actions**: `addCommunity()`, `addMembership()`, `setMemberRole()`

### 4. `useCommunityBoardStore` - Community Board
- **Purpose**: Posts and replies management
- **Key State**: `posts`, `replies`, `currentPost`
- **Key Actions**: `addPost()`, `addReply()`, `updatePost()`

### 5. `useCourseCatalogStore` - Course Catalog
- **Purpose**: Academic course structure management
- **Key State**: `terms`, `courses`, `sections`
- **Key Actions**: `addTerm()`, `addCourse()`, `addSection()`

### 6. `useUserEnrollmentsStore` - User Enrollments
- **Purpose**: User course enrollment management
- **Key State**: `enrollments`
- **Key Actions**: `addEnrollment()`, `updateEnrollmentVisibility()`

## Usage in Components

### Basic Usage
```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>
```

### Multiple Stores
```vue
<script setup lang="ts">
import { useStores } from '@/composables/useStores'

const { auth, userProfile, community } = useStores()
</script>
```

### Store Helpers
```vue
<script setup lang="ts">
import { useStoreHelpers } from '@/composables/useStores'

const { clearAllErrors, resetAllStores } = useStoreHelpers()
</script>
```

## Store Patterns

### Reactive State
All state is reactive and will automatically update the UI when changed.

### Computed Getters
Use computed properties for derived state that depends on other state.

### Action Methods
Actions are the only way to modify store state. They can be async.

### Error Handling
Each store has `isLoading` and `error` state for consistent error handling.

## Data Flow

1. **Components** call store actions
2. **Actions** update store state
3. **State changes** trigger reactive updates
4. **UI** automatically re-renders with new data

## Persistence

- **Auth Store**: Automatically persists to localStorage
- **Other Stores**: Can be extended with persistence as needed

## TypeScript Support

All stores are fully typed with TypeScript interfaces for:
- Store state
- Action parameters
- Return values
- API response types
