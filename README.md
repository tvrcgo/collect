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
- `delay` 页面所有请求完成后，在 delay 的时间内再无请求发出，认为 ajax 加载已经完成

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
