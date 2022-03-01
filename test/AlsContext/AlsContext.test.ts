import { AlsContext } from "../../dist/index";
import { faker } from "@faker-js/faker";
import { makeArray } from "test/utils/test-helpers";

interface MyStore {
  counter: number;
}

describe("AlsContext behaves correctly :-)", () => {
  let context = new AlsContext<MyStore>();

  afterEach(() => {
    context = new AlsContext<MyStore>();
  });

  test("getStore returns undefined when accessed outside of a run functionnn", () => {
    // Arrange
    // done in before each / after each

    // Act
    const store = context.getStore();

    // Assert
    expect(store).toBeUndefined();
  });

  test("initial value is passed correctly", () => {
    // Arrange
    const fakeNumber = faker.datatype.number();

    // Act
    let counter = 0;
    context.run(
      async () => {
        const store = context.getStore();
        // eslint-reason false positive, can't deconstruct into a variable...
        // eslint-disable-next-line prefer-destructuring
        counter = store!.counter;
      },
      {
        counter: fakeNumber,
      },
    );

    // Assert
    expect(counter).toBe(fakeNumber);
  });

  test("getting the value with the same context name works", () => {
    // Arrange
    const fakeNumber = faker.datatype.number();

    // Act
    let counter = 0;
    context.run(
      async () => {
        const newContext = new AlsContext<MyStore>();
        // eslint-disable-next-line prefer-destructuring
        counter = newContext.getStore()!.counter;
      },
      {
        counter: fakeNumber,
      },
    );

    // Assert
    expect(counter).toBe(fakeNumber);
  });

  test("multiple context can have different values", () => {
    // Arrange
    const fakeNumbers = makeArray<number>(2, () => faker.datatype.number());
    const context2 = new AlsContext<MyStore>(faker.datatype.string());

    // Act
    const counters: number[] = [];
    context.run(
      async () => {
        counters.push(context.getStore()!.counter);

        context2.run(
          async () => {
            counters.push(context2.getStore()!.counter);
          },
          {
            counter: fakeNumbers[1],
          },
        );
      },
      {
        counter: fakeNumbers[0],
      },
    );

    // Assert
    expect(counters).toEqual(fakeNumbers);
  });

  test("dsiabling a context works", () => {
    // Arrange
    const fakeNumbers = [faker.datatype.number(), undefined];

    // Act
    const counters: (number | undefined)[] = [];
    context.run(
      async () => {
        counters.push(context.getStore()!.counter);
        context.disable();
        counters.push(context.getStore()?.counter);
      },
      {
        counter: +fakeNumbers[0]!,
      },
    );

    // Assert
    expect(counters).toEqual(fakeNumbers);
  });

  test("multiple context run can keep track of their own values, although they reference the same AsyncLocalStorage behind the scenes", async () => {
    // Arrange
    const fakeNumbers = makeArray<number>(2, () => faker.datatype.number());
    function worker(counter: number): Promise<number> {
      return new Promise<number>((resolve) => {
        context.run(
          async () => {
            setTimeout(() => {
              resolve(context.getStore()!.counter);
            }, faker.datatype.number({ min: 100, max: 500 }));
          },
          {
            counter,
          },
        );
      });
    }

    // Act
    const result = await Promise.all([worker(fakeNumbers[0]), worker(fakeNumbers[1])]);

    // Assert
    expect(result).toEqual(fakeNumbers);
  });
});
