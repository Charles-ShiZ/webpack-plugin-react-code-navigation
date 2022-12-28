import generate from '@babel/generator'
import * as parser from '@babel/parser'

export default function IndexHtmlListener(
  html: string,
  options?: Partial<{
    triggerEvent: string
    triggerKey: string
    lineJsxKey: string
    columnJsxKey: string
    filePathJsxKey: string
    id: string
  }>
): string {
  const {
    id = 'root',
    triggerEvent = 'onContextMenu',
    triggerKey = 'shift',
    lineJsxKey = 'data-code-line',
    columnJsxKey = 'data-code-column',
    filePathJsxKey = 'data-code-file-path',
  } = options ?? {}
  const rootIdAttrRegExp = new RegExp(`id=["|'|\`]${id}["|' | \`]`, 'g')
  if (html.search(rootIdAttrRegExp) === -1) return html
  const bodyClosingTagRegExp = /<\/body>/
  const triggerEventCode = `
    document.${triggerEvent.toLocaleLowerCase()} = function (e) {
      if (e[\`${triggerKey}Key\`]) {
        e.preventDefault()
        e.stopPropagation()
        const element = e.target
        const attributes = element.attributes
        const { line, column, filePath } = ((element) => {
          const attributes = element.attributes
          const line = attributes.getNamedItem('${lineJsxKey}')
          const column = attributes.getNamedItem('${columnJsxKey}')
          const filePath = attributes.getNamedItem('${filePathJsxKey}')
          if (line && column && filePath) {
            return {
              line: line.value,
              column: +column.value + 1,
              filePath: filePath.value,
            }
          } else {
            const fiberKey = Object.keys(element).find((key) => key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance'))
            // __reactInternalInstance: react <= v16.13.1
            let debugOwner = element[fiberKey]
            while (debugOwner) {
              if (Object.keys(debugOwner.pendingProps).find((key) => key === '${lineJsxKey}')) {
                const line = debugOwner.pendingProps['${lineJsxKey}']
                const column = debugOwner.pendingProps['${columnJsxKey}']
                const filePath = debugOwner.pendingProps['${filePathJsxKey}']
                return {
                  line,
                  column: +column + 1,
                  filePath,
                }
              }
              debugOwner = debugOwner._debugOwner
            }
          }
        })(element)
        const vscodeFilePath = \`vscode://file/\${filePath}:\${line}:\${column}\`
        const decodedFilePath = ((string) => {
          return decodeURI(string.replace(/\\\\u/g, '%u'))
        })(vscodeFilePath)
        window.open(decodedFilePath)
      }
    }
  `
  const triggerEventAst = parser.parse(triggerEventCode, {
    sourceType: 'unambiguous',
  })
  const { code: triggerEventCleanString } = generate(triggerEventAst, {
    comments: false, //无注释
    compact: true, //无空白
  })
  return html.replace(bodyClosingTagRegExp, (rootDivHtml) => {
    return `<script type="text/javascript">${triggerEventCleanString}</script>\n${rootDivHtml}`
  })
}
