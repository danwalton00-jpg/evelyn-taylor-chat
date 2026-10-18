# Evelyn Taylor Chat — Web/PWA preparation

This package has been adjusted to target Expo Web and generate a static site that can be opened in Safari and added to an iPhone Home Screen. It has **not** been deployed, and the web build could not be verified in this environment because `npm install` did not complete (dependency download timed out).

## Required build environment
- Node.js 20 or newer
- Internet access to install npm packages
- Expo SDK 52 dependencies are older; upgrade and retest if current tooling reports compatibility issues.

## Build the web site
1. Unzip this package on a computer or cloud development environment.
2. Open a terminal in the `mpf_ios18` project folder.
3. Run:
   ```sh
   npm install
   npm run build:web
   ```
4. A successful Expo static export should create a `dist/` folder. If the command fails, read the first Expo/Metro error and fix that before deploying. Do not upload the source ZIP as if it were the website.

## Host it
Use a static HTTPS host such as Netlify or Cloudflare Pages:
- Build command: `npm run build:web`
- Publish/output directory: `dist`
- Node version: 20 (also pinned in `.nvmrc`)
- Install command: `npm install`

You can also build locally and upload the contents of `dist/` using the host's manual deploy feature. Use HTTPS. The app is not live until the host provides a URL and the site is tested at that URL. Netlify SPA fallback is configured in `public/_redirects`. See `REALTIME_MESSAGING_SETUP.md` for the separate requirements to activate live messages between users.

## Add to iPhone Home Screen
1. Open the deployed HTTPS URL in Safari on the iPhone.
2. Tap Share (square with upward arrow).
3. Choose **Add to Home Screen**. If not visible, scroll the share sheet.
4. Rename to **Evelyn Taylor Chat** and tap **Add**.

This installs a Home Screen shortcut/PWA-style web experience, not a signed native iOS application. Test launching, sign-in, navigation, image selection, reloads, and storage on the actual iPhone.

## Important security and product limitations
- Web sign-in uses browser-local storage as a compatibility fallback. A password hash in browser storage is not a secure server-backed identity system. Do not publish for sensitive use or rely on it as a privacy boundary.
- Owner account, profile settings, and chats remain local to the browser/device; they do not sync to another phone and may be cleared with browser data.
- The included backend is a starter and is not deployed or wired into the app. Remote messaging needs authenticated server APIs, a database, authorization checks, HTTPS, rate limits, abuse controls, retention/deletion procedures, and security tests.
- Real Meta functionality requires a Meta developer app, approved permissions, a secure backend and any required app review. This app does not search Facebook live or read arbitrary private profiles/inboxes.
- Before public distribution, add a privacy policy and data deletion process, and replace browser-local owner auth with server-backed authentication. Do not store Meta access tokens in frontend code.

## What changed for web compatibility
- Added `react-dom` and `react-native-web` dependencies.
- Added `web` and `build:web` npm scripts.
- Added Expo web/PWA metadata (app name, theme/background colors and favicon).
- Added a web-specific owner-auth adapter and browser-friendly alert/confirmation behavior.
- Updated the login/settings copy to disclose that browser storage is not iPhone Keychain.

## Verification status
- ZIP/source files prepared: yes.
- Dependency installation: not completed here (npm download timed out).
- Expo web export: not run successfully.
- HTTPS deployment: not done.
- iPhone Home Screen install/device test: not done.
