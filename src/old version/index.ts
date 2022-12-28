import HtmlWebpackPlugin from 'html-webpack-plugin'
import type { Compiler } from 'webpack'
import indexHtmlListener from './index-html-listener'
import path from 'path'
type TPluginOptions = Partial<{
  exclude: string[]
  lineJsxKey: string
  columnJsxKey: string
  filePathJsxKey: string
  triggerEvent: string
  triggerKey: string
  id: string
}>
const isDevelopment = process.env.NODE_ENV?.includes('dev')
export default class CodeNavigation {
  private options: TPluginOptions = {}
  constructor(options?: TPluginOptions) {
    this.options = options ?? {}
  }
  apply(compiler: Compiler): void {
    const {
      id = 'root',
      triggerEvent = 'onContextMenu',
      triggerKey = 'shift',
      exclude = [],
      lineJsxKey = 'data-code-line',
      columnJsxKey = 'data-code-column',
      filePathJsxKey = 'data-code-file-path',
    } = this.options
    const codeNavigationLoader = {
      enforce: 'pre' as const,
      test: /\.[j|t]sx$/,
      use: [
        {
          loader: path.resolve(__dirname, './code-navigation-loader'),
          options: {
            id,
            triggerEvent,
            triggerKey,
            exclude,
          },
        },
      ],
    }
    if (isDevelopment && compiler.options.module) {
      compiler.options.module.rules.push(codeNavigationLoader)
    }
    compiler.hooks.compilation.tap('CodeNavigation', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('CodeNavigation', (data, cb) => {
        if (isDevelopment) {
          data.html = indexHtmlListener(data.html, {
            lineJsxKey,
            columnJsxKey,
            filePathJsxKey,
          })
        }
        cb(null, data)
      })
    })
  }
}
