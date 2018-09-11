import vm from 'vm'
import util from 'util'
import assert from 'assert'

export function createSandbox() {
  const exports = {}
  const sandbox = {
    exports,
    module: { exports },
    require(path) {
      delete require.cache[require.resolve(path)]
      return require(path)
    }
  }

  return sandbox
}

export function createSandboxAmd() {
  const exports = {}
  const sandbox = {
    exports,
    module: { exports },
    require(path) {
      delete require.cache[require.resolve(path)]
      return require(path)
    },
    define(args, fn) {
      fn(exports)
    }
  }

  return sandbox
}

export function testPlugin(babelTransform, code, options, fn, useAmdSandbox = false) {
  const result = babelTransform(code, options)
  const sandbox = useAmdSandbox ? createSandboxAmd() : createSandbox()

  vm.runInNewContext(result.code, sandbox)

  fn(sandbox.module.exports, result.code)
}

export function inspect(object) {
  const result = util.inspect(object)
  return result.replace('Object {', '{') // HACK the module.export inspect
}

export function equal(actual, expected, previouslyChecked = []) {
  if (typeof expected === 'string') {
    assert(actual.toString() === expected)
  } else if (typeof expected === 'function' || typeof expected === 'object') {
    equalObject(actual, expected, previouslyChecked)
  } else {
    assert(inspect(actual) === inspect(expected))
  }
}

function equalObject(actual, expected, previouslyChecked) {
  // Prevent infinite recursing when encountering circular references
  if (previouslyChecked.includes(expected)) return
  previouslyChecked.push(expected)

  // Check if both have the same properties
  const actualKeys = Object.keys(actual).sort()
  const expectedKeys = Object.keys(expected).sort()
  if (Array.isArray(expected)) {
    assert(actual.length === expected.length)
  } else {
    assert(actualKeys.length === expectedKeys.length)
    expectedKeys.forEach((key, i) => {
      assert(actualKeys[i] === expectedKeys[i])
    })
  }

  // For function we also compare results
  if (typeof expected === 'function') {
    assert(actual() === expected())
  }

  assert(typeof actual === typeof expected)
  expectedKeys.forEach(key => {
    equal(actual[key], expected[key], previouslyChecked)
  })
}
