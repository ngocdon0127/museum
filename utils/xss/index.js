const xssFilter = require('xssfilter');
let xssfilter = new xssFilter();

let xss = {
	filter: function (_s) {
		return this.stripTag(xssfilter.filter(_s).replace(/\s{2,}/g, ' '), 'script');
	},
	stripTag: function (_s, _tag) {
		if (!(/^[a-z]+$/i.test(_tag))) {
			throw new Error('Invalid tag name: ' + _tag)
		}

		// full tag
		// let _rg1 = new RegExp(`<${_tag}[^>]*[^<]*<\s*\/\s*${_tag}\s*>`, 'gi')
		let _rg1 = new RegExp(`<\s*<${_tag}\s*>.*<\s*\/\s*${_tag}\s*>`, 'gi')
		_s = _s.replace(_rg1, '');

		// self-closed tag
		let _rg2 = new RegExp(`<${_tag}[^>]*>`, 'gi')
		_s = _s.replace(_rg2, '');

		return _s.replace(/\s{2,}/g, ' '); // trim
	},
	stripTags: function (_s, _tags) {
		if (_tags instanceof Array) {
			for(_tag of _tags) {
				_s = this.stripTag(_s, _tag)
			}
		}
		return _s.replace(/\s{2,}/g, ' ');
	},
}

// module.exports = xss;
module.exports = Object.freeze(xss);