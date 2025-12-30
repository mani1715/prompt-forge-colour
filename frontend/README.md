# Frontend - MSPN DEV

React-based frontend for the MSPN DEV platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- yarn package manager
- Backend API running on http://localhost:8001

### Setup

1. **Install dependencies**
   ```bash
   yarn install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Default values work for local development
   ```

3. **Start development server**
   ```bash
   yarn start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin/login
   - Client Portal: http://localhost:3000/client/login

---

## 📁 Directory Structure

```
frontend/
├── package.json           # Dependencies & scripts
├── .nvmrc                 # Node version (18)
├── .env.example           # Environment template
├── craco.config.js        # CRACO configuration
├── tailwind.config.js     # Tailwind CSS config
├── postcss.config.js      # PostCSS config
├── jsconfig.json          # JavaScript config
├── components.json        # shadcn/ui config
│
├── public/                # Static assets
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
│
└── src/
    ├── App.js             # Main application component
    ├── App.css            # Global styles
    ├── index.js           # Entry point
    ├── index.css          # Base styles
    │
    ├── pages/             # Page components
    │   ├── Home.jsx
    │   ├── About.jsx
    │   ├── Services.jsx
    │   ├── Portfolio.jsx
    │   ├── BlogList.jsx
    │   ├── Contact.jsx
    │   ├── ClientLogin.jsx
    │   └── ClientDashboard.jsx
    │
    ├── components/        # Reusable components
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   ├── ChatWidget.jsx
    │   └── ui/            # shadcn/ui components
    │
    ├── admin/             # Admin panel
    │   ├── AdminLayout.jsx
    │   ├── pages/         # Admin pages
    │   │   ├── Dashboard.jsx
    │   │   ├── PortfolioManager.jsx
    │   │   ├── BlogsManager.jsx
    │   │   ├── ClientsManager.jsx
    │   │   └── ... (20+ admin pages)
    │   └── context/       # Admin context
    │
    ├── demos/             # Demo showcases
    │   ├── ecommerce/     # E-commerce demo
    │   ├── corporate/     # Corporate demo
    │   ├── lms/           # LMS demo
    │   ├── restaurant/    # Restaurant demo
    │   └── ... (8 demos total)
    │
    ├── context/           # React Context providers
    │   ├── CartContext.jsx
    │   └── AdminContext.jsx
    │
    ├── services/          # API service layer
    │   ├── api.js         # Axios instance
    │   ├── authService.js
    │   └── projectService.js
    │
    ├── lib/               # Utilities
    │   └── utils.js
    │
    └── data/              # Mock/demo data
        ├── mock.js
        ├── ecommerceData.js
        └── lmsData.js
```

---

## 🎨 Styling

### Tailwind CSS
The project uses Tailwind CSS for styling with custom configuration.

### shadcn/ui Components
Built on Radix UI primitives with 40+ components in `/src/components/ui/`

---

## 🔐 Authentication

Uses React Context API with JWT tokens stored in localStorage.
Tokens are automatically attached to API requests via axios interceptors.

---

## 🌐 API Integration

Centralized API service in `/src/services/api.js` using axios.
Base URL configured via `REACT_APP_BACKEND_URL` environment variable.

---

## 📦 Key Dependencies

- React 19 + React Router v6
- Tailwind CSS + shadcn/ui
- Axios for HTTP
- React Hook Form + Zod validation
- date-fns, lucide-react

See `package.json` for complete list.

---

## 🏗️ Building for Production

```bash
yarn build
```

Output in `/build` directory, ready for static hosting.

---

## 📚 Additional Documentation

- [Main README](/README.md)
- [Backend README](/backend/README.md)

---

**Last Updated:** December 30, 2025
