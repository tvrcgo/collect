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
    .use(function(data){
        // process data
        return data2
    })
    .use(function(data2){
        // process data2
        return data3;
    })
```

将处理后的数据输出到文件
```js
collect.src('http://example.com')
    .use(function(data){
        // process data
        return data;
    })
    .dest('body.csv');
```

输出到其它流
```js
collect.src('http://example.com')
    .use(function(data){
        // process data
        return data;
    })
    .pipe(stream);
```

## License
MIT
