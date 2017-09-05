import { ComponentClass } from 'react'
import * as t from 'io-ts'
import { PathReporter } from 'io-ts/lib/PathReporter'
import * as React from 'react'

// tslint:disable-next-line no-empty
const noop = () => {}

export type Options = {
  strict?: boolean
  children?: t.Type<any>
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

export type PropTypeable =
  | t.AnyType
  | t.RefinementType<any>
  | t.ReadonlyType<any>
  | t.IntersectionType<any, any>
  | t.InterfaceType<any>
  | t.PartialType<any>

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

export function props(type: PropTypeable, options?: Options): (C: ComponentClass<any>) => void {
  if (process.env.NODE_ENV !== 'production') {
    const propsTypes = getPropTypes(type, options)
    return function(Component) {
      Component.propTypes = propsTypes
    }
  }
  return noop
}

export class ReactElementType implements t.Type<React.ReactElement<any>> {
  readonly _tag: 'ReactElement' = 'ReactElement'
  readonly _A: React.ReactElement<any>
  readonly name: string = 'ReactElement'
  readonly validate: t.Validate<React.ReactElement<any>> = (v, c) =>
    React.isValidElement(v) ? t.success(v) : t.failure(v, c)
}

export const ReactElement: ReactElementType = new ReactElementType()

export class ReactChildType implements t.Type<React.ReactChild> {
  readonly _tag: 'ReactChild' = 'ReactChild'
  readonly _A: React.ReactChild
  readonly name: string = 'ReactChild'
  readonly validate: t.Validate<React.ReactChild> = (v, c) =>
    t.is(v, t.string) || t.is(v, t.number) || t.is(v, ReactElement) ? t.success(v) : t.failure(v, c)
}

export const ReactChild: ReactChildType = new ReactChildType()

export class ReactFragmentType implements t.Type<React.ReactFragment> {
  readonly _tag: 'ReactFragment' = 'ReactFragment'
  readonly _A: React.ReactFragment
  readonly name: string = 'ReactFragment'
  readonly validate: t.Validate<React.ReactFragment> = (v, c) =>
    t.is(v, t.Dictionary) || t.is(v, t.array(ReactNode)) ? t.success(v) : t.failure(v, c)
}

export const ReactFragment: ReactFragmentType = new ReactFragmentType()

export class ReactNodeType implements t.Type<React.ReactNode> {
  readonly _tag: 'ReactNode' = 'ReactNode'
  readonly _A: React.ReactNode
  readonly name: string = 'ReactNode'
  readonly validate: t.Validate<React.ReactNode> = (v, c) =>
    t.is(v, ReactChild) || t.is(v, ReactFragment) || t.is(v, t.boolean) || t.is(v, t.null) || t.is(v, t.undefined)
      ? t.success(v)
      : t.failure(v, c)
}

export const ReactNode: ReactNodeType = new ReactNodeType()
