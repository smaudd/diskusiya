import { store, t } from "shablon";
import getBlockedUsers from "../services/collections/users";
import recordMeta from "./recordMeta";
import { $ } from "../utils/i18n";
import { unblockUser } from "../services/collections/blocks";
import confirmationModal from "./confirmationModal";
import modal from "./modal";
import pagination from "./pagination";
import loader from "./loader";

export default function blockedUsers() {
    const searchParams = new URLSearchParams(location.search);
    let data = store({
        items: [],
        shouldUnblockId: null,
        page: +searchParams.get("page") || 1,
        limit: 1,
        totalItems: null,
        loading: false,
    });

    const confirmationModalRef = confirmationModal({
        onConfirm: async () => {
            await unblockUser(data.shouldUnblockId);
            data.items = data.items.filter((item) => item.id !== data.shouldUnblockId);
            data.shouldUnblockId = null;
            modal.close(confirmationModalRef);
        },
    });

    return t.div(
        {
            onmount: async () => {
                const res = await getBlockedUsers({ data });
                data.items = res.items;
                data.totalItems = res.totalItems;
                data.totalPages = res.totalPages;
                data.page = res.page;
            },
        },
        confirmationModalRef,

        t.ul(
            {
                className: "table",
            },
            () => {
                if (data.loading) {
                    return loader();
                }
                if (data.items.length === 0) {
                    return t.span({}, $("You don't have any blocked users"));
                }
                return data.items.map((item) =>
                    t.li(
                        {},
                        t.div(
                            { className: "row-data" },
                            recordMeta({
                                created: item.created,
                                updated: item.updated,
                                author: item.expand.blocking,
                            }),
                        ),
                        t.div({ className: "row-actions" }, [
                            t.button(
                                {
                                    className: "btn",
                                    onclick: () => {
                                        data.shouldUnblockId = item.id;
                                        modal.open(confirmationModalRef);
                                    },
                                },
                                $("Unblock"),
                            ),
                        ]),
                    ),
                );
            },
            () => {
                if (data.items.length > 0 && data.items.totalPages > 1) {
                    pagination({
                        data,
                        collection: "settings",
                    });
                }
            },
        ),
    );
}
