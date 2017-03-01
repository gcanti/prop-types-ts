import { ComponentClass } from 'react'
import * as t from 'io-ts'
import { PathReporter } from 'io-ts/lib/reporters/default'
import * as React from 'react'

const noop = () => {}

export type Options = {
  strict?: boolean,
  children?: t.Type<any>
};

function getExcessProps(values: Object, props: t.Props): Array<string> {
  const excess: Array<string> = []
  for (let k in values) {
    if (k !== 'children' && !props.hasOwnProperty(k)) {
      excess.push(k);
    }
  }
  return excess
}

function getProps(type: t.Any): t.Props | null {
  if (type instanceof t.RefinementType || type instanceof t.ReadonlyType) {
    return getProps(type.type)
  }
  if (type instanceof t.IntersectionType) {
    const props = type.types.map(getProps).filter(Boolean)
    if (props.length) {
      return Object.assign.apply(null, [{}].concat(props))
    }
  }
  if (type instanceof t.InterfaceType || type instanceof t.PartialType) {
    return type.props
  }
  return null
}

export function getPropTypes(type: t.Any, options: Options = { strict: true }) {
  const props = options.strict ? getProps(type) : null
  return {
    __prop_types_ts(values: any, prop: string, displayName: string): Error | null {
      const validation = t.validate(values, type)
        .chain(v => {
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
              return new Error(`\nInvalid additional prop(s): ${JSON.stringify(excess)}`);
            }
          }
          return null
        }
      )
    }
  }
}

export function props(type: t.Any, options?: Options): (C: ComponentClass<any>) => void {
  if (process.env.NODE_ENV !== 'production') {
    const propsTypes = getPropTypes(type, options)
    return function (Component) {
      Component.propTypes = propsTypes
    }
  }
  return noop
}

export const ReactElement = new t.Type<React.ReactElement<any>>(
  'ReactElement',
  (v, c) => React.isValidElement(v) ? t.success(v) : t.failure<React.ReactElement<any>>(v, c)
)

export const ReactChild = new t.Type<React.ReactChild>(
  'ReactChild',
  (v, c) => t.string.is(v) || t.number.is(v) || ReactElement.is(v) ? t.success(v) : t.failure<React.ReactChild>(v, c)
)

export const ReactFragment: t.Type<React.ReactFragment> = new t.Type<React.ReactFragment>(
  'ReactFragment',
  (v, c) => t.Dictionary.is(v) || t.array(ReactNode).is(v) ? t.success(v) : t.failure<React.ReactFragment>(v, c)
)

export const ReactNode = new t.Type<React.ReactNode>(
  'ReactNode',
  (v, c) => ReactChild.is(v) || ReactFragment.is(v) || t.boolean.is(v) || t.null.is(v) || t.undefined.is(v) ? t.success(v) : t.failure<React.ReactNode>(v, c)
)

