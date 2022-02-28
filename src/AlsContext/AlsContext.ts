import { AsyncLocalStorage } from "async_hooks";

/**
 * The default instance name
 */
const DEFAULT_CONTEXT_NAME = "__ASYNC_LOCAL_STORAGE_CONTEXT";

/**
 * Provides a class to access the AsyncLocalStorage from "async_hooks"
 */
class AsyncLocalStorageContext<T> {
  /**
   * The name of the instance
   */
  private name: string;

  /**
   * The instance of the instiated class
   */
  private instance: AsyncLocalStorage<T>;

  /**
   * List of all available instances
   */
  private static allInstances: Map<string, AsyncLocalStorage<any>> = new Map();

  /**
   *
   * @param name The name of the instance, optional
   */
  constructor(name = DEFAULT_CONTEXT_NAME) {
    const staticInstance = AsyncLocalStorageContext.allInstances.get(name);

    // We already have an instance, we won't recreate it...
    if (staticInstance) {
      this.instance = staticInstance;
    }
    // We are missing the instance so we create a new one...
    else {
      const newInstance = new AsyncLocalStorage<T>();
      this.instance = newInstance;
      AsyncLocalStorageContext.allInstances.set(name, newInstance);
    }

    this.name = name;
  }

  /**
   * Get rid off the instance
   */
  dispose() {
    AsyncLocalStorageContext.allInstances.delete(this.name);
  }

  /**
   * Gets the store
   * https://nodejs.org/api/async_context.html#async_context_asynclocalstorage_getstore
   * @returns The underlying store of type T
   */
  getStore(): T | undefined {
    return this.instance.getStore();
  }

  /**
   * Runs the current instance
   * https://nodejs.org/api/async_context.html#async_context_asynclocalstorage_run_store_callback_args
   * @param fn The function to run, the context will be available in all underlying calls
   * @param initialValue The initial values, optional
   */
  async run(fn: () => Promise<void>, initialValue: T): Promise<void> {
    return this.instance.run(initialValue, fn);
  }
}

export { AsyncLocalStorageContext as AlsContext };
