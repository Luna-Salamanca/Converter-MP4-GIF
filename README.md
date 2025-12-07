# Converter-MP4-GIF

This is a web application for converting MP4 videos to GIFs.

## Development

To run the application in development mode, you need to have Node.js and npm installed.

1.  Clone the repository:

    ```bash
    git clone https://github.com/Luna-Salamanca/Converter-MP4-GIF.git
    ```

2.  Install the dependencies:

    ```bash
    npm install
    ```

3.  Run the development server:

    ```bash
    npm run dev
    ```

## Recent Enhancements

This project has received several key enhancements for improved functionality and user experience:

*   **Enhanced GIF Generation Reliability:** Fixed an issue where the GIF Web Worker failed to load, ensuring stable and consistent GIF creation.
*   **More Accurate Size Estimation:** Implemented significant improvements to the estimated GIF file size calculation, providing more precise predictions, especially for higher quality outputs and when adjusting dimensions.
*   **Updated Branding & UI Clarity:** The application branding has been updated to "Cassi-Fi." Additionally, dimension labels in the export settings have been clarified for better user understanding.

For a detailed development log and a comprehensive list of all changes, please refer to the `GEMINI.md` file.

## Deployment to GitHub Pages

This application can be deployed to GitHub Pages. 

### Manual Deployment

1.  Build the application:

    ```bash
    npm run build
    ```

2.  Deploy to GitHub Pages:

    ```bash
    npm run deploy
    ```

### Automated Deployment

This project includes a GitHub Actions workflow that automatically deploys the application to GitHub Pages whenever you push to the `main` branch.

To enable automated deployment, you need to:

1.  Go to your repository's settings.
2.  In the "Pages" section, select the `gh-pages` branch as the source for your GitHub Pages site.
3.  Push to the `main` branch.

The workflow will then automatically build and deploy your application.