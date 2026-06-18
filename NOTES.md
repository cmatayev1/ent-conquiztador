# ent-conquiztador — Dev Notes

## Gotchas / things to remember

### Clerk: use <Show>, not <SignedIn>/<SignedOut>
Installed @clerk/nextjs 7.5.2 does NOT export SignedIn/SignedOut as
components (they come through as undefined). Use <Show when="signed-in">
and <Show when="signed-out"> instead. When following Clerk tutorials that
use <SignedIn>/<SignedOut>, translate them to <Show>. Revisit if Clerk
is upgraded to a version that exports them correctly.

### Convex auth.config.ts trusts DEV Clerk only
convex/auth.config.ts currently trusts the development Clerk instance
(bold-lamb-12.clerk.accounts.dev). At real launch with a custom domain +
pk_live keys, add the production Clerk domain to the providers list.

### Next.js pinned to 15 (not 16)
Downgraded from Next 16 to 15 because Next 16 + Turbopack didn't resolve
Clerk 7.5.2's exports. Next 15 + Clerk works reliably. middleware.ts is
the correct filename for Next 15 (Next 16 wanted proxy.ts).

### File editing: use VS Code editor, NOT terminal heredocs
`cat > file << 'EOF'` heredocs kept failing and contaminating files
(stray `cat` text written into source). Always create/edit files by
opening them in VS Code and pasting.

## Daily startup
1. cd to project
2. `npm run dev` in one terminal
3. `npx convex dev` in another terminal

## Stack
- Next.js 15 + TypeScript, deployed on Vercel (auto-deploy on git push)
- Clerk auth (email + Google), dev instance for now
- Convex database (EU/Ireland region: fabulous-frog-557)
- GitHub: cmatayev1/ent-conquiztador