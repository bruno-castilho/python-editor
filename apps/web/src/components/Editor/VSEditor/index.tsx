'use client'
import MonacoEditor, { type Monaco } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import { VSEditorSkeleton } from './skeleton'
import { useColorScheme, useMediaQuery } from '@mui/material'
import { useEditor } from '@/hooks/useEditor'

const defineMonacoThemes = (monacoInstance: Monaco) => {
  monacoInstance.editor.defineTheme('python-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '5BA3D9', fontStyle: 'bold' },
      { token: 'keyword.control', foreground: '5BA3D9', fontStyle: 'bold' },
      { token: 'storage', foreground: '5BA3D9', fontStyle: 'bold' },

      { token: 'string', foreground: 'FFD43B' },
      { token: 'string.escape', foreground: 'FFA500' },

      { token: 'comment', foreground: '6A9153', fontStyle: 'italic' },

      { token: 'number', foreground: 'FF9F43' },
      { token: 'constant.language', foreground: 'FF9F43', fontStyle: 'bold' },

      { token: 'variable', foreground: 'E8E8E8' },
      { token: 'parameter', foreground: 'C3D9A8' },
      { token: 'property', foreground: 'ABB2BF' },

      { token: 'function', foreground: '4EC9B0', fontStyle: 'bold' },
      { token: 'function.call', foreground: '4EC9B0' },

      { token: 'type', foreground: 'E5C07B', fontStyle: 'bold' },
      { token: 'class', foreground: 'E5C07B', fontStyle: 'bold' },

      { token: 'decorator', foreground: 'C678DD' },

      { token: 'operator', foreground: '56B6C2' },
      { token: 'delimiter', foreground: 'ABB2BF' },
      { token: 'punctuation', foreground: 'ABB2BF' },
    ],
    colors: {
      'editor.background': '#1B2A3B',
      'editor.foreground': '#E8E8E8',
      'editorCursor.foreground': '#FFD43B',

      'editor.selectionBackground': '#2D4A6A',
      'editor.inactiveSelectionBackground': '#1F3347',

      'editor.lineHighlightBackground': '#1F3347',
      'editor.lineHighlightBorder': '#1F3347',

      'editorLineNumber.foreground': '#3776AB',
      'editorLineNumber.activeForeground': '#FFD43B',

      focusBorder: '#00000000',
      'editor.outlineColor': '#00000000',

      'editorError.foreground': '#FF6B6B',
      'editorWarning.foreground': '#FFD43B',
      'editorInfo.foreground': '#5BA3D9',

      'editorSuggestWidget.background': '#1B2A3B',
      'editorSuggestWidget.border': '#3776AB',
      'editorSuggestWidget.foreground': '#E8E8E8',
      'editorSuggestWidget.highlightForeground': '#FFD43B',
      'editorSuggestWidget.selectedBackground': '#2D4A6A',

      'editorIndentGuide.background1': '#2A3F55',
      'editorIndentGuide.activeBackground1': '#3776AB',

      'scrollbarSlider.background': '#3776AB55',
      'scrollbarSlider.hoverBackground': '#3776AB88',
      'scrollbarSlider.activeBackground': '#3776ABAA',
    },
  })

  monacoInstance.editor.defineTheme('python-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '3776AB', fontStyle: 'bold' },
      { token: 'keyword.control', foreground: '3776AB', fontStyle: 'bold' },
      { token: 'storage', foreground: '3776AB', fontStyle: 'bold' },

      { token: 'string', foreground: 'B07D00' },
      { token: 'string.escape', foreground: 'D4820A' },

      { token: 'comment', foreground: '6A7B76', fontStyle: 'italic' },

      { token: 'number', foreground: 'C25A00' },
      { token: 'constant.language', foreground: 'C25A00', fontStyle: 'bold' },

      { token: 'variable', foreground: '212121' },
      { token: 'parameter', foreground: '495D6E' },
      { token: 'property', foreground: '495D6E' },

      { token: 'function', foreground: '1565C0', fontStyle: 'bold' },
      { token: 'function.call', foreground: '1565C0' },

      { token: 'type', foreground: '6D4C41', fontStyle: 'bold' },
      { token: 'class', foreground: '6D4C41', fontStyle: 'bold' },

      { token: 'decorator', foreground: '7B1FA2' },

      { token: 'operator', foreground: '0277BD' },
      { token: 'delimiter', foreground: '546E7A' },
    ],
    colors: {
      'editor.background': '#F5F8FC',
      'editor.foreground': '#212121',
      'editorCursor.foreground': '#3776AB',

      'editor.selectionBackground': '#C2D9F0',
      'editor.inactiveSelectionBackground': '#DDEEFF',

      'editor.lineHighlightBackground': '#EBF2FA',
      'editor.lineHighlightBorder': '#EBF2FA',

      'editorLineNumber.foreground': '#3776AB',
      'editorLineNumber.activeForeground': '#B07D00',

      focusBorder: '#00000000',
      'editor.outlineColor': '#00000000',

      'editorIndentGuide.background1': '#D5E3F0',
      'editorIndentGuide.activeBackground1': '#3776AB',

      'editorError.foreground': '#C62828',
      'editorWarning.foreground': '#E65100',
      'editorInfo.foreground': '#3776AB',

      'editorSuggestWidget.background': '#F5F8FC',
      'editorSuggestWidget.border': '#3776AB',
      'editorSuggestWidget.foreground': '#212121',
      'editorSuggestWidget.highlightForeground': '#3776AB',
      'editorSuggestWidget.selectedBackground': '#C2D9F0',

      'scrollbarSlider.background': '#3776AB33',
      'scrollbarSlider.hoverBackground': '#3776AB66',
      'scrollbarSlider.activeBackground': '#3776AB99',
    },
  })

  monacoInstance.editor.defineTheme('radioactive-code-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'FF073A', fontStyle: 'bold' },
      { token: 'type', foreground: 'FF073A', fontStyle: 'bold' },
      { token: 'storage', foreground: 'FF073A', fontStyle: 'bold' },
      { token: 'interface', foreground: 'FF073A', fontStyle: 'bold' },

      { token: 'string', foreground: '00F0FF' },
      { token: 'string.escape', foreground: '00F0FF' },

      { token: 'comment', foreground: '666666', fontStyle: 'italic' },

      { token: 'number', foreground: 'FFFF00' },
      { token: 'constant.language.boolean', foreground: 'FFFF00' },

      { token: 'variable', foreground: 'E0E0E0' },
      { token: 'parameter', foreground: 'E0E0E0' },
      { token: 'property', foreground: 'E0E0E0' },

      { token: 'function', foreground: '00BFFF', fontStyle: 'bold' },
      { token: 'function.call', foreground: '00BFFF' },

      { token: 'class', foreground: '4EC9B0' },

      { token: 'operator', foreground: '808080' },
      { token: 'delimiter', foreground: '808080' },
      { token: 'brace', foreground: '808080' },
      { token: 'bracket', foreground: '808080' },
      { token: 'paren', foreground: '808080' },

      { token: 'tag', foreground: 'FF073A' },
      { token: 'attribute.name', foreground: '00BFFF' },
      { token: 'attribute.value', foreground: '00F0FF' },

      { token: 'error.foreground', foreground: 'FF0000' },
      { token: 'warning.foreground', foreground: 'FFFF00' },
      { token: 'info.foreground', foreground: '00BFFF' },
    ],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#E0E0E0',
      'editorCursor.foreground': '#D4D4D4',

      'editor.selectionBackground': '#4C5D6F',
      'editor.inactiveSelectionBackground': '#3A424A',

      'editor.lineHighlightBackground': '#1E1E1E',
      'editor.lineHighlightBorder': '#1E1E1E',

      'editorLineNumber.foreground': '#FF073A',
      'editorLineNumber.activeForeground': '#00F0FF',

      focusBorder: '#00000000',
      'editor.outlineColor': '#00000000',

      'editorError.foreground': '#FF0000',
      'editorWarning.foreground': '#FFFF00',
      'editorInfo.foreground': '#00BFFF',

      'editorSuggestWidget.background': '#1E1E1E',
      'editorSuggestWidget.border': '#4A5057',
      'editorSuggestWidget.foreground': '#E0E0E0',
      'editorSuggestWidget.highlightForeground': '#00F0FF',
      'editorSuggestWidget.selectedBackground': '#3A424A',
    },
  })

  monacoInstance.editor.defineTheme('radioactive-code-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'FF073A', fontStyle: 'bold' },
      { token: 'type', foreground: 'FF073A', fontStyle: 'bold' },
      { token: 'storage', foreground: 'FF073A', fontStyle: 'bold' },
      { token: 'interface', foreground: 'FF073A', fontStyle: 'bold' },

      { token: 'string', foreground: '00F0FF' },
      { token: 'string.escape', foreground: '00F0FF' },

      { token: 'comment', foreground: '6A7B76', fontStyle: 'italic' },

      { token: 'number', foreground: '39FF14' },
      { token: 'constant.language.boolean', foreground: '39FF14' },

      { token: 'variable', foreground: '212121' },
      { token: 'parameter', foreground: '212121' },
      { token: 'property', foreground: '212121' },

      { token: 'function', foreground: '00BFFF', fontStyle: 'bold' },
      { token: 'function.call', foreground: '00BFFF' },

      { token: 'class', foreground: '1976D2' },

      { token: 'operator', foreground: '616161' },
      { token: 'delimiter', foreground: '616161' },
      { token: 'brace', foreground: '616161' },
      { token: 'bracket', foreground: '616161' },
      { token: 'paren', foreground: '616161' },

      { token: 'tag', foreground: 'FF073A' },
      { token: 'attribute.name', foreground: '00BFFF' },
      { token: 'attribute.value', foreground: '00F0FF' },

      { token: 'error.foreground', foreground: 'FF0000' },
      { token: 'warning.foreground', foreground: 'FFFF00' },
      { token: 'info.foreground', foreground: '00BFFF' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#212121',
      'editorCursor.foreground': '#000000',

      'editor.selectionBackground': '#B3D9FF',
      'editor.inactiveSelectionBackground': '#E6F2FF',

      'editor.lineHighlightBackground': '#FFFFFF',
      'editor.lineHighlightBorder': '#FFFFFF',

      'editorLineNumber.foreground': 'FF073A',
      'editorLineNumber.activeForeground': '00F0FF',

      focusBorder: '#00000000',
      'editor.outlineColor': '#00000000',

      'editorIndentGuide.background': '#E0E0E0',
      'editorIndentGuide.activeBackground': '#C0C0C0',

      'editorError.foreground': 'FF0000',
      'editorWarning.foreground': 'FFFF00',
      'editorInfo.foreground': '00BFFF',

      'editorSuggestWidget.background': '#FFFFFF',
      'editorSuggestWidget.border': '#E0E0E0',
      'editorSuggestWidget.foreground': '#212121',
      'editorSuggestWidget.highlightForeground': '00F0FF',
      'editorSuggestWidget.selectedBackground': '#E0E0E0',

      'input.background': '#FFFFFF',
      'input.foreground': '#212121',
      'input.border': '#D0D0D0',
      'input.placeholderForeground': '#A0A0A0',
    },
  })
}

