export type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
    ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
    : S;

export type FromDb<T> = {
    [K in keyof T as SnakeToCamelCase<K & string>]: T[K] extends null ? (Exclude<T[K], null> | undefined) : T[K]
};
