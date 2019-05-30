(function () {

	var defaultPrecision = {
		km: 2,
		ha: 2,
		m: 0,
		mi: 2,
		ac: 2,
		yd: 0,
		ft: 0,
		nm: 2
	};


	/**
	 * @class L.GeometryUtil
	 * @aka GeometryUtil
	 */
	L.GeometryUtil = L.extend(L.GeometryUtil || {}, {
		// Ported from the OpenLayers implementation. See https://github.com/openlayers/openlayers/blob/master/lib/OpenLayers/Geometry/LinearRing.js#L270

		// @method geodesicArea(): number
		geodesicArea: function (latLngs) {
			var pointsCount = latLngs.length,
				area = 0.0,
				d2r = Math.PI / 180,
				p1, p2;

			if (pointsCount > 2) {
				for (var i = 0; i < pointsCount; i++) {
					p1 = latLngs[i];
					p2 = latLngs[(i + 1) % pointsCount];
					area += ((p2.lng - p1.lng) * d2r) *
						(2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
				}
				area = area * 6378137.0 * 6378137.0 / 2.0;
			}

			return Math.abs(area);
		},

		// @method formattedNumber(n, precision): string
		// Returns n in specified number format (if defined) and precision
		formattedNumber: function (n, precision) {
			var formatted = parseFloat(n).toFixed(precision),
				format = L.drawLocal.format && L.drawLocal.format.numeric,
				delimiters = format && format.delimiters,
				thousands = delimiters && delimiters.thousands,
				decimal = delimiters && delimiters.decimal;

			if (thousands || decimal) {
				var splitValue = formatted.split('.');
				formatted = thousands ? splitValue[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + thousands) : splitValue[0];
				decimal = decimal || '.';
				if (splitValue.length > 1) {
					formatted = formatted + decimal + splitValue[1];
				}
			}

			return formatted;
		},

		// @method readableArea(area, isMetric, precision): string
		// Returns a readable area string in yards or metric.
		// The value will be rounded as defined by the precision option object.
		readableArea: function (area, isMetric, precision) {
			var areaStr,
				units,
				precision = L.Util.extend({}, defaultPrecision, precision);

			if (isMetric) {
				units = ['ha', 'm'];
				type = typeof isMetric;
				if (type === 'string') {
					units = [isMetric];
				} else if (type !== 'boolean') {
					units = isMetric;
				}

				if (area >= 1000000 && units.indexOf('km') !== -1) {
					areaStr = L.GeometryUtil.formattedNumber(area * 0.000001, precision['km']) + ' km²';
				} else if (area >= 10000 && units.indexOf('ha') !== -1) {
					areaStr = L.GeometryUtil.formattedNumber(area * 0.0001, precision['ha']) + ' ha';
				} else {
					areaStr = L.GeometryUtil.formattedNumber(area, precision['m']) + ' m²';
				}
			} else {
				area /= 0.836127; // Square yards in 1 meter

				if (area >= 3097600) { //3097600 square yards in 1 square mile
					areaStr = L.GeometryUtil.formattedNumber(area / 3097600, precision['mi']) + ' mi²';
				} else if (area >= 4840) { //4840 square yards in 1 acre
					areaStr = L.GeometryUtil.formattedNumber(area / 4840, precision['ac']) + ' acres';
				} else {
					areaStr = L.GeometryUtil.formattedNumber(area, precision['yd']) + ' yd²';
				}
			}
			return areaStr;
		},

		// @method readableDistance(distance, units): string
		// Converts a metric distance to one of [ feet, nauticalMile, metric or yards ] string
		//
		// @alternative
		// @method readableDistance(distance, isMetric, useFeet, isNauticalMile, precision): string
		// Converts metric distance to distance string.
		// The value will be rounded as defined by the precision option object.
		readableDistance: function (distance, isMetric, isFeet, isNauticalMile, precision) {
			var distanceStr,
				units,
				precision = L.Util.extend({}, defaultPrecision, precision);

			if (isMetric) {
				units = typeof isMetric == 'string' ? isMetric : 'metric';
			} else if (isFeet) {
				units = 'feet';
			} else if (isNauticalMile) {
				units = 'nauticalMile';
			} else {
				units = 'yards';
			}

			switch (units) {
				case 'metric':
					// show metres when distance is < 1km, then show km
					if (distance > 1000) {
						distanceStr = L.GeometryUtil.formattedNumber(distance / 1000, precision['km']) + ' km';
					} else {
						distanceStr = L.GeometryUtil.formattedNumber(distance, precision['m']) + ' m';
					}
					break;
				case 'feet':
					distance *= 1.09361 * 3;
					distanceStr = L.GeometryUtil.formattedNumber(distance, precision['ft']) + ' ft';

					break;
				case 'nauticalMile':
					distance *= 0.53996;
					distanceStr = L.GeometryUtil.formattedNumber(distance / 1000, precision['nm']) + ' nm';
					break;
				case 'yards':
				default:
					distance *= 1.09361;

					if (distance > 1760) {
						distanceStr = L.GeometryUtil.formattedNumber(distance / 1760, precision['mi']) + ' miles';
					} else {
						distanceStr = L.GeometryUtil.formattedNumber(distance, precision['yd']) + ' yd';
					}
					break;
			}
			return distanceStr;
		},

		// @method isVersion07x(): boolean
		// Returns true if the Leaflet version is 0.7.x, false otherwise.
		isVersion07x: function () {
			var version = L.version.split('.');
			//If Version is == 0.7.*
			return parseInt(version[0], 10) === 0 && parseInt(version[1], 10) === 7;
		},
	});

})();
/**
 * @class L.LatLngUtil
 * @aka LatLngUtil
 */
L.LatLngUtil = {
	// Clones a LatLngs[], returns [][]

	// @method cloneLatLngs(LatLngs[]): L.LatLngs[]
	// Clone the latLng point or points or nested points and return an array with those points
	cloneLatLngs: function (latlngs) {
		var clone = [];
		for (var i = 0, l = latlngs.length; i < l; i++) {
			// Check for nested array (Polyline/Polygon)
			if (Array.isArray(latlngs[i])) {
				clone.push(L.LatLngUtil.cloneLatLngs(latlngs[i]));
			} else {
				clone.push(this.cloneLatLng(latlngs[i]));
			}
		}
		return clone;
	},

	// @method cloneLatLng(LatLng): L.LatLng
	// Clone the latLng and return a new LatLng object.
	cloneLatLng: function (latlng) {
		return L.latLng(latlng.lat, latlng.lng);
	}
};
/**
 * @class L.LineUtil
 * @aka Util
 * @aka L.Utils
 */
L.Util.extend(L.LineUtil, {

	// @method segmentsIntersect(): boolean
	// Checks to see if two line segments intersect. Does not handle degenerate cases.
	// http://compgeom.cs.uiuc.edu/~jeffe/teaching/373/notes/x06-sweepline.pdf
	segmentsIntersect: function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2, /*Point*/ p3) {
		return this._checkCounterclockwise(p, p2, p3) !==
			this._checkCounterclockwise(p1, p2, p3) &&
			this._checkCounterclockwise(p, p1, p2) !==
			this._checkCounterclockwise(p, p1, p3);
	},

	// check to see if points are in counterclockwise order
	_checkCounterclockwise: function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
		return (p2.y - p.y) * (p1.x - p.x) > (p1.y - p.y) * (p2.x - p.x);
	}
});
/**
 * @class L.Polygon
 * @aka Polygon
 */
