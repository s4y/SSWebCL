
global.WebCL = (function(){
	function Query(string){
		var args = string.split(' '), curArgs = args;
		Object.defineProperty(this, 'command', { value: args.shift().toLowerCase(), writable: false });
		Object.defineProperty(this, 'arguments', { get: function(){ return curArgs } });
		Object.defineProperty(this, 'effectiveArguments', {
			get: function(){ return curArgs.length },
			set: function(effectiveArgs){ curArgs = args.slice(0, effectiveArgs-1).concat(args.slice(effectiveArgs-1).join(' ')) }
		});
		Object.defineProperty(this, 'maxArguments', { value: args.length, writable: false });
	}
	
	function WebCL(query, type){
		if (!(this instanceof WebCL)) {
			return new WebCL(query, type);
		}
		this.actions = WebCL.actions.slice();
	}
	WebCL.actions = [];
	WebCL.prototype.registerActions = WebCL.registerActions = function(newActions){
		Array.prototype.push.apply(this.actions, newActions);
		return this;
	};
	WebCL.prototype.eval = function(query, type) {
		var query = new Query(query), candidateActions = [], action;
		this.actions.forEach(function(action){
			if (action.args <= query.maxArguments && action.name === query.command) {
				candidateActions.push(action);
			}
		});
		candidateActions.sort(function(a, b) {
			if (a.args < b.args) {
				return 1;
			} else if (a.args > b.args){
				return -1;
			} else {
				return 0;
			}
		});
		if (action = candidateActions[0]) {
			return candidateActions.length.toString();
		} else {
			return '-SSWebCL: ' + query.command + '/' + query.maxArguments + ': action not found';
		}
	};
	
	return WebCL;
})();

var port = 8081,
	sys = require('sys'),
	url = require('url'),
	querystring = require('querystring'),
	http = require('http');

function handleURL(){

};

WebCL.registerActions([
	{
		name: 'list',
		description: 'List all commands',
		args: 0,
		returns: 'text',
		handler: function(arg){}
	},
	{
		name: 'g',
		description: 'Google search',
		args: 1,
		returns: 'url',
		handler: formatURL,
		url: 'http://google.com/search?q={1}'
	},
	{
		name: 'gs',
		description: 'Google I\'m Feeling Lucky',
		args: 1,
		returns: 'url',
		handler: formatURL,
		url: 'http://google.com/search?q={1}&btnI=I%27m+Feeling+Lucky'
	}
]);
var formatURL = (function(){
	var tokenizer = /{(\w+)}/g;
	return function(string, replacements){
		return string.replace(tokenizer, function(str, token){
			return replacements[token] || '';
		});
	}
})();

function respond(res, opts, body){
	var headers = {'Content-Type': opts.type || 'text/plain'};
	if (opts.cache !== true) {
		headers['Cache-Control'] = 'no-cache, must-revalidate';
		headers['Expires'] = 'Sat, 26 Jul 1997 05:00:00 GMT';
	}
	res.writeHead(opts.status || 200, headers);
	res.write(body);
	res.close();
}
http.createServer(function (req, res) {
	var requestURL = url.parse(req.url);
	requestURL.query = querystring.parse(requestURL.query, {numerals: false});
	if (requestURL.pathname === '/'){
		if (requestURL.query && requestURL.query.q) {
			respond(res, {status: 200, cache: false}, new WebCL().eval(requestURL.query.q, requestURL.query.t || 'text'));
		} else {
			respond(res, {status: 501}, 'I\'m not sure what you want.');
		}
	} else {
		respond(res, {status: 404}, 'What you seek may be found elsewhere.');
	}
}).listen(port);
sys.puts('Alive on ' + port);