var assert = require('assert');
var cssAbbreviation = require('../lib/resolver/css-abbreviation');

describe('CSS abbreviation parser', function() {
	it('split abbreviation', function() {
		function split(abbr) {
			var prop = cssAbbreviation.split(abbr);
			return prop.name + ': ' + prop.value;
		}

		assert.equal(split('padding10'), 'padding: 10');
		assert.equal(split('padding10-10'), 'padding: 10 10');
		assert.equal(split('padding-10-10'), 'padding: -10 10');
		assert.equal(split('padding-10--10'), 'padding: -10 -10');
		assert.equal(split('padding11px22px'), 'padding: 11px 22px');
		assert.equal(split('padding11px-22px'), 'padding: 11px -22px');
		assert.equal(split('padding1.5'), 'padding: 1.5');
		assert.equal(split('padding.5'), 'padding: .5');
		assert.equal(split('padding-.5'), 'padding: -.5');
		assert.equal(split('padding-.5em.3'), 'padding: -.5em .3');
		assert.equal(split('margin-a'), 'margin-a: ');
		assert.equal(split('margin-a-i'), 'margin-a-i: ');
		assert.equal(split('c#333'), 'c: #333');
		assert.equal(split('mr$size'), 'mr: $size');
		assert.equal(split('mr$size32'), 'mr: $size32');
		assert.equal(split('p10e'), 'p: 10e');
		assert.equal(split('p10px'), 'p: 10px');
		assert.equal(split('p10%'), 'p: 10%');
		assert.equal(split('bd1-s-blue'), 'bd: 1 s blue');
		assert.equal(split('bdt2-s#ED'), 'bdt: 2 s #ED');
	});

	it('parse value', function() {
		function parse(abbr) {
			return cssAbbreviation.parseValue(abbr).join(' ');
		}

		assert.equal(parse('#0#333'), '#0 #333');
		assert.equal(parse('5'), '5');
		assert.equal(parse('10'), '10');
		assert.equal(parse('10-10'), '10 10');
		assert.equal(parse('10em10px'), '10em 10px');
		assert.equal(parse('10em-10px'), '10em -10px');
		assert.equal(parse('10em-10px10'), '10em -10px 10');
		assert.equal(parse('10-10--10'), '10 10 -10');
		assert.equal(parse('1.5'), '1.5');
		assert.equal(parse('.5'), '.5');
		assert.equal(parse('-.5'), '-.5');
		assert.equal(parse('1.5em-.5'), '1.5em -.5');
		assert.equal(parse('i-5-a'), 'i -5 a');
		assert.equal(parse('$a$b'), '$a $b');
	});

	it('normalize value', function() {
		function normalize(value, property, options) {
			if (typeof property === 'object') {
				options = property;
				property = undefined;
			}
			return cssAbbreviation.normalizeValue(value, property, options);
		}

		assert.equal(normalize('0'), '0');
		assert.equal(normalize('1'), '1px');
		assert.equal(normalize('1', 'z-index'), '1');
		assert.equal(normalize('10e'), '10em');
		assert.equal(normalize('s'), 'solid');
		assert.equal(normalize('i'), 'inherit');
		assert.equal(normalize('a'), 'auto');
		assert.equal(normalize('auto'), 'auto');
		assert.equal(normalize('foo'), 'foo');
		assert.equal(normalize('#0'), '#000');
		assert.equal(normalize('#ed'), '#ededed');
		assert.equal(normalize('#ED'), '#EDEDED');
	});

	it('parse abbreviation', function() {
		function parse(abbr) {
			var prop = cssAbbreviation.parse(abbr);
			var result = prop.name + ': ' + prop.value;
			if (prop.important) {
				result += ' !important';
			}
			return result;
		}

		assert.equal(parse('p'), 'padding: ${1}');
		assert.equal(parse('p0'), 'padding: 0');
		assert.equal(parse('p10'), 'padding: 10px');
		assert.equal(parse('p-10'), 'padding: -10px');
		assert.equal(parse('z1'), 'z-index: 1');
		assert.equal(parse('m-a'), 'margin: auto');
		assert.equal(parse('something'), 'something: ');
		assert.equal(parse('bxsh'), 'box-shadow: ${1:inset }${2:hoff} ${3:voff} ${4:blur} ${5:color}');
		assert.equal(parse('bd1#0solid'), 'border: 1px #000 solid');
		assert.equal(parse('bd1-s-blue'), 'border: 1px solid blue');
		assert.equal(parse('bdt2-s#ED'), 'border-top: 2px solid #EDEDED');
		assert.equal(parse('p10%'), 'padding: 10%');

		assert.equal(parse('pos-a!'), 'position: absolute !important');
		assert.equal(parse('poa!'), 'position: absolute !important');
		assert.equal(parse('p5!'), 'padding: 5px !important');

		assert.equal(parse('c#3d3d3d'), 'color: #3d3d3d');
		assert.equal(parse('c#d3d3d3'), 'color: #d3d3d3');
		assert.equal(parse('c#'), 'color: #000');
		assert.equal(parse('c#t'), 'color: transparent');
		assert.equal(parse('c#f.5'), 'color: rgba(255, 255, 255, 0.5)');
		assert.equal(parse('c#fc0.333'), 'color: rgba(255, 204, 0, 0.333)');
	});
});