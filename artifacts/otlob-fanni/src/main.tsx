import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { seedDatabase } from "./data/seedDatabase";

seedDatabase();

createRoot(document.getElementById("root")!).render(<App />);
