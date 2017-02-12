import * as assert from 'assert'
import { getPropTypes, Options } from '../src/index'
import * as t from 'io-ts'

function runPropTypes(propTypes: { __prop_types_ts: Function }, values: Object): Error | null {
  return propTypes.__prop_types_ts(values, '__prop_types_ts', '<diplayName>');
}

function assertError(type: t.Type<any>, values: Object, message: string, options?: Options) {
  const error = runPropTypes(getPropTypes(type, options), values)
  if (error !== null) {
    assert.strictEqual(error.message, message)
  } else {
    assert.ok(false)
  }
}

function assertNoError(type: t.Type<any>, values: Object, options?: Options) {
  const error = runPropTypes(getPropTypes(type, options), values)
  assert.strictEqual(error, null)
}

describe('getPropTypes', () => {

  it('should check bad values', function () {
    const T = t.object({ name: t.string })
    assertError(T, {}, '\nInvalid value undefined supplied to : { name: string }/name: string')
    assertNoError(T, { name: 'name' })
  });

  it('should check excess props', function () {
    const T = t.object({ name: t.string })
    assertError(T, { name: 'name', a: 1 }, '\nInvalid additional prop(s): ["a"]')
  });

  it('should handle strict = false option', function () {
    const T = t.object({ name: t.string })
    assertNoError(T, { name: 'name', a: 1 }, { strict: false })
  });

})
