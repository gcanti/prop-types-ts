import { ComponentClass } from 'react'
import * as t from 'io-ts'
import { PathReporter } from 'io-ts/lib/reporters/default'

const noop = () => {}

export type Options = { strict?: boolean };

function getExcessProps(values: Object, props: t.Props): Array<string> {
  const excess: Array<string> = []
  for (let k in values) {
    if (!props.hasOwnProperty(k)) {
      excess.push(k);
    }
  }
  return excess
}

export function getPropTypes(type: t.Type<any>, options: Options = { strict: true }) {
  return {
    __prop_types_ts(values: Object, prop: string, displayName: string): Error | null {
      const validation = t.validate(values, type)
      return validation.fold(
        () => new Error('\n' + PathReporter.report(validation).join('\n')),
        () => {
          if (options.strict) {
            const excess = getExcessProps(values, (type as any).props)
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

export function props<T extends t.Type<any>, P extends t.TypeOf<T>>(type: T, options?: Options): (C: ComponentClass<P>) => void {
  if (process.env.NODE_ENV !== 'production') {
    const propsTypes = getPropTypes(type, options)
    return function (Component) {
      Component.propTypes = propsTypes
    }
  }
  return noop
}
