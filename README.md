# App Hub 3D -> APK

## Install dependencies (on your computer, Node 18+)
    npm install

This installs Capacitor (Android wrapper), Netlify CLI and Vercel CLI.

## Make the APK
Option A - cloud (no Android Studio): push this folder to GitHub.
The "Build APK" action produces app-debug.apk under Actions > Artifacts.

Option B - local (needs JDK 17 + Android SDK):
    npx cap add android
    npm run apk:debug
APK: android/app/build/outputs/apk/debug/app-debug.apk

## Deploy the web version
    npx netlify login && npm run deploy:netlify
    npx vercel login   && npm run deploy:vercel
