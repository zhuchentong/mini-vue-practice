import { effect, stop } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({ age: 10 });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);
    // update
    user.age++;
    expect(nextAge).toBe(12);
  });

  it("effect runner", () => {
    let count = 1;
    const runner = effect(() => {
      count++;
      return "count plus";
    });

    expect(count).toBe(2);

    const result = runner();

    expect(count).toBe(3);
    expect(result).toBe("count plus");
  });

  it("effect scheduler", () => {
    let count: any;
    let run: any;

    const scheduler = jest.fn(() => {
      run = runner;
    });

    const obj = reactive({ foo: 1 });

    const runner = effect(
      () => {
        count = obj.foo;
      },
      {
        scheduler,
      }
    );

    expect(scheduler).not.toHaveBeenCalled();
    expect(count).toBe(1);

    obj.foo++;

    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(count).toBe(1);

    run();

    expect(count).toBe(2);
  });

  it("stop", () => {
    let count;
    const obj = reactive({ foo: 1 });

    const runner = effect(() => {
      count = obj.foo;
    });

    obj.foo = 2;

    expect(count).toBe(2);
    stop(runner);

    obj.foo = 3;
    obj.foo++;
    expect(count).toBe(2);
    
    runner();
    expect(count).toBe(4);
  });

  it("onStop", () => {
    const obj = reactive({
      foo: 1,
    });

    const onStop = jest.fn();

    let count;

    const runner = effect(
      () => {
        count = obj.foo;
      },
      {
        onStop,
      }
    );

    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
});
