# Fakta atau Opini? — Interactive Quiz

A lightweight, zero-dependency interactive web quiz in Bahasa Indonesia that challenges players to distinguish between facts (*fakta*) and opinions (*opini*) across 10 statement cards.

## Features

- **Card-Swipe Gameplay**: Drag and swipe statement cards left for **Opini** or right for **Fakta** with live stamp indicators and smooth Web Animations API transitions.
- **Multiple Input Methods**: Answer via touch/mouse drag gestures (Pointer Events), on-screen **Opini** / **Fakta** buttons, or keyboard arrow keys (`ArrowLeft` / `ArrowRight`).
- **Stacked Deck Visuals**: Layered card deck preview with rotating pastel palettes, glassmorphic container styling, and dynamic pose transforms.
- **Instant Feedback & Explanations**: Native HTML `<dialog>` modal shows immediate right/wrong feedback and displays an explanation whenever a factual statement is answered incorrectly.
- **Score & Progress Tracking**: Live score badge, question counter, progress bar, and tiered end-of-game summary messages with one-click replay.
- **Responsive & Accessible**: Adapts from a centered card frame on desktop to a full-viewport (`100dvh`) safe-area-aware layout on mobile, with ARIA live regions, keyboard focus management, and `prefers-reduced-motion` support.

## Tech Stack

- **HTML5** — Semantic screens, native `<dialog>`, and ARIA attributes
- **CSS3** — Custom properties, `backdrop-filter` glassmorphism, responsive media queries, and reduced-motion rules
- **Vanilla JavaScript** — Pointer Events API, Web Animations API, and state management (no frameworks or build tools)

## Project Structure

```text
landing-page-quiz-jagat/
├── index.html   # Welcome, play, and result screens + feedback modal dialog
├── style.css    # Visual theme, card stack layout, and responsive styles
└── script.js    # Question dataset, swipe interactions, and quiz logic
```

## Getting Started

No installation or build step is required.

1. Clone the repository:
   ```bash
   git clone https://github.com/Padeswara/landing-page-quiz-jagat.git
   cd landing-page-quiz-jagat
   ```
2. Open `index.html` directly in your browser, or serve the folder with any static file server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Or using Node.js
   npx serve .
   ```

## Controls

| Action | Gesture / Button | Keyboard |
| --- | --- | --- |
| Choose **Opini** | Swipe card left or click **← Opini** | `ArrowLeft` |
| Choose **Fakta** | Swipe card right or click **Fakta →** | `ArrowRight` |

## Customizing Questions

Questions are configured in the `questions` array at the top of `script.js`:

```js
{
  text: 'Matahari terbit dari arah timur.',
  answer: 'fact', // 'fact' or 'opinion'
  explanation:
    'Bumi berputar dari barat ke timur. Akibatnya, Matahari tampak terbit dari arah timur.',
}
```

- `text`: Statement shown on the card.
- `answer`: `'fact'` or `'opinion'`.
- `explanation` *(optional)*: Displayed in the feedback modal when a `'fact'` question is answered incorrectly.

> **Note:** If you change the total number of questions from `10`, update the total count labels (`10 soal`, `/ 10`, `aria-valuemax="10"`) in `index.html` as well as the progress percentage calculation and score thresholds in `script.js`.

