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
    name: 'export default and named declarations (#30)',
    code: 'const foo = 1;const BAR = 2;export { foo as default, BAR }',
    expected: {
      module: {
        default: 1,
        BAR: 2
      },
      exports: {
        default: 1,
        BAR: 2
      }
    }
  }
]
