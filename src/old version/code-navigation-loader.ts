import generate from '@babel/generator'
import traverse from '@babel/traverse'
import * as parser from '@babel/parser'
import * as types from '@babel/types'
import type { LoaderContext } from 'webpack'

const forbiddenNodeTypes = ['JSXFragment']
const excludeDefault = [
  'React.Fragment',
  'Fragment',
  'MuiThemeProvider',
  'CssBaseline',
  'ThemeProvider',
  'ClickAwayListener',
]

export default function codeNavigationLoader(
  this: LoaderContext<{
    exclude?: string[]
    lineJsxKey?: string
    columnJsxKey?: string
    filePathJsxKey?: string
  }>,
  source: string
): string {
  const options = this.getOptions()
  const filePath = this.resourcePath
  const {
    exclude = [],
    lineJsxKey = 'data-code-line',
    columnJsxKey = 'data-code-column',
    filePathJsxKey = 'data-code-file-path',
  } = options ?? {}

  const excludeSet = Array.from(new Set([...exclude, ...excludeDefault]))

  const sourceAst = parser.parse(source, {
    sourceType: 'unambiguous',
    plugins: ['typescript', 'jsx'],
    errorRecovery: false,
  })

  traverse(sourceAst, {
    JSXElement(path) {
      const nodeType = path.node.type
      const openingElement = path.node.openingElement
      const jsxComponentName = (() => {
        const identifier = openingElement.name as types.JSXIdentifier
        if (identifier.name) return identifier.name

        const memberExpression = openingElement.name as types.JSXMemberExpression
        const memberExpressionObject = memberExpression.object as types.JSXIdentifier
        const memberExpressionProperty = memberExpression.property as types.JSXIdentifier
        return `${memberExpressionObject.name}.${memberExpressionProperty.name}`
      })()
      if (!forbiddenNodeTypes.includes(nodeType) && !excludeSet.includes(jsxComponentName)) {
        const { line, column } = path.node.loc?.start ?? {}
        openingElement.attributes.unshift(
          types.jsxAttribute(types.jsxIdentifier(lineJsxKey), types.stringLiteral(String(line))),
          types.jsxAttribute(
            types.jsxIdentifier(columnJsxKey),
            types.stringLiteral(String(column))
          ),
          types.jsxAttribute(types.jsxIdentifier(filePathJsxKey), types.stringLiteral(filePath))
        )
      }
    },
  })
  const { code } = generate(sourceAst)
  return code
}
