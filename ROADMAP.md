# Slow the Growth - Project Roadmap

## Mission
Track flooding in Volusia County and correlate it with rapid development to support "Slow the Growth" advocacy.

---

## v1.0 - Foundation (Current)
**Status:** ✅ Complete
**Goal:** Basic flood reporting system with statewide visibility

- [x] Anonymous flood reporting (Volusia County only)
- [x] Interactive map (shows all of Florida)
- [x] Location verification (GPS-based)
- [x] Rate limiting (3 reports/device/day)
- [x] Weekly data rotation
- [x] NOAA weather alerts
- [x] USGS stream gauge data
- [x] PWA support

---

## v1.1 - Current Deployment (In Progress)
**Status:** 🔄 In Progress
**Goal:** Deploy statewide map with Volusia-only reporting

- [ ] Deploy to production VPS
- [ ] Test location verification
- [ ] Update public-facing documentation
- [ ] Monitor for issues

---

## v2.0 - Development Overlay (Planned)
**Status:** 📋 Planned
**Goal:** Show correlation between flooding and development

### Features
- [ ] **Zoning layer overlay**
  - Display Volusia County zoning classifications
  - Toggle on/off
  - Color-coded by zone type

- [ ] **Pending development permits**
  - Show active development permit applications
  - Click permit → see details (address, project type, size)
  - Filter by permit type

- [ ] **Future land use layer**
  - Show areas designated for future development
  - Highlight high-growth zones

- [ ] **Correlation metrics**
  - Count flood reports within X meters of development sites
  - Dashboard widget: "15 reports near 8 pending projects"
  - Time-based analysis (reports before/after development)

### Data Sources
- Volusia County Open Data Portal: https://opendata-volusiacountyfl.hub.arcgis.com/
- GRM Interactive Map data
- Building permit data

### Technical Approach
- ArcGIS REST API integration
- Frontend: Leaflet overlay layers
- Backend: Cache GIS data, refresh daily
- New service: `backend/src/services/volusiaGIS.ts`

---

## v2.1 - Enhanced Visualization (Future)
**Status:** 💡 Ideas
**Goal:** Make the data more compelling for advocacy

- [ ] **Heatmap view**
  - Density of flood reports
  - Overlay with development density

- [ ] **Timeline slider**
  - Show flooding over time
  - Correlate with development approvals

- [ ] **PDF Report Generation**
  - Export map view with stats
  - Use for presentations/meetings
  - "15 floods reported in [Zone] since [Date]"

- [ ] **Photo uploads**
  - Allow users to attach photos to reports
  - Image gallery per location

---

## v3.0 - County Expansion (Future)
**Status:** 💡 Ideas
**Goal:** Expand to other Florida counties

- [ ] Wellington/Palm Beach County support
- [ ] County-specific GIS integration
- [ ] Multi-county dashboard
- [ ] County comparison metrics

---

## v3.1 - Advanced Features (Future)
**Status:** 💡 Ideas

- [ ] **Historical flood data**
  - Import past flooding events
  - Show trends over years

- [ ] **FEMA flood zone integration**
  - Show official flood zones
  - Highlight reports in non-flood zones (surprising data)

- [ ] **Storm surge simulation**
  - Show predicted surge zones
  - Overlay with reported flooding

- [ ] **API for researchers**
  - Public API for flood data
  - Support academic research

- [ ] **Email notifications**
  - Alert subscribers to new reports in their area
  - Weekly digest

---

## Technical Debt & Improvements

### High Priority
- [ ] Add automated tests (unit + integration)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Database backup automation
- [ ] Error monitoring (Sentry or similar)

### Medium Priority
- [ ] Improve mobile responsiveness
- [ ] Add admin dashboard analytics
- [ ] Optimize map performance (clustering)
- [ ] Add TypeScript strict mode

### Low Priority
- [ ] Dark mode
- [ ] Internationalization (Spanish)
- [ ] Accessibility improvements (WCAG AA)

---

## Ideas for Advocacy Use

### Data Stories
- "X% of flood reports occur within 500m of new developments"
- "Flooding increased by Y% in areas rezoned for development"
- "Z reports in non-flood zones - development changed drainage?"

### Presentations
- Live demo at county meetings
- Static exports for slides
- Before/after comparisons

### Media Engagement
- Share map on social media
- Partner with local news
- Submit data to investigative journalists

---

## Notes

### Design Principles
1. **Privacy First** - No personal data collection
2. **Mobile-Friendly** - Most users report from phones
3. **Simple UX** - Easy to report, easy to view
4. **Data Integrity** - Rate limiting, location verification
5. **Advocacy Focus** - Data should tell compelling stories

### Data Retention
- Active reports: 7 days
- Archived reports: Indefinite (for historical analysis)
- Device fingerprints: Deleted with reports

### Community Guidelines
- No spam/abuse
- Volusia County residents only (for reporting)
- Public data, open source code

---

## Contact & Contributions

- **GitHub Issues**: Report bugs or request features
- **Pull Requests**: Welcome!
- **Email**: [Your contact for advocacy inquiries]

---

*Last Updated: October 13, 2025*
