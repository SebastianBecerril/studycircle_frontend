# Components Directory

This directory contains all your Vue components organized by feature.

## Current Structure

```
components/
├── common/          # Reusable components (empty - ready for future components)
└── [feature]/      # Future: Feature-specific components
```

As you build out features, you can add subdirectories for:
- `auth/` - Authentication related components
- `community/` - Community-specific components
- `board/` - Community board components
- `classes/` - Course/enrollment components

## Naming Convention

- Use PascalCase for component files: `UserProfile.vue`
- Use kebab-case for component names in templates: `<user-profile>`
- Group related components in subdirectories

## Example Component Structure

```vue
<template>
  <!-- Your template -->
</template>

<script setup lang="ts">
// Your component logic
</script>

<style scoped>
/* Component-specific styles */
</style>
```
