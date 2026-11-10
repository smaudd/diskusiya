import { t } from "shablon";
import { pb } from "../pb";

export default function avatar({ author, src }) {
    if (src) {
        return t.img({
            className: "avatar-image",
            src,
        });
    }
    return author?.avatar
        ? t.img({
              className: "avatar-image",
              src: pb.files.getURL(author, author?.avatar, {
                  thumb: "100x250",
              }),
          })
        : t.span({ className: "avatar-imageless" }, author?.name?.slice(0, 2) || "");
}
