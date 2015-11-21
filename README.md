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
