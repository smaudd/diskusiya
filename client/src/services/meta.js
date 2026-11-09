export default function meta({ title }) {
    const titleMetaTag = document.querySelector("title");
    if (titleMetaTag) {
        if (title) {
            titleMetaTag.textContent = `${title} - ${import.meta.env.VITE_APP_TITLE}`;
            return;
        }
        titleMetaTag.textContent = import.meta.env.VITE_APP_TITLE;
    }
}
