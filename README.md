# collect
数据采集

## Install
```sh
npm i tvrcgo/collect
```

## Usage

#### 采集数据
流式处理，自由添加处理函数
```js
var collect = require('collect');

collect.src('http://example.com')
    .use(function(data, next){
        // 网页内容在 data.content
        // process data -> data2
        next(data2);
    })
    .use(function(data2, next){
        // process data2 -> data3
        next(data3);
    })
```

#### 选择元素
支持索引值、属性、html内容，默认取标签text
- `[]` 索引
- `@` 属性
- `:html` html内容

```js
collect.src('http://example.com')
    .query({
        li: '.list li[1]', // 按索引找单个元素
        imgs: '.list li img@src', // 多个img的src属性值
        cols: ['.list li', 'img@src, a@href, a'], // 多个li元素下面多个元素的值
        html: '.list li:html' // html内容
    })
    .use(function(data, next){
        // data.li
        // data.imgs
        // data.cols
        // data.html
    })
```

#### 指定 User-Agent 和代理
```js
collect.src('http://example.com', {
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 ...",
    proxy: "http://191.26.14.23:8000"
})
.use(function(data, next){
    // process data
    next(data);
})
```

#### 采集 Ajax 页面内容
- `javascript` 为 true 允许页面执行JS
- `delay` 页面最后一次发出或收到请求后，在 delay 时间内再无动作，认为 ajax 加载已经完成
- `timeout` 页面加载超时

```js
collect.src('http://example.com', {
        javascript: true,
        delay: 1000*5,
        timeout: 1000*15
    })
    .use(function(data, next){
        // process data
    })
```

#### 输出
将处理后的数据输出到文件
```js
collect.src('http://example.com')
    .use(function(data, next){
        // process data
        next(data);
    })
    .dest('body.csv');
```

输出到其它流
```js
collect.src('http://example.com')
    .use(function(data, next){
        // process data
        next(data);
    })
    .pipe(stream);
```

## License
MIT
