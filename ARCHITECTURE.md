# First mobile skeleton: architecture notes

This skeleton is intentionally separate from the existing Vue 2 + Element UI desktop project.

## Desktop project observations used here

- Existing frontend is Vue 2 + Vue Router 3 + Vuex + Element UI.
- Existing frontend already uses some Vant 2 components, so Vant is a natural direction for the mobile UI.
- Existing backend is accessed through `https://api.quickysharing.cn` and the desktop code uses `withCredentials`, so the mobile Axios client preserves credentials.
- Existing routing includes files, file details, search, profile, ranking, extract code, messages, photos, tags, suggestions/report, login and registration.
- Existing WebSocket messaging is treated as a separate later phase rather than being implemented in this first skeleton.

## Mobile choices

- Vue 3 + Vite + TypeScript
- Vant 4
- Pinia
- Vue Router 4
- Axios
- vue-i18n

## First phase intentionally does NOT implement

- Real file listing/upload/download endpoints
- Real authentication callback/login request implementation
- WebSocket/STOMP chat
- Full file preview flow
- All desktop pages
- Complete backend error-code mapping

The point of this phase is to verify the new project boots, the mobile navigation pattern is comfortable, the i18n structure works, and the project boundaries are clean before business logic is migrated incrementally.
