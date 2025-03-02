# Dealer

![logo](/public/favicon.png)

_A self-hosted and cheap poker planning application for small teams_

An SPA intended to be run with the Firebase free tier. It expects the following environment variables to be present during build:

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

It will create its own collections once it connects successfully.

It's advisable to apply the security rules in `doc/firebase-security-rules.md` to prevent players from being able to do anything. These are not fully secure currently, but they provide a decent measure of sanity to the game.
