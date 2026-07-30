# What changed

Scope: theme, typing indicator, Google login. Same flow, same routes,
same REST/socket contracts otherwise.

## Theme

- `index.html` now forces `class="dark"` on `<html>`. The app was
  already built around a single dark navy (#0a192f) look in the chat
  screens, but auth pages, `Button`, and `Input` were still the
  default light Tailwind template, and some components only used
  `dark:` variants (which follow OS preference, not this app's
  design). Forcing `dark` makes every `dark:` utility in the codebase
  apply consistently everywhere, no toggle needed.
- `index.css` — added the Inter font, a dark-matching scrollbar, and
  a couple of small animations (fade-in, typing dots).
- Rebuilt `Button`, `Input`, `ProtectedRoute`, `Home` to match the
  navy/indigo palette instead of the leftover light-mode defaults.
- Rebuilt `Login`, `Register`, `ForgotPassword`, `ResetPassword`,
  `VerifyEmail` with a shared `AuthCard` component, replaced every
  `alert()` with `react-hot-toast`, added loading states.
- Left `ChatSidebar`, `ChatWindow`, `ChatHeader`, `ChatItem`,
  `ChatList`, `MessageBubble`, `MessageList`, `MessageInput`,
  `UserSearch`, `Profile`, `FriendsTab`, `FriendRequestsTab` as-is —
  they already matched the theme well.

## Typing indicator

The backend (`sockets/socket.js`) and `MessageInput` already emitted
`typing` / `stopTyping` — nothing was listening on the receiving end.
- `SocketContext` now listens for `typing` / `stopTyping` and exposes
  `isTyping`, with a 3s safety-net timeout in case `stopTyping` is
  ever missed.
- `ChatHeader` shows an animated "typing..." indicator in place of
  the online/offline status while the other person is typing, and
  also now reads `onlineUsers` from `SocketContext` instead of its
  own duplicate socket listener.

## Google login

The backend already had a working `POST /auth/google` endpoint
(`googleLogin` in `authController.js`) and `GOOGLE_CLIENT_ID` in
`.env` — it just had no frontend entry point.
- Added the `@react-oauth/google` package.
- `main.jsx` wraps the app in `GoogleOAuthProvider` using
  `VITE_GOOGLE_CLIENT_ID`.
- New `GoogleAuthButton` component (used on both Login and Register)
  gets the Google credential, posts it to the existing `/auth/google`
  endpoint, and logs the user in exactly like a normal login. If
  `VITE_GOOGLE_CLIENT_ID` isn't set yet, it shows a disabled button
  instead of crashing.

## Setup

To actually enable Google sign-in you need a Google OAuth Client ID
(Google Cloud Console → APIs & Services → Credentials → OAuth Client
ID → Web application):

1. Add it to `Backend/.env` as `GOOGLE_CLIENT_ID=...` (already present
   as a placeholder).
2. Add the same ID to `Frontend/.env` as `VITE_GOOGLE_CLIENT_ID=...`
   (see `Frontend/.env.example`).
3. In the Google Cloud Console, add `http://localhost:5173` as an
   Authorized JavaScript origin for local dev.

Everything else runs the same as before:

```
cd Backend && npm install && npm run dev
cd Frontend && npm install && npm run dev
```

node_modules were stripped from this archive to keep it small.
