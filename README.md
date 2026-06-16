# 🎙️ Public Speaking Practice

An interactive, premium single-page web application designed to help you practice and master public speaking exercises. The app features a modern dark glassmorphism design, immersive audio cues, customizable exercise lengths and difficulties, and an optional microphone recording system with local audio download.

## 🚀 Key Features

*   **Four Core Exercises:**
    *   **💬 Word Association Riff:** Speak continuously, connecting random words that appear at difficulty-controlled intervals. Includes a history trail.
    *   **🎭 The Conductor:** Adapt your speaking style on the fly as dramatic prompts (e.g., "WHISPER", "GET EXCITED", "EXPLAIN TO A CHILD") appear.
    *   **📰 The Headline Drill:** Spend a brief moment crafting a punchy headline, then expand it into a full explanation.
    *   **🔭 Telescoping:** Deliver a talk on a single topic across three rounds of increasing length (1:2:3 time ratio) with transition intervals.
*   **Customization:**
    *   **Duration:** Practice for 1 to 20 minutes (customized per exercise).
    *   **Difficulty:** Easy, Medium, or Hard modes which adjust word/command intervals, topic complexity, and prep times.
*   **🎙️ Live Session Recording:** Record your practice session directly in your browser. Play it back on the completion screen or download it as a `.webm` file.
*   **🔊 Immersive Audio Cues:** Sound effects for countdown ticks, completions, new words/commands, and phase changes, with a global mute toggle.
*   **✨ Premium UI/UX:** Responsive dark mode, glassmorphism design, Google Fonts (Inter), and smooth micro-animations.

---

## 🛠️ Getting Started / Running Locally

Since this app is built using **ES Modules**, it cannot be run by simply opening `index.html` directly from your file manager (which uses the `file://` protocol). It must be served through a local web server.

### Option 1: Python HTTP Server (Built-in)
If you have Python installed, open your terminal, navigate to the project folder, and run:
```bash
python3 -m http.server 8080
```
Then open your browser and navigate to:
[http://localhost:8080](http://localhost:8080)

### Option 2: Node.js / `npx` (No Install Required)
If you have Node.js installed, run:
```bash
npx serve
```
Then open the URL shown in your terminal (usually `http://localhost:3000` or `http://localhost:5000`).

---

## 📁 Project Structure

```
public-speaking-practice/
├── index.html                     # Single-page layout containing all views
├── README.md                      # Project documentation (this file)
├── css/
│   ├── index.css                  # Core design tokens, global resets, view transitions
│   ├── components.css             # Reusable UI (cards, buttons, sliders, timer ring)
│   └── exercises.css              # Custom layout/animations for active exercises
└── js/
    ├── app.js                     # Main controller (routing, state, and event binding)
    ├── timer.js                   # High-precision timer and SVG circular progress sync
    ├── audio.js                   # Web Audio synth cue generator & MediaRecorder manager
    ├── data.js                    # Exercise databases (words, topics, style commands)
    └── exercises/
        ├── word-riff.js           # Word Association Riff game loop
        ├── conductor.js           # The Conductor game loop
        ├── headline-drill.js      # The Headline Drill game loop
        └── telescoping.js         # Telescoping game loop
```

---

## 🌐 Deploying to the Web

Because the app is built entirely with client-side HTML, CSS, and JavaScript, you can host it for free on various platforms:

### 1. GitHub Pages (Recommended)
1. Push this folder to a GitHub repository.
2. Go to **Settings** > **Pages** in your repository.
3. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
4. Select `main` (or your default branch) and `/ (root)`, then click **Save**.
5. Your site will be live at `https://<your-username>.github.io/<your-repo-name>/` within a few minutes.

### 2. Netlify (Drag and Drop)
1. Go to [Netlify Drop](https://app.netlify.com/drop).
2. Drag and drop the project folder onto the browser window.
3. Your app will be deployed instantly!
