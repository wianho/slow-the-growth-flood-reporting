# Slow the Growth - Flood Reporting

> Community-driven flood reporting system for Volusia County, Florida

🌐 **Live Application**: [https://stgfloods386.from-fl.com](https://stgfloods386.from-fl.com)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Overview

**Slow the Growth** is an open-source Progressive Web App (PWA) that empowers Volusia County residents to anonymously report flooding conditions. The system features location verification, rate limiting, confidence scoring, and integration with NOAA, USGS, and Volusia County GIS data.

### Mission

To empower communities with real-time flood data, promoting informed decision-making and highlighting the need for sustainable development practices.

## Features

- 📍 **Anonymous Reporting** - Submit flood reports with device fingerprinting (no personal data stored)
- 🗺️ **Interactive Map** - View all active flood reports on an OpenStreetMap-based map
- 🎯 **Location Verification** - GPS-based verification ensures reports are from Volusia County
- ⏱️ **Rate Limiting** - 3 reports per device per day to prevent spam
- 🔄 **Confidence Scoring** - Multiple reports from the same area increase confidence
- 📅 **Weekly Rotation** - Data automatically archives every Wednesday at 5am EST
- 🌊 **USGS Integration** - Real-time stream gauge data from Volusia County waterways
- ⚠️ **NOAA Alerts** - Live weather alerts and flood warnings
- 📱 **PWA Support** - Install on mobile devices for offline access

## Quick Start

```bash
# Clone and setup
git clone https://github.com/wianho/slow-the-growth-flood-reporting.git
cd slow-the-growth-flood-reporting

# Start Docker services
docker compose up -d

# Install and run backend
cd backend && npm install && npm run dev

# Install and run frontend (new terminal)
cd frontend && npm install && npm run dev

# Access at http://localhost:5173
```

See full installation guide and deployment options in the sections below.

## Contact

- GitHub: [github.com/wianho/slow-the-growth-flood-reporting](https://github.com/wianho/slow-the-growth-flood-reporting)

---

**Slow the Growth** - Empowering communities through data-driven environmental awareness
