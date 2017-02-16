Alternative syntax for prop types powered by [io-ts](https://github.com/gcanti/io-ts)

# How it works

The `@props` decorator sets `propTypes` on the target component to use a [custom validator function](https://facebook.github.io/react/docs/reusable-components.html#prop-validation) built around `io-ts` types.

# Usage

```ts
import * as React from 'react'
import * as t from 'io-ts'
import { props } from 'prop-types-ts'

// define the runtime type
const AlertType = t.union([
  t.literal('success'),
  t.literal('warning'),
  t.literal('info')
], 'AlertType')

const RuntimeProps = t.object({
  type: AlertType
}, 'Props')

// extract the static type
export type Props = t.TypeOf<typeof RuntimeProps>;
// same as type Props = { type: 'success' | 'warning' | 'info' }

@props(RuntimeProps)
export default class Alert extends React.Component<Props, void> {
  render() {
    return <div>{this.props.children}</div>
  }
}
```

# Errors

```ts
<Alert type="foo" />
```

Output: `Invalid value "foo" supplied to : Props/type: AlertType`

```ts
<Alert type="info" foo="bar" />
```

Output: `Invalid additional prop(s): ["foo"]`

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

- `ReactElement`
- `ReactChild`
- `ReactFragment`
- `ReactNode`
