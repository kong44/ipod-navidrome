# 🎵 iPod Classic - Navidrome Music Player Client

A high-fidelity retro **iPod Classic** (5th/6th Generation) web client for **Navidrome** and Subsonic-compatible music servers, built with **React**, **TypeScript**, and **Tailwind CSS**.

---

## ✨ Features

- **Authentic iPod Classic Hardware & UI Design**:
  - Realistic iPod chassis with brushed aluminum finish, glass screen reflection, headphone jack, and working Hold switch.
  - 3 Interchangeable themes: **Classic Silver**, **Space Black**, and **U2 Special Edition** (black chassis with red click wheel).
  - LCD display with Apple blue highlight bar, split-screen live artwork preview, and vintage status bar.
- **Iconic 3D Cover Flow View**:
  - Flip through your album collection in true 3D perspective with realistic glassy floor reflections.
- **Physical Click Wheel & Gestures**:
  - **Circular Rotary Scrolling**: Drag around the wheel with mouse or finger to scroll menus and adjust volume.
  - Tactile center button and cardinal buttons (`MENU`, `<<`, `>>`, `>||`).
  - **Synthesized Click Sounds**: Authentic mechanical iPod piezo clicker sound synthesized with the Web Audio API on every rotary step and button press.
- **Subsonic / Navidrome REST API Integration**:
  - Connect to any Navidrome, Subsonic, or Airsonic instance with Subsonic API (v1.16.1+).
  - OpenSubsonic MD5 authentication token + salt support.
  - Browse Artists, Albums, Songs, Playlists, Genres, Starred tracks, and Search.
  - Scrobbling support when songs are played.
  - **Offline Demo Mode**: Preloaded with tracks, albums, and artwork for instant offline enjoyment without server setup.
- **Now Playing Screen**:
  - Square album artwork, song title, artist, album name, retro segmented timeline scrubber, and volume HUD overlay on rotary scroll.
- **Comprehensive Keyboard & Touch Controls**:
  - `↑` / `↓` or `←` / `→`: Rotate click wheel
  - `Enter`: Center Select
  - `Esc` / `Backspace` / `M`: MENU (Back)
  - `Space` / `P`: Play / Pause
  - `N` / `B`: Next / Previous track

---

## 🚀 Getting Started

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### 🔌 Connecting to Navidrome
1. Click the **Demo Mode / Connected** button in the top right (or navigate to **Settings -> Navidrome Server** on the iPod).
2. Enter your Navidrome server URL (e.g., `http://localhost:4533` or `https://music.yourdomain.com`).
3. Enter your **Username** and **Password**.
4. Click **Test Connection** to verify, then **Save & Connect**.
