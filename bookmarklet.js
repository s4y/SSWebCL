(function() {
    var d = document,
    b = d.body,
    l,
    e = escape,
    u = 'http://sidneysm.com/webcl/req?q=',
    q = prompt('');
	if (q){
		u += e(q) + '&m=' + (b ? 'script' : 'direct');
	    if (b) {
			l = d.createElement('scr' + 'ipt');
			l.setAttribute('src', u += '&l=' + escape(d.location.href));
			b.appendChild(l);
		} else {
			d.location.href = u;
		}
	}
})();
void(0)