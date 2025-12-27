# Project Overview

This is a web application for converting MP4 videos to GIFs. It's a full-stack TypeScript project with a React frontend and an Express backend.

**Frontend:**

- **Framework:** React
- **Build Tool:** Vite
- **Routing:** Wouter
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **Data Fetching:** TanStack Query

**Backend:**

- **Framework:** Express
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM

# Building and Running

To run the application in development mode, you need to have Node.js and npm installed.

1.  Install the dependencies:

    ```bash
    npm install
    ```

2.  Run the development server:

    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:5000`.

To build the application for production, run:

```bash
npm run build
```

To start the production server, run:

```bash
npm run start
```

# Development Conventions

The project uses TypeScript for both the frontend and the backend. The code is organized into `client` and `server` directories.

The frontend code is located in the `client/src` directory. It uses a feature-based structure, with components, hooks, pages, and utils organized into separate directories.

The backend code is located in the `server` directory. It uses Express as a web framework and Drizzle ORM for database access. The API routes are defined in the `server/routes.ts` file.

# Recent Changes & Enhancements

This section summarizes recent updates and bug fixes.

## 1. Fixed GIF Worker Loading Issue

-   **Problem:** The GIF generation process was getting stuck at "GIF worker progress: 0%". Investigation revealed the Web Worker (`gif.worker.js`) was not loading, often indicated by "Provisional Headers" in the browser's Network tab.
-   **Root Cause:** A mismatch between Vite's `base: '/Converter-MP4-GIF/'` configuration (which prefixes all static asset paths) and the hardcoded `workerScript: '/gif.worker.js'` path used by the GIF library.
-   **Solution:** The `workerScript` path in `client/src/components/settings-panel.tsx` was modified to use `import.meta.env.BASE_URL + 'gif.worker.js'`. This leverages Vite's dynamic base URL, ensuring the worker script is loaded from the correct location.

## 2. Branding Update

-   **Change:** Replaced all instances of "GIFcraft" with "Cassi-Fi" in the frontend, specifically in `client/src/components/layout.tsx` and `client/index.html`.

## 3. Improved Estimated GIF Size Calculation

Several issues related to the estimated GIF size display were addressed:

### 3.1. Dimension Changes Not Reflecting in Estimate

-   **Problem:** The estimated GIF size (`estSize`) was not updating when output dimensions were changed (e.g., from "Original" to "720px Width").
-   **Root Cause:** The `width` state variable (controlling dimensions) was missing from the dependency array of the `useEffect` hook that calculates `estSize`. Additionally, the calculation used original video dimensions instead of the dynamically calculated output GIF dimensions.
-   **Solution:** `width` was added to the `useEffect` dependency array. The logic to calculate `gifWidth` and `gifHeight` based on the selected `width` was integrated into the `useEffect`, ensuring `pixelCount` uses the correct output dimensions.

### 3.2. Draft Mode Not Affecting Estimate

-   **Problem:** Toggling "Draft Mode (Fast)" did not change the estimated GIF size.
-   **Root Cause:** The `useEffect` for `estSize` did not include `fastMode` as a dependency, and its `compressionFactor` calculation didn't account for `fastMode` overriding the `quality` setting (which implies higher compression).
-   **Solution:** `fastMode` was added to the `useEffect` dependency array. The `compressionFactor` calculation was updated to use an `effectiveQuality` derived from both `fastMode` and `compression` settings, aligning the estimate with the actual encoding quality.

### 3.3. Enhanced Estimated Size Accuracy

-   **Problem:** The estimated GIF size was significantly underestimating the actual file size (e.g., an estimate of 43MB resulted in a ~150MB GIF).
-   **Root Cause:** The `compressionFactor` heuristic used a too-narrow range (0.2 to 0.8 bytes/pixel), which was insufficient to accurately represent the file sizes of complex GIFs, especially at higher quality settings.
-   **Solution:** The range for the `compressionFactor` heuristic was adjusted to be wider and more conservative (0.5 to 2.0 bytes/pixel). This provides a more realistic upper bound for estimated sizes, leading to more accurate predictions for various video contents and quality settings.

## 4. UI/UX Refinements

-   **Dimension Label Clarity:**
    -   **Problem:** Dimension labels like "720p" were misleading, as the application uses these values to set the output *width*, not height.
    -   **Solution:** Labels were updated from "HD (720p)" to "HD (720px Width)", "Social (480p)" to "Social (480px Width)", and "Mobile (360p)" to "Mobile (360px Width)" for improved clarity.
-   **Dimensions Section Visual Alignment:**
    -   **Enhancement:** The "Dimensions" settings section was updated to visually match the style of the "Frame Rate" and "Compression" sliders. This included adding a separate display for the current selected output dimensions within the header, ensuring a consistent user interface.