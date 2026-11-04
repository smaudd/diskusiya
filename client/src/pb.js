import PocketBase from "pocketbase";
window.app = window.app || {};
window.app.pb = new PocketBase(import.meta.env.VITE_PB_BACKEND_URL);
