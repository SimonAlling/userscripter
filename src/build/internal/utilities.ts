export function concat<T>(xss: ReadonlyArray<T | ReadonlyArray<T>>): ReadonlyArray<T> {
    return ([] as ReadonlyArray<T>).concat(...xss);
}
