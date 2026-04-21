<p align="center">
  <img src="client/public/favicon.svg" width="80" height="80" alt="Sana Logo" />
</p>

<h1 align="center">SANA</h1>
<h3 align="center">Cybersecurity Awareness Platform for Kazakhstan</h3>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-8.5-47A248?style=flat-square&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Recharts-2.12-FF6384?style=flat-square" alt="Recharts" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />
</p>

<p align="center">
  <strong>Educating the next generation of digitally safe citizens through interactive simulations, real-time analytics, and engaging content.</strong>
</p>

---

## 🛡️ Problem Statement

Kazakhstan faces a rapidly escalating cybersecurity crisis:

- **20,000+ internet fraud cases** recorded in 2024, with damages exceeding **₸12 billion**
- **43% increase** in cyberbullying among teens aged 12-17
- **67% of phishing attacks** in Central Asia target banking users with convincing fake websites
- Only **12% of companies** have dedicated cybersecurity teams

Traditional awareness campaigns (pamphlets, lectures) fail to engage modern users. **Sana** bridges this gap with an interactive, gamified platform that turns cybersecurity education into an experience.

## 🎯 Value Proposition

**Sana** transforms cybersecurity awareness from passive reading into active learning:

| Traditional Approach | Sana Platform |
|---------------------|---------------|
| Static PDFs and lectures | Interactive life-scenario simulations |
| Outdated statistics | Real-time data dashboards (2024-2026) |
| Generic global content | Kazakhstan/CIS-specific threat intelligence |
| One-time exposure | Gamified engagement with scoring & feedback |

## ✨ Core Features

### 1. 🎮 Life Scenario Simulation
A gamified experience where users face real-world cyber threats:
- **5 realistic scenarios**: Phishing emails, fake SMS, cyberbullying, social engineering, investment fraud
- **Multiple-choice responses** with 3-4 options per scenario
- **Immediate expert feedback** explaining why each choice is safe or dangerous
- **Score tracking** with progress bar and awareness grade (Cyber Expert → High Risk)
- **Educational context**: Kazakhstan-specific laws, reporting channels, and protection strategies

### 2. 📊 Interactive Statistics Dashboard
Dynamic data visualization powered by Recharts:
- **Area Chart**: Incident trends (phishing, fraud, cyberbullying) over 36 months
- **Bar Chart**: Monthly category breakdown with stacked visualization
- **Pie Chart**: Threat type distribution with real-time calculations
- **Date Range Filter**: Dual slider to explore any period between Jan 2024 – Dec 2026
- **Animated Stat Cards**: Total incidents, monthly averages, growth rates, top threats

### 3. ⚡ Cyber-Fact Generator
Discover shocking cybersecurity facts about Kazakhstan and CIS:
- **18+ curated facts** with real sources (CERT-KZ, National Bank, UNICEF)
- **Severity classification**: Low / Medium / High / Critical
- **Category tags**: Fraud, Phishing, Cyberbullying, Data Breach, Identity Theft, Malware
- **Copy to clipboard** for easy sharing
- **Backend API** with random selection via MongoDB aggregation

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework with functional components & hooks |
| **Vite 5** | Build tool & dev server with HMR |
| **Tailwind CSS 3** | Utility-first CSS with custom dark/security theme |
| **Recharts** | Data visualization (Area, Bar, Pie charts) |
| **React Router 6** | Client-side routing |
| **Lucide React** | Icon library |
| **Axios** | HTTP client for API communication |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express 4** | REST API framework |
| **MongoDB** | Document database |
| **Mongoose 8** | ODM with schema validation |
| **CORS** | Cross-origin request handling |
| **dotenv** | Environment configuration |

### Architecture
```
Client (React + Vite)          Server (Express)          Database (MongoDB)
     :5173                          :5000
       │                              │                        │
       ├── Pages                      ├── Routes               ├── CyberFacts
       ├── Components                 ├── Controllers           ├── QuizResults
       ├── Hooks                      ├── Models               └── DailyStats
       └── Utils/API ──── REST ──────>├── Middleware
                                      └── Seed Data
```

## 📁 Project Structure

