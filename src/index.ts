import { ComponentClass } from 'react'
import * as t from 'io-ts'
import { PathReporter } from 'io-ts/lib/PathReporter'
import * as React from 'react'

// tslint:disable-next-line no-empty
const noop = () => {}

export type Options = {
  strict?: boolean
  children?: t.Any
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

export interface PropTypeableRefinement extends t.RefinementType<PropTypeable, any, any> {}
export interface PropTypeableReadonlyType extends t.ReadonlyType<PropTypeable, any> {}
export interface PropTypeableIntersection extends t.IntersectionType<Array<PropTypeable>, any> {}
export type PropTypeable =
  | t.AnyType
  | PropTypeableRefinement
  | PropTypeableReadonlyType
  | PropTypeableIntersection
  | t.InterfaceType<any, any>
  | t.PartialType<any, any>

function getProps(type: PropTypeable): t.Props | null {
  switch (type._tag) {
    case 'RefinementType':
    case 'ReadonlyType':
      return getProps(type.type)
    case 'IntersectionType':
      const props = type.types.map(getProps).filter(Boolean)
      if (props.length) {
        return Object.assign.apply(null, [{}].concat(props))
      }
      break
    case 'InterfaceType':
    case 'PartialType':
      return type.props
  }
  return null
}

export function getPropTypes(type: PropTypeable, options: Options = { strict: true }) {
  const props = options.strict ? getProps(type) : null
  return {
    __prop_types_ts(values: any, prop: string, displayName: string): Error | null {
      const validation = t.validate(values, type).chain(v => {
        if (options.children) {
          return options.children.validate(values.children, [{ key: 'children', type: options.children }])
        }
        return t.success(v)
      })
      return validation.fold(
        () => new Error('\n' + PathReporter.report(validation).join('\n')),
        () => {
          if (props) {
            const excess = getExcessProps(values, props)
            if (excess.length > 0) {
              return new Error(`\nInvalid additional prop(s): ${JSON.stringify(excess)}`)
            }
          }
          return null
        }
      )
    }
  }
}

const NODE_ENV = process.env.NODE_ENV

export function props(type: PropTypeable, options?: Options): (C: ComponentClass<any>) => void {
  if (NODE_ENV !== 'production') {
    const propsTypes = getPropTypes(type, options)
    return function(Component) {
      Component.propTypes = propsTypes
    }
  }
  return noop
}

export class ReactElementType extends t.Type<any, React.ReactElement<any>> {
  readonly _tag: 'ReactElement' = 'ReactElement'
  constructor() {
    super(
      'ReactElement',
      React.isValidElement,
      (v, c) => (React.isValidElement(v) ? t.success(v) : t.failure(v, c)),
      x => x
    )
  }
}

export const ReactElement: ReactElementType = new ReactElementType()

const isReactChild = (v: any): v is React.ReactChild => t.string.is(v) || t.number.is(v) || ReactElement.is(v)

export class ReactChildType extends t.Type<any, React.ReactChild> {
  readonly _tag: 'ReactChild' = 'ReactChild'
  constructor() {
    super('ReactChild', isReactChild, (v, c) => (isReactChild(v) ? t.success(v) : t.failure(v, c)), x => x)
  }
}

export const ReactChild: ReactChildType = new ReactChildType()

const isReactFragment = (v: any): v is React.ReactFragment => t.Dictionary.is(v) || ReactNodes.is(v)

export class ReactFragmentType extends t.Type<any, React.ReactFragment> {
  readonly _tag: 'ReactFragment' = 'ReactFragment'
  constructor() {
    super('ReactFragment', isReactFragment, (v, c) => (isReactFragment ? t.success(v) : t.failure(v, c)), x => x)
  }
}

export const ReactFragment: ReactFragmentType = new ReactFragmentType()

const isReactNode = (v: any): v is React.ReactNode =>
  t.boolean.is(v) || t.null.is(v) || t.undefined.is(v) || ReactChild.is(v) || ReactFragment.is(v)

export class ReactNodeType extends t.Type<any, React.ReactNode> {
  readonly _tag: 'ReactNode' = 'ReactNode'
  constructor() {
    super('ReactNode', isReactNode, (v, c) => (isReactNode ? t.success(v) : t.failure(v, c)), x => x)
  }
}

export const ReactNode: ReactNodeType = new ReactNodeType()
const ReactNodes = t.array(ReactNode)
