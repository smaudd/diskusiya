import { router } from "shablon";
import "./pb";
import "./i18n";
import "./css/main.css";
import "./components/toast";
import "./components/modal";
import login from "./pages/login";
import home from "./pages/home";
import register from "./pages/register";
import discussion from "./pages/discussion";
import settings from "./pages/settings";
import notfound from "./components/notfound";
import layout from "./components/layout";

const app = document.getElementById("app");
router(
    {
        "/": () => {
            app.replaceChildren(home());
        },
        "/d/{slug}": (route) => {
            app.pb.authStore.isValid
                ? app.replaceChildren(discussion(route))
                : app.navigate("/");
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
        // TODO: Not sure if this is the way to 404 every not known route but it seems to work
        "/{any}": () => {
            console.log("hola?");
            app.replaceChildren(layout(notfound()));
        },
    },
    { pretty: true },
);

window.app = window.app || {};
window.app.navigate = (route) => {
    history.pushState({}, null, route);
};

window.app.navigateQueryParam = (paramsList) => {
    const params = new URLSearchParams(window.location.search);
    paramsList.forEach((param) => {
        params.set(param.name, param.value);
    });
    history.replaceState(
        {},
        "",
        decodeURIComponent(`${window.location.pathname}?${params}`),
    );
};
