export function navigate(route) {
    history.pushState({}, null, route);
}

export function navigateQueryParam(paramsList) {
    const params = new URLSearchParams(window.location.search);
    paramsList.forEach((param) => {
        params.set(param.name, param.value);
    });
    history.replaceState(
        {},
        "",
        decodeURIComponent(`${window.location.pathname}?${params}`),
    );
}
