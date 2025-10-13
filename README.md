# Slow the Growth - Flood Reporting

> Community-driven flood reporting system with statewide visibility and multi-county reporting

🌐 **Live Application**: [https://stgfloods386.from-fl.com](https://stgfloods386.from-fl.com)

📖 **Access Model**: Public viewing statewide · Reporting available in Volusia & Palm Beach counties

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Overview

**Slow the Growth** is an open-source Progressive Web App (PWA) that tracks flooding in participating Florida counties while displaying data statewide for public awareness. Residents of Volusia and Palm Beach counties (including Wellington) can anonymously report flooding conditions to document the impact of rapid development. The system features location verification, rate limiting, confidence scoring, and integration with NOAA and USGS data sources.

**Why this approach?** By displaying the map statewide, we raise awareness about flooding issues across Florida while maintaining data quality through county-specific reporting. New counties can join the program as advocacy efforts expand.

### Mission

To empower communities with real-time flood data, promoting informed decision-making and highlighting the need for sustainable development practices.

## Features

- 📍 **Anonymous Reporting** - Submit flood reports from participating counties (Volusia, Palm Beach) with device fingerprinting (no personal data stored)
- 🗺️ **Interactive Statewide Map** - View flood reports from all counties on a Florida-wide map for context
- 🎯 **Location Verification** - GPS-based verification ensures reports are from participating county residents
- ⏱️ **Rate Limiting** - 3 reports per device per day to prevent spam
- 🔄 **Confidence Scoring** - Multiple reports from the same area increase confidence
- 📅 **Weekly Rotation** - Data automatically archives every Wednesday at 5am EST
- 🌊 **USGS Integration** - Real-time stream gauge data from major Florida waterways
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
