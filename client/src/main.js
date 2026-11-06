import { router } from "shablon";
import "./pb";
import "./utils/i18n";
import "./css/main.css";
import "./components/toast";
import "./components/modal";
import "./utils/markdown";
import login from "./pages/login";
import home from "./pages/home";
import register from "./pages/register";
import discussion from "./pages/discussion";
import settings from "./pages/settings";
import notfound from "./components/notfound";
import layout from "./components/layout";

const app = document.getElementById("app");
const routes = {
    "/": () => {
        app.replaceChildren(home());
    },
    "/d/{slug}": (route) => {
        app.pb.authStore.isValid
            ? app.replaceChildren(discussion(route))
            : navigate("/");
    },
    "/login": () => {
        app.pb.authStore.isValid ? navigate("/") : app.replaceChildren(login());
    },
    "/register": () => {
        app.pb.authStore.isValid ? navigate("/") : app.replaceChildren(register());
    },
    "/settings": () => {
        app.pb.authStore.isValid
            ? app.replaceChildren(settings())
            : navigate("/login");
    },
    // TODO: Not sure if this is the way to 404 every not known route but it seems to work
    "/{any}": () => {
        app.replaceChildren(layout(notfound()));
    },
};

// Add routes ending with backslash to allow both ways
for (const routeKey of Object.keys(routes)) {
    if (routeKey == "/") continue;
    routes[`${routeKey}/`] = (route) => {
        // fake redirect to route without backslash
        navigate(route.path.slice(0, route.path.length - 1));
    };
}

router(routes, { pretty: true });

