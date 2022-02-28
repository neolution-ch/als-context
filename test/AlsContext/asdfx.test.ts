import { AlsContext } from "dist/index";

interface MyStore {
  counter: number;
}

describe("Verify ALS works with async await", () => {
  test("Hello World", () => {
    console.log("HI");
    const context = new AlsContext<MyStore>();

    const store = context.getStore();

    expect(store).toBeUndefined();
  });
});
