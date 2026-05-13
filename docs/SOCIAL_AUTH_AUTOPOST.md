# Social Auth + Autopost Architecture

LiveShop must allow sellers to connect their social channels inside the mobile app so that recorded videos, replays and supported live sessions can be published automatically and then linked back to the shoppable storefront.

## Principle

The app is the user experience; the backend is the trust boundary.

The mobile app can start OAuth and display safe account metadata, but it must never receive client secrets, access tokens or refresh tokens.

## Flow

```text
Seller opens LiveShop app
→ Social Connections
→ Connect YouTube / Meta / TikTok / Pinterest / LinkedIn / X
→ Backend creates OAuth session with state + PKCE
→ App opens system browser/AuthSession
→ Platform redirects to backend callback
→ Backend stores encrypted tokens
→ Backend discovers channels/pages/boards/profiles
→ App shows connected targets and autopost toggles
```

## Why system browser/AuthSession

Use system browser/AuthSession instead of embedded login forms. This respects platform security rules, prevents password capture inside the app and allows users to see the real platform consent screen.

## Token storage

Store tokens server-side only:

- encrypted access token
- encrypted refresh token when provided
- expiry
- scopes
- account target
- capability snapshot
- reconnect_required state

Never return tokens to React Native, Next.js browser pages or public APIs.

## Target model

A single user authorization can produce multiple publish targets:

- YouTube channel
- Facebook Page
- Instagram Business/Creator account linked to a Page
- TikTok profile
- Pinterest board
- LinkedIn member profile
- LinkedIn organization page
- X user

Autopost jobs must publish to a target, not just to a platform.

## Capabilities

Every target must have explicit capabilities:

- video publishing
- short/reel publishing
- live creation
- permalink collection
- insights reading
- manual fallback requirement
- app review requirement

The UI should show these statuses clearly.

## Recommended implementation order

1. Database migration `004_social_oauth_autopost.sql`.
2. OAuth session start/callback endpoints.
3. YouTube connector end-to-end.
4. Meta connector: Facebook Pages + Instagram Business/Creator.
5. Autopost worker and URL collection.
6. Mobile UI for connect/reconnect/disconnect.
7. TikTok, Pinterest, LinkedIn and X with capability gating.
8. Dashboard monitoring and error visibility.

## Channel-specific guardrails

### YouTube

Use OAuth authorization for uploads and live management. Server-side OAuth is preferred because the backend must refresh tokens and publish when the user is not actively in the app. The YouTube API uses OAuth 2.0 for actions such as uploading videos on behalf of the user.

### Meta/Facebook/Instagram

Use Facebook Login and Meta Graph API. For Instagram autopost, the account must be professional Business/Creator and connected to a Facebook Page. Store Page tokens/targets safely. Do not assume a personal Instagram profile can be autoposted.

### TikTok

TikTok direct posting requires the Content Posting API product, correct scopes and TikTok UX requirements such as querying creator info before direct post. Treat TikTok as capability-gated until approved.

### Pinterest

Connect the user's Pinterest account, list boards/sections and publish Pins to an explicitly selected board/section.

### LinkedIn

Separate personal profile and organization page posting. Video requires upload/register asset before creating the post.

### X/Twitter

Keep optional and plan-dependent. Validate API access before showing it as automatic.

## Mobile UX

Screens:

- SocialConnectionsScreen
- SocialConnectionDetailScreen
- SocialTargetPickerScreen
- AutopostSettingsScreen
- ReconnectRequiredScreen

States:

- connected
- missing_permissions
- reconnect_required
- pending_app_review
- manual_fallback_only
- disabled

## Security release gate

Do not release unless:

- OAuth state is random, hashed and single-use.
- PKCE is used where applicable.
- Tokens are encrypted at rest.
- Refresh tokens never leave backend.
- Logs contain no tokens.
- Disconnect/revoke works.
- Scope mismatch blocks publishing.
- Manual fallback exists.
- Every publish job references tenant_id + social_account_target_id + media_item_id.
