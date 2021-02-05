## v-image-preview

vue图片预览插件

### 效果

![demo](./img/demo.gif)

### 使用方法：
1. 安装包
```
npm install --save v-image-preview 
```

2. 引入并使用：
```js
import VImagePreview from 'v-image-preview';
Vue.use(VImagePreview, {
  maskBackground: 'rgba(0, 0, 0, 0.65)', // 遮罩背景，rgba模式，默认`rgba(18, 18, 18, 0.65)`
  animaDuration: 300, // 动画持续时间，默认300，单位ms
  imgMaxWidth: 400, // 放大时图片最大宽度，单位px；设置为0，即不限制；默认0
  maxWaitTime: 1000, // 之前用的懒加载，请求真实图片最大等待时间，超时后将读取小图片，默认1000，单位ms
});
```

3. 在img标签上使用v-preview指令
```html
<img 
  v-preview 
  src="https://mock.jpg"
/>
```

### 更新日志

#### v0.0.7 
- webpack打包，压缩文件、并解决低版本不适配问题

#### v0.0.8
- 修改`package.json`中的`main`字段
