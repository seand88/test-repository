#Overview - AI Usage Description 

I used AI, specifically gemini cli to help write some more tedious parts of the project. 
Unit tests, etc.... 

I also used it for some of the components. 
Once I had the architecture I wanted in terms of the component system on the frontend, then I could ask AI to generate individual components. 
Typically I like to only use it for small tasks, like a single component otherwise it can get out of hand. 
Need to make sure it follows the architecture and scalability I am going for. 

In terms of the backend design its all based on pathing for the deep linking strategy needed. 
I also used AI to write some of the unit testing on the backend. 

In my daily usage I will use AI for unit testing then review the tests etc... 
Have to really watch every piece of code its touching to make sure what you want. 

Overall im pleased with the design accomplishing this within 5-6 hours as thats all the time I have for this. 

I really like the canvas element idea I used to render 3d in the background. This could really be anything you want, a full 3d scene or something to make things more visually interesting. 

Thanks for taking the time to look at my project. see below for instructions. 



# File Browser SPA - Code Test

This project is a Single Page Application (SPA) built with a vanilla TypeScript frontend (using a custom component-based architecture) and a .NET Web API backend.

## Project Structure

*   `ClientApp/`: Contains the raw, vanilla TypeScript source code for the frontend UI.
*   `wwwroot/`: The web root. This serves the static `index.html`, CSS, and the *compiled* JavaScript. **Do not edit `.js` files in here directly.**
*   `Controllers/`: ASP.NET Core API Controllers.
*   `Program.cs`: The backend entry point.

## Prerequisites

To build and run this project, you need:
1.  [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
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
