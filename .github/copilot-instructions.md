# Copilot Instructions

## Project Overview

This is a **Microsoft Teams Meeting Link Creator** — an embeddable React SPA that lets users sign in with Azure AD, create Teams meetings via Microsoft Graph, and share the meeting link. It is designed to integrate into external platforms like Moodle LMS via query-parameter-based return URLs.

## Commands

```bash
yarn start            # Dev server at http://localhost:3000
yarn build            # Production build (edu SKU, default)
yarn build:health     # Production build for the health SKU
```

There are no test or lint scripts defined. ESLint runs automatically via `react-scripts` during `start` and `build`.

## Architecture

The app is a Redux SPA using a **command/event middleware pattern**:

```
React Components → dispatch Commands → Redux Middleware → Service (Graph API)
                                                        → dispatch Events → Reducers
```

- **Commands** express intent: `CREATE_MEETING_COMMAND`, `OPEN_SIGNIN_DIALOG_COMMAND`
- **Events** express outcomes: `MEETING_CREATED_EVENT`, `SIGNIN_COMPLETE_EVENT`
- **Middleware** handles all async side-effects; reducers stay pure

State shape (from `RootReducer.ts`):
```
AppState
  ├── meeting: MeetingState   (inputMeeting, createdMeeting, creationInProgress)
  └── router: History         (connected-react-router)
```

Hash-based routing (`createHashHistory`) with these routes:
- `/` → `CreateLandingPage` — checks for signed-in user, redirects to `/signin` or `/createMeeting`
- `/signin` → `SigninPage`
- `/createMeeting` → `MeetingPage` — the form
- `/copyMeeting` → `CopyMeetingPage` — shown after creation when no `url` query param is present
- `/error` → `ErrorPage`

### Moodle LMS Integration

When launched from a Moodle editor, these query params are passed:
- `url` — Moodle base URL; triggers redirect back to Moodle after meeting creation
- `editor` — `atto` or `tiny` (determines return URL path)
- `courseid` — Moodle course ID
- `msession` — Moodle session key
- `locale` — UI locale override

After meeting creation, if `url` is present, the middleware (`meeting-creator/middleware.ts`) constructs a return URL to the appropriate Moodle editor plugin and redirects.

## Key Conventions

### Redux Action Naming
- Constants: `UPPER_SNAKE_CASE` with `_COMMAND` or `_EVENT` suffix
- Action interfaces: PascalCase matching the constant (e.g., `CreateMeetingCommand`)
- Union types per domain: `MeetingAction`, `AuthAction`

### Connected Components
Components use the `connect()` HOC (not hooks):
```typescript
const mapStateToProps = (state: AppState) => ({ ... });
const mapDispatchToProps = (dispatch: Dispatch) => ({ ... });
export default connect(mapStateToProps, mapDispatchToProps)(ComponentNameComponent);
```

### Service Factory Pattern
Services are created via factory functions, not singletons:
```typescript
export function createMeetingService() {
  return { async createMeeting(...) { ... } };
}
```

### Localization
- All user-facing strings go in `src/translations/{sku}/{locale}/strings.json`
- Use `<FormattedMessage id="..." />` in JSX or `translate('...')` in non-JSX contexts
- Two SKUs: `edu` (default) and `health` — controlled by `REACT_APP_SKU` env var
- Locale is detected from the `locale` query param or `navigator.languages`

### Formatting
Prettier config (`.prettierrc.json`): single quotes, semicolons, 2-space tabs, TypeScript parser.

## Authentication

Auth uses MSAL v1 (`UserAgentApplication`). The MSAL instance is a module-level singleton in `src/auth/msalApp.ts` (which re-exports from `msalApp.live.ts` or `msalApp.uat.ts`).

- **Scope**: `OnlineMeetings.ReadWrite`
- **Flow**: silent token acquisition, falls back to popup
- **MSAL redirect conflict**: `index.tsx` checks `window.location.hash` for MSAL parameters before rendering to prevent the app from fighting with MSAL's implicit flow redirect handling

To configure a new environment, update `clientId` and `postLogoutRedirectUri` in the appropriate `msalApp.*.ts` file.

## Microsoft Graph API

The only Graph call is in `src/meeting-creator/service.ts`:
```
POST https://graph.microsoft.com/beta/me/onlineMeetings
```
Uses the **beta** endpoint. Dates are passed as ISO strings. The `joinInformation.content` field is base64+URL-encoded iCalendar data — it is decoded to produce the `preview` field on `OnlineMeeting`.

## SKU Builds

Two deployment SKUs exist with separate translations and MSAL configs:
- **edu** (default): `yarn build`
- **health**: `yarn build:health` (sets `REACT_APP_SKU=health`)

Each SKU has its own translation files under `src/translations/{sku}/` and its own source strings in `src/localization/{sku}/strings.json`.
