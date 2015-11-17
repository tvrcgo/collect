
var assert = require('assert');
var fs = require('fs');
var collect = require('../index.js');

describe('collect', function(){

    this.timeout(1000*20);

    it('fetch content', function(done){
        collect.src('http://www.baidu.com')
            .use(function(data){
                assert.ok(data);
                done();
            })
    })

    it('dest file', function(done){
        var file = 'body.txt';

        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }

        collect.src('http://www.baidu.com')
            .dest(file);

        fs.exists(file, function(exist){
            assert.ok(exist);
            done();
        })
    })

})

describe('collect.query', function(){

    this.timeout(1000*20);

    it('select element', function(done){

        collect.src('http://www.baidu.com')
            .use(collect.query({
                select: '#lg img',
                attr: 'src'
            }))
            .use(function(data){
                assert.ok(data.src);
                done();
            })
    })

    it('each: select', function(done){

        collect.src('http://www.houzz.com/photos')
            .use(collect.query({
                select: '.rightSideContent .content-row',
                each: {
                    select: '.imageArea img',
                    attr: 'src'
                }
            }))
            .use(function(data){
                assert.equal(data.length, 9);
                done();
            })

    })

    it('each: multi selects', function(done){

        collect.src('http://movie.douban.com/later/guangzhou/')
            .use(collect.query({
                select: '#showing-soon .item',
                each: [
                    {
                        select: 'h3 a',
                        value: 'text',
                        attr: 'href'
                    },
                    {
                        select: '.thumb img',
                        attr: 'src'
                    }
                ]
            }))
            .use(function(data){
                assert.equal(data.length, 20);
                done();
            })
    })
})
