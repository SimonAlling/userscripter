export type Err<E> = { tag: "Err", error: E };

export function Err<E>(error: E): Err<E> {
    return { tag: "Err", error };
}

export type Ok<T> = { tag: "Ok", value: T };

export function Ok<T>(value: T): Ok<T> {
    return { tag: "Ok", value };
}

export type Result<T, E> = Ok<T> | Err<E>;