L.Polygon.include({

	// @method intersects(): boolean
	// Checks a polygon for any intersecting line segments. Ignores holes.
	intersects: function () {
		var polylineIntersects,
			points = this._getProjectedPoints(),
			len, firstPoint, lastPoint, maxIndex;

		if (this._tooFewPointsForIntersection()) {
			return false;
		}

		polylineIntersects = L.Polyline.prototype.intersects.call(this);

		// If already found an intersection don't need to check for any more.
		if (polylineIntersects) {
			return true;
		}

		len = points.length;
		firstPoint = points[0];
		lastPoint = points[len - 1];
		maxIndex = len - 2;

		// Check the line segment between last and first point. Don't need to check the first line segment (minIndex = 1)
		return this._lineSegmentsIntersectsRange(lastPoint, firstPoint, maxIndex, 1);
	}
});
/**
 * @class L.Polyline
 * @aka Polyline
 */
L.Polyline.include({

	// @method intersects(): boolean
	// Check to see if this polyline has any linesegments that intersect.
	// NOTE: does not support detecting intersection for degenerate cases.
	intersects: function () {
		var points = this._getProjectedPoints(),
			len = points ? points.length : 0,
			i, p, p1;

		if (this._tooFewPointsForIntersection()) {
			return false;
		}

		for (i = len - 1; i >= 3; i--) {
			p = points[i - 1];
			p1 = points[i];


			if (this._lineSegmentsIntersectsRange(p, p1, i - 2)) {
				return true;
			}
		}

		return false;
	},

	// @method newLatLngIntersects(): boolean
	// Check for intersection if new latlng was added to this polyline.
	// NOTE: does not support detecting intersection for degenerate cases.
	newLatLngIntersects: function (latlng, skipFirst) {
		// Cannot check a polyline for intersecting lats/lngs when not added to the map
		if (!this._map) {
			return false;
		}

		return this.newPointIntersects(this._map.latLngToLayerPoint(latlng), skipFirst);
	},

	// @method newPointIntersects(): boolean
	// Check for intersection if new point was added to this polyline.
	// newPoint must be a layer point.
	// NOTE: does not support detecting intersection for degenerate cases.
	newPointIntersects: function (newPoint, skipFirst) {
		var points = this._getProjectedPoints(),
			len = points ? points.length : 0,
			lastPoint = points ? points[len - 1] : null,
			// The previous previous line segment. Previous line segment doesn't need testing.
			maxIndex = len - 2;

		if (this._tooFewPointsForIntersection(1)) {
			return false;
		}

		return this._lineSegmentsIntersectsRange(lastPoint, newPoint, maxIndex, skipFirst ? 1 : 0);
	},

	// Polylines with 2 sides can only intersect in cases where points are collinear (we don't support detecting these).
	// Cannot have intersection when < 3 line segments (< 4 points)
	_tooFewPointsForIntersection: function (extraPoints) {
		var points = this._getProjectedPoints(),
			len = points ? points.length : 0;
		// Increment length by extraPoints if present
		len += extraPoints || 0;

		return !points || len <= 3;
	},

	// Checks a line segment intersections with any line segments before its predecessor.
	// Don't need to check the predecessor as will never intersect.
	_lineSegmentsIntersectsRange: function (p, p1, maxIndex, minIndex) {
		var points = this._getProjectedPoints(),
			p2, p3;

		minIndex = minIndex || 0;

		// Check all previous line segments (beside the immediately previous) for intersections
		for (var j = maxIndex; j > minIndex; j--) {
			p2 = points[j - 1];
			p3 = points[j];

			if (L.LineUtil.segmentsIntersect(p, p1, p2, p3)) {
				return true;
			}
		}

		return false;
	},

	_getProjectedPoints: function () {
		if (!this._defaultShape) {
			return this._originalPoints;
		}
		var points = [],
			_shape = this._defaultShape();

		for (var i = 0; i < _shape.length; i++) {
			points.push(this._map.latLngToLayerPoint(_shape[i]));
		}
		return points;
	}
});
L.Map.mergeOptions({
	touchExtend: true
});

