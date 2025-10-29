# Components Directory

This directory contains all your Vue components organized by feature.

## Structure

```
components/
├── common/          # Reusable components (buttons, modals, etc.)
├── auth/           # Authentication related components
├── dashboard/      # Dashboard specific components
└── [feature]/      # Feature-specific components
```

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
