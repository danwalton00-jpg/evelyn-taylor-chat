# Evelyn Taylor Chat — iPhone-only source package

This Expo / React Native project targets iPhone and is intended to run on iOS 18.3.1. It is source code, not an already signed iPhone app. Actual compatibility must be confirmed by a successful EAS build and device test.

## Included in version 1.3.6
- Private owner setup/sign-in and password-change flow with device-local credential protection.
- Upload/change profile photo and edit the visitor display name.
- Visitor preview for **Evelyn Taylor** with one **Message** button only; no Add Friend button.
- A local app inbox and messages saved on this iPhone.
- Demo profile search and locally saved profile shortcuts.

## Important messaging limitations
The visitor profile is an **app profile**, not a Facebook account. Since no Facebook account exists, this app cannot create a real Facebook profile or direct messages to a Facebook inbox. The included chat stores messages locally on this device only. It does not send or receive messages from another phone, does not connect to Facebook/Messenger, and is not end-to-end encrypted. Do not use it for sensitive messages.

To support remote users, a secure backend must be implemented and deployed with authenticated accounts, authorization checks, encrypted transport, database storage, rate limits, abuse reporting/blocking, retention/deletion controls, and security tests. A public app also needs a privacy policy and account/data deletion workflow. Facebook Messenger access is a separate Page-based integration subject to Meta's current permissions, recipient eligibility, app review, and platform rules; it cannot access arbitrary personal inboxes or bypass restrictions.

## Build and install on iPhone
1. Extract this ZIP on a Mac or computer. Install Node.js 20 or newer.
2. From the project folder run:
   ```sh
   npm install
   npx eas-cli login
   npx eas-cli build:configure
   npm run build:ios
   ```
3. Follow Apple signing/distribution prompts. Depending on the chosen install method, Apple Developer membership and device registration may be required. Open the completed EAS installation link on your iPhone.

A ZIP itself cannot be installed directly. A successful cloud build and physical-device test have not been performed as part of this package preparation. This package uses Expo SDK 52, which is an older SDK. If current Expo/EAS tooling reports compatibility warnings, upgrade the Expo SDK and dependencies, then rebuild and retest before distributing. No cloud iOS build or physical-device test has been completed here.

See `ACCOUNT_SETUP.md` for the intended primary/recovery email configuration and the required steps before account recovery can be considered active. Those addresses are notes only and are not verified or wired to email delivery.

## Security and Meta integration
Owner sign-in is device-local. On a fresh installation, the first person opening the app can create the local owner account. The included `backend/` is a starter and is not deployed or wired into the app. Real Meta services require a Meta developer app, server-only secrets, approved permissions, a deployed HTTPS backend, and end-to-end testing. Never collect Facebook passwords in this app.

## iPhone configuration
- Bundle identifier: `com.evelyntaylor.metaprofilefinderchat`
- iPad support disabled; portrait orientation
- Android configuration removed