/**
 * @class L.Map.TouchExtend
 * @aka TouchExtend
 */
L.Map.TouchExtend = L.Handler.extend({

	// @method initialize(): void
	// Sets TouchExtend private accessor variables
	initialize: function (map) {
		this._map = map;
		this._container = map._container;
		this._pane = map._panes.overlayPane;
	},

	// @method addHooks(): void
	// Adds dom listener events to the map container
	addHooks: function () {
		L.DomEvent.on(this._container, 'touchstart', this._onTouchStart, this);
		L.DomEvent.on(this._container, 'touchend', this._onTouchEnd, this);
		L.DomEvent.on(this._container, 'touchmove', this._onTouchMove, this);
		if (this._detectIE()) {
			L.DomEvent.on(this._container, 'MSPointerDown', this._onTouchStart, this);
			L.DomEvent.on(this._container, 'MSPointerUp', this._onTouchEnd, this);
			L.DomEvent.on(this._container, 'MSPointerMove', this._onTouchMove, this);
			L.DomEvent.on(this._container, 'MSPointerCancel', this._onTouchCancel, this);

		} else {
			L.DomEvent.on(this._container, 'touchcancel', this._onTouchCancel, this);
			L.DomEvent.on(this._container, 'touchleave', this._onTouchLeave, this);
		}
	},

	// @method removeHooks(): void
	// Removes dom listener events from the map container
	removeHooks: function () {
		L.DomEvent.off(this._container, 'touchstart', this._onTouchStart, this);
		L.DomEvent.off(this._container, 'touchend', this._onTouchEnd, this);
		L.DomEvent.off(this._container, 'touchmove', this._onTouchMove, this);
		if (this._detectIE()) {
			L.DomEvent.off(this._container, 'MSPointerDown', this._onTouchStart, this);
			L.DomEvent.off(this._container, 'MSPointerUp', this._onTouchEnd, this);
			L.DomEvent.off(this._container, 'MSPointerMove', this._onTouchMove, this);
			L.DomEvent.off(this._container, 'MSPointerCancel', this._onTouchCancel, this);
		} else {
			L.DomEvent.off(this._container, 'touchcancel', this._onTouchCancel, this);
			L.DomEvent.off(this._container, 'touchleave', this._onTouchLeave, this);
		}
	},

	_touchEvent: function (e, type) {
		// #TODO: fix the pageX error that is do a bug in Android where a single touch triggers two click events
		// _filterClick is what leaflet uses as a workaround.
		// This is a problem with more things than just android. Another problem is touchEnd has no touches in
		// its touch list.
		var touchEvent = {};
		if (typeof e.touches !== 'undefined') {
			if (!e.touches.length) {
				return;
			}
			touchEvent = e.touches[0];
		} else if (e.pointerType === 'touch') {
			touchEvent = e;
			if (!this._filterClick(e)) {
				return;
			}
		} else {
			return;
		}

		var containerPoint = this._map.mouseEventToContainerPoint(touchEvent),
			layerPoint = this._map.mouseEventToLayerPoint(touchEvent),
			latlng = this._map.layerPointToLatLng(layerPoint);

		this._map.fire(type, {
			latlng: latlng,
			layerPoint: layerPoint,
			containerPoint: containerPoint,
			pageX: touchEvent.pageX,
			pageY: touchEvent.pageY,
			originalEvent: e
		});
	},

	/** Borrowed from Leaflet and modified for bool ops **/
	_filterClick: function (e) {
		var timeStamp = (e.timeStamp || e.originalEvent.timeStamp),
			elapsed = L.DomEvent._lastClick && (timeStamp - L.DomEvent._lastClick);

		// are they closer together than 500ms yet more than 100ms?
		// Android typically triggers them ~300ms apart while multiple listeners
		// on the same event should be triggered far faster;
		// or check if click is simulated on the element, and if it is, reject any non-simulated events
		if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
			L.DomEvent.stop(e);
			return false;
		}
		L.DomEvent._lastClick = timeStamp;
		return true;
	},

	_onTouchStart: function (e) {
		if (!this._map._loaded) {
			return;
		}

		var type = 'touchstart';
		this._touchEvent(e, type);

	},

	_onTouchEnd: function (e) {
		if (!this._map._loaded) {
			return;
		}

		var type = 'touchend';
		this._touchEvent(e, type);
	},

	_onTouchCancel: function (e) {
		if (!this._map._loaded) {
			return;
		}

		var type = 'touchcancel';
		if (this._detectIE()) {
			type = 'pointercancel';
		}
		this._touchEvent(e, type);
	},

	_onTouchLeave: function (e) {
		if (!this._map._loaded) {
			return;
		}

		var type = 'touchleave';
		this._touchEvent(e, type);
	},

	_onTouchMove: function (e) {
		if (!this._map._loaded) {
			return;
		}

		var type = 'touchmove';
		this._touchEvent(e, type);
	},

	_detectIE: function () {
		var ua = window.navigator.userAgent;

		var msie = ua.indexOf('MSIE ');
		if (msie > 0) {
			// IE 10 or older => return version number
			return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
		}

		var trident = ua.indexOf('Trident/');
		if (trident > 0) {
			// IE 11 => return version number
			var rv = ua.indexOf('rv:');
			return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
		}

		var edge = ua.indexOf('Edge/');
		if (edge > 0) {
			// IE 12 => return version number
			return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
		}

		// other browser
		return false;
	}
});

