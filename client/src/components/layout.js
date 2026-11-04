import { t, store } from "shablon";
import header from "./header";
import footer from "./footer";

export default function layout(...children) {
    const data = store({ language: app.pb?.authStore?.record?.language || "en" });
    return t.main(
        {
            className: "app page",
            rid: data.language,
        },
        () => header(),
        () => children,
        () => footer(),
    );
}
