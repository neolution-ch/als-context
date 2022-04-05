# @neolution-ch/als-context

This package is a wrapper for the `AsyncLocalStorage`.
Documentation: https://nodejs.org/api/async_context.html#async_context_class_asynclocalstorage.

https://dev.to/miketalbot/simplify-your-node-code-with-continuation-local-storage-variables-4b3k:

> We have all kinds of ways of managing application state on the front end, but when it comes to the server we can find ourselves lost is a mass of parameters or context variables that need to be forwarded to and through everything in case something needs it later.
>
> This is because we can't have global state on something which is processing many things in parallel for different users. At best we could try to create a context and associate that, but there is an easier way using Continuation Local Storage.
>
> CLS is so named because it's a bit like Thread Local Storage - data specifically owned by a thread. It's a set of data that is scope to the current execution context. So no matter how many continuations are flowing through the server, each is sure to have it's own copy.

So basically we can write and read data to the current request. For example we can write a cookie we receive in the request to the CLS and read it anywhere we want (instead of manually passing it around everywhere).

You can also pass the `ALSContext` a name to have multiple contexts, but its optional.

## Example

The `AlsContext` is typed so you can pass it an interface to make it strongly typed.

```typescript
export interface AlsTokenContext {
  token?: string;
}
```

Setting it (usually you want to do this in your server file)

```typescript
const alsContext = new AlsContext<AlsTokenContext>();

await alsContext.run(
  // this is the function that will be run in inside the Context
  async () => {
    const store = alsContext.getStore();
    if (store) {
      store.token = token;
    }
  },
  {
    token: "my token",
  },
);
```

Using it:

```typescript
// eslint-disable-next-line global-require
const alsModule = require("@neolution-ch/als-context");
const alsContext: AlsContext<AlsTokenContext> = new alsModule.AlsContext();
return alsContext.getStore()?.token;
```

## Caveats

:warning: This package only works on the node.js environment not in the browser! So make sure you only require it in on the client side, for example like this:

```typescript
if (typeof window === "undefined") {
  // eslint-disable-next-line global-require
  const alsModule = require("@neolution-ch/als-context");
  const alsContext: AlsContext<YourInterfaceHere> = new alsModule.AlsContext();
}
```

But we are allowed to always import the type:

```typescript
import { AlsContext } from "@neolution-ch/als-context/dist/lib/AlsContext/AlsContext";
```

```typescript
if (typeof window === "undefined") {
  // eslint-disable-next-line global-require
  const alsModule = require("@neolution-ch/als-context");
  const alsContext: AlsContext<YourInterfaceHere> = new alsModule.AlsContext();
}
```

You also have to tell webpack to not try to bundle it like so:

```javascript
webpack: (config, { isServer }) => {
    if (!isServer) {
        config.plugins.push(new IgnorePlugin(/^(\@neolution-ch\/als-context)$/));
    }

    return config;
},
```
