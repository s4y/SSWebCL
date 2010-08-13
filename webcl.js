global.webCL = (function(){
	var replaceTokensInURL = (function(){
		var tokenizer = /{(\w+)}/g;
		
		return function(string, replacements){
			return string.replace(tokenizer, function(str, token){
				return encodeURIComponent(replacements[token]) || '';
			});
		}
	})();
	
	// Response formatters
	function script(content){
		return "\t\t(function(){\n\t\t\tvar scripts = document.getElementsByTagName('script'),\n\t\t\t    myScript = scripts[scripts.length-1];\n\t\t\tfunction(){" + content + "}();\n\t\t\tdocument.body.removeChild(myScript);\n\t\t})()";
	}
	function alert(content){
		return script("alert(\"" + content.replace("\"", "\\\"") + "\")");
	}
	function redirect(content){
		return script("document.location.href='"+ content.replace("'", "\\'") +"'");
	}
	
	
	var webCL = {
		actions: [],
		eval: function(query, additionalActions){
			var argv = query.split(' '),
				effectiveActions = additionalActions ? this.actions.concat(additionalActions) : this.actions;
			if (!argv.length) {
				return script("");
			}
			argv[0] = argv[0].toLowerCase();
			for (var i = effectiveActions.length - 1, action = effectiveActions[i]; i >= 0; i--, action = effectiveActions[i]){
				if (action.name === argv[0]) {
					// If we're representing the query as more arguments than the action supports, join the final arguments
					// e.g. ["action", "Search", "string"] -> ["action", "Search string"]
					if (argv.length - 1 > action.args) {
						argv = argv.slice(0, action.args-1).concat(argv.slice(action.args-1).join(' '));
					}
					var content;
					if (action.handler) {
						content = action.handler.call(action, argv)+'';
					} else if (action.url) {
						content = replaceTokensInURL(action.url, argv);
					}
					switch (action.type){
						case "url":
							return redirect(content);
							break;
						case "script":
							return script(content);
							break;
						default:
							return alert(content);
					}
					break;
				}
			}
			return alert("-SSWebCL: " + argv[0] + "/" + argv.length + ": action not found");
		},
		register: function(newActions){
			Array.prototype.push.apply(this.actions, newActions);
			this.actions.sort(function(a, b) {
				if (a.args < b.args) {
					return 1;
				} else if (a.args > b.args){
					return -1;
				} else {
					return 0;
				}
			});
		}
	}
	return webCL;
})();


var port = 8081,
	sys = require('sys'),
	url = require('url'),
	querystring = require('querystring'),
	http = require('http');

webCL.register([
	{
		name: 'list',
		description: 'List all commands',
		args: 0,
		type: 'text',
		handler: function(arg){}
	},
	{
		name: 'g',
		description: 'Google search',
		args: 1,
		type: 'url',
		url: 'http://google.com/search?q={1}'
	},
	{
		name: 'gs',
		description: 'Google I\'m Feeling Lucky',
		args: 1,
		type: 'url',
		url: 'http://google.com/search?q={1}&btnI=I%27m+Feeling+Lucky'
	}
]);

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
			respond(res, {status: 200, cache: false, type:'application/javascript'}, webCL.eval(requestURL.query.q));
		} else {
			respond(res, {status: 501}, 'I\'m not sure what you want.');
		}
	} else {
		respond(res, {status: 404}, 'What you seek may be found elsewhere.');
	}
}).listen(port);
sys.puts('Alive on ' + port);