interface VSEditorProps {
  defaultValue?: string
}

export function VSEditor({ defaultValue }: VSEditorProps) {
  const { mode } = useColorScheme()
  const isMobile = useMediaQuery('(max-width:600px)')
  const isTablet = useMediaQuery('(max-width:1024px)')

  const { editorRef } = useEditor()

  async function handleEditorMount(
    editor: editor.IStandaloneCodeEditor,
    monacoInstance: Monaco,
  ) {
    defineMonacoThemes(monacoInstance)
    monacoInstance.editor.setTheme(isDarkMode ? 'python-dark' : 'python-light')

    editorRef.current = editor
  }

  const isDarkMode = mode === 'dark'

  return (
    <MonacoEditor
      height="100%"
      defaultLanguage="python"
      defaultValue={defaultValue}
      theme={isDarkMode ? 'python-dark' : 'python-light'}
      saveViewState={false}
      options={{
        fontSize: isMobile ? 12 : isTablet ? 14 : 16,
        minimap: { enabled: true },
        automaticLayout: true,
        fontFamily: '"Fira Code", monospace',
        lineNumbersMinChars: 3,
        scrollBeyondLastLine: false,
        readOnly: false,
      }}
      loading={<VSEditorSkeleton />}
      onMount={handleEditorMount}
    />
  )
}
