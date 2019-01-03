import * as assert from 'assert'
import { getPropTypes, Options, ReactElement, ReactNode, ReactFragment, ReactChild, PropTypeable } from '../src'
import * as t from 'io-ts'
import * as React from 'react'

function runPropTypes(propTypes: { __prop_types_ts: Function }, values: Object): Error | null {
  return propTypes.__prop_types_ts(values, '__prop_types_ts', '<diplayName>')
}

function assertError(type: PropTypeable, values: Object, message: string, options?: Options) {
  const error = runPropTypes(getPropTypes(type, options), values)
  if (error !== null) {
    assert.strictEqual(error.message, message)
  } else {
    assert.ok(false)
  }
}

function assertNoError(type: PropTypeable, values: Object, options?: Options) {
  const error = runPropTypes(getPropTypes(type, options), values)
  assert.strictEqual(error, null)
}

describe('getPropTypes', () => {
  it('should check bad values', () => {
    const T = t.interface({ name: t.string })
    assertError(T, {}, '\nInvalid value undefined supplied to : { name: string }/name: string')
    assertNoError(T, { name: 'name' })
  })

  it('should check excess props', () => {
    const T = t.interface({ name: t.string })
    assertError(T, { name: 'name', a: 1 }, '\nInvalid additional prop(s): ["a"]')
  })

  it('should handle strict = false option', () => {
    const T = t.interface({ name: t.string })
    assertNoError(T, { name: 'name', a: 1 }, { strict: false })
  })

  it('should handle children option', () => {
    const T = t.interface({ name: t.string })
    assertNoError(T, { name: 'name', children: 1 }, { children: t.number })
    assertError(T, { name: 'name', children: 's' }, '\nInvalid value "s" supplied to children: number', {
      children: t.number
    })
  })

  it('should handle refinements', () => {
    const T = t.refinement(t.interface({ a: t.number }), v => v.a >= 0)
    assertNoError(T, { a: 1 })
    assertError(T, { a: -1 }, '\nInvalid value {"a":-1} supplied to : ({ a: number } | <function1>)')
  })

  it('should handle intersections', () => {
    const A = t.interface({ a: t.string })
    const B = t.interface({ b: t.number })
    const T = t.intersection([A, B])
    assertNoError(T, { a: 's', b: 1 })
    assertError(T, { a: 2, b: 1 }, '\nInvalid value 2 supplied to : ({ a: string } & { b: number })/a: string')
    assertError(T, { a: 's', b: 1, c: 2 }, '\nInvalid additional prop(s): ["c"]')
    const T2 = t.intersection([t.any, t.any])
    assertNoError(T2, { a: 's', b: 1, c: 2 })
  })

  it('should handle any', () => {
    const T = t.any
    assertNoError(T, { a: 's', b: 1 })
  })

  it('should handle unions', function() {
    const T = t.union([t.interface({ a: t.string }), t.interface({ b: t.number })])
    assertNoError(T, { a: 's' })
    assertNoError(T, { b: 1 })
    assertError(T, { a: 's', b: 1 }, '\nInvalid additional prop(s): ["b"]')
  })

  it('should handle tagged unions', function() {
    const T = t.taggedUnion('type', [
      t.interface({ type: t.literal('A'), a: t.string }),
      t.interface({ type: t.literal('B'), b: t.number })
    ])
    assertNoError(T, { type: 'A', a: 's' })
    assertNoError(T, { type: 'B', b: 1 })
    assertError(T, { type: 'A', a: 's', b: 1 }, '\nInvalid additional prop(s): ["b"]')
  })
})

describe('Pre-defined types', () => {
  it('ReactElement', () => {
    const T = ReactElement
    assert.strictEqual(T.is(<div />), true)
    assert.strictEqual(T.is(null), false)
    assert.strictEqual(T.is(NaN), false)
  })

  it('ReactFragment', () => {
    const T = ReactFragment
    assert.strictEqual(T.is(<div />), true)
    assert.strictEqual(T.is([<div />, <span />]), true)
    assert.strictEqual(T.is(null), false)
    assert.strictEqual(T.is(NaN), false)
  })

  it('ReactChild', () => {
    const T = ReactChild
    assert.strictEqual(t.Dictionary.is(NaN), false)
    assert.strictEqual(T.is(true), false)
  })

  it('ReactNode', () => {
    const T = ReactNode
    assert.strictEqual(T.is(<div />), true)
    assert.strictEqual(T.is(false), true)
    assert.strictEqual(T.is(null), true)
    assert.strictEqual(T.is(undefined), true)
    assert.strictEqual(
      T.is(() => {
        return undefined
      }),
      false
    )
  })
})
