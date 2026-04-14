# Mythos Arena – Mobile App Design

## Overview

**Mythos Arena** is an epic mythology trivia game with dark, atmospheric UI featuring gold accents, ancient textures, and dramatic typography. The app targets iOS and Android with portrait orientation (9:16) optimized for one-handed usage.

---

## Screen List

1. **Splash Screen** – App logo and loading animation
2. **Auth Screen** – Sign up / Login (email, Google, Apple)
3. **Home Screen** – Temple/hall with pantheon doors, quick stats, daily challenge CTA
4. **Pantheon Selection** – Grid of 7 mythology pantheons with lock/unlock status
5. **Campaign Mode Screen** – 5 stages per pantheon, boss round at stage 5
6. **Quick Play Mode** – Random 10-question round selection
7. **Daily Challenge Screen** – Today's unique challenge + leaderboard
8. **Endless Mode Screen** – Streak counter, current question count
9. **Versus Mode Matchmaking** – Find opponent, waiting state
10. **Quiz Screen** – Main gameplay: question, 4 answers, timer ring, feedback
11. **Results Screen** – Round summary, XP earned, streak info, next action CTA
12. **Profile Screen** – User stats, level, title, achievements, avatar frames
13. **Leaderboard Screen** – Global/daily/pantheon-specific rankings
14. **Settings Screen** – Audio toggle, brightness, language, sign out
15. **Achievement/Badge Detail** – Full achievement list with unlock conditions

---

## Primary Content and Functionality

### Splash Screen
- **Content:** Mythos Arena logo (animated), loading bar
- **Functionality:** Auto-advance to Auth or Home after 2–3 seconds

### Auth Screen
- **Content:** Email input, password input, sign-up/login buttons, OAuth options (Google, Apple)
- **Functionality:** Validate credentials, create account, sign in, store auth token

### Home Screen
- **Content:** 
  - Stylized temple/hall background with doors to each pantheon
  - Player name, current level, XP progress bar
  - Quick stats: total XP, streak, achievements unlocked
  - Daily Challenge card (prominent CTA)
  - Game mode buttons: Quick Play, Campaign, Endless, Versus
- **Functionality:** Navigate to game modes, view profile, access settings

### Pantheon Selection
- **Content:** 7 pantheon cards (Greek, Norse, Egyptian, Tolkien, Celtic, Hindu, Japanese) with lock icons if not unlocked
- **Functionality:** Tap to enter Campaign mode, show unlock level requirement

### Campaign Mode Screen
- **Content:** Pantheon name, 5 stage cards, boss round indicator on stage 5
- **Functionality:** Tap stage to start quiz, show stage progress, unlock next stage on completion

### Quick Play Mode
- **Content:** Random pantheon selector, difficulty filter (Easy/Medium/Hard), start button
- **Functionality:** Generate random 10-question quiz from unlocked pantheons

### Daily Challenge Screen
- **Content:** Today's challenge card, leaderboard with top 10 players, player's current rank
- **Functionality:** Start challenge, view live leaderboard, see daily reset timer

### Endless Mode Screen
- **Content:** Current streak counter, highest streak badge, start button
- **Functionality:** Begin endless round, track streak in real-time

### Versus Mode Matchmaking
- **Content:** "Finding opponent..." message, cancel button, player avatar/level
- **Functionality:** Match with another player, sync questions in real-time

### Quiz Screen
- **Content:**
  - Pantheon name + current question number (e.g., "Greek 3/10")
  - Question text
  - 4 multiple-choice answer buttons
  - Circular timer ring (15 seconds, color changes red at 5 seconds)
  - Current streak multiplier (3x, 5x, 10x)
  - Lifelines available (50/50, Skip, Extra Time)
- **Functionality:** 
  - Tap answer to submit
  - Animated feedback (green flash for correct, red for wrong)
  - Sound effects (correct chime, wrong buzz)
  - Timer countdown with visual ring
  - Lifeline usage (remove wrong answers, skip, add 10 seconds)
  - Auto-advance to next question or results

