# webpack性能优化
##  分析打包速度
用speed-measure-webpack-plugin
```
npm install --save-dev speed-measure-webpack-plugin
```
```
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
 
const smp = new SpeedMeasurePlugin();
 
const webpackConfig = smp.wrap({
  plugins: [
    new MyPlugin(),
    new MyOtherPlugin()
  ]
});
```
## 分析包大小
```
npm install --save-dev webpack-bundle-analyzer
```
```
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}
```

## 分析影响打包速度环节
    解析时间   loader执行耗时
    压缩时间   
    搜索时间   依赖项搜索耗时

# 优化解析时间
### 一、开启多线程打包
### thread-loader
    把这个 loader 放置在其他 loader 之前， 放置在这个 loader 之后的 loader 就会在一个单独的 worker【worker pool】 池里运行，一个worker 就是一个nodeJS 进程【node.js proces】，每个单独进程处理时间上限为600ms，各个进程的数据交换也会限制在这个时间内。

## 二、利用缓存
    利用缓存会增加初始构建时间，缩短连续构建时间
### cache-loader
### HardSourceWebpackPlugin

## 三、提前解析耗时、稳定的模块
  webpack.DllPlugin和webpack.DllReferencePlugin
  与config.externals原理类似，都是跳过需要解析的包，并在html下手动引入被跳过的包

  首先配置webpack.config.dll.js
  ```
  const webpack = require('webpack');
  const path = require('path');

  const vendors = [
      'react',
      'react-dom',
      'jquery',
      // ...其它库
  ];

  const webpackConfig = {
      output: {
          path: path.resolve(__dirname, 'build'),
          filename: '[name].js',
          library: '[name]',
      },
      entry: {
          "lib": vendors,
      },
      plugins: [
          new webpack.DllPlugin({
              path: path.resolve(__dirname, 'build/manifest.json'),
              name: '[name]',
              context: __dirname,
          }),
      ],
  };

  module.exports = webpackConfig;
  ```
  webpack运行后得到想要加入html的lib.js以及记录需要跳过解析的包（给DllReferencePlugin用的）
  
  然后在webpack.config.js添加：
  ```
  plugins: [
      new webpack.DllReferencePlugin({
          context: __dirname,
          manifest: path.resolve(__dirname, 'build/manifest.json'),
      }),
  ],
  ```

# 优化压缩时间
    原理：开启并行
    1.terser-webpack-plugin
```
module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
    ],
  },
};
```
    2.ParallelUglifyPlugin (没人维护，不推荐)

# 优化搜索时间
    1.在使用loader时使用test、include、exclude
    2.resolve.modules
    3.resolve.alias
    4.resolve.extensions 出现频率高的放前，列表尽可能短，代码中尽可能手动带上后缀
    5.module.noParse   忽略没有采用模块化的库，没有解析的必要  如jQuery、ChartJS