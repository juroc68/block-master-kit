import "./styles.css";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const rootElement = document.querySelector<HTMLDivElement>("#app");
if (!rootElement) {
  throw new Error("Missing #app container");
}

createRoot(rootElement).render(<App />);