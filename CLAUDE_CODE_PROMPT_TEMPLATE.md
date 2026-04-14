# Claude Code Prompt Templates

Use these templates to get the best results from Claude Code. Copy and paste the entire template, then fill in the bracketed sections.

---

## Template 1: Code Review & Explanation

```
I have a React Native + Expo mobile app called Mythos Arena. It's a mythology quiz game.

Here's the project context:
[PASTE: QUICK_START_FOR_CLAUDE.md]

Please:
1. Review the [FILE/COMPONENT NAME] code
2. Identify any bugs or issues
3. Suggest improvements for [SPECIFIC AREA]
4. Explain how [FEATURE] works

Focus on:
- Code quality and TypeScript correctness
- Performance optimization
- Following the project's conventions
- Integration with GameContext
```

---

## Template 2: Add a New Feature

```
I have a React Native + Expo mobile app called Mythos Arena. It's a mythology quiz game.

Here's the project context:
[PASTE: QUICK_START_FOR_CLAUDE.md]

I need you to:

**Task:** [DESCRIBE WHAT YOU WANT]
Example: "Create a quiz screen with a 15-second countdown timer and answer feedback"

**File to create/edit:** [SPECIFY FILE PATH]
Example: "Create app/quiz.tsx"

**Requirements:**
- [REQUIREMENT 1]
- [REQUIREMENT 2]
- [REQUIREMENT 3]

**Design:**
- [DESIGN DETAIL 1]
- [DESIGN DETAIL 2]

**Integration:**
- Use GameContext for state management
- Follow the styling conventions from theme.config.js
- Use ScreenContainer for SafeArea handling
- Add TypeScript types

**Include:**
- Complete, working code
- Proper TypeScript interfaces
- Tailwind CSS styling
- Unit tests using Vitest
- Comments explaining key logic

Reference these files for context:
- lib/types.ts (type definitions)
- lib/game-context.tsx (state management)
- app/(tabs)/index.tsx (screen example)
- components/screen-container.tsx (layout pattern)
```

---

## Template 3: Fix a Bug

```
I have a React Native + Expo mobile app called Mythos Arena. It's a mythology quiz game.

Here's the project context:
[PASTE: QUICK_START_FOR_CLAUDE.md]

**Bug Description:**
[DESCRIBE THE BUG]
Example: "The pantheon selection screen shows all pantheons as unlocked, but they should be locked until the player reaches the required level"

**Expected Behavior:**
[WHAT SHOULD HAPPEN]

**Actual Behavior:**
[WHAT ACTUALLY HAPPENS]

**Error Message (if any):**
[PASTE ERROR]

**File(s) Involved:**
- [FILE 1]
- [FILE 2]

**What I've Already Tried:**
- [ATTEMPT 1]
- [ATTEMPT 2]

Please:
1. Identify the root cause
2. Provide the fix with complete code
3. Explain why the bug occurred
4. Suggest how to prevent similar bugs
5. Add tests to verify the fix
```

---

## Template 4: Refactor/Optimize Code

```
I have a React Native + Expo mobile app called Mythos Arena. It's a mythology quiz game.

Here's the project context:
[PASTE: QUICK_START_FOR_CLAUDE.md]

**Current Code:**
[PASTE THE CODE YOU WANT TO REFACTOR]

**Goals:**
- [GOAL 1: e.g., "Improve performance"]
- [GOAL 2: e.g., "Make code more readable"]
- [GOAL 3: e.g., "Reduce bundle size"]

**Constraints:**
- Must maintain same functionality
- Must follow project conventions
- Must use TypeScript
- Must include tests

Please:
1. Analyze the current code
2. Identify improvements
3. Provide refactored version
4. Explain the changes
5. Show performance/quality improvements
```

---

## Template 5: Implement Multiple Features

```
I have a React Native + Expo mobile app called Mythos Arena. It's a mythology quiz game.

Here's the project context:
[PASTE: QUICK_START_FOR_CLAUDE.md]

**Phase 4 Implementation:** Quiz Gameplay Engine

I need you to implement these features:

**Feature 1: Quiz Screen**
- Display current question and 4 answer buttons
- Show question number (e.g., "Question 3 of 10")
- Highlight selected answer
- File: Create app/quiz.tsx

**Feature 2: 15-Second Timer**
- Countdown from 15 seconds
- Visual ring that rotates and changes color (green → yellow → red)
- Auto-submit when timer reaches 0
- Haptic feedback at 5 seconds remaining
- File: Create components/quiz-timer.tsx

**Feature 3: Answer Feedback**
- Green flash + checkmark for correct answers
- Red shake + X for wrong answers
- Show "Did You Know?" fact after answer
- Disable buttons after answer is selected
- File: Create components/answer-feedback.tsx

**Feature 4: Lifelines System**
- 50/50: Remove 2 wrong answers
- Skip: Pass current question
- Extra Time: Add 5 seconds to timer
- Show lifeline buttons with usage count
- File: Create components/lifelines.tsx

**Feature 5: Sound Effects**
- Correct answer chime
- Wrong answer buzz
- Timer alert at 5 seconds
- Victory fanfare at end
- File: Create lib/sound-manager.ts

**Requirements:**
- Use GameContext for state
- Follow project styling conventions
- Add TypeScript types
- Include unit tests
- Handle edge cases
- Add comments

**Integration:**
- Connect to home screen
- Update GameContext with quiz state
- Persist results to AsyncStorage
- Calculate XP earned

Please provide:
1. All files with complete code
2. Type definitions
3. Unit tests
4. Integration instructions
5. Any new dependencies needed
```

