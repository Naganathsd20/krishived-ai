# KrishiVed AI

### AI-Powered Smart Agricultural Intelligence Platform

KrishiVed AI is a modern agricultural technology platform designed to bring useful farming intelligence, agricultural information, market data, government schemes, support resources, analytics, and AI-powered tools together in one platform.

The project focuses on providing farmers with a simple, structured, and accessible digital platform for agricultural decision support.

---

## Overview

Agriculture often requires farmers to use multiple sources for weather information, crop guidance, market prices, government schemes, agricultural support centers, farm records, and other resources.

KrishiVed AI brings these capabilities together through a unified web platform.

The platform provides:

- Agricultural information and decision-support tools
- Crop advisory
- Disease diagnostics
- Weather and soil information
- Mandi market prices
- Government agricultural schemes
- Agricultural support center discovery
- Farm diary
- Crop scheduling
- Irrigation planning
- Agricultural analytics
- Yield intelligence
- Field reports
- Quality assurance tools
- KrishiMitra AI assistance
- User profile and preferences
- Administrative monitoring

---

## Key Features

### Dashboard

Provides a centralized overview of the farmer's agricultural activities and important information.

### Farm Diary

Allows farmers to maintain and manage farm-related records and activities.

### Crop Schedule

Helps organize crop-related activities and schedules.

### Irrigation Planning

Provides irrigation planning capabilities based on the information available within the platform.

### KrishiMitra AI

An AI-powered agricultural assistant designed to help users interact with agricultural information and guidance.

### Crop Advisory

Provides crop-related advisory information to support farming decisions.

### Disease Diagnostics

Provides AI-assisted crop disease analysis and diagnostic functionality.

### Weather & Soil

Provides weather information and soil-related agricultural insights.

### Mandi Prices

Displays agricultural market prices using official AGMARKNET/Data.gov.in market data.

The platform uses real market data rather than generated or estimated prices.

### Government Schemes

Provides information about agricultural government schemes and eligibility-related information.

### Agriculture Support Centers

Helps users discover agricultural support resources such as:

- Krishi Vigyan Kendras (KVKs)
- Government agriculture offices
- Soil testing laboratories
- Agricultural universities
- Other agricultural support centers

Currently organized with dedicated support data for Karnataka and Maharashtra.

### Analytics

Provides agricultural analytics and visual summaries of available platform data.

### Yield Intelligence

Provides crop production and readiness analysis using available agricultural information.

### Field Reports

Provides functionality for managing and reviewing field-related reports.

### Quality Assurance

Provides tools for reviewing agricultural information and platform data quality.

### Admin Dashboard

Provides authorized administrators with platform-level monitoring and analytics.

Administrative access is protected through authentication and authorization checks.

### Settings

Allows users to manage their platform preferences and farming-related settings.

### Help & Support

Provides guidance for using the different KrishiVed AI modules.

---

## Data Sources

KrishiVed AI uses real external data sources where applicable.

### Mandi Market Data

Mandi market prices are sourced from:

**AGMARKNET / Government of India Open Government Data Platform (Data.gov.in)**

The platform does not generate synthetic mandi prices.

### Government Schemes

Government scheme information is based on official government sources and guidelines used by the application.

### Agriculture Support Centers

Agricultural support center information is maintained using the project's verified agricultural center dataset.

---

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide Icons

### Backend

- Next.js API Routes
- Node.js
- TypeScript

### Authentication

- Clerk

### Database

- MongoDB
- Mongoose

### External Data

- Government of India Open Data APIs
- AGMARKNET market data
- Weather services
- Other configured agricultural data services

---

## Architecture

KrishiVed AI follows a modern full-stack Next.js architecture.

```text
KrishiVed AI
│
├── Frontend
│   ├── Dashboard
│   ├── Agricultural Modules
│   ├── Analytics
│   ├── Reports
│   └── Settings
│
├── API Layer
│   ├── Agricultural APIs
│   ├── Market APIs
│   ├── Government Scheme APIs
│   ├── Support Center APIs
│   └── Administrative APIs
│
├── Authentication
│   └── Clerk
│
├── Database
│   └── MongoDB
│
└── External Data Sources
    ├── Data.gov.in / AGMARKNET
    └── Configured agricultural services