L.Map.addInitHook('addHandler', 'touchExtend', L.Map.TouchExtend);


/**
 * @class L.Marker.Touch
 * @aka Marker.Touch
 *
 * This isn't full Touch support. This is just to get markers to also support dom touch events after creation
 * #TODO: find a better way of getting markers to support touch.
 */
L.Marker.Touch = L.Marker.extend({

	_initInteraction: function () {
		if (!this.addInteractiveTarget) {
			// 0.7.x support
			return this._initInteractionLegacy();
		}
		// TODO this may need be updated to re-add touch events for 1.0+
		return L.Marker.prototype._initInteraction.apply(this);
	},

	// This is an exact copy of https://github.com/Leaflet/Leaflet/blob/v0.7/src/layer/marker/Marker.js
	// with the addition of the touch events
	_initInteractionLegacy: function () {

		if (!this.options.clickable) {
			return;
		}

		// TODO refactor into something shared with Map/Path/etc. to DRY it up

		var icon = this._icon,
			events = ['dblclick',
				'mousedown',
				'mouseover',
				'mouseout',
				'contextmenu',
				'touchstart',
				'touchend',
				'touchmove'];
		if (this._detectIE) {
			events.concat(['MSPointerDown',
				'MSPointerUp',
				'MSPointerMove',
				'MSPointerCancel']);
		} else {
			events.concat(['touchcancel']);
		}

		L.DomUtil.addClass(icon, 'leaflet-clickable');
		L.DomEvent.on(icon, 'click', this._onMouseClick, this);
		L.DomEvent.on(icon, 'keypress', this._onKeyPress, this);

		for (var i = 0; i < events.length; i++) {
			L.DomEvent.on(icon, events[i], this._fireMouseEvent, this);
		}

		if (L.Handler.MarkerDrag) {
			this.dragging = new L.Handler.MarkerDrag(this);

			if (this.options.draggable) {
				this.dragging.enable();
			}
		}
	},

	_detectIE: function () {
		var ua = window.navigator.userAgent;

		var msie = ua.indexOf('MSIE ');
		if (msie > 0) {
			// IE 10 or older => return version number
			return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
		}

		var trident = ua.indexOf('Trident/');
		if (trident > 0) {
			// IE 11 => return version number
			var rv = ua.indexOf('rv:');
			return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
		}

		var edge = ua.indexOf('Edge/');
		if (edge > 0) {
			// IE 12 => return version number
			return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
		}

		// other browser
		return false;
	}
});
