# PFE_SmartCar — Angular 17 + Spring Boot

## Architecture
```
src/app/
├── admin/                    → Module Admin
│   ├── components/
│   │   ├── dashboard/        → Dashboard stats
│   │   ├── customers/        → CRUD Customers
│   │   ├── sensor-logs/      → CRUD Sensor Logs
│   │   └── health/           → API Health Check
│   ├── directives/           → has-role.directive.ts
│   ├── guards/               → admin.guard.ts
│   ├── interceptors/         → auth.interceptor.ts
│   ├── models/               → admin.model.ts
│   ├── pipes/                → balance-format.pipe.ts
│   ├── services/             → customer, sensor-log, health
│   └── utils/                → admin.utils.ts
├── member/                   → Module Member
│   ├── components/
│   │   ├── profile/          → Mon Profil
│   │   ├── vehicles/         → Mes Véhicules
│   │   └── logs/             → Mes Logs
│   ├── directives/guards/interceptors/models/pipes/services/utils/
└── shared/                   → Partagé
    ├── components/navbar/ footer/
    ├── models/               → customer, sensor-log, api-response
    ├── pipes/                → status-badge.pipe.ts
    ├── directives/           → highlight.directive.ts
    ├── services/             → api.service.ts (base)
    └── utils/                → constants.ts
```

## Installation
```bash
npm install -g @angular/cli@17
npm install
npm start
```
→ http://localhost:4200 (Spring Boot sur :8080)
