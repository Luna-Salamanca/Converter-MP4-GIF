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
