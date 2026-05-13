# Social Capabilities Matrix — LiveShop Platform

This document defines what each social channel can do within the platform, ensuring the autopost and live engines only attempt supported actions.

## 1. Capability Definition
- **Autopost**: Ability to publish a recorded video/replay as a native post.
- **Live Stream**: Ability to receive an RTMPS stream and create a live session.
- **Product Sync**: Ability to link products to posts (e.g., TikTok Shop).
- **Comment Sync**: Ability to fetch and display comments in the LiveShop chat.

## 2. Platform Matrix

| Channel | Autopost | Live Stream | Product Sync | Comments |
| :--- | :---: | :---: | :---: | :---: |
| **YouTube** | ✅ | ✅ | ❌ | ✅ |
| **Facebook** | ✅ | ✅ | ❌ | ✅ |
| **Instagram** | ✅ | ⚠️ (Manual) | ❌ | ✅ |
| **TikTok** | ⚠️ (Partner) | ✅ | ✅ | ✅ |
| **Pinterest** | ✅ | ❌ | ❌ | ❌ |
| **X (Twitter)**| ✅ | ✅ | ❌ | ❌ |

## 3. Implementation Rules

### Social Account Connection
- Connections are stored in `social_accounts` with a reference to the `social_account_capabilities` table.
- **OAuth tokens** are NEVER stored in the mobile app.
- Discovery of targets (Pages, Channels) happens on the backend.

### Cap-Check Workflow
Before any `autopost_job` or `live_session` is created:
1. Query `social_account_capabilities` for the target account.
2. If the capability is `false`, block UI action and inform the user.
3. If capability is `manual`, provide the manual fallback instruction (e.g., Copy/Paste stream key).

### Fallback Policy
Manual fallback is the default for any channel whose API is unstable, requires manual approval, or has restrictive scopes.
