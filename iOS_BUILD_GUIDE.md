# Mythos Arena – iOS Build & Deployment Guide

This guide covers all methods to run and build Mythos Arena on iOS devices, from local development to App Store submission.

---

## Option 1: Quick Testing with Expo Go (Fastest – 5 minutes)

**Best for:** Quick testing and development without building a native app.

### Prerequisites
- iPhone or iPad with iOS 15.1+
- Expo Go app installed from App Store (free)
- Same WiFi network as your development machine

### Steps

1. **Start the development server:**
   ```bash
   cd /home/ubuntu/mythos-arena
   pnpm dev
   ```
   
   You'll see output like:
   ```
   Metro Bundler running at: https://8081-iuyqy30lee7rzkqnmtymh-7e290142.us2.manus.computer
   Expo QR Code: exps://8081-iuyqy30lee7rzkqnmtymh-7e290142.us2.manus.computer
   ```

2. **Open Expo Go on your iPhone:**
   - Launch the Expo Go app
   - Tap the QR code scanner icon (top-right)
   - Scan the QR code from the terminal output

3. **App loads instantly** – You can now test all features on your real device!

### Limitations
- Expo Go is not a production app – it's for development only
- Cannot submit to App Store
- Some native features may not work (e.g., background tasks)
- Requires Expo Go app to run

---

## Option 2: Build a Standalone iOS App (Recommended for Distribution)

### Prerequisites
- Apple Developer Account ($99/year)
- Mac with Xcode 15+ (or use EAS Build cloud service)
- iOS 15.1+ device for testing

### Method A: Using EAS Build (Cloud – Easiest)

**EAS Build** is Expo's cloud build service – you don't need a Mac or Xcode locally.

#### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

#### Step 2: Authenticate with Expo
```bash
eas login
```
(Enter your Expo account credentials)

#### Step 3: Configure EAS Build
```bash
eas build:configure
```
This creates `eas.json` in your project.

#### Step 4: Build for iOS
```bash
eas build --platform ios --profile preview
```

**Build profiles:**
- `preview` – Development build (for testing)
- `production` – Release build (for App Store)

The build takes 10–20 minutes. Once complete, you'll get a download link for the `.ipa` file.

#### Step 5: Install on Your Device
Option A – Using TestFlight (Recommended):
```bash
eas submit --platform ios --latest
```
This automatically submits to TestFlight. Testers can install via a link.

Option B – Manual Installation:
- Download the `.ipa` file
- Use Xcode or Apple Configurator 2 to install on your device

---

### Method B: Local Build with Xcode (Advanced)

**Requirements:**
- Mac with Xcode 15+
- Apple Developer Account
- iOS 15.1+ device

#### Step 1: Install Xcode Command Line Tools
```bash
xcode-select --install
```

#### Step 2: Generate Native iOS Project
```bash
cd /home/ubuntu/mythos-arena
eas build --platform ios --local
```

#### Step 3: Open in Xcode
```bash
open ios/MythosArena.xcworkspace
```

#### Step 4: Configure Signing
1. In Xcode, select your project in the left sidebar
2. Go to **Signing & Capabilities**
3. Select your team from the dropdown
4. Xcode auto-generates provisioning profiles

#### Step 5: Build & Run
- Connect your iPhone via USB
- Select your device from the device dropdown (top-left)
- Press **Cmd + R** to build and run

---

## Option 3: TestFlight Distribution (For Beta Testing)

**Best for:** Sharing with testers before App Store release.

### Prerequisites
- Apple Developer Account
- TestFlight app installed on test devices

### Steps

1. **Build for TestFlight:**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Submit to TestFlight:**
   ```bash
   eas submit --platform ios --latest
   ```

3. **Invite Testers:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Navigate to your app → TestFlight
   - Add tester emails
   - Testers receive an invite link and can install via TestFlight app

---

## Option 4: App Store Submission (Production Release)

### Prerequisites
- Apple Developer Account ($99/year)
- Completed app metadata (name, description, screenshots, privacy policy)
- App icon and screenshots (1024×1024 for icon, specific sizes for screenshots)

### Steps

1. **Create App Store Listing:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Click **My Apps** → **+** → **New App**
   - Fill in app name, bundle ID, SKU, and primary language

2. **Build for Production:**
   ```bash
   eas build --platform ios --profile production
   ```

3. **Submit to App Store:**
   ```bash
   eas submit --platform ios --latest
   ```

4. **Complete App Store Connect:**
   - Add app description, keywords, category
   - Upload screenshots (5 required)
   - Set pricing and availability
   - Add privacy policy URL
   - Complete app review information

5. **Submit for Review:**
   - Click **Submit for Review** in App Store Connect
   - Apple reviews your app (typically 24–48 hours)
   - Once approved, your app goes live!

---

## Troubleshooting

### "Build Failed" Error
- Check your Apple Developer Account is active
- Verify bundle ID matches your provisioning profile
- Run `eas build --platform ios --profile production --clear-cache`

### "Certificate Expired" Error
- Go to [App Store Connect](https://appstoreconnect.apple.com) → Certificates
- Revoke expired certificate and create a new one
- Run `eas build --platform ios --profile production` again

### App Crashes on Launch
- Check console logs: `eas build:logs --platform ios`
- Verify all native dependencies are installed
- Ensure `app.config.ts` has correct bundle ID

### "Provisioning Profile Not Found"
- Run `eas device:create` to register your test device
- Ensure your Apple Developer Account has an active team

---

## Quick Reference: Build Commands

| Task | Command |
|------|---------|
| Test with Expo Go | `pnpm dev` + scan QR code |
| Build for testing (cloud) | `eas build --platform ios --profile preview` |
| Build for production (cloud) | `eas build --platform ios --profile production` |
| Submit to TestFlight | `eas submit --platform ios --latest` |
| Submit to App Store | `eas submit --platform ios --latest` |
| Build locally (requires Mac) | `eas build --platform ios --local` |
| View build logs | `eas build:logs --platform ios` |

---

## Next Steps

1. **Immediate Testing:** Use Expo Go (Option 1) to test on your device right now
2. **Beta Testing:** Use TestFlight (Option 3) to share with friends/testers
3. **Production Release:** Submit to App Store (Option 4) when ready

---

## Additional Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Apple Developer Program](https://developer.apple.com/programs/)

---

## Support

For issues or questions:
- Check [Expo Forums](https://forums.expo.dev)
- Review [Expo GitHub Issues](https://github.com/expo/expo/issues)
- Contact Apple Developer Support via [App Store Connect](https://appstoreconnect.apple.com)
