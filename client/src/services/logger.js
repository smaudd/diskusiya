export default function logger(...args) {
    if (import.meta.env.DEV) {
        console[args.at(-1)](...args.slice(0, args.length - 1))
    }
}