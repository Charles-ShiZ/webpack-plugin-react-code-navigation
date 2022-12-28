# webpack-plugin-react-code-navigation
代码导航 vite 插件

## 功能 ( function )
在网页的某个组件上点击某个快捷键，快速跳转到 vscode 上组件对应的位置

## 使用 esbuild 打包 ( use esbuild to bundle ) 
   `npm run build` 执行打包

## 插件使用方法 ( how to use the vite plugin )
1. 安装插件
   
   `npm i webpack-plugin-react-code-navigation`

2. 配置插件

    craco.config.js
    ```js
    // module
    import { CodeNavigation } from 'webpack-plugin-react-code-navigation'
    // commonjs
    // const { CodeNavigation } = require('webpack-plugin-react-code-navigation')

    module.exports = {
      webpack: {
        plugins: [
          new CodeNavigation()
        ],
      },
    };
    ```

    或者

    webpack.config.js
    ```js
    import { CodeNavigation } from '@ccc-toolkit/webpack-plugins'

    module.exports = {
      plugins: [
        new CodeNavigation()
      ],
    };
    ```
   点击 shift 和 鼠标右键 跳转到组件在vscode编辑器的对应位置。
   
   click shift + right mouse button to jump the component position in vscode IDE
##  预览效果图 ( preview )
![pin-Interview](https://github.com/Charles-ShiZ/images/blob/master/code-navigation/preview.gif)