```
Sana/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable UI (Button, Card, Badge, ProgressBar)
│   │   │   ├── layout/             # Navbar, Footer, Layout
│   │   │   ├── simulation/         # LifeScenario, ScenarioCard, FeedbackModal
│   │   │   ├── dashboard/          # Dashboard, StatsChart, DateFilter, StatCard
│   │   │   └── facts/             # CyberFact Generator
│   │   ├── pages/                  # HomePage, SimulationPage, DashboardPage, 404
│   │   ├── hooks/                  # useFetch
│   │   ├── data/                   # scenarios.js, mockStats.js
│   │   └── utils/                  # API client (axios)
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Express Backend
│   ├── config/db.js                # MongoDB connection
│   ├── controllers/                # Business logic
│   ├── models/                     # Mongoose schemas
│   ├── routes/                     # API endpoints
│   ├── middleware/                 # Error handler
│   ├── data/seedFacts.js          # Seed data
│   └── server.js                  # Entry point
│
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** >= 18.x
- **MongoDB** (local or [Atlas](https://www.mongodb.com/cloud/atlas))
- **npm** >= 9.x

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/sana.git
cd sana
```

### 2. Setup Environment
```bash
cp .env.example server/.env
```

Edit `server/.env` and set your MongoDB connection string:
```env
MONGO_URI=mongodb://localhost:27017/sana
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Run the Application
```bash
# Terminal 1 — Start the backend
cd server
npm run dev

# Terminal 2 — Start the frontend
cd client
npm run dev
```

The frontend will be available at **http://localhost:5173** and the API at **http://localhost:5000**.

### 5. Seed the Database (Optional)
The server auto-seeds cyber facts on first startup. To manually seed or reset:
```bash
cd server
npm run seed
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/facts/random` | Get a random cyber fact |
| `GET` | `/api/facts` | Get all facts (paginated) |
| `POST` | `/api/quiz/results` | Save simulation result |
| `GET` | `/api/quiz/results` | Get results with filters |
| `GET` | `/api/quiz/stats` | Aggregated quiz statistics |
| `GET` | `/api/stats` | Get incident stats (date filter) |
| `GET` | `/api/stats/summary` | Aggregated summary |
| `POST` | `/api/stats/seed` | Seed mock statistics |

## 🎨 Design System

The platform uses a custom **"Dark/Security"** theme:

- **Background**: Deep blacks (`#0a0a0f`, `#12121a`) with cyber-grid pattern
- **Accents**: Cyan (`#00f0ff`), Purple (`#8b5cf6`), Blue (`#0ea5e9`)
- **Effects**: Glassmorphism cards, neon glow borders, gradient text
- **Typography**: Inter (UI), JetBrains Mono (data/numbers)
- **Animations**: Fade-in, slide-up, pulse-glow, floating orbs

## 🗺️ Future Roadmap

### Phase 2 — Intelligence (Q3 2026)
- 🤖 **AI-Powered Sentiment Analysis** for real-time bullying detection in chat platforms
- 🔐 **Integration with Government Anti-Fraud APIs** (KZ-CERT, National Bank)
- 📱 **Mobile App** (React Native) with real-time push alerts for new threats

### Phase 3 — Community (Q4 2026)
- 👥 **P2P Reporting System** with Blockchain verification for tamper-proof evidence
- 🏫 **School Integration Module** — curriculum-aligned content for grades 5-12
- 🌐 **Multi-language Support** — Kazakh, Russian, English

### Phase 4 — Enterprise (2027)
- 🏢 **Corporate Training Platform** with employee certification
- 📊 **Threat Intelligence Feed** — real-time cyber threat data for organizations
- 🔗 **API Marketplace** — allow third-party apps to integrate Sana's threat data
- 🧠 **ML-based Phishing URL Detector** — browser extension powered by our data

### Phase 5 — National Scale (2027+)
- 🏛️ **Government Partnership** — official cybersecurity awareness platform
- 📡 **Real-time Dashboard** — live monitoring of national cyber threat landscape
- 🎓 **Digital Literacy Certification** — nationally recognized credential

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Built with 🛡️ for Kazakhstan's digital safety<br/>
  <strong>IT Competition 2026</strong>
</p>
