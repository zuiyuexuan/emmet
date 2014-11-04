/**
 * Vendor prefixes resolver: provides methods for detecting CSS vendor
 * prefixes for given property or value
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var ciu = require('../assets/caniuse');
	var prefs = require('../assets/preferences');
	var utils = require('../utils/common');
	var template = require('../utils/template');

	var prefixObj = {
		/** Real vendor prefix name */
		prefix: 'emmet',
		
		/** 
		 * Indicates this prefix is obsolete and should't be used when user 
		 * wants to generate all-prefixed properties
		 */
		obsolete: false,
		
		/**
		 * Returns prefixed CSS property name
		 * @param {String} name Unprefixed CSS property
		 */
		transformName: function(name) {
			return '-' + this.prefix + '-' + name;
		},
		
		/**
		 * List of unprefixed CSS properties that supported by 
		 * current prefix. This list is used to generate all-prefixed property
		 * @returns {Array} 
		 */
		properties: function() {
			return getProperties('css.' + this.prefix + 'Properties') || [];
		},
		
		/**
		 * Check if given property is supported by current prefix
		 * @param name
		 */
		supports: function(name) {
			return ~this.properties().indexOf(name);
		}
	};

	/** 
	 * List of registered one-character prefixes. Key is a one-character prefix, 
	 * value is an <code>prefixObj</code> object
	 */
	var vendorPrefixes = {};

	prefs.define('css.autoInsertVendorPrefixes', true,
		'Automatically generate vendor-prefixed copies of expanded CSS ' 
		+ 'property. By default, Emmet will generate vendor-prefixed '
		+ 'properties only when you put dash before abbreviation ' 
		+ '(e.g. <code>-bxsh</code>). With this option enabled, you don’t ' 
		+ 'need dashes before abbreviations: Emmet will produce ' 
		+ 'vendor-prefixed properties for you.');

	prefs.define('less.autoInsertVendorPrefixes', false, 'Same as <code>css.autoInsertVendorPrefixes</code> but for LESS syntax');
	prefs.define('scss.autoInsertVendorPrefixes', false, 'Same as <code>css.autoInsertVendorPrefixes</code> but for SCSS syntax');
	prefs.define('sass.autoInsertVendorPrefixes', false, 'Same as <code>css.autoInsertVendorPrefixes</code> but for SASS syntax');
	prefs.define('stylus.autoInsertVendorPrefixes', false, 'Same as <code>css.autoInsertVendorPrefixes</code> but for Stylus syntax');

	var descTemplate = template('A comma-separated list of CSS properties that may have ' 
		+ '<code><%= vendor %></code> vendor prefix. This list is used to generate '
		+ 'a list of prefixed properties when expanding <code>-property</code> '
		+ 'abbreviations. Empty list means that all possible CSS values may ' 
		+ 'have <code><%= vendor %></code> prefix.');
	
	var descAddonTemplate = template('A comma-separated list of <em>additional</em> CSS properties ' 
			+ 'for <code>css.<%= vendor %>Preperties</code> preference. ' 
			+ 'You should use this list if you want to add or remove a few CSS ' 
			+ 'properties to original set. To add a new property, simply write its name, '
			+ 'to remove it, precede property with hyphen.<br>'
			+ 'For example, to add <em>foo</em> property and remove <em>border-radius</em> one, '
			+ 'the preference value will look like this: <code>foo, -border-radius</code>.');
	
	// properties list is created from cssFeatures.html file
	var props = {
		'webkit': 'animation, animation-delay, animation-direction, animation-duration, animation-fill-mode, animation-iteration-count, animation-name, animation-play-state, animation-timing-function, appearance, backface-visibility, background-clip, background-composite, background-origin, background-size, border-fit, border-horizontal-spacing, border-image, border-vertical-spacing, box-align, box-direction, box-flex, box-flex-group, box-lines, box-ordinal-group, box-orient, box-pack, box-reflect, box-shadow, color-correction, column-break-after, column-break-before, column-break-inside, column-count, column-gap, column-rule-color, column-rule-style, column-rule-width, column-span, column-width, dashboard-region, font-smoothing, highlight, hyphenate-character, hyphenate-limit-after, hyphenate-limit-before, hyphens, line-box-contain, line-break, line-clamp, locale, margin-before-collapse, margin-after-collapse, marquee-direction, marquee-increment, marquee-repetition, marquee-style, mask-attachment, mask-box-image, mask-box-image-outset, mask-box-image-repeat, mask-box-image-slice, mask-box-image-source, mask-box-image-width, mask-clip, mask-composite, mask-image, mask-origin, mask-position, mask-repeat, mask-size, nbsp-mode, perspective, perspective-origin, rtl-ordering, text-combine, text-decorations-in-effect, text-emphasis-color, text-emphasis-position, text-emphasis-style, text-fill-color, text-orientation, text-security, text-stroke-color, text-stroke-width, transform, transition, transform-origin, transform-style, transition-delay, transition-duration, transition-property, transition-timing-function, user-drag, user-modify, user-select, writing-mode, svg-shadow, box-sizing, border-radius',
		'moz': 'animation-delay, animation-direction, animation-duration, animation-fill-mode, animation-iteration-count, animation-name, animation-play-state, animation-timing-function, appearance, backface-visibility, background-inline-policy, binding, border-bottom-colors, border-image, border-left-colors, border-right-colors, border-top-colors, box-align, box-direction, box-flex, box-ordinal-group, box-orient, box-pack, box-shadow, box-sizing, column-count, column-gap, column-rule-color, column-rule-style, column-rule-width, column-width, float-edge, font-feature-settings, font-language-override, force-broken-image-icon, hyphens, image-region, orient, outline-radius-bottomleft, outline-radius-bottomright, outline-radius-topleft, outline-radius-topright, perspective, perspective-origin, stack-sizing, tab-size, text-blink, text-decoration-color, text-decoration-line, text-decoration-style, text-size-adjust, transform, transform-origin, transform-style, transition, transition-delay, transition-duration, transition-property, transition-timing-function, user-focus, user-input, user-modify, user-select, window-shadow, background-clip, border-radius',
		'ms': 'accelerator, backface-visibility, background-position-x, background-position-y, behavior, block-progression, box-align, box-direction, box-flex, box-line-progression, box-lines, box-ordinal-group, box-orient, box-pack, content-zoom-boundary, content-zoom-boundary-max, content-zoom-boundary-min, content-zoom-chaining, content-zoom-snap, content-zoom-snap-points, content-zoom-snap-type, content-zooming, filter, flow-from, flow-into, font-feature-settings, grid-column, grid-column-align, grid-column-span, grid-columns, grid-layer, grid-row, grid-row-align, grid-row-span, grid-rows, high-contrast-adjust, hyphenate-limit-chars, hyphenate-limit-lines, hyphenate-limit-zone, hyphens, ime-mode, interpolation-mode, layout-flow, layout-grid, layout-grid-char, layout-grid-line, layout-grid-mode, layout-grid-type, line-break, overflow-style, perspective, perspective-origin, perspective-origin-x, perspective-origin-y, scroll-boundary, scroll-boundary-bottom, scroll-boundary-left, scroll-boundary-right, scroll-boundary-top, scroll-chaining, scroll-rails, scroll-snap-points-x, scroll-snap-points-y, scroll-snap-type, scroll-snap-x, scroll-snap-y, scrollbar-arrow-color, scrollbar-base-color, scrollbar-darkshadow-color, scrollbar-face-color, scrollbar-highlight-color, scrollbar-shadow-color, scrollbar-track-color, text-align-last, text-autospace, text-justify, text-kashida-space, text-overflow, text-size-adjust, text-underline-position, touch-action, transform, transform-origin, transform-origin-x, transform-origin-y, transform-origin-z, transform-style, transition, transition-delay, transition-duration, transition-property, transition-timing-function, user-select, word-break, wrap-flow, wrap-margin, wrap-through, writing-mode',
		'o': 'dashboard-region, animation, animation-delay, animation-direction, animation-duration, animation-fill-mode, animation-iteration-count, animation-name, animation-play-state, animation-timing-function, border-image, link, link-source, object-fit, object-position, tab-size, table-baseline, transform, transform-origin, transition, transition-delay, transition-duration, transition-property, transition-timing-function, accesskey, input-format, input-required, marquee-dir, marquee-loop, marquee-speed, marquee-style'
	};

	Object.keys(props).forEach(function(k) {
		prefs.define('css.' + k + 'Properties', props[k], descTemplate({vendor: k}));
		prefs.define('css.' + k + 'PropertiesAddon', '', descAddonTemplate({vendor: k}));
	});

	prefs.define('css.alignVendor', false, 
			'If set to <code>true</code>, all generated vendor-prefixed properties ' 
			+ 'will be aligned by real property name.');

	function addPrefix(name, obj) {
		if (typeof obj === 'string') {
			obj = {prefix: obj};
		}
		
		vendorPrefixes[name] = utils.extend({}, prefixObj, obj);
	}

	function getProperties(key) {
		var list = prefs.getArray(key);
		var addon = prefs.getArray(key + 'Addon');
		if (addon) {
			addon.forEach(function(prop) {
				if (prop.charAt(0) == '-') {
					list = utils.without(list, prop.substr(1));
				} else {
					if (prop.charAt(0) == '+')
						prop = prop.substr(1);
					
					list.push(prop);
				}
			});
		}
		
		return list;
	}

	// TODO refactor, this looks awkward now
	addPrefix('w', {prefix: 'webkit'});
	addPrefix('m', {prefix: 'moz'});
	addPrefix('s', {prefix: 'ms'});
	addPrefix('o', {prefix: 'o'});

	return {
		/**
		 * Adds vendor prefix
		 * @param {String} name One-character prefix name
		 * @param {Object} obj Object describing vendor prefix
		 * @memberOf cssResolver
		 */
		add: addPrefix,

		/**
		 * Check if passed CSS property support specified vendor prefix 
		 * @param {String} property
		 * @param {String} prefix
		 */
		supportsPrefix: function(property, prefix) {
			var info = utils.find(vendorPrefixes, function(data, name) {
				return name === prefix || data.prefix === prefix;
			});
		
			return info && info.supports(property);
		},

		/**
		 * Finds available vendor prefixes for given CSS property.
		 * Search is performed within Can I Use database and internal
		 * property list
		 * @param  {String} property CSS property name
		 * @return {Array} Array of resolved prefixes or null if
		 * prefixes are not available for this property at all.
		 * Empty array means prefixes are not available for current
		 * user-define era
		 */
		find: function(property) {
			var prefixes = ciu.resolvePrefixes(property);
			if (!prefixes) {
				// Can I Use database is disabled or prefixes are not
				// available for this property
				prefixes = [];
				Object.keys(vendorPrefixes).forEach(function(key) {
					if (this.supportsPrefix(property, key)) {
						prefixes.push(vendorPrefixes[key].prefix);
					}
				}, this);

				if (!prefixes.length) {
					prefixes = null;
				}
			}

			return prefixes;
		},

		/**
		 * Search for a list of supported prefixes for CSS property. This list
		 * is used to generate all-prefixed snippet
		 * @param {String} property CSS property name
		 * @returns {Array}
		 */
		findInternalPrefixes: function(property, noAutofill) {
			var result = [];
			var prefixes = this.find(property);
			
			if (prefixes) {
				var prefixMap = {};
				Object.keys(vendorPrefixes).forEach(function(key) {
					prefixMap[vendorPrefixes[key].prefix] = key;
				});

				result = prefixes.map(function(prefix) {
					return prefixMap[prefix];
				});
			}
			
			if (!result.length && !noAutofill) {
				// add all non-obsolete prefixes
				Object.keys(vendorPrefixes).forEach(function(prefix) {
					if (!vendorPrefixes[prefix].obsolete) {
						result.push(prefix);
					}
				});
			}
			
			return result;
		},

		/**
		 * Returns prefixed version of given CSS property, only if this
		 * property supports given prefix
		 * @param {String} property
		 * @param {String} prefix
		 * @returns
		 */
		prefixed: function(property, prefix) {
			return this.supportsPrefix(property, prefix) 
				? '-' + prefix + '-' + property 
				: property;
		},

		/**
		 * Returns list of all registered vendor prefixes
		 * @returns {Array}
		 */
		list: function() {
			return vendorPrefixes.map(function(obj) {
				return obj.prefix;
			});
		},

		/**
		 * Returns object describing vendor prefix
		 * @param {String} name
		 * @returns {Object}
		 */
		get: function(name) {
			return vendorPrefixes[name];
		},
		
		/**
		 * Removes given prefix from database
		 * @param {String} name
		 */
		remove: function(name) {
			if (name in vendorPrefixes) {
				delete vendorPrefixes[name];
			}
		},
	};
});