### Results Screen
- **Content:**
  - Round summary (e.g., "8/10 Correct")
  - XP earned breakdown (base + speed + streak bonus)
  - Streak info (maintained or broken)
  - Achievement unlocked (if any)
  - Next button (continue to next round or return home)
- **Functionality:** Show detailed stats, unlock achievements, navigate next

### Profile Screen
- **Content:**
  - Player avatar + name + title (e.g., "Demigod")
  - Level progress bar
  - Total XP, total questions answered, win rate
  - Unlocked achievements grid
  - Unlocked avatar frames
- **Functionality:** Edit profile, view achievement details, change avatar frame

### Leaderboard Screen
- **Content:**
  - Tabs: Global, Daily, Pantheon-specific
  - Top 10 players with rank, name, level, score
  - Player's current rank highlighted
- **Functionality:** Tap player to view profile, refresh leaderboard

### Settings Screen
- **Content:**
  - Audio toggle (background music, SFX)
  - Brightness control
  - Language selector
  - Sign out button
- **Functionality:** Save preferences, toggle audio, change language, logout

---

## Key User Flows

### Flow 1: New Player Onboarding
1. Splash → Auth (sign up)
2. Auth → Home (tutorial or first quiz)
3. Home → Quick Play (random 10-question round)
4. Quiz → Results → Home

### Flow 2: Campaign Progression
1. Home → Pantheon Selection
2. Pantheon Selection → Campaign Mode (Greek selected)
3. Campaign Mode → Stage 1 (5 questions)
4. Quiz → Results → Campaign Mode (stage 1 complete)
5. Campaign Mode → Stage 2 (unlock next stage)
6. Repeat until Stage 5 (boss round, harder questions, shorter timer)

### Flow 3: Daily Challenge
1. Home → Daily Challenge
2. Daily Challenge → Quiz (10 unique questions)
3. Quiz → Results (XP + leaderboard rank)
4. Results → Leaderboard (view global rankings)

### Flow 4: Endless Mode
1. Home → Endless Mode
2. Endless Mode → Quiz (questions until 3 wrong)
3. Quiz → Results (streak count, XP)
4. Results → Home (offer retry or pantheon selection)

### Flow 5: Versus (PvP)
1. Home → Versus Mode
2. Versus Mode → Matchmaking (waiting for opponent)
3. Matchmaking → Quiz (same questions, real-time sync)
4. Quiz → Results (higher score wins, XP awarded)
5. Results → Leaderboard (PvP rankings)

---

## Color Choices

### Base Theme (Dark)
- **Background:** Deep black (`#0a0a0a`)
- **Surface:** Dark stone/marble (`#1a1a1a`)
- **Foreground:** Cream/off-white (`#f5f5f0`)
- **Muted:** Dim gold (`#8b7355`)
- **Border:** Dark gold (`#3d3d3d`)

### Accent Colors (Gold & Bronze)
- **Primary (Gold):** `#d4af37` (highlights, buttons, progress bars)
- **Secondary (Bronze):** `#b87333` (secondary actions, badges)
- **Success (Green):** `#4ade80` (correct answers, achievements)
- **Error (Red):** `#ef4444` (wrong answers, warnings)
- **Warning (Orange):** `#f59e0b` (timer alerts, lifeline usage)

### Pantheon-Specific Palettes

