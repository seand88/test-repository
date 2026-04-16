# File Browser SPA - Code Test

This project is a Single Page Application (SPA) built with a vanilla TypeScript frontend (using a custom component-based architecture) and a .NET Web API backend.

## Project Structure

*   `ClientApp/`: Contains the raw, vanilla TypeScript source code for the frontend UI.
*   `wwwroot/`: The web root. This serves the static `index.html`, CSS, and the *compiled* JavaScript. **Do not edit `.js` files in here directly.**
*   `Controllers/`: ASP.NET Core API Controllers.
*   `Program.cs`: The backend entry point.

## Prerequisites

To build and run this project, you need:
1.  [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
2.  [Node.js](https://nodejs.org/) (which includes `npm`)

## How to Run the Application

The application requires two steps to run locally: building the frontend TypeScript, and starting the backend .NET server.

### 1. Build the Frontend

Open a terminal in the project root directory and install the TypeScript dependencies:

```bash
npm install
```

Then, compile the TypeScript source code into standard JavaScript. You have two options:

*   **Option A: Build once**
    ```bash
    npm run build
    ```
    This compiles the `.ts` files in `ClientApp` and outputs `.js` files into `wwwroot/js`.

*   **Option B: Watch mode (Recommended for active development)**
    ```bash
    npm run watch
    ```
    This process will stay open and automatically recompile your TypeScript files every time you save a change.

### 2. Run the Backend

With the frontend compiled, start the .NET Web API server. Open a new terminal (or use your IDE like Visual Studio / Rider) and run:

```bash
dotnet run
```

### 3. View the App

Once the backend is running, it will output the local URL (usually `http://localhost:5000` or `https://localhost:5001`). 

Open that URL in your browser. You should see the basic UI and the component click counter working!

## Architecture Notes

*   **No Frontend Frameworks:** As per the requirements, this project avoids React, Angular, Vue, etc.
*   **Custom Component System:** The frontend utilizes a lightweight, custom `Component` base class (`ClientApp/core/Component.ts`) that provides basic state management (`setState()`) and DOM rendering capabilities using vanilla DOM APIs.
