# CCM Executive Dashboard - Deployment Guide

## Quick Deploy to Firebase Hosting

This dashboard is configured for deployment to Firebase Hosting under the `rts-labs` project.

### Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Authenticated to Firebase: `firebase login`

### Deployment Steps

1. **Build the production bundle**
   ```bash
   npm run build
   ```
   This creates an optimized production build in the `dist/` directory with embedded static data.

2. **Deploy to Firebase Hosting**
   ```bash
   firebase deploy --only hosting
   ```

3. **Access the deployed dashboard**
   - Firebase URL: `https://rts-labs.web.app` or `https://rts-labs.firebaseapp.com`
   - Custom domain (if configured): `https://ccm-dash.labs.rapidtechconsultants.com`

### Data Source Behavior

**Local Development (`npm run dev`)**:
- Fetches data from `/analytical_layer/core_reporting.json`
- Live reloading when JSON file changes
- Full local workflow unchanged

**Production (Firebase Hosting)**:
- Attempts to fetch `/analytical_layer/core_reporting.json` (will fail—file not deployed)
- Automatically falls back to embedded static data bundled in the app
- Uses snapshot of data at build time
- No runtime dependencies on external files

### Updating Production Data

To update the data shown on the live site:

1. Update `analytical_layer/core_reporting.json` locally with new data
2. Run `npm run build` (this embeds the updated data)
3. Run `firebase deploy --only hosting`
4. Live site now reflects new data

### Firebase Project Configuration

- **Project**: `rts-labs`
- **Hosting Site**: Default (can be changed to `ccm-dash` subdomain later)
- **Build Directory**: `dist/`
- **Single Page App**: Yes (all routes rewrite to `/index.html`)

### Cache Headers

- Static assets (JS, CSS, images): Cached for 1 year
- HTML and JSON: No caching (always fetch latest)

### Future: Live Firestore Integration

When Firestore is configured:

1. Uncomment `fetchAppDataFromFirestore()` in `src/services/dataService.js`
2. Add Firebase SDK initialization
3. Data cascade will become: **Firestore → Local JSON → Embedded Static**
4. No changes needed to components or deployment process

---

## Custom Domain Setup (Optional)

To use `ccm-dash.labs.rapidtechconsultants.com`:

1. **Add custom domain in Firebase Console**
   - Go to Firebase Console → Hosting → Add custom domain
   - Enter: `ccm-dash.labs.rapidtechconsultants.com`

2. **Update DNS records** (at your DNS provider)
   ```
   Type: CNAME
   Name: ccm-dash.labs
   Value: rts-labs.web.app
   ```

3. **Wait for SSL certificate provisioning** (automatic, ~24 hours)

---

## Rollback Strategy

If deployment has issues:

```bash
firebase hosting:channel:deploy preview  # Test in preview channel first
firebase hosting:clone SOURCE:TARGET     # Rollback to previous version
```

---

## Monitoring

- **Firebase Console**: View traffic, performance, errors
- **Browser Console**: Check `[DataService]` logs to confirm data source used
  - "Loaded data from local JSON file" = Local dev mode
  - "Local JSON unavailable, using embedded static data" = Production mode