---

## Template 6: Ask for Guidance

```
I have a React Native + Expo mobile app called Mythos Arena. It's a mythology quiz game.

Here's the project context:
[PASTE: QUICK_START_FOR_CLAUDE.md]

**Question:** [YOUR QUESTION]
Example: "How should I structure the PvP matchmaking system?"

**Context:**
[PROVIDE CONTEXT]

**What I'm Trying to Achieve:**
[DESCRIBE YOUR GOAL]

**Constraints:**
- [CONSTRAINT 1]
- [CONSTRAINT 2]

Please:
1. Explain the best approach
2. Show code examples
3. List pros and cons
4. Recommend tools/libraries if needed
5. Provide implementation steps
```

---

## Quick Copy-Paste Sections

### Section A: Project Context (Always Include)
```
I have a React Native + Expo mobile app called Mythos Arena. It's a mythology quiz game built with:
- React Native 0.81 + Expo 54
- TypeScript 5.9
- NativeWind 4 (Tailwind CSS)
- React Context + useReducer for state
- Vitest for testing

Here's the full project guide:
[PASTE: QUICK_START_FOR_CLAUDE.md]
```

### Section B: Code Style Requirements
```
**Code Style Requirements:**
- Use TypeScript with strict mode
- Use Tailwind classes for styling (no inline styles)
- Never use className on Pressable (use style prop)
- Always wrap screens with ScreenContainer
- Use useGame() hook for state management
- Use useColors() hook for theme colors
- Follow naming: Components=PascalCase, files=kebab-case, functions=camelCase
- Add JSDoc comments for complex functions
- Write unit tests with Vitest
```

### Section C: File References
```
**Reference Files:**
- lib/types.ts – Type definitions and constants
- lib/game-context.tsx – State management pattern
- app/(tabs)/index.tsx – Screen example
- components/screen-container.tsx – Layout pattern
- components/pantheon-card.tsx – Component example
- theme.config.js – Color definitions
- tailwind.config.js – Tailwind setup
```

### Section D: Integration Checklist
```
**Integration Checklist:**
- [ ] Add TypeScript types to lib/types.ts if needed
- [ ] Update GameContext if adding new state
- [ ] Add route to app/_layout.tsx if new screen
- [ ] Use ScreenContainer for SafeArea
- [ ] Use Tailwind classes for styling
- [ ] Write unit tests
- [ ] Test on iOS and web
- [ ] Update todo.md with completion
```

---

## Example: Complete Request to Claude Code

```
I have a React Native + Expo mobile app called Mythos Arena. It's a mythology quiz game.

Here's the full project context:
[PASTE: QUICK_START_FOR_CLAUDE.md]

**Task:** Implement the quiz gameplay screen with timer and answer feedback

**Files to create:**
1. app/quiz.tsx – Main quiz screen
2. components/quiz-timer.tsx – 15-second countdown timer
3. components/answer-feedback.tsx – Feedback animations
4. lib/sound-manager.ts – Sound effects

**Requirements:**
- Display question with 4 multiple-choice buttons
- 15-second countdown timer with visual ring
- Green flash + checkmark for correct answers
- Red shake + X for wrong answers
- Show "Did You Know?" fact after answer
- Play sound effects (correct chime, wrong buzz, timer alert)
- Auto-submit when timer reaches 0
- Haptic feedback at 5 seconds remaining
- Disable buttons after answer selected
- Calculate XP earned (base + speed + streak bonus)

**Code Style:**
- Use TypeScript with strict mode
- Use Tailwind classes for styling
- Never use className on Pressable
- Always wrap with ScreenContainer
- Use GameContext for state
- Use useColors() for theme colors
- Add JSDoc comments
- Write Vitest unit tests

**Include:**
- Complete, working code
- TypeScript interfaces
- Unit tests
- Integration instructions
- Comments explaining key logic

**Reference:**
- lib/types.ts for type definitions
- lib/game-context.tsx for state management
- app/(tabs)/index.tsx for screen pattern
- theme.config.js for colors
```

---

## Tips for Best Results

1. **Be Specific** – The more details, the better the code
2. **Include Context** – Always paste the project guide
3. **Mention Constraints** – Tell Claude about limitations
4. **Reference Files** – Point to similar code in the project
5. **Explain Integration** – Show how it connects to other parts
6. **Ask for Tests** – Always request unit tests
7. **Request Comments** – Ask for explanation comments
8. **Specify Style** – Remind Claude about code conventions

---

## What Claude Code Can Do

✅ Write complete, working code
✅ Review and refactor existing code
✅ Fix bugs and explain root causes
✅ Add new features and screens
✅ Write unit tests
✅ Optimize performance
✅ Explain architecture decisions
✅ Suggest improvements
✅ Handle TypeScript types
✅ Integrate with existing code

---

## What to Avoid

❌ Vague requests ("make it better")
❌ Forgetting to include project context
❌ Not specifying file locations
❌ Asking for code that violates project conventions
❌ Requesting features without explaining integration
❌ Forgetting to ask for tests
❌ Not mentioning constraints or limitations

---

**Ready to use Claude Code!** 🚀

Pick a template above, fill in the bracketed sections, and paste into Claude Code.
