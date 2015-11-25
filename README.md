# collect
数据采集

## Install
```sh
npm i tvrcgo/collect
```

## Usage

采集数据，中间件处理
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
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36",
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
        delay: 1000*5
    })
    .use(function(data, next){
        // process data
    })
```
- `javascript` 设为 true 允许页面执行JS
- `delay` 页面最后一次发出或收到请求后，在 delay 时间内再无动作，认为 ajax 加载已经完成

#### collect.query
按DOM选择器规则采集数据
```js
collect.src('http://www.houzz.com/photos')
    .use(collect.query({
        select: '.rightSideContent .content-row',
        each: {
            select: '.imageArea img',
            attr: 'src'
        }
    }))
    .use(function(data, next){

    })

```

## License
MIT
