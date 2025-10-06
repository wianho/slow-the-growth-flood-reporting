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

## Privacy & Security

### Our Privacy-First Approach

**We do not track you.** This application is designed with privacy as a core principle.

#### What We DON'T Collect:
- ❌ No personal information (name, email, phone number)
- ❌ No account creation or login required for reporting
- ❌ No IP address logging
- ❌ No persistent cookies or tracking pixels
- ❌ No third-party analytics (Google Analytics, Facebook, etc.)
- ❌ No location history beyond the single report submission
- ❌ No cross-site tracking

#### What We DO Use:
- ✅ **Anonymous Device Fingerprinting** - A temporary hash created from your browser characteristics (used only for rate limiting)
  - Purpose: Prevent spam (3 reports per device per day)
  - Storage: Not linked to any personal information
  - Deletion: Automatically removed when reports expire (7 days)
- ✅ **GPS Coordinates** - Only for the specific flood location you're reporting
  - Purpose: Display flood location on the map
  - Storage: Only the coordinates of the reported flood, not your device's location history
  - Deletion: Automatically archived after 7 days
- ✅ **Local Storage** - Device fingerprint stored locally in your browser
  - Purpose: Rate limiting without server-side user tracking
  - Control: You can clear this anytime via browser settings

#### Data Retention

- **Flood Reports**: Automatically archived after 7 days
- **Device Fingerprints**: Deleted when associated reports expire
- **No Long-Term Tracking**: All data is ephemeral by design

#### Security Practices

- 🔒 **HTTPS Only** - All communication encrypted with SSL/TLS
- 🔐 **Environment Variables** - Sensitive credentials never stored in code
- 🛡️ **Rate Limiting** - Redis-based spam prevention (3 reports per device per day)
- 🔑 **Admin Authentication** - Bcrypt password hashing + JWT tokens
- 📍 **Location Validation** - Server-side verification that reports are from Volusia County
- 🚫 **No Database Exports** - Reports are not sold, shared, or exported to third parties

#### Open Source Transparency

This entire application is open source. You can:
- Review our code to verify our privacy claims
- Audit our security practices
- See exactly what data we collect and how it's used
- Contribute improvements to make it even more private and secure

**See our [Security Documentation](.github/SECURITY.md) for technical details.**

## Contact

- GitHub: [github.com/wianho/slow-the-growth-flood-reporting](https://github.com/wianho/slow-the-growth-flood-reporting)

---

**Slow the Growth** - Empowering communities through data-driven environmental awareness
