import type { CSSProperties } from 'react'

type PrismStyle = Record<string, CSSProperties>

const MONO_FONT =
  '"Cascadia Code", "Fira Code", Consolas, "Courier New", monospace'
const FONT_SIZE = '0.85rem'
const LINE_HEIGHT = '1.5'

export function getCustomStyle(bg: string): CSSProperties {
  return {
    margin: 0,
    borderRadius: 0,
    fontSize: FONT_SIZE,
    fontFamily: MONO_FONT,
    background: bg,
    padding: '12px 16px',
    lineHeight: LINE_HEIGHT,
  }
}

export function getLineNumberStyle(color: string): CSSProperties {
  return {
    minWidth: '2.5em',
    paddingRight: '1em',
    color,
    userSelect: 'none' as const,
  }
}

export const codeTagProps = {
  style: { fontFamily: MONO_FONT } as CSSProperties,
}

// Based on the python-dark Monaco theme palette
export const pythonDarkTheme: PrismStyle = {
  'code[class*="language-"]': {
    color: '#E8E8E8',
    background: '#1B2A3B',
    fontFamily:
      '"Cascadia Code", "Fira Code", Consolas, "Courier New", monospace',
    fontSize: '0.85rem',
    lineHeight: '1.5',
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    tabSize: 4,
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: '#E8E8E8',
    background: '#1B2A3B',
    fontFamily:
      '"Cascadia Code", "Fira Code", Consolas, "Courier New", monospace',
    fontSize: '0.85rem',
    lineHeight: '1.5',
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    tabSize: 4,
    hyphens: 'none',
    padding: '12px 16px',
    margin: 0,
    overflow: 'auto',
  },

  // Line numbers
  'line-numbers .line-numbers-rows': {
    borderRight: '1px solid #2A3F55',
  },
  '.line-numbers-rows > span:before': {
    color: '#3776AB',
  },

  // Keywords: blue (#5BA3D9)
  keyword: { color: '#5BA3D9', fontWeight: 'bold' },
  'keyword.module': { color: '#5BA3D9', fontWeight: 'bold' },
  'keyword.control': { color: '#5BA3D9', fontWeight: 'bold' },
  'control-flow': { color: '#5BA3D9', fontWeight: 'bold' },
  imports: { color: '#5BA3D9', fontWeight: 'bold' },
  storage: { color: '#5BA3D9', fontWeight: 'bold' },

  // Strings: yellow (#FFD43B)
  string: { color: '#FFD43B' },
  'string-interpolation': { color: '#FFD43B' },
  'template-string': { color: '#FFD43B' },
  'string.escape': { color: '#FFA500' },
  regex: { color: '#FFA500' },

  // Comments: green italic (#6A9153)
  comment: { color: '#6A9153', fontStyle: 'italic' },
  prolog: { color: '#6A9153', fontStyle: 'italic' },
  doctype: { color: '#6A9153', fontStyle: 'italic' },
  cdata: { color: '#6A9153', fontStyle: 'italic' },

  // Numbers & booleans: orange (#FF9F43)
  number: { color: '#FF9F43' },
  boolean: { color: '#FF9F43', fontWeight: 'bold' },
  constant: { color: '#FF9F43', fontWeight: 'bold' },
  'literal-property': { color: '#FF9F43' },

  // Functions: teal (#4EC9B0)
  function: { color: '#4EC9B0', fontWeight: 'bold' },
  'function-variable': { color: '#4EC9B0' },
  'method-definition': { color: '#4EC9B0', fontWeight: 'bold' },
  builtin: { color: '#4EC9B0' },

  // Types & classes: gold (#E5C07B)
  'class-name': { color: '#E5C07B', fontWeight: 'bold' },
  'maybe-class-name': { color: '#E5C07B' },

  // Decorators / annotations: purple (#C678DD)
  decorator: { color: '#C678DD' },
  annotation: { color: '#C678DD' },

  // Operators: cyan (#56B6C2)
  operator: { color: '#56B6C2' },
  arrow: { color: '#56B6C2' },

  // Delimiters, punctuation, brackets: muted (#ABB2BF)
  punctuation: { color: '#ABB2BF' },

  // Variables & parameters
  variable: { color: '#E8E8E8' },
  parameter: { color: '#C3D9A8' },
  'attr-name': { color: '#ABB2BF' },
  property: { color: '#ABB2BF' },

  // Tags (HTML/JSX)
  tag: { color: '#5BA3D9' },
  'attr-value': { color: '#FFD43B' },

  // Namespace
  namespace: { color: '#E5C07B' },

  // Selection highlight
  ':not(pre) > code[class*="language-"]': {
    background: '#1B2A3B',
    borderRadius: '4px',
    padding: '0.1em 0.3em',
  },
}

