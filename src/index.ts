/**
 * @since 0.6.0
 */
import * as t from 'io-ts'
import { either, fold } from 'fp-ts/lib/Either'
import { PathReporter } from 'io-ts/lib/PathReporter'
import { Reporter } from 'io-ts/lib/Reporter'
import * as React from 'react'

// tslint:disable-next-line no-empty
const noop = () => {}

/**
 * @since 0.6.0
 */
export type Options = {
  strict?: boolean
  children?: t.Mixed
  reporter?: Reporter<string[]>
}

function getExcessProps(values: Object, props: t.Props): Array<string> {
  const excess: Array<string> = []
  for (let k in values) {
    if (k !== 'children' && !props.hasOwnProperty(k)) {
      excess.push(k)
    }
  }
  return excess
}

/**
 * @since 0.6.0
 */
export interface PropTypeableRefinement extends t.RefinementType<PropTypeable> {}
/**
 * @since 0.6.0
 */
export interface PropTypeableReadonlyType extends t.ReadonlyType<PropTypeable> {}
/**
 * @since 0.6.0
 */
export interface PropTypeableIntersection extends t.IntersectionType<Array<PropTypeable>> {}
/**
 * @since 0.6.0
 */
export interface PropTypeableUnion extends t.UnionType<Array<PropTypeable>> {}
/**
 * @since 0.6.0
 */
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

function getProps(values: any, type: PropTypeable): t.Props | null {
  switch (type._tag) {
    case 'AnyType':
      return null
    case 'RefinementType':
    case 'ReadonlyType':
      return getProps(values, type.type)
    case 'IntersectionType':
      const props = type.types.map(type => getProps(values, type)).filter(Boolean)
      if (props.length) {
        return Object.assign({}, ...props)
      } else {
        return null
      }
    case 'InterfaceType':
    case 'PartialType':
    case 'StrictType':
      return type.props
    case 'UnionType':
      for (const member of type.types) {
        if (member.is(values)) {
          return getProps(values, member)
        }
      }
      return null
  }
}

/**
 * @since 0.6.0
 */
export function getPropTypes(type: PropTypeable, options: Options = { strict: true }) {
  const reporter = options.reporter || PathReporter

  return {
    __prop_types_ts(values: any, prop: string, displayName: string): Error | null {
      const validation = either.chain(type.decode(values), v => {
        if (options.children) {
          return options.children.validate(values.children, [{ key: 'children', type: options.children }])
        } else {
          return t.success(v)
        }
      })

      return fold(
        () => new Error('\n' + reporter.report(validation).join('\n')),
        () => {
          const props = options.strict ? getProps(values, type) : null
          if (props) {
            const excess = getExcessProps(values, props)
            if (excess.length > 0) {
              return new Error(`\nInvalid additional prop(s): ${JSON.stringify(excess)}`)
            }
          }
          return null
        }
      )(validation)
    }
  }
}

const NODE_ENV = process.env.NODE_ENV

/**
 * @since 0.6.0
 */
export function props(type: PropTypeable, options?: Options): (C: React.ComponentClass<any>) => void {
  if (NODE_ENV !== 'production') {
    const propsTypes = getPropTypes(type, options)
    return function(Component) {
      Component.propTypes = propsTypes
    }
  }
  return noop
}

/**
 * @since 0.6.0
 */
export class ReactElementType extends t.Type<React.ReactElement<any, any>> {
  readonly _tag: 'ReactElement' = 'ReactElement'
  constructor() {
    super(
      'ReactElement',
      React.isValidElement as any,
      (m, c) =>
        either.chain(t.UnknownRecord.validate(m, c), o =>
          React.isValidElement<any>(o as any) ? t.success(o as any) : t.failure(o, c)
        ),
      t.identity
    )
  }
}

/**
 * @since 0.6.0
 */
export const ReactElement: ReactElementType = new ReactElementType()

/**
 * @since 0.6.0
 */
export class ReactChildType extends t.Type<React.ReactChild> {
  readonly _tag: 'ReactChild' = 'ReactChild'
  constructor() {
    super(
      'ReactChild',
      (m): m is React.ReactChild => t.string.is(m) || t.number.is(m) || ReactElement.is(m),
      (m, c) => (this.is(m) ? t.success(m) : t.failure(m, c)),
      t.identity
    )
  }
}

/**
 * @since 0.6.0
 */
export const ReactChild: ReactChildType = new ReactChildType()

/**
 * @since 0.6.0
 */
export class ReactFragmentType extends t.Type<React.ReactFragment> {
  readonly _tag: 'ReactFragment' = 'ReactFragment'
  constructor() {
    super(
      'ReactFragment',
      (m): m is React.ReactFragment => t.UnknownRecord.is(m) || ReactNodes.is(m),
      (m, c) => (this.is(m) ? t.success(m) : t.failure(m, c)),
      t.identity
    )
  }
}

/**
 * @since 0.6.0
 */
export const ReactFragment: ReactFragmentType = new ReactFragmentType()

/**
 * @since 0.6.0
 */
export class ReactNodeType extends t.Type<React.ReactNode> {
  readonly _tag: 'ReactNode' = 'ReactNode'
  constructor() {
    super(
      'ReactNode',
      (m): m is React.ReactNode =>
        t.boolean.is(m) || t.null.is(m) || t.undefined.is(m) || ReactChild.is(m) || ReactFragment.is(m),
      (m, c) => (this.is(m) ? t.success(m) : t.failure(m, c)),
      t.identity
    )
  }
}

/**
 * @since 0.6.0
 */
export const ReactNode: ReactNodeType = new ReactNodeType()

const ReactNodes = t.array(ReactNode)
