# Elevator Pitch:

"Stocks - What happened next?" is an educational game that challenges players to predict short-term market movements. Players are shown real historical stock charts from major companies, but with a twist - the last week of data is hidden. They must analyze the trend and make a prediction: will the stock be very bearish, bearish, neutral, bullish, or very bullish in the following week?

After making their prediction, players see what actually happened and earn points based on their accuracy. It's a fun way to test market intuition without risking real money, perfect for both beginners learning about market movements and experienced traders testing their analysis skills. No accounts needed - just jump in and start predicting!

Think of it as "Stock Market Price is Right" meets "Higher or Lower" - educational, engaging, and endlessly replayable.

## Core Functionality:

* Random stock selector from a predefined list of major companies
* Historical data fetching from Yahoo Finance
* Interactive chart display
* User prediction input mechanism
* Scoring/feedback system

## Technical Components:

* Frontend: Plain vanilla JavaScript, HTML, CSS
* Backend: Flask, Python
* Database: SQLite
* Data handling: Yahoo Finance API integration
* State management for tracking user predictions
* Responsive design for mobile/desktop

## Screens:

### 1. Welcome Screen
- **App Title**: "Stocks - What happened next?"
- **Controls**:
      - "Start Game" button
      - "Start Playing" button
- **Instructions**:
      - You'll see a stock's recent price history
      - Predict the next week's movement
      - Make your prediction: Very Bearish to Very Bullish
      - See how you did!

### 2. Main Game Screen
- **Stock Information**:
      - Ticker symbol
      - Company name
      - Price chart (partial data)
- **Prediction Interface**:
      - Question: "What will happen next week?"
      - Prediction options:
            - Very Bearish (-5% or more)
            - Bearish (-1% to -5%)
            - Neutral (-1% to +1%)
            - Bullish (+1% to +5%)
            - Very Bullish (+5% or more)
- **Game Stats**:
      - Current streak
      - Current score

### 3. Result Screen
- **Chart**: Complete price chart with next week revealed
- **Results Overview**:
      - Your prediction
      - Actual outcome
      - Percentage change
      - Points earned this round
- **Controls**:
      - "Next Stock" button
      - "End Game" button

### 4. Game Over Screen
- **Final Statistics**:
      - Final score
      - Number of predictions made
      - Correct predictions
      - Best streak this session
- **Controls**:
      - "Play Again" button
      - "Back to Home" button

### 5. Loading Screen
- Loading spinner
- "Loading next stock..."

### 6. Error Screen
- Error message
- "Try Again" button
- "Back to Home" button

## User Flow:

```text
Welcome Screen
      ↓
Main Game Screen ←→ Loading Screen
      ↓
Result Screen
      ↓
[Repeat Main Game → Result] OR End Game
      ↓
Game Over Screen
      ↓
Welcome Screen
```

## Release Plan

## Release 1: Basic Game Loop (MVP)
**Goal**: Create the simplest possible version of the game that works
- **Features**:
      1. Static Welcome Screen with Start button
      2. Game Screen with:
            - Single hardcoded stock data
            - Simple line chart showing price history
            - Basic prediction buttons (Up/Down only)
      3. Result Screen showing:
            - Complete chart
            - Whether player was right/wrong
      4. Next round button
- **Technical Tasks**:
      1. Set up basic project structure
      2. Create basic HTML/CSS layout
      3. Implement simple chart visualization
      4. Add basic game logic
      5. Create simple navigation between screens

## Release 2: Data Integration
**Goal**: Replace hardcoded data with real stock data
- **Features**:
      1. Yahoo Finance API integration
      2. Random stock selection from a small list (5-10 stocks)
      3. Loading screen while fetching data
      4. Error handling for failed API calls
- **Technical Tasks**:
      1. Set up Flask backend
      2. Implement Yahoo Finance API wrapper
      3. Create endpoints for stock data
      4. Add loading states
      5. Implement error handling

## Release 3: Enhanced Predictions
**Goal**: Implement full prediction system
- **Features**:
      1. Five-level prediction system:
            - Very Bearish to Very Bullish
      2. Percentage-based scoring
      3. Basic scoring system
      4. Streak counter
- **Technical Tasks**:
      1. Enhance prediction UI
      2. Implement percentage calculation logic
      3. Add scoring system
      4. Add streak tracking
      5. Update result screen with detailed feedback

## Release 4: Game Progress & Statistics
**Goal**: Add game session tracking
- **Features**:
      1. Session-based game progress
      2. Game Over screen with statistics
      3. Play Again functionality
      4. Current game statistics display
- **Technical Tasks**:
      1. Implement session management
      2. Create statistics tracking
      3. Build Game Over screen
      4. Add persistent game state
      5. Implement reset functionality

## Release 5: Polish & Enhancement
**Goal**: Improve user experience and visual appeal
- **Features**:
      1. Responsive design
      2. Animations and transitions
      3. Enhanced chart interactions
      4. Improved visual design
      5. Tutorial/Help section
- **Technical Tasks**:
      1. Implement responsive layouts
      2. Add animations
      3. Enhance chart functionality
      4. Polish UI/UX
      5. Create help documentation

## Release 6: Final Polish
**Goal**: Final improvements and optimizations
- **Features**:
      1. Performance optimizations
      2. Extended stock list
      3. Browser caching
      4. Progressive Web App capabilities
- **Technical Tasks**:
      1. Performance audit and optimization
      2. Expand stock database
      3. Implement caching strategy
      4. Add PWA features
      5. Final testing and bug fixes
