import PocketBase from "pocketbase";
export const PB_URL = import.meta.env.VITE_PB_BACKEND_URL;
export const pb = new PocketBase(PB_URL);
