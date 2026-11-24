# Project Guidance

## User Preferences

- Premium dark navy and black theme with neon cyan and turquoise highlights
- Modern glassmorphism UI with smooth animations and transitions
- No dark/light mode switch
- Indian currency format (₹)
- Bottom navigation on mobile, sidebar navigation on desktop
- Mobile-first responsive design
- Exactly seven membership plans; no other plans
- ₹500 plan styled as MOST POPULAR with a glowing cyan border
- No fake payment success, fake wallet balances, fake earning records or fake testimonials

## Accepted Requirements

[Filled after each deployed build — what the user asked for and the build delivered]

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Backend is Motoko at src/backend/main.mo with domain libs under src/backend/lib and API mixins under src/backend/mixins; mops.toml lives at the app root, so add missing caffeineai-* packages with mops add <pkg> from the project root.
- Email-verification mixin state is VerifiedEmails.State, not Map<Text,Bool>; use VerifiedEmails.contains.
- Private helpers with the same name in multiple mixins collide when included into one actor; rename per mixin.
- OQL manual entities need a top-level Entity import for .payload and MapEntity.toEntityManual takes two type args <K, V>; variant fields project to Text via switch.
- Referral records must be created at registration in src/backend/lib/users.mo register() so the payment-approval eligibility and admin reward-credit paths have a record to act on.
- Frontend uses React 19, Tailwind CSS with OKLCH tokens in src/frontend/src/index.css, shadcn/radix UI under src/frontend/src/components/ui, lucide-react, motion, tanstack-router and tanstack-react-query.
- Auth uses InternetIdentityProvider and useInternetIdentity from @caffeineai/core-infrastructure; never import @dfinity/internet-identity-react.
- The backend actor factory is createActor from @/backend and useActor comes from @caffeineai/core-infrastructure; wrap them in React Query hooks and never use local sample data as primary state.
- TanStack Router v1 code-based routes nest pages under a pathless shellRoute whose component renders Layout with Outlet; private routes wrap the page component in RequireRole.
- Generated bindings type FileRef as raw Uint8Array and skip the platform upload/download conversion, so FileRef fields need StorageClient.putFile/getDirectURL with the !caf! sentinel handled in app code.
- motion/react re-exports useReducedMotion; gate entrance animations with initial={reduceMotion ? false : ...} and add motion-reduce:animate-none to animate-pulse skeletons.
- Biome useSemanticElements rejects role="status" on <p>; use <output> for status messages.
- No global sonner Toaster is mounted in main.tsx or Layout; pages that need toasts mount their own or use inline state for transient feedback.
- The app has no caller-facing active-membership getter; derive membership name/expiry from the latest approved payment joined with MembershipPlan.validityDays.
- Verified commands: backend mops check --fix and mops build from src/backend; frontend pnpm typecheck and pnpm fix from src/frontend; pnpm bindgen from the project root.
