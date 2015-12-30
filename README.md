# collect
数据采集

## Install
```sh
npm i tvrcgo/collect
```

## Usage

采集数据，流式处理
```js
var collect = require('collect');

collect.src('http://example.com')
    .use(function(data, next){
        // process data -> data2
        next(data2);
    })
    .use(function(data2, next){
        // process data2 -> data3
        next(data3);
    })
```

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

指定 User-Agent 和代理
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

采集页面包含 ajax
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
- `javascript` 设为 true 允许页面执行JS
- `delay` 页面最后一次发出或收到请求后，在 delay 时间内再无动作，认为 ajax 加载已经完成
- `timeout` 页面加载超时

### collect.query
按DOM选择器规则采集数据，支持索引值、属性、html内容
- `[]` 索引
- `@` 属性
- `:html` html内容

```js
collect.src('http://www.houzz.com/photos')
    .use(collect.query({
        li: '.rightSideContent .content-row[1]', // 单个
        imgs: '.rightSideContent .content-row .imageArea img@src', // N行一列
        cols: ['.rightSideContent .content-row', 'img@src, a@href, a'], // N行三列
        html: '.rightSideContent li:html' // html内容
    }))
    .use(function(data, next){
        // data.imgs
        // data.li
        // data.cols
        // data.html
    })

```

## License
MIT
