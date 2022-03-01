import type { AsyncLocalStorage as AsyncLocalStorageType } from "async_hooks";

const AsyncLocalStorageImport = (() => {
  try {
    return require("async_hooks").AsyncLocalStorage;
  } catch {
    return undefined;
  }
})();

/**
 * The default instance name
 */
const DEFAULT_CONTEXT_NAME = "_ASYNC_LOCAL_STORAGE_CONTEXT_";

/**
 * Provides a class to access the AsyncLocalStorage from "async_hooks"
 */
class AsyncLocalStorageContext<T> {
  /**
   * The name of the instance
   */
  public name: string;

  /**
   * The instance of the instiated class
   */
  private instance: AsyncLocalStorageType<T>;

  /**
   * List of all available instances
   */
  private static allInstances: Map<string, AsyncLocalStorageType<any>> = new Map();

  /**
   *
   * @param name The name of the instance, optional
   */
  constructor(name = DEFAULT_CONTEXT_NAME) {
    // if AsyncLocalStorage doesn't exist do nothing...
    if (AsyncLocalStorageImport === undefined) {
      return;
    }

    const staticInstance = AsyncLocalStorageContext.allInstances.get(name);
    // We already have an instance, we won't recreate it...
    if (staticInstance) {
      this.instance = staticInstance;
    }
    // We are missing the instance so we create a new one...
    else {
      const newInstance = new AsyncLocalStorageImport();
      this.instance = newInstance;
      AsyncLocalStorageContext.allInstances.set(name, newInstance);
    }

    this.name = name;
  }

  /**
   * Disables the context. All further calls to getStore will be undefined.
   * Node.js doc: https://nodejs.org/api/async_context.html#asynclocalstoragedisable
   */
  disable() {
    this.instance.disable();
  }

  /**
   * Gets the store
   * Node.js doc: https://nodejs.org/api/async_context.html#async_context_asynclocalstorage_getstore
   * @returns The underlying store of type T
   */
  getStore(): T | undefined {
    return this.instance.getStore();
  }

  /**
   * Runs the current instance
   * Node.js doc: https://nodejs.org/api/async_context.html#async_context_asynclocalstorage_run_store_callback_arg
   * @param fn The function to run, the context will be available in all underlying calls
   * @param initialValue The initial values, optional
   */
  async run(fn: () => Promise<void>, initialValue: T): Promise<void> {
    return this.instance.run(initialValue, fn);
  }
}

export { AsyncLocalStorageContext as AlsContext };
