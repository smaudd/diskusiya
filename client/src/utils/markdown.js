/**
 * 
 * Taken from https://ganigeorgiev.com/bugstage/bugstage/files/ui/src/utils.markdown.js
 */

import markdownit from "markdown-it";
import DOMPurify from "dompurify";

const DOMPurifyConfig = {
    ALLOW_DATA_ATTR: false,
    ALLOWED_TAGS: [
        "a",
        "p",
        "ul",
        "ol",
        "li",
        "img",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "b",
        "i",
        "s",
        "em",
        "sub",
        "sup",
        "strong",
        "small",
        "code",
        "pre",
        "span",
        "blockquote",
        "cite",
        "br",
        "hr",
        "table",
        "tbody",
        "thead",
        "tfoot",
        "tr",
        "td",
        "th",
        "details",
        "summary",
    ],
    ALLOWED_ATTR: [
        // note: class is filtered addinitionally via hook
        "class",
        "href",
        "title",
        "alt",
        "src",
        "colspan",
        "rowspan",
        "align",
        "valign",
        "name", // for grouped details
    ],
    // extends the default regex and adds "blob:..." urls support for the dragged attachments
    // https://github.com/cure53/DOMPurify/blob/560ffd6725664996d017181b8b0ae37e4b0c68fa/src/regexp.ts#L8
    ALLOWED_URI_REGEXP:
        /^(?:(?:(?:f|ht)tps?|blob|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

let md;

/**
 * Parses and renders the provided Markdown content as safe HTML string
 * (cleaned with `app.utils.sanitizeHTML`).
 *
 * @param  {string} content
 * @return {string}
 */
export default function renderMarkdown(content) {
    if (!md) {
        md = markdownit({
            html: true,
            breaks: true,
            linkify: true,
        });

        md.use(mentionWrap);
        md.use(hashNumberToDiscussionLink);
    }

    // note: check the util sanitizer func as some of the attrs and elements will be stripped
    return DOMPurify.sanitize(md.render(content || ""), DOMPurifyConfig);
    // return app.utils.sanitizeHTML(md.render(content || ""));
};

// Markdown-it helpers and plugins
//
// A lot of the below code is copied or based on the examples from
// https://github.com/markdown-it/markdown-it/blob/master/docs/examples/text_decoration.md
// -------------------------------------------------------------------

// Wraps `@username` in `<strong>` HTML tag.
function mentionWrap(md) {
    md.inline.ruler.push("mention", function (state, silent) {
        const start = state.pos;
        const marker = state.src.charCodeAt(start);

        if (silent || marker !== 0x40 /* @ */) {
            return false;
        }

        const rest = state.src.slice(start);

        // extract username
        const match = rest.match(/^@\w+/);
        if (!match) {
            return false;
        }

        const strongOpen = state.push("em_open", "em", 1);
        strongOpen.attrs = [["class", "mention"]];

        const token = state.push("text", "", 0);
        token.content = match[0];

        state.push("em_close", "em", -1);

        // move next parsing past the mentioned username
        state.pos += match[0].length;

        return true;
    });
}

// Converts a plain test `#123` into a discussion link such as
// `<a href="https://example.com/myproject/discussions/123">#123</a>`.
function hashNumberToDiscussionLink(md) {
    // const baseUrl = app.store.__raw?.activeProjectDiscussionsURL;
    // if (!baseUrl) {
    //     return;
    // }

    md.inline.ruler.push("mention", function (state, silent) {
        const start = state.pos;
        const marker = state.src.charCodeAt(start);

        if (silent || state.linkLevel > 0 || marker !== 0x23 /* # */) {
            return false;
        }

        const rest = state.src.slice(start);

        // extract discussion number
        const match = rest.match(/^#\w+/);
        if (!match) {
            return false;
        }

        const linkOpen = state.push("link_open", "a", 1);
        // linkOpen.attrs = [["href", `${baseUrl}/${match[0].substring(1)}`]];

        const token = state.push("text", "", 0);
        token.content = match[0];

        state.push("link_close", "a", -1);

        // move next parsing past the number
        state.pos += match[0].length;

        return true;
    });
}
