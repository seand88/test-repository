import { App } from './components/App.js';

document.addEventListener("DOMContentLoaded", () => {
    const rootElement = document.getElementById("app");
    
    if (rootElement) {
        // Initialize our main App component
        const app = new App();
        // Mount it to the root element
        app.mount(rootElement);
    } else {
        console.error("Root element #app not found in index.html");
    }
});