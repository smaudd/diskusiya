import { t, store } from "shablon";
import header from "./header";
import footer from "./footer";
import { pb } from "../pb";

export default function layout(...children) {
    const data = store({ language: pb?.authStore?.record?.language || "en" });
    return t.main(
        {
            className: "page",
            rid: data.language,
        },
        () => header(),
        () => children,
        () => footer(),
    );
}