| Pantheon | Primary | Secondary | Accent |
|----------|---------|-----------|--------|
| **Greek** | White marble (`#f0f0f0`) | Laurel green (`#2d5016`) | Ocean blue (`#1e90ff`) |
| **Norse** | Dark wood (`#3e2723`) | Rune silver (`#c0c0c0`) | Ice blue (`#87ceeb`) |
| **Egyptian** | Sandstone (`#d2b48c`) | Scarab green (`#2d5016`) | Gold (`#ffd700`) |
| **Tolkien** | Forest green (`#228b22`) | Elvish silver (`#e8e8e8`) | Mithril blue (`#4169e1`) |
| **Celtic** | Moss green (`#6b8e23`) | Bronze (`#cd7f32`) | Mystical purple (`#9370db`) |
| **Hindu** | Saffron (`#ff9933`) | Indigo (`#4b0082`) | Sacred gold (`#ffd700`) |
| **Japanese** | Sakura pink (`#ff69b4`) | Midnight blue (`#191970`) | Cherry red (`#dc143c`) |

---

## Typography

- **Display Font:** "Playfair Display" or similar serif (headings, titles, pantheon names)
- **Body Font:** "Inter" or "Roboto" (body text, questions, answers)
- **Monospace Font:** "Courier New" (timers, scores, technical info)

---

## Layout Specifics

### Quiz Screen Layout (Portrait 9:16)
```
┌─────────────────────────────────┐
│ Greek 3/10 | ⏱ 15s | 3x Streak  │ ← Header (pantheon, timer, multiplier)
├─────────────────────────────────┤
│                                 │
│  [Timer Ring - Circular]        │ ← Visual timer (15s countdown)
│                                 │
├─────────────────────────────────┤
│ "Who was the king of the gods?" │ ← Question text (large, centered)
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ A) Zeus                     │ │ ← Answer buttons (4, stacked)
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ B) Poseidon                 │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ C) Hades                    │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ D) Apollo                   │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ [50/50] [Skip] [+10s] ← Lifelines│
└─────────────────────────────────┘
```

### Home Screen Layout
```
┌─────────────────────────────────┐
│ [Temple/Hall Background]        │
│                                 │
│ Level 12 | Demigod              │ ← Player info
│ XP: 4,200 / 5,000 [=====>]      │ ← Progress bar
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎯 Daily Challenge          │ │ ← Prominent CTA
│ │ 10 Questions | 1,500 XP     │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Quick Play] [Campaign]         │ ← Mode buttons
│ [Endless] [Versus]              │
│                                 │
│ [Profile] [Leaderboard]         │ ← Secondary actions
│ [Settings]                      │
└─────────────────────────────────┘
```

---

## Animations & Micro-Interactions

- **Page Transitions:** Fade in/out (200ms)
- **Button Press:** Scale to 0.95 (100ms)
- **Correct Answer:** Green flash + icon bounce (300ms)
- **Wrong Answer:** Red shake + icon fade (300ms)
- **Timer Ring:** Smooth rotation, color change at 5 seconds
- **Streak Multiplier:** Pulse animation when streak increases
- **Lifeline Usage:** Fade out used lifeline (200ms)
- **Achievement Unlock:** Scale up + confetti (500ms)

---

## Sound Design

- **Background Music:** Ambient crackling fire, distant thunder, wind (loops, 60–80 dB)
- **UI Tap:** Subtle metallic click (100ms)
- **Correct Answer:** Triumphant chime (300ms)
- **Wrong Answer:** Deep buzz/error tone (200ms)
- **Timer Alert:** Escalating beep at 5 seconds remaining
- **Victory Fanfare:** Epic orchestral swell (1s)
- **Level Up:** Ascending notes + bell chime (500ms)

---

## Accessibility

- **Text Sizes:** Support 1.0x–2.0x scaling
- **Screen Readers:** VoiceOver (iOS) and TalkBack (Android) support
- **High Contrast:** Ensure gold/dark contrast meets WCAG AA standards
- **Haptics:** Vibration feedback for key actions (answer submission, achievements)
- **Color Blind:** Avoid red/green-only indicators; use icons + text labels

---

## Responsive Considerations

- **Phones (5"–6.5"):** Full-screen portrait, optimized for one-handed thumb reach
- **Tablets (7"–10"):** Landscape support (future phase), centered content with max-width
- **Notch/Safe Area:** Handled by SafeArea component, no content overlap

