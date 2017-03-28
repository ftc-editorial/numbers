const Router = require('koa-router');

const router = new Router();

router
	.get('/', function (ctx, next) {})
	.post('/users', function (ctx, next) {})
	.put('/users/:id', function (ctx, next) {})
	.del('/users/:id', function (ctx, next) {})
	.all('/users/:id', function (ctx, next) {});

console.log(router.routes());