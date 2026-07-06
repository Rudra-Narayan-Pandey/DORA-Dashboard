# AetherOS DORA Metrics & Release Health Command Center

AetherOS is a premium, futuristic glassmorphic DORA Metrics dashboard engineered for DevOps leaders. It monitors **Deployment Frequency**, **Lead Time for Changes**, **Change Failure Rate (CFR)**, and **Mean Time to Recovery (MTTR)** in real-time, utilizing advanced WebGL shaders and Canvas 3D models.

---

## 🚀 How to Run the Project Locally

Follow these quick steps to launch the dashboard on your machine:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18 or higher recommended) installed on your system.

### 2. Enter the Frontend Directory
Navigate into the `frontend` workspace folder:
```bash
cd frontend
```

### 3. Install Dependencies
Install all React 19, Tailwind CSS v4, Recharts, and Framer Motion packages:
```bash
npm install
```

### 4. Start the Local Development Server
Boot up the Vite dev server with hot module replacement (HMR):
```bash
npm run dev
```

Once started, the console will output the active local address. Open your browser and navigate to:
* **[http://localhost:5173/](http://localhost:5173/)**

---

## 🛠️ Production Build

To compile, optimize, and bundle the entire application for static hosting:
```bash
npm run build
```
This outputs the minified production assets inside the `frontend/dist/` directory.

---

## 🌌 Features
* **Future OS Aesthetics**: Glassmorphic widgets, moving aurora energy glows, and 1px refraction borders.
* **Canvas 3D Rotating HUD**: Projecting wireframe models and active particle systems using pure browser Canvas.
* **Liquid Metal Shader**: Raw WebGL canvas background rendering liquid metal animations inside the Orbital Release modal.
* **Interactive Data Views**: Syncs filters across Mission Control Overview, Lead Time graphs, and MTTR telemetry pages.
