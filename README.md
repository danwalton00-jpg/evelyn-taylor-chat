# Evelyn Taylor Chat — iPhone-only source package

This Expo / React Native project targets iPhone and is intended to run on iOS 18.3.1. It is source code, not an already signed iPhone app. Actual compatibility must be confirmed by a successful EAS build and a real device test.

## Included in version 1.3.6

- Private owner setup/sign-in and password-change flow with device-local credential protection.
- Upload/change profile photo and edit the visitor display name.
- Visitor preview for Evelyn Taylor with a single Message button and no Add Friend button.
- A local app inbox and messages saved on this iPhone.
- Demo profile search and locally saved profile shortcuts.

## Important messaging limitations

The visitor profile is an app profile, not a Facebook account. Because no Facebook account exists, this app cannot create a real Facebook profile or direct messages to a Facebook inbox. The included app behavior is therefore limited to local-only chat functionality unless a secure backend and real Meta integration are added.

To support remote users, a secure backend must be implemented and deployed with authenticated accounts, authorization checks, encrypted transport, database storage, rate limits, abuse reporting, and content moderation.

## Build and install on iPhone

1. Extract this ZIP on a Mac or computer. Install Node.js 20 or newer.
2. From the project folder, run:

   ```sh
   npm install
   npx eas-cli login
   npx eas-cli build:configure
   npm run build:ios
   ```

3. Follow the Apple signing and distribution prompts. Depending on the install method, an Apple Developer membership and device registration may be required. Open the completed EAS installation link on the iPhone and install the build.
4. Test the app on a real device before relying on it for production use.

A ZIP file cannot be installed directly. A successful cloud build and physical-device test have not been performed as part of this package preparation. This package uses Expo SDK 52, which is compatible with the project setup in the included source tree, but the final result still depends on the actual build environment and Apple signing configuration.

See ACCOUNT_SETUP.md for the intended primary and recovery email configuration and the required steps before account recovery can be considered active. Those addresses are notes only and are not verified email accounts.

## Security and Meta integration

Owner sign-in is device-local. On a fresh installation, the first person opening the app can create the local owner account. The included backend/ folder is a starter and is not deployed or wired into the app. Remote messaging and Meta features require a secure backend and proper app configuration.

## iPhone configuration

- Bundle identifier: com.evelyntaylor.metaprofilefinderchat
- iPad support disabled; portrait orientation only
- Android configuration removed

## Web / PWA preparation

A web-compatible version of the app has also been prepared for Expo Web and Safari-based install workflows. See WEB_DEPLOYMENT_GUIDE.md for the static hosting and Home Screen setup steps.
