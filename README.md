Alternative syntax for prop types powered by [io-ts](https://github.com/gcanti/io-ts)

# How it works

The `@props` decorator sets `propTypes` on the target component to use a
[custom validator function](https://facebook.github.io/react/docs/reusable-components.html#prop-validation) built around
`io-ts` types.

# Usage

```ts
import * as React from 'react'
import * as t from 'io-ts'
import { props } from 'prop-types-ts'

// define the runtime types

const AlertType = t.keyof(
  {
    success: true,
    warning: true,
    info: true
  },
  'AlertType'
)

const RuntimeProps = t.interface(
  {
    type: AlertType
  },
  'Props'
)

// extract the static type

export type Props = t.TypeOf<typeof RuntimeProps>
// same as type Props = { type: 'success' | 'warning' | 'info' }

@props(RuntimeProps)
export default class Alert extends React.Component<Props, void> {
  render() {
    return <div>{this.props.children}</div>
  }
}
```

# Without decorators

```ts
import { getPropTypes } from 'prop-types-ts'

...

export default class Alert extends React.Component<Props, void> {
  static propTypes = getPropTypes(RuntimeProps)
  render() {
    return <div>{this.props.children}</div>
  }
}
```

# Errors on console

```ts
;<Alert type="foo" /> // => Invalid value "foo" supplied to : Props/type: AlertType
```

```ts
;<Alert type="info" foo="bar" /> // => Invalid additional prop(s): ["foo"]
```

# Excess Property Checks

By default `prop-types-ts` performs excess property checks. You can opt-out passing an `option` argument to `props`

```ts
@props(RuntimeProps, { strict: false })
export default class Alert extends React.Component<Props, void> {
  ...
}
```

# Pre-defined types

`prop-types-ts` exports some useful pre-defined types:

* `ReactElement`
* `ReactChild`
* `ReactFragment`
* `ReactNode`

# Type checking `children`

Use the `children` option

```ts
@props(RuntimeProps, { children: t.string })
export default class Alert extends React.Component<Props, void> {
  ...
}

<Alert type="info">{1}</Alert> // => Invalid value 1 supplied to children: string
<Alert type="info">hello</Alert> // no errors
```

You can use any [io-ts](https://github.com/gcanti/io-ts) type

```ts
import { props, ReactChild } from 'prop-types-ts'

@props(RuntimeProps, { children: t.tuple([t.string, ReactChild]) })
export default class Alert extends React.Component<Props, void> {
  ...
}

<Alert type="info">hello</Alert> // => Invalid value "hello" supplied to children: [string, ReactChild]
<Alert type="info">hello <b>world</b></Alert> // no errors
```

works for `Component`s too

```ts
import * as t from 'io-ts'
import { props, ReactElement } from 'prop-types-ts'

const JSXButton = t.refinement(ReactElement, e => e.type === 'button', 'JSXButton')

@props(RuntimeProps, { children: JSXButton })
export default class Alert extends React.Component<Props, void> {
  ...
}

<Alert type="info">hello</Alert> // => Invalid value "hello" supplied to children: JSXButton
<Alert type="info"><button>Click me</button></Alert> // no errors
```
