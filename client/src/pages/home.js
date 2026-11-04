import { t } from "shablon";
import layout from "../components/layout";

export default function home() {
    return layout(t.h1({}, "Discussions"));
}
