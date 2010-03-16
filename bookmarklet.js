(function() {
	if (!document.documentElement) {
		return;
	}
    var d = document,
	b = d.body,
	l,
	e = encodeURIComponent,
	u = 'http://sidneysm.com/webcl/req?m=script&q=',
	ce = 'createElement',
	ac = 'appendChild',
	de = 'documentElement',
    q = prompt('');
	if (q){
		if (!b) {
			b = d[ce]('body');
			if (!d[de]){
				return;
			}
			d[de][ac](b);
		}
		l = d[ce]('scr' + 'ipt');
		l.setAttribute('src', u += e(q) + '&l=' + e(d.location.href));
		b[ac](l);
	}
})();
void(0);