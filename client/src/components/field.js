import { t } from "shablon";

export default function field(
    props,
    fieldElement,
) {
    const className = props.className
    const options = props.options || []
    delete props.className
    delete props.options
    return t.div(
        { className: `field${className ? ` ${className}` : ""}` },
        t.label({ "html-for": props.id }, app.$(props.label)),
        fieldElement(
            props,
            options.length
                ? options.map((option) =>
                      t.option(
                          { value: option.value, selected: option.selected },
                          option.label,
                      ),
                  )
                : null,
        ),
    );
}
