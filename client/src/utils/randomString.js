export default function randomString() {
    return (Math.random() + 1).toString(64).substring(7);
}
