# Mythos Arena – Project TODO

## Phase 1: Project Setup & Infrastructure
- [ ] Initialize Expo project with TypeScript and NativeWind
- [ ] Set up Firebase project and configure authentication (email, Google, Apple)
- [ ] Configure Firestore database schema for users, questions, scores, leaderboards
- [ ] Set up Firebase Realtime Database for PvP matchmaking
- [ ] Configure Firebase Cloud Functions for daily challenge generation
- [ ] Set up push notifications (Firebase Cloud Messaging)
- [ ] Create local SQLite database schema for offline mode
- [ ] Generate app icon and splash screens (branding assets)

## Phase 2: Data & Content
- [ ] Create 1000+ mythology quiz questions (150+ per pantheon, Easy/Medium/Hard)
  - [ ] Greek mythology (150 questions)
  - [ ] Norse mythology (150 questions)
  - [ ] Egyptian mythology (150 questions)
  - [ ] Tolkien legendarium (150 questions)
  - [ ] Celtic mythology (150 questions)
  - [ ] Hindu mythology (150 questions)
  - [ ] Japanese/Shinto mythology (150 questions)
- [ ] Populate Firestore with question collection
- [ ] Create "Did You Know?" fact snippets for each question
- [ ] Define achievement/badge system (unlock conditions, icons)
- [ ] Define player level titles (1–50 levels with names)

## Phase 3: Core UI Components & Navigation
- [x] Create theme system (dark base, gold accents, pantheon-specific palettes)
- [x] Build ScreenContainer component with SafeArea handling
- [ ] Create bottom tab navigation (Home, Profile, Leaderboard, Settings)
- [ ] Build splash screen with logo animation
- [ ] Create authentication screens (sign up, login, OAuth)
- [x] Build home screen with temple/hall visual and mode buttons
- [x] Create pantheon selection grid with lock/unlock status
- [ ] Build settings screen (audio, brightness, language, sign out)

## Phase 4: Quiz Gameplay Engine
- [ ] Implement 15-second countdown timer with visual ring
- [ ] Build quiz screen with 4 multiple-choice answers
- [ ] Create answer validation and feedback system
- [ ] Implement animated feedback (green flash for correct, red for wrong)
- [ ] Add sound effects (correct chime, wrong buzz, timer alert)
- [ ] Implement streak tracking and multiplier display (3x, 5x, 10x)
- [ ] Create lifelines system (50/50, Skip, Extra Time)
- [ ] Implement XP calculation (base + speed + streak bonus)
- [ ] Build results screen with round summary and XP breakdown
- [ ] Create "Did You Know?" fact display after each answer

## Phase 5: Game Modes
- [ ] Implement Quick Play mode (random 10-question round)
- [ ] Implement Pantheon Campaign mode (5 stages + boss round)
- [ ] Implement Daily Challenge mode (unique daily questions, leaderboard)
- [ ] Implement Endless Mode (questions until 3 wrong, streak tracking)
- [ ] Implement Versus Mode (PvP matchmaking, real-time sync)
- [ ] Create game mode selection screen
- [ ] Implement mode-specific difficulty and timer adjustments

## Phase 6: Progression & Achievements
- [ ] Implement XP system and player leveling (1–50 levels)
- [ ] Create achievement/badge system with unlock conditions
- [ ] Build achievement detail screen with full list
- [ ] Implement unlockable avatar frames (pantheon-themed)
- [ ] Create player profile screen with stats and unlocked items
- [ ] Implement level titles (Mortal, Initiate, Demigod, Mythkeeper, Titan, Allfather)
- [ ] Create level-based pantheon unlocking (Norse at Level 5, etc.)

## Phase 7: Leaderboards & Social
- [ ] Implement global leaderboard (top 100 players)
- [ ] Implement daily challenge leaderboard
- [ ] Implement pantheon-specific leaderboards
- [ ] Create leaderboard screen with tabs and player ranking
- [ ] Implement player profile viewing (tap leaderboard entry)
- [ ] Set up Firebase Cloud Functions for leaderboard computation

## Phase 8: Firebase Integration
- [ ] Integrate Firebase Auth (email, Google, Apple sign-in)
- [ ] Implement user profile storage in Firestore
- [ ] Implement score and progression sync to Firestore
- [ ] Implement offline mode with local SQLite sync
- [ ] Set up Firebase Realtime Database for PvP matchmaking
- [ ] Implement push notifications for daily challenges
- [ ] Create Firebase security rules for data access
- [ ] Implement analytics tracking (Firebase Analytics)

## Phase 9: Audio & Sound Design
- [ ] Integrate background music (ambient crackling fire, thunder, wind)
- [ ] Add UI tap sound effects
- [ ] Add correct answer chime
- [ ] Add wrong answer buzz
- [ ] Add timer alert beep (escalating at 5 seconds)
- [ ] Add victory fanfare
- [ ] Add level-up sound
- [ ] Implement audio toggle in settings
- [ ] Implement audio ducking (lower music when SFX plays)

## Phase 10: Animations & Polish
- [ ] Implement page transition animations (fade in/out)
- [ ] Implement button press feedback (scale 0.95)
- [ ] Implement correct answer animation (green flash + bounce)
- [ ] Implement wrong answer animation (red shake + fade)
- [ ] Implement timer ring rotation and color change
- [ ] Implement streak multiplier pulse animation
- [ ] Implement achievement unlock animation (scale + confetti)
- [ ] Implement lifeline fade-out animation
- [ ] Optimize animations for 60fps performance

## Phase 11: Monetization (Optional)
- [ ] Implement rewarded video ads (earn lifelines)
- [ ] Implement "Patron of the Gods" one-time purchase (remove ads)
- [ ] Set up in-app purchase integration (RevenueCat or native)
- [ ] Create monetization screens (ad prompts, purchase confirmation)

## Phase 12: Testing & Quality Assurance
- [ ] Test all quiz flows end-to-end
- [ ] Test offline mode (local SQLite sync)
- [ ] Test Firebase authentication and data sync
- [ ] Test PvP matchmaking and real-time sync
- [ ] Test push notifications
- [ ] Test leaderboard updates
- [ ] Test achievement unlocks
- [ ] Test accessibility (text scaling, screen readers, haptics)
- [ ] Test on iOS and Android devices
- [ ] Performance testing (60fps animations, smooth scrolling)
- [ ] Load testing (concurrent users, leaderboard queries)

## Phase 13: Documentation & Delivery
- [ ] Write README with setup instructions
- [ ] Document architecture and data flow
- [ ] Write Firebase configuration guide
- [ ] Document how to add new questions
- [ ] Create build instructions for iOS and Android
- [ ] Generate APK and IPA builds
- [ ] Prepare release notes
- [ ] Create user onboarding guide

## Completed
- [x] Phase 1: Project initialization with Expo and TypeScript
- [x] Phase 2: Architecture design and 433 mythology questions database
- [x] Phase 3 (Partial): Theme system, home screen, pantheon selection, game context, type definitions

