
var expect = require('chai').expect;
var fs = require('fs');
var collect = require('../index.js');

describe('collect', function(){

    this.timeout(1000*5);

    it('fetch content', function(done){
        collect.src('http://www.baidu.com')
            .use(function(data){
                expect(data).to.be.ok;
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
            expect(exist).to.be.ok;
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
                expect(data).to.have.property('src');
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
                expect(data).to.have.length.above(5);
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
                expect(data).to.have.length.above(5);
                done();
            })
    })
})
