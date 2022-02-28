import { isProxy, isReadonly, readonly } from "../reactive";

describe("readonly", () => {
  it("happy path", () => {
    const original = { foo: 1, bar: { baz: 2 } };

    const wrapped = readonly(original);

    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
    expect(isReadonly(wrapped.bar)).toBe(true);
    expect(isReadonly(original.foo)).toBe(false);

    expect(isProxy(wrapped)).toBe(true);
  });

  it("warn when call set", () => {
    console.warn = jest.fn();

    const user = readonly({
      age: 1,
    });

    user.age = 11;

    expect(console.warn).toBeCalled();
    expect(isReadonly(user)).toBe(true);
    expect(isReadonly({ a: 1 })).toBe(false);
  });
});
