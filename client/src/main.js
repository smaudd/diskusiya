import { router } from "shablon";
import "./pb";
import "./i18n";
import "./css/main.css";
import "./components/toast";
import login from "./pages/login";
import home from "./pages/home";
import register from "./pages/register";
import settings from "./pages/settings";

const app = document.getElementById("app");
router(
    {
        "/": () => {
            app.replaceChildren(home());
        },
        "/login": () => {
            app.pb.authStore.isValid ? app.navigate("/") : app.replaceChildren(login());
        },
        "/register": () => {
            app.pb.authStore.isValid
                ? app.navigate("/")
                : app.replaceChildren(register());
        },
        "/settings": () => {
            app.pb.authStore.isValid
                ? app.replaceChildren(settings())
                : app.navigate("/login");
        },
    },
    { pretty: true },
);

window.app = window.app || {};
window.app.navigate = (route) => {
    history.pushState({}, null, route);
};
