import HtmlWebpackPlugin from 'html-webpack-plugin'
import type { Compiler } from 'webpack'
import indexHtmlListener from './index-html-listener'

type TPluginOptions = Partial<{
  triggerEvent: string
  triggerKey: string
  elementId:string
}>
const isDevelopment = process.env.NODE_ENV?.includes('dev')
export default class CodeNavigation {
  private options: TPluginOptions = {}
  constructor(options?: TPluginOptions) {
    this.options = options ?? {}
  }
  apply(compiler: Compiler): void {
    const {
      triggerEvent = 'onContextMenu',
      triggerKey = 'shift',
      elementId = 'root'
    } = this.options

    compiler.hooks.compilation.tap('CodeNavigation', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('CodeNavigation', (data, cb) => {
        if (isDevelopment) {
          data.html = indexHtmlListener(data.html, {
            triggerEvent,
            triggerKey,
            elementId
          })
        }
        cb(null, data)
      })
    })
  }
}
