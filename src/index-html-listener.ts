import generate from '@babel/generator'
import * as parser from '@babel/parser'

export default function IndexHtmlListener(
  html: string,
  options?: Partial<{
    triggerEvent: string
    triggerKey: string
    elementId: string
  }>
): string {
  const {
    elementId = 'root',
    triggerEvent = 'onContextMenu',
    triggerKey = 'shift',
  } = options ?? {}
  const rootIdAttrRegExp = new RegExp(`id=["|'|\`]${elementId}["|' | \`]`, 'g')
  if (html.search(rootIdAttrRegExp) === -1) return html
  const bodyClosingTagRegExp = /<\/body>/
  const triggerEventCode = `
    document.${triggerEvent.toLocaleLowerCase()} = function (e) {
      const getDebugSource = (element) => {
        const fiberKey = Object.keys(element).find((key) => key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')) // __reactInternalInstance: react <= v16.13.1
        let debugOwner = element[fiberKey]
        while (debugOwner) {
          if (debugOwner._debugSource) {
            const { fileName, columnNumber, lineNumber } = debugOwner._debugSource
            return { fileName, columnNumber, lineNumber }
          }
          debugOwner = debugOwner._debugOwner
        }
      }
      const stackGetDebugSource = (element) => {
        if(!element) return
        const debugSource = getDebugSource(element)
        if(debugSource){
          return debugSource
        } else {
          return stackGetDebugSource(element.parentNode)
        }
      }
      const goToVscode = (filePath, line, column) => {
        const vscodeFilePath = \`vscode://file/\${filePath}:\${line}:\${column}\`
        const decodedFilePath = ((string) => {
          return decodeURI(string.replace(/\\\\u/g, '%u'))
        })(vscodeFilePath)
        window.open(decodedFilePath)
      }
      if (e[\`${triggerKey}Key\`]) {
        e.preventDefault()
        e.stopPropagation()
        const element = e.target
        const debugSource = stackGetDebugSource(element)
        if(debugSource) {
          const { fileName, columnNumber, lineNumber } = debugSource
          goToVscode(fileName, lineNumber, columnNumber)
        }
      }
    }
  `
  const triggerEventAst = parser.parse(triggerEventCode, {
    sourceType: 'unambiguous',
  })
  const { code: triggerEventCleanString } = generate(triggerEventAst, {
    comments: false, //?????????
    compact: true, //?????????
  })
  return html.replace(bodyClosingTagRegExp, (rootDivHtml) => {
    return `<script type="text/javascript">${triggerEventCleanString}</script>\n${rootDivHtml}`
  })
}
