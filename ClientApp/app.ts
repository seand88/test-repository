import { App } from './components/App.js';

document.addEventListener("DOMContentLoaded", () => {
    const rootElement = document.getElementById("app");
    
    if (rootElement) {
        const app = new App();
        app.mount(rootElement);
    } else {
        console.error("Root element #app not found in index.html");
    }
});