// Based on the python-light Monaco theme palette
export const pythonLightTheme: PrismStyle = {
  'code[class*="language-"]': {
    color: '#212121',
    background: '#F5F8FC',
    fontFamily:
      '"Cascadia Code", "Fira Code", Consolas, "Courier New", monospace',
    fontSize: '0.85rem',
    lineHeight: '1.5',
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    tabSize: 4,
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: '#212121',
    background: '#F5F8FC',
    fontFamily:
      '"Cascadia Code", "Fira Code", Consolas, "Courier New", monospace',
    fontSize: '0.85rem',
    lineHeight: '1.5',
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    tabSize: 4,
    hyphens: 'none',
    padding: '12px 16px',
    margin: 0,
    overflow: 'auto',
  },

  // Keywords: blue (#3776AB)
  keyword: { color: '#3776AB', fontWeight: 'bold' },
  'keyword.module': { color: '#3776AB', fontWeight: 'bold' },
  'keyword.control': { color: '#3776AB', fontWeight: 'bold' },
  'control-flow': { color: '#3776AB', fontWeight: 'bold' },
  imports: { color: '#3776AB', fontWeight: 'bold' },
  storage: { color: '#3776AB', fontWeight: 'bold' },

  // Strings: dark yellow (#B07D00)
  string: { color: '#B07D00' },
  'string-interpolation': { color: '#B07D00' },
  'template-string': { color: '#B07D00' },
  'string.escape': { color: '#D4820A' },
  regex: { color: '#D4820A' },

  // Comments: muted green italic (#6A7B76)
  comment: { color: '#6A7B76', fontStyle: 'italic' },
  prolog: { color: '#6A7B76', fontStyle: 'italic' },
  doctype: { color: '#6A7B76', fontStyle: 'italic' },
  cdata: { color: '#6A7B76', fontStyle: 'italic' },

  // Numbers & booleans: dark orange (#C25A00)
  number: { color: '#C25A00' },
  boolean: { color: '#C25A00', fontWeight: 'bold' },
  constant: { color: '#C25A00', fontWeight: 'bold' },
  'literal-property': { color: '#C25A00' },

  // Functions: dark blue (#1565C0)
  function: { color: '#1565C0', fontWeight: 'bold' },
  'function-variable': { color: '#1565C0' },
  'method-definition': { color: '#1565C0', fontWeight: 'bold' },
  builtin: { color: '#1565C0' },

  // Types & classes: brown (#6D4C41)
  'class-name': { color: '#6D4C41', fontWeight: 'bold' },
  'maybe-class-name': { color: '#6D4C41' },

  // Decorators / annotations: purple (#7B1FA2)
  decorator: { color: '#7B1FA2' },
  annotation: { color: '#7B1FA2' },

  // Operators: dark cyan (#0277BD)
  operator: { color: '#0277BD' },
  arrow: { color: '#0277BD' },

  // Delimiters, punctuation: slate (#546E7A)
  punctuation: { color: '#546E7A' },

  // Variables & parameters
  variable: { color: '#212121' },
  parameter: { color: '#495D6E' },
  'attr-name': { color: '#495D6E' },
  property: { color: '#495D6E' },

  // Tags (HTML/JSX)
  tag: { color: '#3776AB' },
  'attr-value': { color: '#B07D00' },

  // Namespace
  namespace: { color: '#6D4C41' },

  // Selection highlight
  ':not(pre) > code[class*="language-"]': {
    background: '#F5F8FC',
    borderRadius: '4px',
    padding: '0.1em 0.3em',
  },
}
