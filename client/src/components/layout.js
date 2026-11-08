import { t, store } from "shablon";
import header from "./header";
import footer from "./footer";
import { pb } from "../pb";
import meta from "../services/meta";

export default function layout(...children) {
    // call meta empty for every page to have the proper <title>. each page has the responsability of calling it with whatever is needed
    meta({});
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
