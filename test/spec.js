module.exports = [
  {
    name: 'export default to module.exports if only export default',
    code: 'export default "default-entry"',
    expected: {
      module: 'default-entry',
      exports: 'default-entry'
    }
  },
  {
    name: 'export other entries to module.exports if no default entry',
    code: 'export const other1 = "entry1"; export const other2 = "entry2"',
    expected: {
      module: {
        other1: 'entry1',
        other2: 'entry2'
      },
      exports: {
        other1: 'entry1',
        other2: 'entry2'
      }
    }
  },
  {
    name: 'not export default to module.exports if export multiple entries',
    code: 'export default "default-entry"; export const other = "other-entry"',
    expected: {
      module: {
        default: 'default-entry',
        other: 'other-entry'
      },
      exports: {
        default: 'default-entry',
        other: 'other-entry'
      }
    }
  },
  {
    name: 'export a function as default entry',
    code: 'export default () => "default-entry"',
    expected: {
      module: () => 'default-entry',
      exports: () => 'default-entry'
    }
  },
  {
    name: 'export default function entry with other entries',
    code: 'export default () => "default-entry"; export const other = "other-entry"',
    expected: {
      module: {
        default: () => 'default-entry',
        other: 'other-entry'
      },
      exports: {
        default: () => 'default-entry',
        other: 'other-entry'
      }
    }
  },
  {
    name: 'not override default object with other export entries',
    code: 'export default { value: 1 }; export const value = 2',
    expected: {
      module: {
        default: { value: 1 },
        value: 2
      },
      exports: {
        default: { value: 1 },
        value: 2
      }
    }
  },
  {
    // even be compatible with wrong behavior: https://github.com/babel/babel/issues/2212#issuecomment-131110500
    // name: 'allow the wrong default export as like in Babel 5',
    name: 'follow the Babel@5 behavior (end of #4)',
    code: 'export default { name: "test", version: "0.0.1" }',
    expected: {
      module: {
        name: 'test',
        version: '0.0.1'
      },
      exports: {
        name: 'test',
        version: '0.0.1'
      }
    }
  },

  {
    name: 'export default using transform-export-extensions (#11)',
    code: "export default from './fixtures/issue011.js'",
    expected: {
      module: 'this is file',
      exports: 'this is file'
    }

  },

  {
    name: 'export renamed default using export-from statement (#20)',
    code: `
      export { default as en } from './fixtures/issue012_en'
      export { default as es } from './fixtures/issue012_es'
      export { default as it } from './fixtures/issue012_it'
    `,
    expected: {
      module: {
        en: 'en',
        es: 'es',
        it: 'it'
      },
      exports: {
        en: 'en',
        es: 'es',
        it: 'it'
      }
    }
  },
  {
    name: 'export renamed variable',
    code: `
      let foo = 'bar'
      export { foo as baz }
    `,
    expected: {
      module: {
        baz: 'bar'
      },
      exports: {
        baz: 'bar'
      }
    }
  },
  {
    name: 'export renamed object',
    code: `
      const Foo = {bar:'baz'}
      export { Foo as beep }
    `,
    expected: {
      module: {
        beep: {
          bar: 'baz'
        }
      },
      exports: {
        beep: {
          bar: 'baz'
        }
      }
    }
  }
]
