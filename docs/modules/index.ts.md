---
title: index.ts
nav_order: 1
parent: Modules
---

# index overview

Added in v0.6.0

---

<h2 class="text-delta">Table of contents</h2>

- [PropTypeableIntersection (interface)](#proptypeableintersection-interface)
- [PropTypeableReadonlyType (interface)](#proptypeablereadonlytype-interface)
- [PropTypeableRefinement (interface)](#proptypeablerefinement-interface)
- [PropTypeableUnion (interface)](#proptypeableunion-interface)
- [Options (type alias)](#options-type-alias)
- [PropTypeable (type alias)](#proptypeable-type-alias)
- [ReactChildType (class)](#reactchildtype-class)
- [ReactElementType (class)](#reactelementtype-class)
- [ReactFragmentType (class)](#reactfragmenttype-class)
- [ReactNodeType (class)](#reactnodetype-class)
- [ReactChild (constant)](#reactchild-constant)
- [ReactElement (constant)](#reactelement-constant)
- [ReactFragment (constant)](#reactfragment-constant)
- [ReactNode (constant)](#reactnode-constant)
- [getPropTypes (function)](#getproptypes-function)
- [props (function)](#props-function)

---

# PropTypeableIntersection (interface)

**Signature**

```ts
export interface PropTypeableIntersection extends t.IntersectionType<Array<PropTypeable>> {}
```

Added in v0.6.0

# PropTypeableReadonlyType (interface)

**Signature**

```ts
export interface PropTypeableReadonlyType extends t.ReadonlyType<PropTypeable> {}
```

Added in v0.6.0

# PropTypeableRefinement (interface)

**Signature**

```ts
export interface PropTypeableRefinement extends t.RefinementType<PropTypeable> {}
```

Added in v0.6.0

# PropTypeableUnion (interface)

**Signature**

```ts
export interface PropTypeableUnion extends t.UnionType<Array<PropTypeable>> {}
```

Added in v0.6.0

# Options (type alias)

**Signature**

```ts
export type Options = {
  strict?: boolean
  children?: t.Mixed
  reporter?: Reporter<string[]>
}
```

Added in v0.6.0

# PropTypeable (type alias)

**Signature**

```ts
export type PropTypeable =
  // tslint:disable-next-line: deprecation
  | t.AnyType
  | PropTypeableRefinement
  | PropTypeableReadonlyType
  | PropTypeableIntersection
  | t.InterfaceType<any>
  // tslint:disable-next-line: deprecation
  | t.StrictType<any>
  | t.PartialType<any>
  | PropTypeableUnion
```

Added in v0.6.0

# ReactChildType (class)

**Signature**

```ts
export class ReactChildType {
  constructor() { ... }
  ...
}
```

Added in v0.6.0

# ReactElementType (class)

**Signature**

```ts
export class ReactElementType {
  constructor() { ... }
  ...
}
```

Added in v0.6.0

# ReactFragmentType (class)

**Signature**

```ts
export class ReactFragmentType {
  constructor() { ... }
  ...
}
```

Added in v0.6.0

# ReactNodeType (class)

**Signature**

```ts
export class ReactNodeType {
  constructor() { ... }
  ...
}
```

Added in v0.6.0

# ReactChild (constant)

**Signature**

```ts
export const ReactChild: ReactChildType = ...
```

Added in v0.6.0

# ReactElement (constant)

**Signature**

```ts
export const ReactElement: ReactElementType = ...
```

Added in v0.6.0

# ReactFragment (constant)

**Signature**

```ts
export const ReactFragment: ReactFragmentType = ...
```

Added in v0.6.0

# ReactNode (constant)

**Signature**

```ts
export const ReactNode: ReactNodeType = ...
```

Added in v0.6.0

# getPropTypes (function)

**Signature**

```ts
export function getPropTypes(type: PropTypeable, options: Options = { strict: true }) { ... }
```

Added in v0.6.0

# props (function)

**Signature**

```ts
export function props(type: PropTypeable, options?: Options): (C: React.ComponentClass<any>) => void { ... }
```

Added in v0.6.0
