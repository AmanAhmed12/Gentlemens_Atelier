export function toPlain<T>(value: T): PlainOf<T> {
  return JSON.parse(JSON.stringify(value));
}

type PlainOf<T> = T extends { toJSON(): infer J }
  ? J
  : T extends (infer U)[]
    ? PlainOf<U>[]
    : T extends object
      ? { [K in keyof T]: PlainOf<T[K]> }
      : T;
