var PORT = 8081,
	sys = require('sys'),
	url = require('url'),
	querystring = require('querystring'),
	http = require('http'),
	actions = [
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
			handler: handleURL,
			url: 'http://google.com/search?q={1}'
		},
		{
			name: 'gs',
			description: 'Google I\'m Feeling Lucky',
			args: 1,
			returns: 'url',
			handler: handleURL
		}
	],
	tokenize = (function(){
		var tokenizer = /{(\w+)}/g;
		return function(string, replacements){
			return string.replace(tokenizer, function(str, token){
				return replacements[token] || '';
			});
		}
	})();


function handleURL(){
	
};
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
	var requestURL = url.parse(req.url),
		query = {};
	requestURL.query = querystring.parse(requestURL.query, {numerals: false});
	if (requestURL.pathname === '/'){
		if (requestURL.query && requestURL.query.q) {
			respond(res, {status: 200}, sys.inspect(requestURL.query) + '\n\n' + sys.inspect(typeof requestURL.query.q));
		} else {
			respond(res, {status: 501}, 'I\'m not sure what you want.');
		}
	} else {
		respond(res, {status: 404}, 'What you seek may be found elsewhere.');
	}
}).listen(PORT);
sys.puts('Alive on ' + PORT);