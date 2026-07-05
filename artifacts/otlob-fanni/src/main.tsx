import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // updateViaCache: 'none' forces the browser to always fetch a fresh
    // copy of sw.js over the network (bypassing HTTP cache), since our
    // hosting layer applies long-term immutable caching to all static
    // assets, including /sw.js, by default.
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then((reg) => {
      reg.update().catch(() => {});
    }).catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
