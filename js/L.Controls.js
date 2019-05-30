//L.Control.Pan
(function (factory) {
	// Packaging/modules magic dance
	var L;
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['leaflet'], factory);
	} else if (typeof module !== 'undefined') {
		// Node/CommonJS
		L = require('leaflet');
		module.exports = factory(L);
	} else {
		// Browser globals
		if (typeof window.L === 'undefined')
			throw 'Leaflet must be loaded first';
		factory(window.L);
	}
}(function (L) {
	'use strict';
	L.Control.Pan = L.Control.extend({
		options: {
			position: 'topleft',
			panOffset: 500
		},

		onAdd: function (map) {
			var className = 'leaflet-control-pan',
				container = L.DomUtil.create('div', className),
				off = this.options.panOffset;

			this._panButton('Up'   , className + '-up',
							container, map, new L.Point(    0 , -off));
			this._panButton('Left' , className + '-left',
							container, map, new L.Point( -off ,  0));
			this._panButton('Right', className + '-right',
							container, map, new L.Point(  off ,  0));
			this._panButton('Down' , className + '-down',
							container, map, new L.Point(    0 ,  off));

			// Add pan control class to the control container
			if (this.options.position === 'topleft') {
				var controlContainer = L.DomUtil.get(map._controlCorners.topleft);
			} else if (this.options.position === 'topright') {
				var controlContainer = L.DomUtil.get(map._controlCorners.topright);
			} else if (this.options.position === 'bottomleft') {
				var controlContainer = L.DomUtil.get(map._controlCorners.bottomleft);
			} else {
				var controlContainer = L.DomUtil.get(map._controlCorners.bottomright);
			}
			if(!L.DomUtil.hasClass(controlContainer, 'has-leaflet-pan-control')) {
				L.DomUtil.addClass(controlContainer, 'has-leaflet-pan-control');
			}

			return container;
		},

		onRemove: function (map) {
			// Remove pan control class to the control container
			var controlContainer = L.DomUtil.get(map._controlCorners.topleft);
			if(L.DomUtil.hasClass(controlContainer, 'has-leaflet-pan-control')) {
				L.DomUtil.removeClass(controlContainer, 'has-leaflet-pan-control');
			}
		},

		_panButton: function (title, className, container, map, offset) {
			var wrapper = L.DomUtil.create('div', className + '-wrap', container);
			var link = L.DomUtil.create('a', className, wrapper);
			link.href = '#';
			link.title = title;
			L.DomEvent
				.on(link, 'click', L.DomEvent.stopPropagation)
				.on(link, 'click', L.DomEvent.preventDefault)
				.on(link, 'click', function(){ map.panBy(offset); }, map)
				.on(link, 'dblclick', L.DomEvent.stopPropagation);

			return link;
		}
	});

	L.Map.mergeOptions({
		panControl: false
	});

	L.Map.addInitHook(function () {
		if (this.options.panControl) {
			this.panControl = new L.Control.Pan();
			this.addControl(this.panControl);
		}
	});

	L.control.pan = function (options) {
		return new L.Control.Pan(options);
	};

	return L.Control.Pan;
}));
//L.Control.echartsLegend
L.Control.EchartsLegend = L.Control.extend({

    statics: {
        TITLE: '图例'
    },
    options: {
        position: 'bottomright',
    },
    initialize: function(options) {
        L.Control.prototype.initialize.call(this, options);

    },
    onAdd: function(map) {
        var className = 'leaflet-control';
        this._container = L.DomUtil.create('div', 'leaflet-bar');
        var link = L.DomUtil.create('div', className + '-echarts-legend', this._container);
        // link.href = '#';
        link.title = L.Control.EchartsLegend.TITLE;

        return this._container;
    },
    toggle: function() {
        if (this.handler.enabled()) {
            this.handler.disable.call(this.handler);
        } else {
            this.handler.enable.call(this.handler);
        }
    },
});



L.Control.echartsLegend = function(options) {
    return new L.Control.EchartsLegend(options);
};

//L.Control.MousePosition
L.Control.MousePosition = L.Control.extend({
  options: {
    position: 'bottomleft',//位置
    separator: ' : ',// 连接符
    emptyString: '',// 初始化提示文字
    lngFirst: true, //是否经度在前
    numDigits: 3, //小数位数
    lngFormatter: undefined, //  经度提示
    latFormatter: undefined, //  纬度提示
    prefix: "" //前缀文字
  },

  onAdd: function (map) {
    this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
    L.DomEvent.disableClickPropagation(this._container);
    map.on('mousemove', this._onMouseMove, this);
    this._container.innerHTML=this.options.emptyString;
    return this._container;
  },

  onRemove: function (map) {
    map.off('mousemove', this._onMouseMove);
  },

  _onMouseMove: function (e) {
    var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.lng) : L.Util.formatNum(e.latlng.lng, this.options.numDigits);
    var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
    var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
    var prefixAndValue = this.options.prefix + ' ' + value;
    this._container.innerHTML = prefixAndValue;
  }

});

L.Map.mergeOptions({
    positionControl: false
});

L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.MousePosition();
        this.addControl(this.positionControl);
    }
});

L.control.mousePosition = function (options) {
    return new L.Control.MousePosition(options);
};
//L.Control.MiniMap
//Following https://github.com/Leaflet/Leaflet/blob/master/PLUGIN-GUIDE.md
(function (factory, window) {

	// define an AMD module that relies on 'leaflet'
	if (typeof define === 'function' && define.amd) {
		define(['leaflet'], factory);

	// define a Common JS module that relies on 'leaflet'
	} else if (typeof exports === 'object') {
		module.exports = factory(require('leaflet'));
	}

	// attach your plugin to the global 'L' variable
	if (typeof window !== 'undefined' && window.L) {
		window.L.Control.MiniMap = factory(L);
		window.L.control.minimap = function (layer, options) {
			return new window.L.Control.MiniMap(layer, options);
		};
	}
}(function (L) {

	var MiniMap = L.Control.extend({

		includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,

		options: {
			position: 'bottomright',
			toggleDisplay: false,
			zoomLevelOffset: -5,
			zoomLevelFixed: false,
			centerFixed: false,
			zoomAnimation: false,
			autoToggleDisplay: true,
			minimized: false,
			width: 150,
			height: 150,
			collapsedWidth: 19,
			collapsedHeight: 19,
			aimingRectOptions: {color: '#ff7800', weight: 1, clickable: false},
			shadowRectOptions: {color: '#000000', weight: 1, clickable: false, opacity: 0, fillOpacity: 0},
			strings: {hideText: 'Hide MiniMap', showText: 'Show MiniMap'},
			mapOptions: {}  // Allows definition / override of Leaflet map options.
		},

		// layer is the map layer to be shown in the minimap
		initialize: function (layer, options) {
			L.Util.setOptions(this, options);
			// Make sure the aiming rects are non-clickable even if the user tries to set them clickable (most likely by forgetting to specify them false)
			this.options.aimingRectOptions.clickable = false;
			this.options.shadowRectOptions.clickable = false;
			this._layer = layer;
		},

		onAdd: function (map) {

			this._mainMap = map;

			// Creating the container and stopping events from spilling through to the main map.
			this._container = L.DomUtil.create('div', 'leaflet-control-minimap');
			this._container.style.width = this.options.width + 'px';
			this._container.style.height = this.options.height + 'px';
			L.DomEvent.disableClickPropagation(this._container);
			L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);

			var mapOptions = {
				attributionControl: false,
				dragging: !this.options.centerFixed,
				zoomControl: false,
				zoomAnimation: this.options.zoomAnimation,
				autoToggleDisplay: this.options.autoToggleDisplay,
				touchZoom: this.options.centerFixed ? 'center' : !this._isZoomLevelFixed(),
				scrollWheelZoom: this.options.centerFixed ? 'center' : !this._isZoomLevelFixed(),
				doubleClickZoom: this.options.centerFixed ? 'center' : !this._isZoomLevelFixed(),
				boxZoom: !this._isZoomLevelFixed(),
				crs: map.options.crs
			};
			mapOptions = L.Util.extend(this.options.mapOptions, mapOptions);  // merge with priority of the local mapOptions object.

			this._miniMap = new L.Map(this._container, mapOptions);

			this._miniMap.addLayer(this._layer);

			// These bools are used to prevent infinite loops of the two maps notifying each other that they've moved.
			this._mainMapMoving = false;
			this._miniMapMoving = false;

			// Keep a record of this to prevent auto toggling when the user explicitly doesn't want it.
			this._userToggledDisplay = false;
			this._minimized = false;

			if (this.options.toggleDisplay) {
				this._addToggleButton();
			}

			this._miniMap.whenReady(L.Util.bind(function () {
				this._aimingRect = L.rectangle(this._mainMap.getBounds(), this.options.aimingRectOptions).addTo(this._miniMap);
				this._shadowRect = L.rectangle(this._mainMap.getBounds(), this.options.shadowRectOptions).addTo(this._miniMap);
				this._mainMap.on('moveend', this._onMainMapMoved, this);
				this._mainMap.on('move', this._onMainMapMoving, this);
				this._miniMap.on('movestart', this._onMiniMapMoveStarted, this);
				this._miniMap.on('move', this._onMiniMapMoving, this);
				this._miniMap.on('moveend', this._onMiniMapMoved, this);
			}, this));

			return this._container;
		},

		addTo: function (map) {
			L.Control.prototype.addTo.call(this, map);

			var center = this.options.centerFixed || this._mainMap.getCenter();
			this._miniMap.setView(center, this._decideZoom(true));
			this._setDisplay(this.options.minimized);
			return this;
		},

		onRemove: function (map) {
			this._mainMap.off('moveend', this._onMainMapMoved, this);
			this._mainMap.off('move', this._onMainMapMoving, this);
			this._miniMap.off('moveend', this._onMiniMapMoved, this);

			this._miniMap.removeLayer(this._layer);
		},

		changeLayer: function (layer) {
			this._miniMap.removeLayer(this._layer);
			this._layer = layer;
			this._miniMap.addLayer(this._layer);
		},

		_addToggleButton: function () {
			this._toggleDisplayButton = this.options.toggleDisplay ? this._createButton(
				'', this._toggleButtonInitialTitleText(), ('leaflet-control-minimap-toggle-display leaflet-control-minimap-toggle-display-' +
				this.options.position), this._container, this._toggleDisplayButtonClicked, this) : undefined;

			this._toggleDisplayButton.style.width = this.options.collapsedWidth + 'px';
			this._toggleDisplayButton.style.height = this.options.collapsedHeight + 'px';
		},

		_toggleButtonInitialTitleText: function () {
			if (this.options.minimized) {
				return this.options.strings.showText;
			} else {
				return this.options.strings.hideText;
			}
		},

		_createButton: function (html, title, className, container, fn, context) {
			var link = L.DomUtil.create('a', className, container);
			link.innerHTML = html;
			link.href = '#';
			link.title = title;

			var stop = L.DomEvent.stopPropagation;

			L.DomEvent
				.on(link, 'click', stop)
				.on(link, 'mousedown', stop)
				.on(link, 'dblclick', stop)
				.on(link, 'click', L.DomEvent.preventDefault)
				.on(link, 'click', fn, context);

			return link;
		},

		_toggleDisplayButtonClicked: function () {
			this._userToggledDisplay = true;
			if (!this._minimized) {
				this._minimize();
			} else {
				this._restore();
			}
		},

		_setDisplay: function (minimize) {
			if (minimize !== this._minimized) {
				if (!this._minimized) {
					this._minimize();
				} else {
					this._restore();
				}
			}
		},

		_minimize: function () {
			// hide the minimap
			if (this.options.toggleDisplay) {
				this._container.style.width = this.options.collapsedWidth + 'px';
				this._container.style.height = this.options.collapsedHeight + 'px';
				this._toggleDisplayButton.className += (' minimized-' + this.options.position);
				this._toggleDisplayButton.title = this.options.strings.showText;
			} else {
				this._container.style.display = 'none';
			}
			this._minimized = true;
			this._onToggle();
		},

		_restore: function () {
			if (this.options.toggleDisplay) {
				this._container.style.width = this.options.width + 'px';
				this._container.style.height = this.options.height + 'px';
				this._toggleDisplayButton.className = this._toggleDisplayButton.className
					.replace('minimized-'	+ this.options.position, '');
				this._toggleDisplayButton.title = this.options.strings.hideText;
			} else {
				this._container.style.display = 'block';
			}
			this._minimized = false;
			this._onToggle();
		},

		_onMainMapMoved: function (e) {
			if (!this._miniMapMoving) {
				var center = this.options.centerFixed || this._mainMap.getCenter();

				this._mainMapMoving = true;
				this._miniMap.setView(center, this._decideZoom(true));
				this._setDisplay(this._decideMinimized());
			} else {
				this._miniMapMoving = false;
			}
			this._aimingRect.setBounds(this._mainMap.getBounds());
		},

		_onMainMapMoving: function (e) {
			this._aimingRect.setBounds(this._mainMap.getBounds());
		},

		_onMiniMapMoveStarted: function (e) {
			if (!this.options.centerFixed) {
				var lastAimingRect = this._aimingRect.getBounds();
				var sw = this._miniMap.latLngToContainerPoint(lastAimingRect.getSouthWest());
				var ne = this._miniMap.latLngToContainerPoint(lastAimingRect.getNorthEast());
				this._lastAimingRectPosition = {sw: sw, ne: ne};
			}
		},

		_onMiniMapMoving: function (e) {
			if (!this.options.centerFixed) {
				if (!this._mainMapMoving && this._lastAimingRectPosition) {
					this._shadowRect.setBounds(new L.LatLngBounds(this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.sw), this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.ne)));
					this._shadowRect.setStyle({opacity: 1, fillOpacity: 0.3});
				}
			}
		},

		_onMiniMapMoved: function (e) {
			if (!this._mainMapMoving) {
				this._miniMapMoving = true;
				this._mainMap.setView(this._miniMap.getCenter(), this._decideZoom(false));
				this._shadowRect.setStyle({opacity: 0, fillOpacity: 0});
			} else {
				this._mainMapMoving = false;
			}
		},

		_isZoomLevelFixed: function () {
			var zoomLevelFixed = this.options.zoomLevelFixed;
			return this._isDefined(zoomLevelFixed) && this._isInteger(zoomLevelFixed);
		},

		_decideZoom: function (fromMaintoMini) {
			if (!this._isZoomLevelFixed()) {
				if (fromMaintoMini) {
					return this._mainMap.getZoom() + this.options.zoomLevelOffset;
				} else {
					var currentDiff = this._miniMap.getZoom() - this._mainMap.getZoom();
					var proposedZoom = this._miniMap.getZoom() - this.options.zoomLevelOffset;
					var toRet;

					if (currentDiff > this.options.zoomLevelOffset && this._mainMap.getZoom() < this._miniMap.getMinZoom() - this.options.zoomLevelOffset) {
						// This means the miniMap is zoomed out to the minimum zoom level and can't zoom any more.
						if (this._miniMap.getZoom() > this._lastMiniMapZoom) {
							// This means the user is trying to zoom in by using the minimap, zoom the main map.
							toRet = this._mainMap.getZoom() + 1;
							// Also we cheat and zoom the minimap out again to keep it visually consistent.
							this._miniMap.setZoom(this._miniMap.getZoom() - 1);
						} else {
							// Either the user is trying to zoom out past the mini map's min zoom or has just panned using it, we can't tell the difference.
							// Therefore, we ignore it!
							toRet = this._mainMap.getZoom();
						}
					} else {
						// This is what happens in the majority of cases, and always if you configure the min levels + offset in a sane fashion.
						toRet = proposedZoom;
					}
					this._lastMiniMapZoom = this._miniMap.getZoom();
					return toRet;
				}
			} else {
				if (fromMaintoMini) {
					return this.options.zoomLevelFixed;
				} else {
					return this._mainMap.getZoom();
				}
			}
		},

		_decideMinimized: function () {
			if (this._userToggledDisplay) {
				return this._minimized;
			}

			if (this.options.autoToggleDisplay) {
				if (this._mainMap.getBounds().contains(this._miniMap.getBounds())) {
					return true;
				}
				return false;
			}

			return this._minimized;
		},

		_isInteger: function (value) {
			return typeof value === 'number';
		},

		_isDefined: function (value) {
			return typeof value !== 'undefined';
		},

		_onToggle: function () {
			L.Util.requestAnimFrame(function () {
				L.DomEvent.on(this._container, 'transitionend', this._fireToggleEvents, this);
				if (!L.Browser.any3d) {
					L.Util.requestAnimFrame(this._fireToggleEvents, this);
				}
			}, this);
		},

		_fireToggleEvents: function () {
			L.DomEvent.off(this._container, 'transitionend', this._fireToggleEvents, this);
			var data = { minimized: this._minimized };
			this.fire(this._minimized ? 'minimize' : 'restore', data);
			this.fire('toggle', data);
		}
	});

	L.Map.mergeOptions({
		miniMapControl: false
	});

	L.Map.addInitHook(function () {
		if (this.options.miniMapControl) {
			this.miniMapControl = (new MiniMap()).addTo(this);
		}
	});

	return MiniMap;

}, window));
//L.control.navbar
/*
*  Simple navigation control that allows back and forward navigation through map's view history
*/
(function() {
  L.Control.NavBar = L.Control.extend({
    options: {
      position: 'topleft',
      //center:,
      //zoom :,
      //bbox:, //Alternative to center/zoom for home button, takes precedence if included
      forwardTitle: 'Go forward in map view history',
      backTitle: 'Go back in map view history',
      homeTitle: 'Go to home map view'
    },

    onAdd: function(map) {

      // Set options
      if (!this.options.center) {
        this.options.center = map.getCenter();
      }
      if (!this.options.zoom) {
        this.options.zoom = map.getZoom();
      }
      var options = this.options;

      // Create toolbar
      var controlName = 'leaflet-control-navbar',
      container = L.DomUtil.create('div', 'leaflet-bar ' + controlName);

      // Add toolbar buttons
      this._homeButton = this._createButton(options.homeTitle, controlName + '-home', container, this._goHome);
      this._fwdButton = this._createButton(options.forwardTitle, controlName + '-fwd', container, this._goFwd);
      this._backButton = this._createButton(options.backTitle, controlName + '-back', container, this._goBack);

      // Initialize view history and index
      this._viewHistory = [{center: this.options.center, zoom: this.options.zoom}];
      this._curIndx = 0;
      this._updateDisabled();
      map.once('moveend', function() {this._map.on('moveend', this._updateHistory, this);}, this);
      // Set intial view to home
      map.setView(options.center, options.zoom);
      container.style.marginTop = "210px";
      return container;
    },

    onRemove: function(map) {
      map.off('moveend', this._updateHistory, this);
    },

    _goHome: function() {
      if (this.options.bbox){
        try {
          this._map.fitBounds(this.options.bbox);
        } catch(err){
          this._map.setView(this.options.center, this.options.zoom); //Use default if invalid bbox input.
        }
      }
      this._map.setView(this.options.center, this.options.zoom);
    },

    _goBack: function() {
      if (this._curIndx !== 0) {
        this._map.off('moveend', this._updateHistory, this);
        this._map.once('moveend', function() {this._map.on('moveend', this._updateHistory, this);}, this);
        this._curIndx--;
        this._updateDisabled();
        var view = this._viewHistory[this._curIndx];
        this._map.setView(view.center, view.zoom);
      }
    },

    _goFwd: function() {
      if (this._curIndx != this._viewHistory.length - 1) {
        this._map.off('moveend', this._updateHistory, this);
        this._map.once('moveend', function() {this._map.on('moveend', this._updateHistory, this);}, this);
        this._curIndx++;
        this._updateDisabled();
        var view = this._viewHistory[this._curIndx];
        this._map.setView(view.center, view.zoom);
      }
    },

    _createButton: function(title, className, container, fn) {
      // Modified from Leaflet zoom control

      var link = L.DomUtil.create('a', className, container);
      link.href = '#';
      link.title = title;

      L.DomEvent
      .on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
      .on(link, 'click', L.DomEvent.stop)
      .on(link, 'click', fn, this)
      .on(link, 'click', this._refocusOnMap, this);

      return link;
    },

    _updateHistory: function() {
      var newView = {center: this._map.getCenter(), zoom: this._map.getZoom()};
      var insertIndx = this._curIndx + 1;
      this._viewHistory.splice(insertIndx, this._viewHistory.length - insertIndx, newView);
      this._curIndx++;
      // Update disabled state of toolbar buttons
      this._updateDisabled();
    },

    _setFwdEnabled: function(enabled) {
      var leafletDisabled = 'leaflet-disabled';
      var fwdDisabled = 'leaflet-control-navbar-fwd-disabled';
      if (enabled === true) {
        L.DomUtil.removeClass(this._fwdButton, fwdDisabled);
        L.DomUtil.removeClass(this._fwdButton, leafletDisabled);
      }else {
        L.DomUtil.addClass(this._fwdButton, fwdDisabled);
        L.DomUtil.addClass(this._fwdButton, leafletDisabled);
      }
    },

    _setBackEnabled: function(enabled) {
      var leafletDisabled = 'leaflet-disabled';
      var backDisabled = 'leaflet-control-navbar-back-disabled';
      if (enabled === true) {
        L.DomUtil.removeClass(this._backButton, backDisabled);
        L.DomUtil.removeClass(this._backButton, leafletDisabled);
      }else {
        L.DomUtil.addClass(this._backButton, backDisabled);
        L.DomUtil.addClass(this._backButton, leafletDisabled);
      }
    },

    _updateDisabled: function() {
      if (this._curIndx == (this._viewHistory.length - 1)) {
        this._setFwdEnabled(false);
      }else {
        this._setFwdEnabled(true);
      }

      if (this._curIndx <= 0) {
        this._setBackEnabled(false);
      }else {
        this._setBackEnabled(true);
      }
    }

  });

  L.control.navbar = function(options) {
    return new L.Control.NavBar(options);
  };

})();
//L.Control.FullScreen
(function() {
	L.Control.FullScreen = L.Control.extend({
		options: {
			position: 'topleft',
			title: 'Full Screen',
			titleCancel: 'Exit Full Screen',
			forceSeparateButton: false,
			forcePseudoFullscreen: false
		},
		
		onAdd: function (map) {
			var className = 'leaflet-control-zoom-fullscreen', container, content = '';
			
			if (map.zoomControl && !this.options.forceSeparateButton) {
				container = map.zoomControl._container;
			} else {
				container = L.DomUtil.create('div', 'leaflet-bar');
			}
			
			if (this.options.content) {
				content = this.options.content;
			} else {
				className += ' fullscreen-icon';
			}

			this._createButton(this.options.title, className, content, container, this.toggleFullScreen, this);

			this._map.on('enterFullscreen exitFullscreen', this._toggleTitle, this);

			return container;
		},
		
		_state : false,//全屏状态值记录
		
		_createButton: function (title, className, content, container, fn, context) {
			this.link = L.DomUtil.create('a', className, container);
			this.link.href = '#';
			this.link.title = title;
			this.link.innerHTML = content;

			L.DomEvent
				.addListener(this.link, 'click', L.DomEvent.stopPropagation)
				.addListener(this.link, 'click', L.DomEvent.preventDefault)
				.addListener(this.link, 'click', fn, context);
			
			L.DomEvent
				.addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
				.addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
				.addListener(container, fullScreenApi.fullScreenEventName, this._handleEscKey, context);
			
			L.DomEvent
				.addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
				.addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
				.addListener(document, fullScreenApi.fullScreenEventName, this._handleEscKey, context);

			return this.link;
		},
		
		toggleFullScreen: function () {
			//var map = this._map;
			var elem = $(".mainDiv")[0]
			if (this._state) {
				this._state = false;
				if (fullScreenApi.supportsFullScreen && !this.options.forcePseudoFullscreen) {
					fullScreenApi.cancelFullScreen(elem);
				} else {
					L.DomUtil.removeClass(elem, 'leaflet-pseudo-fullscreen');
				}
				//elem.invalidateSize();
				//elem.fire('exitFullscreen');
			}
			else {
				this._state = true;
				if (fullScreenApi.supportsFullScreen && !this.options.forcePseudoFullscreen) {
					fullScreenApi.requestFullScreen(elem);
				} else {
					L.DomUtil.addClass(elem, 'leaflet-pseudo-fullscreen');
				}
				//elem.invalidateSize();
				//elem.fire('enterFullscreen');
			}
			if(resizePage) {resizePage()}
		},
		
		_toggleTitle: function() {
			this.link.title = this._state ? this.options.titleCancel : this.options.title;
		},
		
		_handleEscKey: function () {
			var map = this._map;
			if (!fullScreenApi.isFullScreen(map) && !map._exitFired) {
				map.fire('exitFullscreen');
			}
		}
	});

	L.Map.addInitHook(function () {
		if (this.options.fullscreenControl) {
			this.fullscreenControl = L.control.fullscreen(this.options.fullscreenControlOptions);
			this.addControl(this.fullscreenControl);
		}
	});

	L.control.fullscreen = function (options) {
		return new L.Control.FullScreen(options);
	};

	/* 
	Native FullScreen JavaScript API
	-------------
	Assumes Mozilla naming conventions instead of W3C for now

	source : http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/

	*/

	var fullScreenApi = { 
			supportsFullScreen: false,
			isFullScreen: function() { return false; }, 
			requestFullScreen: function() {}, 
			cancelFullScreen: function() {},
			fullScreenEventName: '',
			prefix: ''
		},
		browserPrefixes = 'webkit moz o ms khtml'.split(' ');
	
	// check for native support
	if (typeof document.exitFullscreen !== 'undefined') {
		fullScreenApi.supportsFullScreen = true;
	} else {
		// check for fullscreen support by vendor prefix
		for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
			fullScreenApi.prefix = browserPrefixes[i];
			if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] !== 'undefined' ) {
				fullScreenApi.supportsFullScreen = true;
				break;
			}
		}
	}
	
	// update methods to do something useful
	if (fullScreenApi.supportsFullScreen) {
		fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
		fullScreenApi.isFullScreen = function() {
			switch (this.prefix) {	
				case '':
					return document.fullScreen;
				case 'webkit':
					return document.webkitIsFullScreen;
				default:
					return document[this.prefix + 'FullScreen'];
			}
		};
		fullScreenApi.requestFullScreen = function(el) {
			return (this.prefix === '') ? el.requestFullscreen() : el[this.prefix + 'RequestFullScreen']();
		};
		fullScreenApi.cancelFullScreen = function(el) {
			return (this.prefix === '') ? document.exitFullscreen() : document[this.prefix + 'CancelFullScreen']();
		};
	}

	// jQuery plugin
	if (typeof jQuery !== 'undefined') {
		jQuery.fn.requestFullScreen = function() {
			return this.each(function() {
				var el = jQuery(this);
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.requestFullScreen(el);
				}
			});
		};
	}

	// export api
	window.fullScreenApi = fullScreenApi;
})();

//
(function() {
    var RestoreViewMixin = {
        restoreView: function () {
            if (!storageAvailable('localStorage')) {
                return false;
            }
            var storage = window.localStorage;
            if (!this.__initRestore) {
                this.on('moveend', function (e) {
                    if (!this._loaded)
                        return;  // Never access map bounds if view is not set.

                    var view = {
                        lat: this.getCenter().lat,
                        lng: this.getCenter().lng,
                        zoom: this.getZoom()
                    };
                    storage['mapView'] = JSON.stringify(view);
                }, this);
                this.__initRestore = true;
            }

            var view = storage['mapView'];
            try {
                view = JSON.parse(view || '');
                this.setView(L.latLng(view.lat, view.lng), view.zoom, true);
                return true;
            }
            catch (err) {
                return false;
            }
        }
    };

    function storageAvailable(type) {
        try {
            var storage = window[type],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            console.warn("Your browser blocks access to " + type);
            return false;
        }
    }

    L.Map.include(RestoreViewMixin);
})();

/*!
 * 
 *  leaflet.browser.print - v0.8.2 (https://github.com/Igor-Vladyka/leaflet.browser.print) 
 *  A leaflet plugin which allows users to print the map directly from the browser
 *  
 *  MIT (http://www.opensource.org/licenses/mit-license.php)
 *  (c) 2019  Igor Vladyka <igor.vladyka@gmail.com> (https://github.com/Igor-Vladyka/)
 * 
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/leaflet.browser.print.js":
/*!**************************************!*\
  !*** ./src/leaflet.browser.print.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/**\r\n\tMIT License http://www.opensource.org/licenses/mit-license.php\r\n\tAuthor Igor Vladyka <igor.vladyka@gmail.com> (https://github.com/Igor-Vladyka/leaflet.browser.print)\r\n**/\r\n\r\nL.Control.BrowserPrint = L.Control.extend({\r\n\toptions: {\r\n\t\ttitle: 'Print map',\r\n\t\tdocumentTitle: '',\r\n\t\tposition: 'topleft',\r\n        printLayer: null,\r\n\t\tprintModes: [\"Portrait\", \"Landscape\", \"Auto\", \"Custom\"],\r\n\t\tclosePopupsOnPrint: true,\r\n\t\tcontentSelector: \"[leaflet-browser-print-content]\",\r\n\t\tpagesSelector: \"[leaflet-browser-print-pages]\",\r\n\t\tmanualMode: false\r\n\t},\r\n\r\n\tonAdd: function (map) {\r\n\r\n\t\tvar container = L.DomUtil.create('div', 'leaflet-control-browser-print leaflet-bar leaflet-control');\r\n\t\tL.DomEvent.disableClickPropagation(container);\r\n\r\n\t\tthis._appendControlStyles(container);\r\n\r\n\t\tif (this.options.printModes.length > 1) {\r\n\t\t\tL.DomEvent.addListener(container, 'mouseover', this._displayPageSizeButtons, this);\r\n\t\t\tL.DomEvent.addListener(container, 'mouseout', this._hidePageSizeButtons, this);\r\n\t\t} else {\r\n\t\t\tcontainer.style.cursor = \"pointer\";\r\n\t\t}\r\n\r\n\t\tif (this.options.position.indexOf(\"left\") > 0) {\r\n\t\t\tthis._createIcon(container);\r\n\t\t\tthis._createMenu(container);\r\n\t\t} else {\r\n\t\t\tthis._createMenu(container);\r\n\t\t\tthis._createIcon(container);\r\n\t\t}\r\n\r\n\t\tsetTimeout( function () {\r\n\t\t\tcontainer.className += parseInt(L.version) ? \" v1\" : \" v0-7\"; // parseInt(L.version) returns 1 for v1.0.3 and 0 for 0.7.7;\r\n\t\t}, 10);\r\n\r\n\t\tmap.printControl = this; // Make control available from the map object itself;\r\n\t\treturn container;\r\n\t},\r\n\r\n\t_createIcon: function (container) {\r\n\t\tthis.__link__ = L.DomUtil.create('a', '', container);\r\n\t\tthis.__link__.className = \"leaflet-browser-print\";\r\n\t\tif (this.options.title) {\r\n\t\t\tthis.__link__.title = this.options.title;\r\n\t\t}\r\n\t\treturn this.__link__;\r\n\t},\r\n\r\n\t_createMenu: function (container) {\r\n\t\tvar domPrintModes = [];\r\n\r\n\t\tfor (var i = 0; i < this.options.printModes.length; i++) {\r\n\t\t\tvar mode = this.options.printModes[i];\r\n\r\n\t\t\t/*\r\n\t\t\t\tMode:\r\n\t\t\t\t\tMode: Portrait/Landscape/Auto/Custom\r\n\t\t\t\t\tTitle: 'Portrait'/'Landscape'/'Auto'/'Custom'\r\n\t\t\t\t\tPageSize: 'A3'/'A4'\r\n\t\t\t\t\tAction: '_printPortrait'/...\r\n\t\t\t\t\tInvalidateBounds: true/false\r\n\t\t\t*/\r\n\t\t\tif (mode.length) {\r\n\t\t\t\tvar key = mode[0].toUpperCase() + mode.substring(1).toLowerCase();\r\n\r\n\t\t\t\tmode = L.control.browserPrint.mode[mode.toLowerCase()](this._getDefaultTitle(key));\r\n\r\n\t\t\t} else if (mode instanceof L.Control.BrowserPrint.Mode) {\r\n\t\t\t\t// Looks like everythin is fine.\r\n\t\t\t} else {\r\n\t\t\t\tthrow \"Invalid Print Mode. Can't construct logic to print current map.\"\r\n\t\t\t}\r\n\r\n\t\t\tif (this.options.printModes.length == 1) {\r\n\t\t\t\tmode.Element = container;\r\n\t\t\t} else {\r\n\t\t\t\tmode.Element = L.DomUtil.create('li', 'browser-print-mode', L.DomUtil.create('ul', 'browser-print-holder', container));\r\n\t\t\t\tmode.Element.innerHTML = mode.Title;\r\n\t\t\t}\r\n\r\n\t\t\tL.DomEvent.addListener(mode.Element, 'click', mode.Action(this, mode), this);\r\n\r\n\t\t\tdomPrintModes.push(mode);\r\n\t\t}\r\n\r\n\t\tthis.options.printModes = domPrintModes;\r\n\t},\r\n\r\n\t_getDefaultTitle: function(key) {\r\n\t\treturn this.options.printModesNames && this.options.printModesNames[key] || key;\r\n\t},\r\n\r\n    _displayPageSizeButtons: function() {\r\n\t\tif (this.options.position.indexOf(\"left\") > 0) {\r\n\t        this.__link__.style.borderTopRightRadius = \"0px\";\r\n\t    \tthis.__link__.style.borderBottomRightRadius = \"0px\";\r\n\t\t} else {\r\n\t\t\tthis.__link__.style.borderTopLeftRadius = \"0px\";\r\n\t    \tthis.__link__.style.borderBottomLeftRadius = \"0px\";\r\n\t\t}\r\n\r\n\t\tthis.options.printModes.forEach(function(mode){\r\n\t\t\tmode.Element.style.display = \"inline-block\";\r\n\t\t});\r\n    },\r\n\r\n    _hidePageSizeButtons: function (){\r\n\t\tif (this.options.position.indexOf(\"left\") > 0) {\r\n\t    \tthis.__link__.style.borderTopRightRadius = \"\";\r\n\t    \tthis.__link__.style.borderBottomRightRadius = \"\";\r\n\t\t} else {\r\n\t    \tthis.__link__.style.borderTopLeftRadius = \"\";\r\n\t    \tthis.__link__.style.borderBottomLeftRadius = \"\";\r\n\t\t}\r\n\r\n\t\tthis.options.printModes.forEach(function(mode){\r\n\t\t\tmode.Element.style.display = \"\";\r\n\t\t});\r\n    },\r\n\r\n\t_getMode: function(name, invalidateBounds) {\r\n\t\tvar mode = this.options.printModes.filter(function(f){\r\n\t\t\treturn f.Mode == name;\r\n\t\t})[0];\r\n\r\n\t\treturn new L.control.browserPrint.mode(mode.Mode, mode.Title, mode.PageSize, mode.Action, invalidateBounds || mode.InvalidateBounds);\r\n\t},\r\n\r\n    _printLandscape: function () {\r\n\t\tthis._addPrintClassToContainer(this._map, \"leaflet-browser-print--landscape\");\r\n\t\tvar orientation = \"Landscape\";\r\n        this._print(this._getMode(orientation), orientation);\r\n    },\r\n\r\n    _printPortrait: function () {\r\n\t\tthis._addPrintClassToContainer(this._map, \"leaflet-browser-print--portrait\");\r\n\t\tvar orientation = \"Portrait\";\r\n        this._print(this._getMode(orientation), orientation);\r\n    },\r\n\r\n    _printAuto: function () {\r\n\t\tthis._addPrintClassToContainer(this._map, \"leaflet-browser-print--auto\");\r\n\r\n\t\tvar autoBounds = this._getBoundsForAllVisualLayers();\r\n\t\tvar orientation = this._getPageSizeFromBounds(autoBounds);\r\n\t\tthis._print(this._getMode(orientation, true), orientation, autoBounds);\r\n    },\r\n\r\n    _printCustom: function () {\r\n\t\tthis._addPrintClassToContainer(this._map, \"leaflet-browser-print--custom\");\r\n\t\tthis._map.on('mousedown', this._startAutoPoligon, this);\r\n    },\r\n\r\n\t_addPrintClassToContainer: function (map, printClassName) {\r\n\t\tvar container = map.getContainer();\r\n\r\n\t\tif (container.className.indexOf(printClassName) === -1) {\r\n\t\t\tcontainer.className += \" \" + printClassName;\r\n\t\t}\r\n\t},\r\n\r\n\t_removePrintClassFromContainer: function (map, printClassName) {\r\n\t\tvar container = map.getContainer();\r\n\r\n\t\tif (container.className && container.className.indexOf(printClassName) > -1) {\r\n\t\t\tcontainer.className = container.className.replace(\" \" + printClassName, \"\");\r\n\t\t}\r\n\t},\r\n\r\n\t_startAutoPoligon: function (e) {\r\n\t\te.originalEvent.preventDefault();\r\n\t\te.originalEvent.stopPropagation();\r\n\r\n\t\tthis._map.dragging.disable();\r\n\r\n\t\tthis.options.custom = { start: e.latlng };\r\n\r\n\t\tthis._map.off('mousedown', this._startAutoPoligon, this);\r\n\t\tthis._map.on('mousemove', this._moveAutoPoligon, this);\r\n\t\tthis._map.on('mouseup', this._endAutoPoligon, this);\r\n\t},\r\n\r\n\t_moveAutoPoligon: function (e) {\r\n\t\tif (this.options.custom) {\r\n\t\t\te.originalEvent.preventDefault();\r\n\t\t\te.originalEvent.stopPropagation();\r\n\t\t\tif (this.options.custom.rectangle) {\r\n\t\t\t\tthis.options.custom.rectangle.setBounds(L.latLngBounds(this.options.custom.start, e.latlng));\r\n\t\t\t} else {\r\n\t\t\t\tthis.options.custom.rectangle = L.rectangle([this.options.custom.start, e.latlng], { color: \"gray\", dashArray: '5, 10' });\r\n\t\t\t\tthis.options.custom.rectangle.addTo(this._map);\r\n\t\t\t}\r\n\t\t}\r\n\t},\r\n\r\n\t_endAutoPoligon: function (e) {\r\n\r\n\t\te.originalEvent.preventDefault();\r\n\t\te.originalEvent.stopPropagation();\r\n\r\n\t\tthis._map.off('mousemove', this._moveAutoPoligon, this);\r\n\t\tthis._map.off('mouseup', this._endAutoPoligon, this);\r\n\r\n\t\tthis._map.dragging.enable();\r\n\r\n\t\tif (this.options.custom && this.options.custom.rectangle) {\r\n\t\t\tvar autoBounds = this.options.custom.rectangle.getBounds();\r\n\r\n\t\t\tthis._map.removeLayer(this.options.custom.rectangle);\r\n\t\t\tthis.options.custom = undefined;\r\n\r\n\t\t\tvar orientation = this._getPageSizeFromBounds(autoBounds);\r\n\t\t\tthis._print(this._getMode(orientation, true), orientation, autoBounds);\r\n\t\t} else {\r\n\t\t\tthis._clearPrint();\r\n\t\t}\r\n\t},\r\n\r\n\t_getPageSizeFromBounds: function(bounds) {\r\n\t\tvar height = Math.abs(bounds.getNorth() - bounds.getSouth());\r\n\t\tvar width = Math.abs(bounds.getEast() - bounds.getWest());\r\n\t\tif (height > width) {\r\n\t\t\treturn \"Portrait\";\r\n\t\t} else {\r\n\t\t\treturn \"Landscape\";\r\n\t\t}\r\n\t},\r\n\r\n\t_setupPrintPagesWidth: function(pagesContainer, size, pageOrientation) {\r\n\t\tpagesContainer.style.width = pageOrientation === \"Landscape\" ? size.Height : size.Width;\r\n\t},\r\n\r\n\t_setupPrintMapHeight: function(mapContainer, size, pageOrientation) {\r\n\t\tmapContainer.style.height = pageOrientation === \"Landscape\" ? size.Width : size.Height;\r\n\t},\r\n\r\n\t/* Intended to cancel next printing*/\r\n\tcancel: function(cancelNextPrinting){\r\n\t\tthis.cancelNextPrinting = cancelNextPrinting;\r\n\t},\r\n\r\n\tprint: function(pageOrientation, autoBounds) {\r\n\t\tif (pageOrientation == \"Landscape\" || pageOrientation == \"Portrait\") {\r\n\t\t\tthis._print(this._getMode(pageOrientation, !!autoBounds), pageOrientation, autoBounds);\r\n\t\t}\r\n\t},\r\n\r\n    _print: function (printMode, pageOrientation, autoBounds) {\r\n\t\tL.Control.BrowserPrint.Utils.initialize();\r\n\t\t\r\n\t\tvar self = this;\r\n        var mapContainer = this._map.getContainer();\r\n\r\n        var origins = {\r\n            bounds: autoBounds || this._map.getBounds(),\r\n            width: mapContainer.style.width,\r\n            height: mapContainer.style.height,\r\n\t\t\tdocumentTitle: document.title,\r\n\t\t\tprintLayer: L.Control.BrowserPrint.Utils.cloneLayer(this.options.printLayer),\r\n\t\t\tpanes: []\r\n        };\r\n\r\n\t\tvar mapPanes = this._map.getPanes();\r\n\t\tfor (var pane in mapPanes) {\r\n\t\t\torigins.panes.push({name: pane, container: undefined});\r\n\t\t}\r\n\r\n\t\torigins.printObjects = this._getPrintObjects(origins.printLayer);\r\n\r\n\t\tthis._map.fire(L.Control.BrowserPrint.Event.PrePrint, { printLayer: origins.printLayer, printObjects: origins.printObjects, pageOrientation: pageOrientation, printMode: printMode.Mode, pageBounds: origins.bounds});\r\n\r\n\t\tif (this.cancelNextPrinting) {\r\n\t\t\tdelete this.cancelNextPrinting;\r\n\t\t\treturn;\r\n\t\t}\r\n\r\n\t\tvar overlay = this._addPrintMapOverlay(printMode.PageSize, printMode.getPageMargin(), printMode.getSize(), pageOrientation, origins);\r\n\r\n\t\tif (this.options.documentTitle) {\r\n\t\t\tdocument.title = this.options.documentTitle;\r\n\t\t}\r\n\r\n\t\tthis._map.fire(L.Control.BrowserPrint.Event.PrintStart, { printLayer: origins.printLayer, printMap: overlay.map, printObjects: overlay.objects });\r\n\r\n\t\tif (printMode.InvalidateBounds) {\r\n\t\t\toverlay.map.fitBounds(origins.bounds);\r\n\t\t\toverlay.map.invalidateSize({reset: true, animate: false, pan: false});\r\n\t\t} else {\r\n\t\t\toverlay.map.setView(this._map.getCenter(), this._map.getZoom());\r\n\t\t}\r\n\r\n\t\tvar interval = setInterval(function(){\r\n\t\t\tif (!self._isTilesLoading(overlay.map)) {\r\n\t\t\t\tclearInterval(interval);\r\n\t\t\t\tif (self.options.manualMode) {\r\n\t\t\t\t\tself._setupManualPrintButton(overlay.map, origins, overlay.objects);\r\n\t\t\t\t} else {\r\n\t\t\t\t\tself._completePrinting(overlay.map, origins, overlay.objects);\r\n\t\t\t\t}\r\n\t\t\t}\r\n\t\t}, 50);\r\n    },\r\n\r\n\t_completePrinting: function (overlayMap, origins, printObjects) {\r\n\t\tvar self = this;\r\n\t\tsetTimeout(function(){\r\n\t\t\tself._map.fire(L.Control.BrowserPrint.Event.Print, { printLayer: origins.printLayer, printMap: overlayMap, printObjects: printObjects });\r\n\t\t\tvar printPromise = window.print();\r\n\t\t\tif (printPromise) {\r\n\t\t\t\tPromise.all([printPromise]).then(function(){\r\n\t\t\t\t\tself._printEnd(origins);\r\n\t\t\t\t\tself._map.fire(L.Control.BrowserPrint.Event.PrintEnd, { printLayer: origins.printLayer, printMap: overlayMap, printObjects: printObjects });\r\n\t\t\t\t})\r\n\t\t\t} else {\r\n\t\t\t\tself._printEnd(origins);\r\n\t\t\t\tself._map.fire(L.Control.BrowserPrint.Event.PrintEnd, { printLayer: origins.printLayer, printMap: overlayMap, printObjects: printObjects });\r\n\t\t\t}\r\n\t\t}, 1000);\r\n\t},\r\n\r\n    _getBoundsForAllVisualLayers: function () {\r\n\t    var fitBounds = null;\r\n\r\n        // Getting all layers without URL -> not tiles.\r\n        for (var layerId in this._map._layers){\r\n            var layer = this._map._layers[layerId];\r\n            if (!layer._url && !layer._mutant) {\r\n                if (fitBounds) {\r\n                    if (layer.getBounds) {\r\n                        fitBounds.extend(layer.getBounds());\r\n                    } else if(layer.getLatLng){\r\n                        fitBounds.extend(layer.getLatLng());\r\n                    }\r\n                } else {\r\n                    if (layer.getBounds) {\r\n                        fitBounds = layer.getBounds();\r\n                    } else if(layer.getLatLng){\r\n                        fitBounds = L.latLngBounds(layer.getLatLng(), layer.getLatLng());\r\n                    }\r\n                }\r\n            }\r\n        }\r\n\r\n\t\tif (!fitBounds) {\r\n\t\t\tfitBounds = this._map.getBounds();\r\n\t\t}\r\n\r\n\t\treturn fitBounds;\r\n    },\r\n\r\n\t_clearPrint: function () {\r\n\t\tthis._removePrintClassFromContainer(this._map, \"leaflet-browser-print--landscape\");\r\n\t\tthis._removePrintClassFromContainer(this._map, \"leaflet-browser-print--portrait\");\r\n\t\tthis._removePrintClassFromContainer(this._map, \"leaflet-browser-print--auto\");\r\n\t\tthis._removePrintClassFromContainer(this._map, \"leaflet-browser-print--custom\");\r\n\t},\r\n\r\n    _printEnd: function (origins) {\r\n\t\tthis._clearPrint();\r\n\r\n\t\tdocument.body.removeChild(this.__overlay__);\r\n\t\tthis.__overlay__ = null;\r\n\r\n\t\tdocument.body.className = document.body.className.replace(\" leaflet--printing\", \"\");\r\n\t\tif (this.options.documentTitle) {\r\n\t\t\tdocument.title = origins.documentTitle;\r\n\t\t}\r\n\r\n\t\tthis._map.invalidateSize({reset: true, animate: false, pan: false});\r\n    },\r\n\r\n\t_getPrintObjects: function(printLayer) {\r\n\t\tvar printObjects = {};\r\n\t\tfor (var id in this._map._layers){\r\n\t\t\tvar layer = this._map._layers[id];\r\n\t\t\tif (!printLayer || !layer._url || layer instanceof L.TileLayer.WMS) {\r\n\t\t\t\tvar type = L.Control.BrowserPrint.Utils.getType(layer);\r\n\t\t\t\tif (type) {\r\n\t\t\t\t\tif (!printObjects[type]) {\r\n\t\t\t\t\t\tprintObjects[type] = [];\r\n\t\t\t\t\t}\r\n\t\t\t\t\tprintObjects[type].push(layer);\r\n\t\t\t\t}\r\n\t\t\t}\r\n\t\t}\r\n\r\n\t\treturn printObjects;\r\n\t},\r\n\r\n    _addPrintCss: function (pageSize, pageMargin, pageOrientation) {\r\n\r\n        var printStyleSheet = document.createElement('style');\r\n\t\tprintStyleSheet.className = \"leaflet-browser-print-css\";\r\n        printStyleSheet.setAttribute('type', 'text/css');\r\n\t\tprintStyleSheet.innerHTML = ' @media print { .leaflet-popup-content-wrapper, .leaflet-popup-tip { box-shadow: none; }';\r\n\t\tprintStyleSheet.innerHTML += ' .leaflet-browser-print--manualMode-button { display: none; }';\r\n\t\tprintStyleSheet.innerHTML += ' * { -webkit-print-color-adjust: exact!important; printer-colors: exact!important; color-adjust: exact!important; }';\r\n\t\tif (pageMargin) {\r\n\t\t\tprintStyleSheet.innerHTML += ' @page { margin: ' + pageMargin + '; }';\r\n\t\t}\r\n\t\tprintStyleSheet.innerHTML += ' @page :first { page-break-after: always; }';\r\n\r\n        switch (pageOrientation) {\r\n            case \"Landscape\":\r\n                printStyleSheet.innerText += \" @page { size : \" + pageSize + \" landscape; }\";\r\n                break;\r\n            default:\r\n            case \"Portrait\":\r\n                printStyleSheet.innerText += \" @page { size : \" + pageSize + \" portrait; }\";\r\n                break;\r\n        }\r\n\r\n        return printStyleSheet;\r\n    },\r\n\r\n\t_appendControlStyles:  function (container) {\r\n\t\tvar printControlStyleSheet = document.createElement('style');\r\n\t\tprintControlStyleSheet.setAttribute('type', 'text/css');\r\n\r\n\t\tprintControlStyleSheet.innerHTML += \" .leaflet-control-browser-print { display: flex; } .leaflet-control-browser-print a { background: #fff url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gcCCi8Vjp+aNAAAAGhJREFUOMvFksENgDAMA68RC7BBN+Cf/ZU33QAmYAT6BolAGxB+RrrIsg1BpfNBVXcPMLMDI/ytpKozMHWwK7BJJ7yYWQbGdBea9wTIkRDzKy0MT7r2NiJACRgotCzxykFI34QY2Ea7KmtxGJ+uX4wfAAAAAElFTkSuQmCC') no-repeat 5px; background-size: 16px 16px; display: block; border-radius: 2px; }\";\r\n\r\n\t\tprintControlStyleSheet.innerHTML += \" .v0-7.leaflet-control-browser-print a.leaflet-browser-print { width: 26px; height: 26px; } .v1.leaflet-control-browser-print a.leaflet-browser-print { background-position-x: 7px; }\";\r\n\t\tprintControlStyleSheet.innerHTML += \" .browser-print-holder { margin: 0px; padding: 0px; list-style: none; white-space: nowrap; } .browser-print-holder-left li:last-child { border-top-right-radius: 2px; border-bottom-right-radius: 2px; } .browser-print-holder-right li:first-child { border-top-left-radius: 2px; border-bottom-left-radius: 2px; }\";\r\n\t\tprintControlStyleSheet.innerHTML += \" .browser-print-mode { display: none; background-color: #919187; color: #FFF; font: 11px/19px 'Helvetica Neue', Arial, Helvetica, sans-serif; text-decoration: none; padding: 4px 10px; text-align: center; } .v1 .browser-print-mode { padding: 6px 10px; } .browser-print-mode:hover { background-color: #757570; cursor: pointer; }\";\r\n\t\tprintControlStyleSheet.innerHTML += \" .leaflet-browser-print--custom, .leaflet-browser-print--custom path { cursor: crosshair!important; }\";\r\n\t\tprintControlStyleSheet.innerHTML += \" .leaflet-print-overlay { width: 100%; height:auto; min-height: 100%; position: absolute; top: 0; background-color: white!important; left: 0; z-index: 1001; display: block!important; } \";\r\n\t\tprintControlStyleSheet.innerHTML += \" .leaflet--printing { height:auto; min-height: 100%; margin: 0px!important; padding: 0px!important; } body.leaflet--printing > * { display: none; box-sizing: border-box; }\";\r\n\t\tprintControlStyleSheet.innerHTML += \" .grid-print-container { grid-template: 1fr / 1fr; box-sizing: border-box; } .grid-map-print { grid-row: 1; grid-column: 1; } body.leaflet--printing .grid-print-container [leaflet-browser-print-content]:not(style) { display: unset!important; }\";\r\n\t\tprintControlStyleSheet.innerHTML += \" .pages-print-container { box-sizing: border-box; }\";\r\n\r\n        container.appendChild(printControlStyleSheet);\r\n\t},\r\n\r\n\t_setupManualPrintButton: function(map, origins, objects) {\r\n\t\tvar manualPrintButton = document.createElement('button');\r\n\t\tmanualPrintButton.className = \"leaflet-browser-print--manualMode-button\";\r\n\t\tmanualPrintButton.innerHTML = \"Print\";\r\n\t\tmanualPrintButton.style.position = \"absolute\";\r\n\t\tmanualPrintButton.style.top = \"20px\";\r\n\t\tmanualPrintButton.style.right = \"20px\";\r\n\t\tthis.__overlay__.appendChild(manualPrintButton);\r\n\r\n\t\tvar self = this;\r\n\t\tL.DomEvent.addListener(manualPrintButton, 'click', function () {\r\n\t\t\tself._completePrinting(map, origins, objects);\r\n\t\t});\r\n\t},\r\n\r\n\t_addPrintMapOverlay: function (pageSize, pageMargin, printSize, pageOrientation, origins) {\r\n\t\tthis.__overlay__ = document.createElement(\"div\");\r\n\t\tthis.__overlay__.className = this._map.getContainer().className + \" leaflet-print-overlay\";\r\n\t\tdocument.body.appendChild(this.__overlay__);\r\n\r\n\t\tthis.__overlay__.appendChild(this._addPrintCss(pageSize, pageMargin, pageOrientation));\r\n\r\n\t\tvar gridContainer = document.createElement(\"div\");\r\n\t\tgridContainer.className = \"grid-print-container\";\r\n\t\tgridContainer.style.width = \"100%\";\r\n\t\tgridContainer.style.display = \"grid\";\r\n\t\tthis._setupPrintMapHeight(gridContainer, printSize, pageOrientation);\r\n\r\n\t\tif (this.options.contentSelector) {\r\n\t\t\tvar content = document.querySelectorAll(this.options.contentSelector);\r\n\t\t\tif (content && content.length) {\r\n\t\t\t\tfor (var i = 0; i < content.length; i++) {\r\n\t\t\t\t\tvar printContentItem = content[i].cloneNode(true);\r\n\t\t\t\t\tgridContainer.appendChild(printContentItem);\r\n\t\t\t\t}\r\n\t\t\t}\r\n\t\t}\r\n\r\n\t\tvar isMultipage = this.options.pagesSelector && document.querySelectorAll(this.options.pagesSelector).length;\r\n\t\tif (isMultipage) {\r\n\t\t\tvar pagesContainer = document.createElement(\"div\");\r\n\t\t\tpagesContainer.className = \"pages-print-container\";\r\n\t\t\tpagesContainer.style.margin = \"0!important\";\r\n\t\t\tthis._setupPrintPagesWidth(pagesContainer, printSize, pageOrientation);\r\n\r\n\t\t\tthis.__overlay__.appendChild(pagesContainer);\r\n\t\t\tpagesContainer.appendChild(gridContainer);\r\n\r\n\t\t\tvar pages = document.querySelectorAll(this.options.pagesSelector);\r\n\t\t\tif (pages && pages.length) {\r\n\t\t\t\tfor (var i = 0; i < pages.length; i++) {\r\n\t\t\t\t\tvar printPageItem = pages[i].cloneNode(true);\r\n\t\t\t\t\tpagesContainer.appendChild(printPageItem);\r\n\t\t\t\t}\r\n\t\t\t}\r\n\t\t} else {\r\n\t\t\tthis._setupPrintPagesWidth(gridContainer, printSize, pageOrientation);\r\n\t\t\tthis.__overlay__.appendChild(gridContainer);\r\n\t\t}\r\n\r\n\t\tvar overlayMapDom = document.createElement(\"div\");\r\n\t\toverlayMapDom.id = this._map.getContainer().id + \"-print\";\r\n\t\toverlayMapDom.className = \"grid-map-print\";\r\n\t\toverlayMapDom.style.width = \"100%\";\r\n\t\toverlayMapDom.style.height = \"100%\";\r\n\t\tgridContainer.appendChild(overlayMapDom);\r\n\r\n\t\tdocument.body.className += \" leaflet--printing\";\r\n\r\n\t\tvar newMapOptions = L.Control.BrowserPrint.Utils.cloneBasicOptionsWithoutLayers(this._map.options);\r\n\t\tnewMapOptions.maxZoom = this._map.getMaxZoom();\r\n\t\treturn this._setupPrintMap(overlayMapDom.id, newMapOptions, origins.printLayer, origins.printObjects, origins.panes);\r\n\t},\r\n\r\n\t_setupPrintMap: function (id, options, printLayer, printObjects, panes) {\r\n\t\toptions.zoomControl = false;\r\n\t\tvar overlayMap = L.map(id, options);\r\n\r\n\t\tif (printLayer) {\r\n\t\t\tprintLayer.addTo(overlayMap);\r\n\t\t}\r\n\r\n\t\tpanes.forEach(function(p) { overlayMap.createPane(p.name, p.container); });\r\n\r\n\t\tfor (var type in printObjects){\r\n\t\t\tvar closePopupsOnPrint = this.options.closePopupsOnPrint;\r\n\t\t\tprintObjects[type] = printObjects[type].map(function(pLayer){\r\n\t\t\t\tvar clone = L.Control.BrowserPrint.Utils.cloneLayer(pLayer);\r\n\r\n\t\t\t\tif (clone) {\r\n\t\t\t\t\t/* Workaround for apropriate handling of popups. */\r\n\t\t\t\t\tif (pLayer instanceof L.Popup){\r\n\t\t\t\t\t\tif(!pLayer.isOpen) {\r\n\t\t\t\t\t\t\tpLayer.isOpen = function () { return this._isOpen; };\r\n\t\t\t\t\t\t}\r\n\t\t\t\t\t\tif (pLayer.isOpen() && !closePopupsOnPrint) {\r\n\t\t\t\t\t\t\tclone.openOn(overlayMap);\r\n\t\t\t\t\t\t}\r\n\t\t\t\t\t} else {\r\n\t\t\t\t\t\tclone.addTo(overlayMap);\r\n\t\t\t\t\t}\r\n\r\n\t\t\t\t\tif (pLayer instanceof L.Layer) {\r\n\t\t\t\t\t\tvar tooltip = pLayer.getTooltip();\r\n\t\t\t\t\t\tif (tooltip) {\r\n\t\t\t\t\t\t\tclone.bindTooltip(tooltip.getContent(), tooltip.options);\r\n\t\t\t\t\t\t\tif (pLayer.isTooltipOpen()) {\r\n\t\t\t\t\t\t\t\tclone.openTooltip(tooltip.getLatLng());\r\n\t\t\t\t\t\t\t}\r\n\t\t\t\t\t\t}\r\n\t\t\t\t\t}\r\n\r\n\t\t\t\t\treturn clone;\r\n\t\t\t\t}\r\n\t\t\t});\r\n\t\t}\r\n\r\n\t\treturn {map: overlayMap, objects: printObjects};\r\n\t},\r\n\r\n\t// Get all layers that is tile layers and is still loading;\r\n\t_isTilesLoading: function(overlayMap){\r\n\t\tvar isLoading = false;\r\n\t\tvar mapMajorVersion = parseFloat(L.version);\r\n\t\tif (mapMajorVersion > 1) {\r\n\t\t\tisLoading = this._getLoadingLayers(overlayMap);\r\n\t\t} else {\r\n\t\t\tisLoading = overlayMap._tilesToLoad || overlayMap._tileLayersToLoad;\r\n\t\t}\r\n\r\n\t\treturn isLoading;\r\n\t},\r\n\r\n\t_getLoadingLayers: function(map) {\r\n\t\tfor (var l in map._layers) {\r\n\t\t\tvar layer = map._layers[l];\r\n\t\t\tif ((layer._url || layer._mutant) && layer._loading) {\r\n\t\t\t\treturn true;\r\n\t\t\t}\r\n\t\t}\r\n\r\n\t\treturn false;\r\n\t}\r\n});\r\n\r\nL.Control.BrowserPrint.Event =  {\r\n\tPrePrint: 'browser-pre-print',\r\n\tPrintStart: 'browser-print-start',\r\n\tPrint: 'browser-print',\r\n\tPrintEnd: 'browser-print-end'\r\n},\r\n\r\nL.control.browserPrint = function(options) {\r\n\tif (!options || !options.printModes) {\r\n\t\toptions = options || {};\r\n\t\toptions.printModes = [\r\n\t\t\tL.control.browserPrint.mode.portrait(),\r\n\t\t\tL.control.browserPrint.mode.landscape(),\r\n\t\t\tL.control.browserPrint.mode.auto(),\r\n\t\t\tL.control.browserPrint.mode.custom()\r\n\t\t]\r\n\t}\r\n\r\n\tif (options && options.printModes && (!options.printModes.filter || !options.printModes.length)) {\r\n\t\tthrow \"Please specify valid print modes for Print action. Example: printModes: [L.control.browserPrint.mode.portrait(), L.control.browserPrint.mode.auto('Automatico'), 'Custom']\";\r\n\t}\r\n\r\n\tif (options.printModesNames) {\r\n\t\tconsole.warn(\"'printModesNames' option is obsolete. Please use 'L.control.browserPrint.mode.*(/*Title*/)' shortcut instead. Please check latest release and documentation.\");\r\n\t}\r\n\r\n\treturn new L.Control.BrowserPrint(options);\r\n};\r\n\n\n//# sourceURL=webpack:///./src/leaflet.browser.print.js?");

/***/ }),

/***/ "./src/leaflet.browser.print.sizes.js":
/*!********************************************!*\
  !*** ./src/leaflet.browser.print.sizes.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/**\r\n\tMIT License http://www.opensource.org/licenses/mit-license.php\r\n\tAuthor Igor Vladyka <igor.vladyka@gmail.com> (https://github.com/Igor-Vladyka/leaflet.browser.print)\r\n**/\r\n\r\n/* Portrait mode sizes in mm for 0 lvl*/\r\nL.Control.BrowserPrint.Size =  {\r\n\tA: {\r\n\t\tWidth: 840,\r\n\t\tHeight: 1188\r\n\t},\r\n\tB: {\r\n\t\tWidth: 1000,\r\n\t\tHeight: 1414\r\n\t}\r\n};\r\n\r\nL.Control.BrowserPrint.Mode = function(mode, title, pageSize, action, invalidateBounds) {\r\n\tif (!mode) {\r\n\t\tthrow 'Print mode should be specified.';\r\n\t}\r\n\r\n\tthis.Mode = mode;\r\n\tthis.Title = title || mode;\r\n\tthis.PageSize = (pageSize || 'A4').toUpperCase();\r\n\tthis.PageSeries = this.PageSize[0];\r\n\tthis.PageSeriesSize = parseInt(this.PageSize.substring(1));\r\n\tthis.Action = action || function(context) { return context['_print' + mode]; };\r\n\tthis.InvalidateBounds = invalidateBounds;\r\n};\r\n\r\nL.Control.BrowserPrint.Mode.Landscape = \"Landscape\";\r\nL.Control.BrowserPrint.Mode.Portrait = \"Portrait\";\r\nL.Control.BrowserPrint.Mode.Auto = \"Auto\";\r\nL.Control.BrowserPrint.Mode.Custom = \"Custom\";\r\n\r\nL.Control.BrowserPrint.Mode.prototype.getPageMargin = function(){\r\n\tvar size = this.getPaperSize();\r\n\treturn Math.floor((size.Width + size.Height) / 40) + 'mm';\r\n};\r\n\r\nL.Control.BrowserPrint.Mode.prototype.getPaperSize = function(){\r\n\tvar series = L.Control.BrowserPrint.Size[this.PageSeries];\r\n\tvar w = series.Width;\r\n\tvar h = series.Height;\r\n\tvar switchSides = false;\r\n\tif (this.PageSeriesSize) {\r\n\t\tswitchSides = this.PageSeriesSize % 2 === 1;\r\n\t\tif (switchSides) {\r\n\t\t\tw = w / (this.PageSeriesSize - 1 || 1);\r\n\t\t\th = h / (this.PageSeriesSize + 1);\r\n\t\t} else {\r\n\t\t\tw = w / this.PageSeriesSize;\r\n\t\t\th = h / this.PageSeriesSize;\r\n\t\t}\r\n\t}\r\n\r\n\treturn {\r\n\t\tWidth: switchSides ? h : w,\r\n\t\tHeight: switchSides ? w : h\r\n\t};\r\n};\r\n\r\nL.Control.BrowserPrint.Mode.prototype.getSize = function(){\r\n\tvar size = this.getPaperSize();\r\n\tvar margin = parseInt(this.getPageMargin());\r\n\r\n\tvar calculateMargin = function(s) {\r\n\t\tif (margin) {\r\n\t\t\treturn s - (margin * 2);\r\n\t\t}\r\n\r\n\t\treturn s;\r\n\t}\r\n\r\n\tsize.Width = Math.floor(calculateMargin(size.Width)) + 'mm';\r\n\tsize.Height = Math.floor(calculateMargin(size.Height)) + 'mm';\r\n\r\n\treturn size;\r\n};\r\n\r\nL.control.browserPrint.mode = function(mode, title, type, action, invalidateBounds){\r\n\treturn new L.Control.BrowserPrint.Mode(mode, title, type, action, invalidateBounds);\r\n}\r\n\r\nL.control.browserPrint.mode.portrait = function(title, pageSize, action) {\r\n\treturn L.control.browserPrint.mode(L.Control.BrowserPrint.Mode.Portrait, title, pageSize, action, false);\r\n};\r\n\r\nL.control.browserPrint.mode.landscape = function(title, pageSize, action) {\r\n\treturn L.control.browserPrint.mode(L.Control.BrowserPrint.Mode.Landscape, title, pageSize, action, false);\r\n};\r\n\r\nL.control.browserPrint.mode.auto = function(title, pageSize, action) {\r\n\treturn L.control.browserPrint.mode(L.Control.BrowserPrint.Mode.Auto, title, pageSize, action, true);\r\n};\r\n\r\nL.control.browserPrint.mode.custom = function(title, pageSize, action) {\r\n\treturn L.control.browserPrint.mode(L.Control.BrowserPrint.Mode.Custom, title, pageSize, action, true);\r\n};\r\n\n\n//# sourceURL=webpack:///./src/leaflet.browser.print.sizes.js?");

/***/ }),

/***/ "./src/leaflet.browser.print.utils.js":
/*!********************************************!*\
  !*** ./src/leaflet.browser.print.utils.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/**\r\n\tMIT License http://www.opensource.org/licenses/mit-license.php\r\n\tAuthor Igor Vladyka <igor.vladyka@gmail.com> (https://github.com/Igor-Vladyka/leaflet.browser.print)\r\n**/\r\n\r\nL.Control.BrowserPrint.Utils = {\r\n\r\n\t_ignoreArray: [],\r\n\r\n\t_cloneFactoryArray: [],\r\n\t_cloneRendererArray: [],\r\n\t_knownRenderers: {},\r\n\r\n\tcloneOptions: function(options) {\r\n\t\tvar utils = this;\r\n\t    var retOptions = {};\r\n\t    for (var name in options) {\r\n\t        var item = options[name];\r\n\t\t\tif (item && item.clone) {\r\n\t\t\t\tretOptions[name] = item.clone();\r\n\t\t\t} else if (item && item.onAdd) {\r\n\t\t\t\tretOptions[name] = utils.cloneLayer(item);\r\n\t\t\t} else {\r\n\t\t\t\tretOptions[name] = item;\r\n\t\t\t}\r\n\t    }\r\n\t    return retOptions;\r\n\t},\r\n\r\n\tcloneBasicOptionsWithoutLayers: function(options) {\r\n\t    var retOptions = {};\r\n\t\tvar optionNames = Object.getOwnPropertyNames(options);\r\n\t\tif (optionNames.length) {\r\n\t\t\tfor (var i = 0; i < optionNames.length; i++) {\r\n\t\t\t\tvar optName = optionNames[i];\r\n\t\t\t\tif (optName && optName != \"layers\") {\r\n\t\t\t        retOptions[optName] = options[optName];\r\n\t\t\t\t}\r\n\t\t\t}\r\n\r\n\t\t    return this.cloneOptions(retOptions);\r\n\t\t}\r\n\r\n\t\treturn retOptions;\r\n\t},\r\n\r\n\tcloneInnerLayers: function (layer) {\r\n\t\tvar utils = this;\r\n\t\tvar layers = [];\r\n\r\n\t\tlayer.eachLayer(function (inner) {\r\n\t\t\tvar l = utils.cloneLayer(inner);\r\n\r\n\t\t\tif (l) {\r\n\t\t\t\tlayers.push(l);\r\n\t\t\t}\r\n\t\t});\r\n\r\n\t\treturn layers;\r\n\t},\r\n\r\n\tinitialize: function () {\r\n\r\n\t\tthis._knownRenderers = {};\r\n\r\n\t\t// Renderers\r\n\t\tthis.registerRenderer(L.SVG, 'L.SVG');\r\n\t\tthis.registerRenderer(L.Canvas, 'L.Canvas');\r\n\r\n\t\tthis.registerLayer(L.MarkerClusterGroup, 'L.MarkerClusterGroup', function (layer, utils) {\r\n\t\t\tvar cluster = L.markerClusterGroup(layer.options);\r\n\t\t\tcluster.addLayers(utils.cloneInnerLayers(layer));\r\n\t\t\treturn cluster;\r\n\t\t});\r\n\t\tthis.registerLayer(L.TileLayer.WMS, 'L.TileLayer.WMS', function(layer, utils) { \treturn L.tileLayer.wms(layer._url, utils.cloneOptions(layer.options)); });\r\n\t\tthis.registerLayer(L.TileLayer, 'L.TileLayer', function(layer, utils) { \t\t\treturn L.tileLayer(layer._url, utils.cloneOptions(layer.options)); });\r\n\t\tthis.registerLayer(L.GridLayer, 'L.GridLayer', function(layer, utils) { \t\t\treturn L.gridLayer(utils.cloneOptions(layer.options)); });\r\n\t\tthis.registerLayer(L.ImageOverlay, 'L.ImageOverlay', function(layer, utils) { \t\treturn L.imageOverlay(layer._url, layer._bounds, utils.cloneOptions(layer.options)); });\r\n\t\tthis.registerLayer(L.Marker, 'L.Marker', function(layer, utils) { \t\t\t\t\treturn L.marker(layer.getLatLng(), utils.cloneOptions(layer.options)); });\r\n\t\tthis.registerLayer(L.Popup, 'L.Popup', function(layer, utils) { \t\t\t\t\treturn L.popup(utils.cloneOptions(layer.options)).setLatLng(layer.getLatLng()).setContent(layer.getContent()); });\r\n\t\tthis.registerLayer(L.Circle, 'L.Circle', function(layer, utils) { \t\t\t\t\treturn L.circle(layer.getLatLng(), layer.getRadius(), utils.cloneOptions(layer.options)); });\r\n\t\tthis.registerLayer(L.CircleMarker, 'L.CircleMarker', function(layer, utils) { \t\treturn L.circleMarker(layer.getLatLng(), utils.cloneOptions(layer.options)); });\r\n\t\tthis.registerLayer(L.Rectangle, 'L.Rectangle', function(layer, utils) { \t\t\treturn L.rectangle(layer.getBounds(), utils.cloneOptions(layer.options)); });\r\n\t\tthis.registerLayer(L.Polygon, 'L.Polygon', function(layer, utils) { \t\t\t\treturn L.polygon(layer.getLatLngs(), utils.cloneOptions(layer.options)); });\r\n\r\n\t\t// MultiPolyline is removed in leaflet 1.0.0\r\n\t\tthis.registerLayer(L.MultiPolyline, 'L.MultiPolyline', function(layer, utils) { \treturn L.polyline(layer.getLatLngs(), utils.cloneOptions(layer.options)); });\r\n\t\t// MultiPolygon is removed in leaflet 1.0.0\r\n\t\tthis.registerLayer(L.MultiPolygon, 'L.MultiPolygon', function(layer, utils) { \t\treturn L.multiPolygon(layer.getLatLngs(), utils.cloneOptions(layer.options)); });\r\n\r\n\t\tthis.registerLayer(L.Polyline, 'L.Polyline', function(layer, utils) { \t\t\t\treturn L.polyline(layer.getLatLngs(), utils.cloneOptions(layer.options)); });\r\n\t\tthis.registerLayer(L.GeoJSON, 'L.GeoJSON', function(layer, utils) { \t\t\t\treturn L.geoJson(layer.toGeoJSON(), utils.cloneOptions(layer.options)); });\r\n\r\n\t\tthis.registerIgnoreLayer(L.FeatureGroup, 'L.FeatureGroup');\r\n\t\tthis.registerIgnoreLayer(L.LayerGroup, 'L.LayerGroup');\r\n\r\n\t\t// There is no point to clone tooltips here;  L.tooltip(options);\r\n\t\tthis.registerLayer(L.Tooltip, 'L.Tooltip', function(){\treturn null; });\r\n\t},\r\n\r\n\t_register: function(array, type, identifier, builderFunction) {\r\n\t\tif (type &&\r\n\t\t\t!array.filter(function(l){ return l.identifier === identifier; }).length) {\r\n\r\n\t\t\tarray.push({\r\n\t\t\t\ttype: type,\r\n\t\t\t\tidentifier: identifier,\r\n\t\t\t\tbuilder: builderFunction || function (layer) { return new type(layer.options); }\r\n\t\t\t});\r\n\t\t}\r\n\t},\r\n\r\n\tregisterLayer: function(type, identifier, builderFunction) {\r\n\t\tthis._register(this._cloneFactoryArray, type, identifier, builderFunction);\r\n\t},\r\n\r\n\tregisterRenderer: function(type, identifier, builderFunction) {\r\n\t\tthis._register(this._cloneRendererArray, type, identifier, builderFunction);\r\n\t},\r\n\r\n\tregisterIgnoreLayer: function(type, identifier) {\r\n\t\tthis._register(this._ignoreArray, type, identifier);\r\n\t},\r\n\r\n\tcloneLayer: function(layer) {\r\n\t\tif (!layer) return null;\r\n\r\n\t\t// First we check if this layer is actual renderer\r\n\t\tvar renderer = this.__getRenderer(layer);\r\n\t\tif (renderer) {\r\n\t\t\treturn renderer;\r\n\t\t}\r\n\r\n\t\t// We clone and recreate layer if it's simple overlay\r\n\t\tvar factoryObject = this.__getFactoryObject(layer);\r\n\t\tif (factoryObject) {\r\n\t\t\tfactoryObject = factoryObject.builder(layer, this);\r\n\t\t}\r\n\r\n\t\treturn factoryObject;\r\n\t},\r\n\r\n\tgetType: function(layer) {\r\n\t\tif (!layer) return null;\r\n\r\n\t\tvar factoryObject = this.__getFactoryObject(layer);\r\n\t\tif (factoryObject) {\r\n\t\t\tfactoryObject = factoryObject.identifier;\r\n\t\t}\r\n\r\n\t\treturn factoryObject;\r\n\t},\r\n\r\n\t__getRenderer: function(oldRenderer) {\r\n\t\tvar renderer = this._knownRenderers[oldRenderer._leaflet_id];\r\n\t\tif (!renderer) {\r\n\t\t\tfor (var i = 0; i < this._cloneRendererArray.length; i++) {\r\n\t\t\t\tvar factoryObject = this._cloneRendererArray[i];\r\n\t\t\t\tif (oldRenderer instanceof factoryObject.type) {\r\n\t\t\t\t\tthis._knownRenderers[oldRenderer._leaflet_id] = factoryObject.builder(oldRenderer.options);\r\n\t\t\t\t\tbreak;\r\n\t\t\t\t}\r\n\t\t\t}\r\n\r\n\t\t\trenderer = this._knownRenderers[oldRenderer._leaflet_id];\r\n\t\t}\r\n\r\n\t\treturn renderer;\r\n\t},\r\n\r\n\t__getFactoryObject: function (layer) {\r\n\t\tfor (var i = 0; i < this._ignoreArray.length; i++) {\r\n\t\t\tvar ignoreObject = this._ignoreArray[i];\r\n\t\t\tif (ignoreObject.type && layer instanceof ignoreObject.type) {\r\n\t\t\t\treturn null;\r\n\t\t\t}\r\n\t\t}\r\n\r\n\t\tfor (var i = 0; i < this._cloneFactoryArray.length; i++) {\r\n\t\t\tvar factoryObject = this._cloneFactoryArray[i];\r\n\t\t\tif (factoryObject.type && layer instanceof factoryObject.type) {\r\n\t\t\t\treturn factoryObject;\r\n\t\t\t}\r\n\t\t}\r\n\r\n\t\tfor (var i = 0; i < this._cloneRendererArray.length; i++) {\r\n\t\t\tvar factoryObject = this._cloneRendererArray[i];\r\n\t\t\tif (factoryObject.type && layer instanceof factoryObject.type) {\r\n\t\t\t\treturn null;\r\n\t\t\t}\r\n\t\t}\r\n\r\n\t\tthis.__unknownLayer__();\r\n\r\n\t\treturn null;\r\n\t},\r\n\r\n\t__unknownLayer__: function(){\r\n\t   console.warn('Unknown layer, cannot clone this layer. Leaflet-version: ' + L.version);\r\n\t   console.info('Please use \"L.Control.BrowserPrint.Utils.registerLayer(/*layerFunction*/, \"layerIdentifierString\", constructorFunction)\" to register new layers.');\r\n\t   console.info('WMS Layer registration Example: L.Control.BrowserPrint.Utils.registerLayer(L.TileLayer.WMS, \"L.TileLayer.WMS\", function(layer, utils) { return L.tileLayer.wms(layer._url, layer.options); });');\r\n\t   console.info('For additional information please refer to documentation on: https://github.com/Igor-Vladyka/leaflet.browser.print.');\r\n\t   console.info('-------------------------------------------------------------------------------------------------------------------');\r\n   }\r\n};\r\n\n\n//# sourceURL=webpack:///./src/leaflet.browser.print.utils.js?");

/***/ }),

/***/ 0:
/*!**********************************************************************************************************************!*\
  !*** multi ./src/leaflet.browser.print.js ./src/leaflet.browser.print.utils.js ./src/leaflet.browser.print.sizes.js ***!
  \**********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! ./src/leaflet.browser.print.js */\"./src/leaflet.browser.print.js\");\n__webpack_require__(/*! ./src/leaflet.browser.print.utils.js */\"./src/leaflet.browser.print.utils.js\");\nmodule.exports = __webpack_require__(/*! ./src/leaflet.browser.print.sizes.js */\"./src/leaflet.browser.print.sizes.js\");\n\n\n//# sourceURL=webpack:///multi_./src/leaflet.browser.print.js_./src/leaflet.browser.print.utils.js_./src/leaflet.browser.print.sizes.js?");

/***/ })

/******/ });

(function(window) {

    L.Icon.Pulse = L.DivIcon.extend({

        options: {
            className: '',
            iconSize: [12,12],
            fillColor: 'red',
            color: 'red',
            animate: true,
            heartbeat: 1,
        },

        initialize: function (options) {
            L.setOptions(this,options);

            // css
            
            var uniqueClassName = 'lpi-'+ new Date().getTime()+'-'+Math.round(Math.random()*100000);

            var before = ['background-color: '+this.options.fillColor];
            var after = [

                'box-shadow: 0 0 6px 2px '+this.options.color,

                'animation: pulsate ' + this.options.heartbeat + 's ease-out',
                'animation-iteration-count: infinite',
                'animation-delay: '+ (this.options.heartbeat + .1) + 's',
            ];

            if (!this.options.animate){
                after.push('animation: none');
                after.push('box-shadow:none');
            }

            var css = [
                '.'+uniqueClassName+'{'+before.join(';')+';}',
                '.'+uniqueClassName+':after{'+after.join(';')+';}',
            ].join('');
 
            var el = document.createElement('style');
            if (el.styleSheet){
                el.styleSheet.cssText = css;
            } else {
                el.appendChild(document.createTextNode(css));
            }

            document.getElementsByTagName('head')[0].appendChild(el);

            // apply css class

            this.options.className = this.options.className+' leaflet-pulsing-icon '+uniqueClassName;

            // initialize icon
            
            L.DivIcon.prototype.initialize.call(this, options);
        
        }
    });

    L.icon.pulse = function (options) {
        return new L.Icon.Pulse(options);
    };


    L.Marker.Pulse = L.Marker.extend({
        initialize: function (latlng,options) {
            options.icon = L.icon.pulse(options);
            L.Marker.prototype.initialize.call(this, latlng, options);
        }
    });

    L.marker.pulse = function (latlng,options) {
        return new L.Marker.Pulse(latlng,options);
    };

})(window);

(function(){

	// This is for grouping buttons into a bar
	// takes an array of `L.easyButton`s and
	// then the usual `.addTo(map)`
	L.Control.EasyBar = L.Control.extend({

	  options: {
	    position:       'topright',  // part of leaflet's defaults
	    id:             null,       // an id to tag the Bar with
	    leafletClasses: true        // use leaflet classes?
	  },


	  initialize: function(buttons, options){

	    if(options){
	      L.Util.setOptions( this, options );
	    }

	    this._buildContainer();
	    this._buttons = [];

	    for(var i = 0; i < buttons.length; i++){
	      buttons[i]._bar = this;
	      buttons[i]._container = buttons[i].button;
	      this._buttons.push(buttons[i]);
	      this.container.appendChild(buttons[i].button);
	    }

	  },


	  _buildContainer: function(){
	    this._container = this.container = L.DomUtil.create('div', '');
	    this.options.leafletClasses && L.DomUtil.addClass(this.container, 'leaflet-bar easy-button-container leaflet-control');
	    this.options.id && (this.container.id = this.options.id);
	  },


	  enable: function(){
	    L.DomUtil.addClass(this.container, 'enabled');
	    L.DomUtil.removeClass(this.container, 'disabled');
	    this.container.setAttribute('aria-hidden', 'false');
	    return this;
	  },


	  disable: function(){
	    L.DomUtil.addClass(this.container, 'disabled');
	    L.DomUtil.removeClass(this.container, 'enabled');
	    this.container.setAttribute('aria-hidden', 'true');
	    return this;
	  },


	  onAdd: function () {
	    return this.container;
	  },

	  addTo: function (map) {
	    this._map = map;

	    for(var i = 0; i < this._buttons.length; i++){
	      this._buttons[i]._map = map;
	    }

	    var container = this._container = this.onAdd(map),
	        pos = this.getPosition(),
	        corner = map._controlCorners[pos];

	    L.DomUtil.addClass(container, 'leaflet-control');

	    if (pos.indexOf('bottom') !== -1) {
	      corner.insertBefore(container, corner.firstChild);
	    } else {
	      corner.appendChild(container);
	    }

	    return this;
	  }

	});

	L.easyBar = function(){
	  var args = [L.Control.EasyBar];
	  for(var i = 0; i < arguments.length; i++){
	    args.push( arguments[i] );
	  }
	  return new (Function.prototype.bind.apply(L.Control.EasyBar, args));
	};

	// L.EasyButton is the actual buttons
	// can be called without being grouped into a bar
	L.Control.EasyButton = L.Control.extend({

	  options: {
	    position:  'topright',       // part of leaflet's defaults

	    id:        null,            // an id to tag the button with

	    type:      'replace',       // [(replace|animate)]
	                                // replace swaps out elements
	                                // animate changes classes with all elements inserted

	    states:    [],              // state names look like this
	                                // {
	                                //   stateName: 'untracked',
	                                //   onClick: function(){ handle_nav_manually(); };
	                                //   title: 'click to make inactive',
	                                //   icon: 'fa-circle',    // wrapped with <a>
	                                // }

	    leafletClasses:   true,     // use leaflet styles for the button
	    tagName:          'button',
	  },



	  initialize: function(icon, onClick, title, id){

	    // clear the states manually
	    this.options.states = [];

	    // add id to options
	    if(id != null){
	      this.options.id = id;
	    }

	    // storage between state functions
	    this.storage = {};

	    // is the last item an object?
	    if( typeof arguments[arguments.length-1] === 'object' ){

	      // if so, it should be the options
	      L.Util.setOptions( this, arguments[arguments.length-1] );
	    }

	    // if there aren't any states in options
	    // use the early params
	    if( this.options.states.length === 0 &&
	        typeof icon  === 'string' &&
	        typeof onClick === 'function'){

	      // turn the options object into a state
	      this.options.states.push({
	        icon: icon,
	        onClick: onClick,
	        title: typeof title === 'string' ? title : ''
	      });
	    }

	    // curate and move user's states into
	    // the _states for internal use
	    this._states = [];

	    for(var i = 0; i < this.options.states.length; i++){
	      this._states.push( new State(this.options.states[i], this) );
	    }

	    this._buildButton();

	    this._activateState(this._states[0]);

	  },

	  _buildButton: function(){

	    this.button = L.DomUtil.create(this.options.tagName, '');

	    if (this.options.tagName === 'button') {
	        this.button.setAttribute('type', 'button');
	    }

	    if (this.options.id ){
	      this.button.id = this.options.id;
	    }

	    if (this.options.leafletClasses){
	      L.DomUtil.addClass(this.button, 'easy-button-button leaflet-bar-part leaflet-interactive');
	    }

	    // don't let double clicks and mousedown get to the map
	    L.DomEvent.addListener(this.button, 'dblclick', L.DomEvent.stop);
	    L.DomEvent.addListener(this.button, 'mousedown', L.DomEvent.stop);
	    L.DomEvent.addListener(this.button, 'mouseup', L.DomEvent.stop);

	    // take care of normal clicks
	    L.DomEvent.addListener(this.button,'click', function(e){
	      L.DomEvent.stop(e);
	      this._currentState.onClick(this, this._map ? this._map : null );
	      this._map && this._map.getContainer().focus();
	    }, this);

	    // prep the contents of the control
	    if(this.options.type == 'replace'){
	      this.button.appendChild(this._currentState.icon);
	    } else {
	      for(var i=0;i<this._states.length;i++){
	        this.button.appendChild(this._states[i].icon);
	      }
	    }
	  },


	  _currentState: {
	    // placeholder content
	    stateName: 'unnamed',
	    icon: (function(){ return document.createElement('span'); })()
	  },



	  _states: null, // populated on init



	  state: function(newState){

	    // when called with no args, it's a getter
	    if (arguments.length === 0) {
	      return this._currentState.stateName;
	    }

	    // activate by name
	    if(typeof newState == 'string'){

	      this._activateStateNamed(newState);

	    // activate by index
	    } else if (typeof newState == 'number'){

	      this._activateState(this._states[newState]);
	    }

	    return this;
	  },


	  _activateStateNamed: function(stateName){
	    for(var i = 0; i < this._states.length; i++){
	      if( this._states[i].stateName == stateName ){
	        this._activateState( this._states[i] );
	      }
	    }
	  },

	  _activateState: function(newState){

	    if( newState === this._currentState ){

	      // don't touch the dom if it'll just be the same after
	      return;

	    } else {

	      // swap out elements... if you're into that kind of thing
	      if( this.options.type == 'replace' ){
	        this.button.appendChild(newState.icon);
	        this.button.removeChild(this._currentState.icon);
	      }

	      if( newState.title ){
	        this.button.title = newState.title;
	      } else {
	        this.button.removeAttribute('title');
	      }

	      // update classes for animations
	      for(var i=0;i<this._states.length;i++){
	        L.DomUtil.removeClass(this._states[i].icon, this._currentState.stateName + '-active');
	        L.DomUtil.addClass(this._states[i].icon, newState.stateName + '-active');
	      }

	      // update classes for animations
	      L.DomUtil.removeClass(this.button, this._currentState.stateName + '-active');
	      L.DomUtil.addClass(this.button, newState.stateName + '-active');

	      // update the record
	      this._currentState = newState;

	    }
	  },

	  enable: function(){
	    L.DomUtil.addClass(this.button, 'enabled');
	    L.DomUtil.removeClass(this.button, 'disabled');
	    this.button.setAttribute('aria-hidden', 'false');
	    return this;
	  },

	  disable: function(){
	    L.DomUtil.addClass(this.button, 'disabled');
	    L.DomUtil.removeClass(this.button, 'enabled');
	    this.button.setAttribute('aria-hidden', 'true');
	    return this;
	  },

	  onAdd: function(map){
	    var bar = L.easyBar([this], {
	      position: this.options.position,
	      leafletClasses: this.options.leafletClasses
	    });
	    this._anonymousBar = bar;
	    this._container = bar.container;
	    return this._anonymousBar.container;
	  },

	  removeFrom: function (map) {
	    if (this._map === map)
	      this.remove();
	    return this;
	  },

	});

	L.easyButton = function(/* args will pass automatically */){
	  var args = Array.prototype.concat.apply([L.Control.EasyButton],arguments);
	  return new (Function.prototype.bind.apply(L.Control.EasyButton, args));
	};

	/*************************
	 *
	 * util functions
	 *
	 *************************/

	// constructor for states so only curated
	// states end up getting called
	function State(template, easyButton){

	  this.title = template.title;
	  this.stateName = template.stateName ? template.stateName : 'unnamed-state';

	  // build the wrapper
	  this.icon = L.DomUtil.create('span', '');

	  L.DomUtil.addClass(this.icon, 'button-state state-' + this.stateName.replace(/(^\s*|\s*$)/g,''));
	  this.icon.innerHTML = buildIcon(template.icon);
	  this.onClick = L.Util.bind(template.onClick?template.onClick:function(){}, easyButton);
	}

	function buildIcon(ambiguousIconString) {

	  var tmpIcon;

	  // does this look like html? (i.e. not a class)
	  if( ambiguousIconString.match(/[&;=<>"']/) ){

	    // if so, the user should have put in html
	    // so move forward as such
	    tmpIcon = ambiguousIconString;

	  // then it wasn't html, so
	  // it's a class list, figure out what kind
	  } else {
	      ambiguousIconString = ambiguousIconString.replace(/(^\s*|\s*$)/g,'');
	      tmpIcon = L.DomUtil.create('span', '');

	      if( ambiguousIconString.indexOf('fa-') === 0 ){
	        L.DomUtil.addClass(tmpIcon, 'fa '  + ambiguousIconString)
	      } else if ( ambiguousIconString.indexOf('glyphicon-') === 0 ) {
	        L.DomUtil.addClass(tmpIcon, 'glyphicon ' + ambiguousIconString)
	      } else {
	        L.DomUtil.addClass(tmpIcon, /*rollwithit*/ ambiguousIconString)
	      }
	      // make this a string so that it's easy to set innerHTML below
	      tmpIcon = tmpIcon.outerHTML;
	  }
	  return tmpIcon;
	}
})();

//L.control.window
L.Control.Window = L.Control.extend({

    includes: L.Evented.prototype || L.Mixin.Events,

    options: {
        element: 'map',
        className: 'control-window',
        visible: false,
        title: undefined,
        closeButton: true,
        content: undefined,
        prompt: undefined,
        maxWidth: 600,
        modal: false,
        position: 'center',
        width : 0,
        height : 0
    },
    initialize: function (container, options) {
        var self = this;

        if (container.hasOwnProperty('options')) { container = container.getContainer(); }

        options.element = container;
        L.setOptions(this, options);

        var modality = 'nonmodal';

        if (this.options.modal){
            modality = 'modal';
        }

        // Create popup window container
        this._wrapper = L.DomUtil.create('div',modality+' leaflet-control-window-wrapper', L.DomUtil.get(this.options.element));

        this._container = L.DomUtil.create('div', 'leaflet-control leaflet-control-window '+this.options.className,this._wrapper);
        var styleStr = 'max-width:'+this.options.maxWidth + 'px;';
        if(this.options.width) styleStr += 'width:' + this.options.width + 'px;';
        if(this.options.height) styleStr += 'height:' + this.options.height + 'px';
        
        this._container.setAttribute('style',styleStr);
//        if(this.options.width) this._container.setAttribute('style','width:'+this.options.width+'px');
//        if(this.options.height) this._container.setAttribute('style','height:'+this.options.height+'px');

        this._containerTitleBar = L.DomUtil.create('div', 'titlebar',this._container);
        this.titleContent = L.DomUtil.create('h2', 'title',this._containerTitleBar);
        this._containerContent =  L.DomUtil.create('div', 'content' ,this._container);
        this._containerPromptButtons =  L.DomUtil.create('div', 'promptButtons' ,this._container);

        if (this.options.closeButton) {
            this._closeButton = L.DomUtil.create('div', 'close',this._containerTitleBar);
            this._closeButton.title = "关闭";
            //this._closeButton.innerHTML = '&times;';
        }

        // Make sure we don't drag the map when we interact with the content
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent
            .on(this._wrapper, 'contextmenu', stop)
            .on(this._wrapper, 'click', stop)
            .on(this._wrapper, 'mousedown', stop)
            .on(this._wrapper, 'touchstart', stop)
            .on(this._wrapper, 'dblclick', stop)
            .on(this._wrapper, 'mousewheel', stop)
            .on(this._wrapper, 'MozMousePixelScroll', stop);

        // Attach event to close button
        if (this.options.closeButton) {
            var close = this._closeButton;
            //L.DomEvent.on(close, 'click', this.hide, this);
            L.DomEvent.on(close, 'click', this.remove, this);
        }
        if (this.options.title){
            this.title(this.options.title);
        }
        if (this.options.content) {
            this.content(this.options.content);
        }
        if (typeof(this.options.prompt)=='object') {
            this.prompt(this.options.prompt);
        }
        if (this.options.visible){
            this.show();
        }

        //map.on('resize',function(){self.mapResized()});
    },
    disableBtn: function(){
			this._btnOK.disabled=true;
			this._btnOK.className='disabled';
	},
	enableBtn: function(){
			this._btnOK.disabled=false;
			this._btnOK.className='';
	},
    title: function(titleContent){
        if (titleContent==undefined){
            return this.options.title;
        }

        this.options.title = titleContent;
        var title = titleContent || '';
        this.titleContent.innerHTML = title;
        return this;
    },
    remove: function () {
        L.DomUtil.get(this.options.element).removeChild(this._wrapper);

        // Unregister events to prevent memory leak
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent
            .off(this._wrapper, 'contextmenu', stop)
            .off(this._wrapper, 'click', stop)
            .off(this._wrapper, 'mousedown', stop)
            .off(this._wrapper, 'touchstart', stop)
            .off(this._wrapper, 'dblclick', stop)
            .off(this._wrapper, 'mousewheel', stop)
            .off(this._wrapper, 'MozMousePixelScroll', stop);

       // map.off('resize',self.mapResized);

        if (this._closeButton && this._close) {
            var close = this._closeButton;
            L.DomEvent.off(close, 'click', this.close, this);
        }
    	if(windowControl) windowControl = null;
        return this;
    },
    mapResized : function(){
      // this.show()
    },
    show: function (position) {

        if (position){
            this.options.position = position
        }

        L.DomUtil.addClass(this._wrapper, 'visible');


        this.setContentMaxHeight();
        var thisWidth = this._container.offsetWidth;
        var thisHeight = this._container.offsetHeight;
        var margin = 8;

        var el =  L.DomUtil.get(this.options.element);
        var rect = el.getBoundingClientRect();
        var width = rect.right -rect.left ||  Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var height = rect.bottom -rect.top ||  Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        var top = rect.top;
        var left = rect.left;
        var offset =0;

        // SET POSITION OF WINDOW
        if (this.options.position == 'topLeft'){
            this.showOn([left,top+offset])
            } else if (this.options.position == 'left') {
            this.showOn([left, top+height/2-thisHeight/2-margin+offset])
        } else if (this.options.position == 'bottomLeft') {
            this.showOn([left, top+height-thisHeight-margin*2-offset])
        } else if (this.options.position == 'top') {
            this.showOn([left+width/2-thisWidth/2-margin,top+offset])
        } else if (this.options.position == 'topRight') {
            this.showOn([left+width-thisWidth-margin*2,top+ offset])
        } else if (this.options.position == 'right') {
            this.showOn([left+width-thisWidth-margin*2, top+height/2-thisHeight/2-margin+offset])
        } else if (this.options.position == 'bottomRight') {
            this.showOn([left+width-thisWidth-margin*2,top+ height-thisHeight-margin*2-offset])
        } else if (this.options.position == 'bottom') {
            this.showOn([left+width/2-thisWidth/2-margin,top+ height-thisHeight-margin*2-offset])
        } else {
            this.showOn([left+width/2-thisWidth/2-margin, top+top+height/2-thisHeight/2-margin+offset])
        }

        return this;
    },
    showOn: function(point){

        this.setContentMaxHeight();
        L.DomUtil.setPosition(this._container, L.point(Math.round(point[0]),Math.round(point[1]),true));

        var draggable = new L.Draggable(this._container,this._containerTitleBar);
        draggable.enable();

        L.DomUtil.addClass(this._wrapper, 'visible');
        this.fire('show');
        return this;
    },
    hide: function (e) {

        L.DomUtil.removeClass(this._wrapper, 'visible');
        this.fire('hide');
        return this;
    },

    getContainer: function () {
        return this._containerContent;
    },
    content: function (content) {
        if (content==undefined){
            return this.options.content
        }
        this.options.content = content;
        this.getContainer().innerHTML = content;
        return this;
    },
    prompt : function(promptObject){

        if (promptObject==undefined){
            return this.options.prompt
        }

        this.options.prompt = promptObject;

        this.setPromptCallback(promptObject.callback);
        
        this.setActionCallback(promptObject.action);

        var cancel = this.options.prompt.buttonCancel || undefined;

        var ok = this.options.prompt.buttonOK || 'OK';

        var action = this.options.prompt.buttonAction || undefined;

        if (action != undefined) {
            var btnAction = L.DomUtil.create('button','',this._containerPromptButtons);
            L.DomEvent.on(btnAction, 'click',this.action, this);
            btnAction.innerHTML=action;
        }

        var btnOK= L.DomUtil.create('button','',this._containerPromptButtons);
        L.DomEvent.on(btnOK, 'click',this.promptCallback, this);
        btnOK.innerHTML=ok;
        
        this._btnOK=btnOK;
        
        if (cancel != undefined) {
	        var btnCancel= L.DomUtil.create('button','',this._containerPromptButtons);
	        L.DomEvent.on(btnCancel, 'click', this.close, this);
	        btnCancel.innerHTML=cancel
        }

        return this;
    },
    container : function(containerContent){
        if (containerContent==undefined){
            return this._container.innerHTML
        }

        this._container.innerHTML = containerContent;

        if (this.options.closeButton) {
            this._closeButton = L.DomUtil.create('a', 'close',this._container);
            this._closeButton.src = "../images/close.jpg"
            //this._closeButton.innerHTML = '&times;';
            L.DomEvent.on(this._closeButton, 'click', this.close, this);
        }
        return this;

    },
    setPromptCallback : function(callback){
        var self = this;
        if (typeof(callback)!= 'function') { callback = function() {console.warn('No callback function specified!');}}
        var cb = function() { self.close();callback();};
        this.promptCallback = cb;
        return this;
    },
    setActionCallback : function(callback){
        var self = this;
        if (typeof(callback)!= 'function') { callback = function() {console.warn('No callback function specified!');}}
        var cb = function() { self.hide();callback();};
        this.action = cb;
        return this;
    },

    setContentMaxHeight : function(){
        var margin = 68;

        if (this.options.title){
            margin += this._containerTitleBar.offsetHeight-36;
        }
        if (typeof(this.options.prompt) == 'object'){
            margin += this._containerPromptButtons.offsetHeight-20
        }

        var el =  L.DomUtil.get(this.options.element)
        var rect = el.getBoundingClientRect();
        var height = rect.bottom -rect.top;

        var maxHeight = height - margin;
        this._containerContent.setAttribute('style','max-height:'+maxHeight+'px')
    },
    close : function(){
        this.hide();
        this.remove();
        this.fire('close');
    	if(windowControl) windowControl = null;
        return undefined;
    }
});

L.control.window = function (container,options) {
    return new L.Control.Window(container,options);
};
/**
 * @class L.Draw.Toolbar
 * @aka Toolbar
 *
 * The toolbar class of the API — it is used to create the ui
 * This will be depreciated
 *
 * @example
 *
 * ```js
 *    var toolbar = L.Toolbar();
 *    toolbar.addToolbar(map);
 * ```
 *
 * ### Disabling a toolbar
 *
 * If you do not want a particular toolbar in your app you can turn it off by setting the toolbar to false.
 *
 * ```js
 *      var drawControl = new L.Control.Draw({
 *          draw: false,
 *          edit: {
 *              featureGroup: editableLayers
 *          }
 *      });
 * ```
 *
 * ### Disabling a toolbar item
 *
 * If you want to turn off a particular toolbar item, set it to false. The following disables drawing polygons and
 * markers. It also turns off the ability to edit layers.
 *
 * ```js
 *      var drawControl = new L.Control.Draw({
 *          draw: {
 *              polygon: false,
 *              marker: false
 *          },
 *          edit: {
 *              featureGroup: editableLayers,
 *              edit: false
 *          }
 *      });
 * ```
 */
L.Toolbar = L.Class.extend({
	// @section Methods for modifying the toolbar

	// @method initialize(options): void
	// Toolbar constructor
	initialize: function (options) {
		L.setOptions(this, options);

		this._modes = {};
		this._actionButtons = [];
		this._activeMode = null;

		var version = L.version.split('.');
		//If Version is >= 1.2.0
		if (parseInt(version[0], 10) === 1 && parseInt(version[1], 10) >= 2) {
			L.Toolbar.include(L.Evented.prototype);
		} else {
			L.Toolbar.include(L.Mixin.Events);
		}
	},

	// @method enabled(): boolean
	// Gets a true/false of whether the toolbar is enabled
	enabled: function () {
		return this._activeMode !== null;
	},

	// @method disable(): void
	// Disables the toolbar
	disable: function () {
		if (!this.enabled()) {
			return;
		}

		this._activeMode.handler.disable();
	},

	// @method addToolbar(map): L.DomUtil
	// Adds the toolbar to the map and returns the toolbar dom element
	addToolbar: function (map) {
		var container = L.DomUtil.create('div', 'leaflet-draw-section'),
			buttonIndex = 0,
			buttonClassPrefix = this._toolbarClass || '',
			modeHandlers = this.getModeHandlers(map),
			i;

		this._toolbarContainer = L.DomUtil.create('div', 'leaflet-draw-toolbar leaflet-bar');
		this._map = map;

		for (i = 0; i < modeHandlers.length; i++) {
			if (modeHandlers[i].enabled) {
				this._initModeHandler(
					modeHandlers[i].handler,
					this._toolbarContainer,
					buttonIndex++,
					buttonClassPrefix,
					modeHandlers[i].title
				);
			}
		}

		// if no buttons were added, do not add the toolbar
		if (!buttonIndex) {
			return;
		}

		// Save button index of the last button, -1 as we would have ++ after the last button
		this._lastButtonIndex = --buttonIndex;

		// Create empty actions part of the toolbar
		this._actionsContainer = L.DomUtil.create('ul', 'leaflet-draw-actions');

		// Add draw and cancel containers to the control container
		container.appendChild(this._toolbarContainer);
		container.appendChild(this._actionsContainer);

		return container;
	},

	// @method removeToolbar(): void
	// Removes the toolbar and drops the handler event listeners
	removeToolbar: function () {
		// Dispose each handler
		for (var handlerId in this._modes) {
			if (this._modes.hasOwnProperty(handlerId)) {
				// Unbind handler button
				this._disposeButton(
					this._modes[handlerId].button,
					this._modes[handlerId].handler.enable,
					this._modes[handlerId].handler
				);

				// Make sure is disabled
				this._modes[handlerId].handler.disable();

				// Unbind handler
				this._modes[handlerId].handler
					.off('enabled', this._handlerActivated, this)
					.off('disabled', this._handlerDeactivated, this);
			}
		}
		this._modes = {};

		// Dispose the actions toolbar
		for (var i = 0, l = this._actionButtons.length; i < l; i++) {
			this._disposeButton(
				this._actionButtons[i].button,
				this._actionButtons[i].callback,
				this
			);
		}
		this._actionButtons = [];
		this._actionsContainer = null;
	},

	_initModeHandler: function (handler, container, buttonIndex, classNamePredix, buttonTitle) {
		var type = handler.type;

		this._modes[type] = {};

		this._modes[type].handler = handler;

		this._modes[type].button = this._createButton({
			type: type,
			title: buttonTitle,
			className: classNamePredix + '-' + type,
			container: container,
			callback: this._modes[type].handler.enable,
			context: this._modes[type].handler
		});

		this._modes[type].buttonIndex = buttonIndex;

		this._modes[type].handler
			.on('enabled', this._handlerActivated, this)
			.on('disabled', this._handlerDeactivated, this);
	},

	/* Detect iOS based on browser User Agent, based on:
	 * http://stackoverflow.com/a/9039885 */
	_detectIOS: function () {
		var iOS = (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
		return iOS;
	},

	_createButton: function (options) {

		var link = L.DomUtil.create('a', options.className || '', options.container);
		// Screen reader tag
		var sr = L.DomUtil.create('span', 'sr-only', options.container);

		link.href = '#';
		link.appendChild(sr);

		if (options.title) {
			link.title = options.title;
			sr.innerHTML = options.title;
		}

		if (options.text) {
			link.innerHTML = options.text;
			sr.innerHTML = options.text;
		}

		/* iOS does not use click events */
		var buttonEvent = this._detectIOS() ? 'touchstart' : 'click';

		L.DomEvent
			.on(link, 'click', L.DomEvent.stopPropagation)
			.on(link, 'mousedown', L.DomEvent.stopPropagation)
			.on(link, 'dblclick', L.DomEvent.stopPropagation)
			.on(link, 'touchstart', L.DomEvent.stopPropagation)
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, buttonEvent, options.callback, options.context);

		return link;
	},

	_disposeButton: function (button, callback) {
		/* iOS does not use click events */
		var buttonEvent = this._detectIOS() ? 'touchstart' : 'click';

		L.DomEvent
			.off(button, 'click', L.DomEvent.stopPropagation)
			.off(button, 'mousedown', L.DomEvent.stopPropagation)
			.off(button, 'dblclick', L.DomEvent.stopPropagation)
			.off(button, 'touchstart', L.DomEvent.stopPropagation)
			.off(button, 'click', L.DomEvent.preventDefault)
			.off(button, buttonEvent, callback);
	},

	_handlerActivated: function (e) {
		// Disable active mode (if present)
		this.disable();

		// Cache new active feature
		this._activeMode = this._modes[e.handler];

		L.DomUtil.addClass(this._activeMode.button, 'leaflet-draw-toolbar-button-enabled');

		this._showActionsToolbar();

		this.fire('enable');
	},

	_handlerDeactivated: function () {
		this._hideActionsToolbar();

		L.DomUtil.removeClass(this._activeMode.button, 'leaflet-draw-toolbar-button-enabled');

		this._activeMode = null;

		this.fire('disable');
	},

	_createActions: function (handler) {
		var container = this._actionsContainer,
			buttons = this.getActions(handler),
			l = buttons.length,
			li, di, dl, button;

		// Dispose the actions toolbar (todo: dispose only not used buttons)
		for (di = 0, dl = this._actionButtons.length; di < dl; di++) {
			this._disposeButton(this._actionButtons[di].button, this._actionButtons[di].callback);
		}
		this._actionButtons = [];

		// Remove all old buttons
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		for (var i = 0; i < l; i++) {
			if ('enabled' in buttons[i] && !buttons[i].enabled) {
				continue;
			}

			li = L.DomUtil.create('li', '', container);

			button = this._createButton({
				title: buttons[i].title,
				text: buttons[i].text,
				container: li,
				callback: buttons[i].callback,
				context: buttons[i].context
			});

			this._actionButtons.push({
				button: button,
				callback: buttons[i].callback
			});
		}
	},

	_showActionsToolbar: function () {
		var buttonIndex = this._activeMode.buttonIndex,
			lastButtonIndex = this._lastButtonIndex,
			toolbarPosition = this._activeMode.button.offsetTop - 1;

		// Recreate action buttons on every click
		this._createActions(this._activeMode.handler);

		// Correctly position the cancel button
		this._actionsContainer.style.top = toolbarPosition + 'px';

		if (buttonIndex === 0) {
			L.DomUtil.addClass(this._toolbarContainer, 'leaflet-draw-toolbar-notop');
			L.DomUtil.addClass(this._actionsContainer, 'leaflet-draw-actions-top');
		}

		if (buttonIndex === lastButtonIndex) {
			L.DomUtil.addClass(this._toolbarContainer, 'leaflet-draw-toolbar-nobottom');
			L.DomUtil.addClass(this._actionsContainer, 'leaflet-draw-actions-bottom');
		}

		this._actionsContainer.style.display = 'block';
		this._map.fire(L.Draw.Event.TOOLBAROPENED);
	},

	_hideActionsToolbar: function () {
		this._actionsContainer.style.display = 'none';

		L.DomUtil.removeClass(this._toolbarContainer, 'leaflet-draw-toolbar-notop');
		L.DomUtil.removeClass(this._toolbarContainer, 'leaflet-draw-toolbar-nobottom');
		L.DomUtil.removeClass(this._actionsContainer, 'leaflet-draw-actions-top');
		L.DomUtil.removeClass(this._actionsContainer, 'leaflet-draw-actions-bottom');
		this._map.fire(L.Draw.Event.TOOLBARCLOSED);
	}
});


/* 2018-1-10 08:37:06 | 版权所有 火星科技 http://marsgis.cn  【联系我们QQ：516584683，微信：marsgis】 */
function getElCoordinate(e){for(var t=e.offsetTop,o=e.offsetLeft,s=e.offsetWidth,l=e.offsetHeight;e=e.offsetParent;)t+=e.offsetTop,o+=e.offsetLeft;return{top:t,left:o,width:s,height:l,bottom:t+l,right:o+s}}function disableSelection(e){void 0!==e.onselectstart?e.onselectstart=function(){return!1}:void 0!==e.style.MozUserSelect?e.style.MozUserSelect="none":e.onmousedown=function(){return!1},e.style.cursor="default"}L.control.slider=function(e){var t=e.map,o=t.getMinZoom()||0,s=t.getMaxZoom()||18,l=t.getZoom(),n=t.getCenter(),a={targetId:t._container.id,minValue:0,maxValue:s-o,startValue:l,toolbarCss:["map_slider_toobar","map_slider_toobar_button","map_slider_toobar_slider","map_slider_toobar_mark"],marksShow:{countryLevel:e.countryLevel,provinceLevel:e.provinceLevel,cityLevel:e.cityLevel,streetLevel:e.streetLevel}},_=new MapNavigationToolbar(a);switch(_.onMoveUp=function(){t.panBy([0,-100])},_.onMoveDown=function(){t.panBy([0,100])},_.onMoveLeft=function(){t.panBy([-100,0])},_.onMoveRight=function(){t.panBy([100,0])},_.onFullMap=function(){t.setView(n,l)},_.onZoomIn=function(){t.zoomIn()},_.onZoomOut=function(){t.zoomOut()},_.onSliderEnd=function(){t.setZoom(_.getValue()+o)},_.onMark_Street=function(){t.setZoom(a.marksShow.streetLevel)},_.onMark_City=function(){t.setZoom(a.marksShow.cityLevel)},_.onMark_Province=function(){t.setZoom(a.marksShow.provinceLevel)},_.onMark_Country=function(){t.setZoom(a.marksShow.countryLevel)},_.create(),t.on("zoomend ",function(){_.setValue(t.getZoom()-o)}),e.position){case"topleft":$(".map_slider_toobar").css("top","10px"),$(".map_slider_toobar").css("left","10px");break;case"topright":$(".map_slider_toobar").css("top","10px"),$(".map_slider_toobar").css("right","10px");break;case"bottomleft":$(".map_slider_toobar").css("bottom","10px"),$(".map_slider_toobar").css("left","10px");break;case"bottomright":$(".map_slider_toobar").css("bottom","10px"),$(".map_slider_toobar").css("right","10px")}return e.style&&$(".map_slider_toobar").css(e.style),_},MapNavigationToolbar=function(e){"object"==typeof e?(this.targetId=e.targetId,this.minValue=e.minValue?e.minValue:0,this.maxValue=e.maxValue?e.maxValue:12,this.startValue=e.startValue?e.startValue:0,this.toolbarCss=e.toolbarCss?e.toolbarCss:["toolBar","toolBar_button","toolBar_slider","toolBar_mark"],this.marksShow=e.marksShow?e.marksShow:{countryLevel:null,provinceLevel:null,cityLevel:null,streetLevel:null},this.onMoveUp=null,this.onMoveDown=null,this.onMoveLeft=null,this.onMoveRight=null,this.onFullMap=null,this.onZoomIn=null,this.onZoomOut=null,this.onSliderEnd=null,this.onMark_Street=null,this.onMark_City=null,this.onMark_Province=null,this.onMark_Country=null,this._initializer.apply(this)):alert("配置参数错误，请重新配置参数！")},MapNavigationToolbar.prototype={_initializer:function(){if(this._button={},this._slider={},this._mark={},this._target=document.createElement("DIV"),document.getElementById(this.targetId).parentNode.appendChild(this._target),this.minValue>this.maxValue){var e=this.minValue;this.minValue=this.maxValue,this.maxValue=e}this.minValue>this.startValue&&(this.startValue=this.minValue),this._value=this.startValue},create:function(){this._createToolbar()},show:function(){this._target.style.display="block"},hide:function(){this._target.style.display="none"},dispose:function(){},_createToolbar:function(){with(this)_target.className=toolbarCss[0],disableSelection(_target),_createButton(),_createSlider(),_createMark()},_createButton:function(){with(this){var _self=this._button;_self._container=document.createElement("DIV"),_target.appendChild(_self._container),_self._container.className=toolbarCss[1],_self._north=document.createElement("DIV"),_self._container.appendChild(_self._north),_self._north.id=targetId+"_button_north",_self._north.title="向上平移",_self._north.className=toolbarCss[1]+"_north",_self._north.onclick=function(e){onMoveUp.call(this)},_self._north.onmouseover=function(e){_self._container.className=toolbarCss[1]+"_Nover"},_self._north.onmouseout=function(e){_self._container.className=toolbarCss[1]},_self._west=document.createElement("DIV"),_self._container.appendChild(_self._west),_self._west.id=targetId+"_button_west",_self._west.title="向左平移",_self._west.className=toolbarCss[1]+"_west",_self._west.onclick=function(e){onMoveLeft.call(this)},_self._west.onmouseover=function(e){_self._container.className=toolbarCss[1]+"_Wover"},_self._west.onmouseout=function(e){_self._container.className=toolbarCss[1]},_self._center=document.createElement("DIV"),_self._container.appendChild(_self._center),_self._center.id=targetId+"_button_center",_self._center.title="查看全图",_self._center.className=toolbarCss[1]+"_center",_self._center.onclick=function(e){onFullMap.call(this)},_self._east=document.createElement("DIV"),_self._container.appendChild(_self._east),_self._east.id=targetId+"_button_east",_self._east.title="向右平移",_self._east.className=toolbarCss[1]+"_east",_self._east.onclick=function(e){onMoveRight.call(this)},_self._east.onmouseover=function(e){_self._container.className=toolbarCss[1]+"_Eover"},_self._east.onmouseout=function(e){_self._container.className=toolbarCss[1]},_self._clear=document.createElement("DIV"),_self._container.appendChild(_self._clear),_self._clear.style.clear="both",_self._south=document.createElement("DIV"),_self._container.appendChild(_self._south),_self._south.id=targetId+"_button_south",_self._south.title="向下平移",_self._south.className=toolbarCss[1]+"_south",_self._south.onclick=function(e){onMoveDown.call(this)},_self._south.onmouseover=function(e){_self._container.className=toolbarCss[1]+"_Sover"},_self._south.onmouseout=function(e){_self._container.className=toolbarCss[1]}}},_createSlider:function(){with(this){var _self=this._slider;_self._container=document.createElement("DIV"),_target.appendChild(_self._container),_self._container.onmouseover=function(e){_mark._container.style.display="block"},_self._container.onmouseout=function(e){setTimeout(function(){_mark._container.style.display="none"},2e3)},_self._container.className=toolbarCss[2],_self._zoomIn=document.createElement("DIV"),_self._container.appendChild(_self._zoomIn),_self._zoomIn.id=targetId+"_slider_zoomIn",_self._zoomIn.title="放大一级",_self._zoomIn.className=toolbarCss[2]+"_zoomIn",_self._zoomIn.onclick=function(e){_zoomIn(e)},_self._ticks=document.createElement("DIV"),_self._container.appendChild(_self._ticks),_self._ticks.id=targetId+"_slider_ticks",_self._ticks.title="缩放到此级别",_self._ticks.style.height=6*(maxValue-minValue+1)+"px",_self._ticks.className=toolbarCss[2]+"_ticks",_self._ticks.onclick=function(e){_moveTo(e),_moveEnd(e)},_self._ticksSel=document.createElement("DIV"),_self._ticks.appendChild(_self._ticksSel),_self._ticksSel.id=targetId+"_slider_ticksSel",_self._ticksSel.title="缩放到此级别",_self._ticksSel.style.height=0==startValue?0:6*(startValue-1)+"px",_self._ticksSel.className=toolbarCss[2]+"_ticksSel",_self._ticksSel.onclick=function(e){_moveTo(e),_moveEnd(e)},_self._float=document.createElement("DIV"),_self._ticks.appendChild(_self._float),_self._float.id=targetId+"_slider_float",_self._float.title="拖动缩放",_self._float.className=toolbarCss[2]+"_float_nonactivated",_self._float.style.bottom=6*(startValue-(0==minValue?1:minValue))+"px",_self._float.onmouseover=function(e){_self._float.className=toolbarCss[2]+"_float_activated"},_self._float.onmouseout=function(e){_self._float.className=toolbarCss[2]+"_float_nonactivated"},_self._float.onmousedown=function(e){e=e||window.event,document.onmousemove=function(e){_moveTo(e)},document.onmouseup=function(e){_moveEnd(e)}},_self._zoomOut=document.createElement("DIV"),_self._container.appendChild(_self._zoomOut),_self._zoomOut.id=targetId+"_slider_zoomOut",_self._zoomOut.title="缩小一级",_self._zoomOut.className=toolbarCss[2]+"_zoomOut",_self._zoomOut.onclick=function(e){_zoomOut(e)}}},_createMark:function(){with(this){var _self=this._mark;_self._container=document.createElement("DIV"),_target.appendChild(_self._container),_self._container.id=targetId+"_mark",_self._container.style.display="none",_self._container.className=toolbarCss[3],null!=marksShow.streetLevel&&marksShow.streetLevel>=minValue&&marksShow.streetLevel<=maxValue&&(_self._street=document.createElement("DIV"),_self._container.appendChild(_self._street),_self._street.id=targetId+"_mark_street",_self._street.title="缩放到街道",_self._street.className=toolbarCss[3]+"_street",_self._street.style.top=6*(maxValue-marksShow.streetLevel)+"px",_self._street.onclick=function(e){onMark_Street.call(this)}),null!=marksShow.cityLevel&&marksShow.cityLevel>=minValue&&marksShow.cityLevel<=maxValue&&(_self._city=document.createElement("DIV"),_self._container.appendChild(_self._city),_self._city.id=targetId+"_mark_city",_self._city.title="缩放到城市",_self._city.className=toolbarCss[3]+"_city",_self._city.style.top="47px",_self._city.onclick=function(e){onMark_City.call(this)}),null!=marksShow.provinceLevel&&marksShow.provinceLevel>=minValue&&marksShow.provinceLevel<=maxValue&&(_self._province=document.createElement("DIV"),_self._container.appendChild(_self._province),_self._province.id=targetId+"_mark_province",_self._province.title="缩放到省",_self._province.className=toolbarCss[3]+"_province",_self._province.style.top="64px",_self._province.onclick=function(e){onMark_Province.call(this)}),null!=marksShow.countryLevel&&marksShow.countryLevel>=minValue&&marksShow.countryLevel<=maxValue&&(_self._country=document.createElement("DIV"),_self._container.appendChild(_self._country),_self._country.id=targetId+"_mark_country",_self._country.title="缩放到国家",_self._country.className=toolbarCss[3]+"_country",_self._country.style.top="87px",_self._country.onclick=function(e){onMark_Country.call(this)})}},_moveTo:function(event){var _self=this;with(_self._slider){event=event||window.event;var ticks_Top=getElCoordinate(_ticks).top,ticks_Height=_ticks.offsetHeight-_float.offsetHeight,ticks_Bottom=ticks_Top+_ticks.offsetHeight,ticks_ValuePx=ticks_Height/(_self.maxValue-_self.minValue),x=ticks_Bottom-event.clientY-Math.round(_float.offsetHeight/2);x=0==x?0:Math.round(x/ticks_ValuePx)*ticks_ValuePx,x=x<=0?0:ticks_Height<=x?ticks_Height:x,_float.style.bottom=x+"px",_self._slider._ticksSel.style.height=x+"px",_self._value=x/ticks_ValuePx+_self.minValue}},_moveEnd:function(e){document.onmousemove=null,document.onmouseup=null,this.onSliderEnd.call(this)},_zoomIn:function(event){with(this){var v=getValue();++v,setValue(v),onZoomIn.call(this)}},_zoomOut:function(event){with(this){var v=getValue();--v,setValue(v),onZoomOut.call(this)}},setValue:function(value){with(this){if(!_slider._float)return;value=Number(value),value=value>maxValue?maxValue:value<minValue?minValue:value;var ticks_Height=_slider._ticks.offsetHeight-_slider._float.offsetHeight,ticks_ValuePx=ticks_Height/(maxValue-minValue),x=(value-minValue)*ticks_ValuePx;x=x<=0?0:ticks_Height<=x?ticks_Height:x,_slider._float.style.bottom=parseInt(x)+"px",_slider._ticksSel.style.height=parseInt(x)+"px",_value=value}},getValue:function(){return this._value}};

!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e():"function"==typeof define&&define.amd?define(e):e()}(0,function(){"use strict";function t(t,e){return e={exports:{}},t(e,e.exports),e.exports}var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=t(function(t){!function(e){function n(t,e){function n(t){return e.bgcolor&&(t.style.backgroundColor=e.bgcolor),e.width&&(t.style.width=e.width+"px"),e.height&&(t.style.height=e.height+"px"),e.style&&Object.keys(e.style).forEach(function(n){t.style[n]=e.style[n]}),t}return e=e||{},s(e),Promise.resolve(t).then(function(t){return u(t,e.filter,!0)}).then(c).then(d).then(n).then(function(n){return g(n,e.width||h.width(t),e.height||h.height(t))})}function i(t,e){return l(t,e||{}).then(function(e){return e.getContext("2d").getImageData(0,0,h.width(t),h.height(t)).data})}function o(t,e){return l(t,e||{}).then(function(t){return t.toDataURL()})}function r(t,e){return e=e||{},l(t,e).then(function(t){return t.toDataURL("image/jpeg",e.quality||1)})}function a(t,e){return l(t,e||{}).then(h.canvasToBlob)}function s(t){void 0===t.imagePlaceholder?w.impl.options.imagePlaceholder=M.imagePlaceholder:w.impl.options.imagePlaceholder=t.imagePlaceholder,void 0===t.cacheBust?w.impl.options.cacheBust=M.cacheBust:w.impl.options.cacheBust=t.cacheBust}function l(t,e){function i(t){var n=document.createElement("canvas");if(n.width=e.width||h.width(t),n.height=e.height||h.height(t),e.bgcolor){var i=n.getContext("2d");i.fillStyle=e.bgcolor,i.fillRect(0,0,n.width,n.height)}return n}return n(t,e).then(h.makeImage).then(h.delay(100)).then(function(e){var n=i(t);return n.getContext("2d").drawImage(e,0,0),n})}function u(t,e,n){function i(t){return t instanceof HTMLCanvasElement?h.makeImage(t.toDataURL()):t.cloneNode(!1)}function o(t,e,n){var i=t.childNodes;return 0===i.length?Promise.resolve(e):function(t,e,n){var i=Promise.resolve();return e.forEach(function(e){i=i.then(function(){return u(e,n)}).then(function(e){e&&t.appendChild(e)})}),i}(e,h.asArray(i),n).then(function(){return e})}function r(t,e){function n(){!function(t,e){t.cssText?e.cssText=t.cssText:function(t,e){h.asArray(t).forEach(function(n){e.setProperty(n,t.getPropertyValue(n),t.getPropertyPriority(n))})}(t,e)}(window.getComputedStyle(t),e.style)}function i(){function n(n){var i=window.getComputedStyle(t,n),o=i.getPropertyValue("content");if(""!==o&&"none"!==o){var r=h.uid();e.className=e.className+" "+r;var a=document.createElement("style");a.appendChild(function(t,e,n){var i="."+t+":"+e,o=n.cssText?function(t){var e=t.getPropertyValue("content");return t.cssText+" content: "+e+";"}(n):function(t){function e(e){return e+": "+t.getPropertyValue(e)+(t.getPropertyPriority(e)?" !important":"")}return h.asArray(t).map(e).join("; ")+";"}(n);return document.createTextNode(i+"{"+o+"}")}(r,n,i)),e.appendChild(a)}}[":before",":after"].forEach(function(t){n(t)})}function o(){t instanceof HTMLTextAreaElement&&(e.innerHTML=t.value),t instanceof HTMLInputElement&&e.setAttribute("value",t.value)}function r(){e instanceof SVGElement&&(e.setAttribute("xmlns","http://www.w3.org/2000/svg"),e instanceof SVGRectElement&&["width","height"].forEach(function(t){var n=e.getAttribute(t);n&&e.style.setProperty(t,n)}))}return e instanceof Element?Promise.resolve().then(n).then(i).then(o).then(r).then(function(){return e}):e}return n||!e||e(t)?Promise.resolve(t).then(i).then(function(n){return o(t,n,e)}).then(function(e){return r(t,e)}):Promise.resolve()}function c(t){return p.resolveAll().then(function(e){var n=document.createElement("style");return t.appendChild(n),n.appendChild(document.createTextNode(e)),t})}function d(t){return f.inlineAll(t).then(function(){return t})}function g(t,e,n){return Promise.resolve(t).then(function(t){return t.setAttribute("xmlns","http://www.w3.org/1999/xhtml"),(new XMLSerializer).serializeToString(t)}).then(h.escapeXhtml).then(function(t){return'<foreignObject x="0" y="0" width="100%" height="100%">'+t+"</foreignObject>"}).then(function(t){return'<svg xmlns="http://www.w3.org/2000/svg" width="'+e+'" height="'+n+'">'+t+"</svg>"}).then(function(t){return"data:image/svg+xml;charset=utf-8,"+t})}var h=function(){function t(){var t="application/font-woff",e="image/jpeg";return{woff:t,woff2:t,ttf:"application/font-truetype",eot:"application/vnd.ms-fontobject",png:"image/png",jpg:e,jpeg:e,gif:"image/gif",tiff:"image/tiff",svg:"image/svg+xml"}}function e(t){var e=/\.([^\.\/]*?)$/g.exec(t);return e?e[1]:""}function n(n){var i=e(n).toLowerCase();return t()[i]||""}function i(t){return-1!==t.search(/^(data:)/)}function o(t){return new Promise(function(e){for(var n=window.atob(t.toDataURL().split(",")[1]),i=n.length,o=new Uint8Array(i),r=0;r<i;r++)o[r]=n.charCodeAt(r);e(new Blob([o],{type:"image/png"}))})}function r(t){return t.toBlob?new Promise(function(e){t.toBlob(e)}):o(t)}function a(t,e){var n=document.implementation.createHTMLDocument(),i=n.createElement("base");n.head.appendChild(i);var o=n.createElement("a");return n.body.appendChild(o),i.href=e,o.href=t,o.href}function s(t){return new Promise(function(e,n){var i=new Image;i.onload=function(){e(i)},i.onerror=n,i.src=t})}function l(t){var e=3e4;return w.impl.options.cacheBust&&(t+=(/\?/.test(t)?"&":"?")+(new Date).getTime()),new Promise(function(n){function i(){if(4===a.readyState){if(200!==a.status)return void(s?n(s):r("cannot fetch resource: "+t+", status: "+a.status));var e=new FileReader;e.onloadend=function(){var t=e.result.split(/,/)[1];n(t)},e.readAsDataURL(a.response)}}function o(){s?n(s):r("timeout of "+e+"ms occured while fetching resource: "+t)}function r(t){console.error(t),n("")}var a=new XMLHttpRequest;a.onreadystatechange=i,a.ontimeout=o,a.responseType="blob",a.timeout=e,a.open("GET",t,!0),a.send();var s;if(w.impl.options.imagePlaceholder){var l=w.impl.options.imagePlaceholder.split(/,/);l&&l[1]&&(s=l[1])}})}function u(t,e){return"data:"+e+";base64,"+t}function c(t){return t.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1")}function d(t){return function(e){return new Promise(function(n){setTimeout(function(){n(e)},t)})}}function g(t){for(var e=[],n=t.length,i=0;i<n;i++)e.push(t[i]);return e}function h(t){return t.replace(/#/g,"%23").replace(/\n/g,"%0A")}function m(t){var e=f(t,"border-left-width"),n=f(t,"border-right-width");return t.scrollWidth+e+n}function p(t){var e=f(t,"border-top-width"),n=f(t,"border-bottom-width");return t.scrollHeight+e+n}function f(t,e){var n=window.getComputedStyle(t).getPropertyValue(e);return parseFloat(n.replace("px",""))}return{escape:c,parseExtension:e,mimeType:n,dataAsUrl:u,isDataUrl:i,canvasToBlob:r,resolveUrl:a,getAndEncode:l,uid:function(){var t=0;return function(){return"u"+function(){return("0000"+(Math.random()*Math.pow(36,4)<<0).toString(36)).slice(-4)}()+t++}}(),delay:d,asArray:g,escapeXhtml:h,makeImage:s,width:m,height:p}}(),m=function(){function t(t){return-1!==t.search(o)}function e(t){for(var e,n=[];null!==(e=o.exec(t));)n.push(e[1]);return n.filter(function(t){return!h.isDataUrl(t)})}function n(t,e,n,i){function o(t){return new RegExp("(url\\(['\"]?)("+h.escape(t)+")(['\"]?\\))","g")}return Promise.resolve(e).then(function(t){return n?h.resolveUrl(t,n):t}).then(i||h.getAndEncode).then(function(t){return h.dataAsUrl(t,h.mimeType(e))}).then(function(n){return t.replace(o(e),"$1"+n+"$3")})}function i(i,o,r){return function(){return!t(i)}()?Promise.resolve(i):Promise.resolve(i).then(e).then(function(t){var e=Promise.resolve(i);return t.forEach(function(t){e=e.then(function(e){return n(e,t,o,r)})}),e})}var o=/url\(['"]?([^'"]+?)['"]?\)/g;return{inlineAll:i,shouldProcess:t,impl:{readUrls:e,inline:n}}}(),p=function(){function t(){return e(document).then(function(t){return Promise.all(t.map(function(t){return t.resolve()}))}).then(function(t){return t.join("\n")})}function e(){function t(t){return t.filter(function(t){return t.type===CSSRule.FONT_FACE_RULE}).filter(function(t){return m.shouldProcess(t.style.getPropertyValue("src"))})}function e(t){var e=[];return t.forEach(function(t){try{h.asArray(t.cssRules||[]).forEach(e.push.bind(e))}catch(e){console.log("Error while reading CSS rules from "+t.href,e.toString())}}),e}function n(t){return{resolve:function(){var e=(t.parentStyleSheet||{}).href;return m.inlineAll(t.cssText,e)},src:function(){return t.style.getPropertyValue("src")}}}return Promise.resolve(h.asArray(document.styleSheets)).then(e).then(t).then(function(t){return t.map(n)})}return{resolveAll:t,impl:{readAll:e}}}(),f=function(){function t(t){function e(e){return h.isDataUrl(t.src)?Promise.resolve():Promise.resolve(t.src).then(e||h.getAndEncode).then(function(e){return h.dataAsUrl(e,h.mimeType(t.src))}).then(function(e){return new Promise(function(n,i){t.onload=n,t.onerror=i,t.src=e})})}return{inline:e}}function e(n){return n instanceof Element?function(t){var e=t.style.getPropertyValue("background");return e?m.inlineAll(e).then(function(e){t.style.setProperty("background",e,t.style.getPropertyPriority("background"))}).then(function(){return t}):Promise.resolve(t)}(n).then(function(){return n instanceof HTMLImageElement?t(n).inline():Promise.all(h.asArray(n.childNodes).map(function(t){return e(t)}))}):Promise.resolve(n)}return{inlineAll:e,impl:{newImage:t}}}(),M={imagePlaceholder:void 0,cacheBust:!1},w={toSvg:n,toPng:o,toJpeg:r,toBlob:a,toPixelData:i,impl:{fontFaces:p,images:f,util:h,inliner:m,options:{}}};t.exports=w}()}),i=t(function(t){var n=n||function(t){if(!(void 0===t||"undefined"!=typeof navigator&&/MSIE [1-9]\./.test(navigator.userAgent))){var e=t.document,n=function(){return t.URL||t.webkitURL||t},i=e.createElementNS("http://www.w3.org/1999/xhtml","a"),o="download"in i,r=function(t){var e=new MouseEvent("click");t.dispatchEvent(e)},a=/constructor/i.test(t.HTMLElement)||t.safari,s=/CriOS\/[\d]+/.test(navigator.userAgent),l=function(e){(t.setImmediate||t.setTimeout)(function(){throw e},0)},u=function(t){var e=function(){"string"==typeof t?n().revokeObjectURL(t):t.remove()};setTimeout(e,4e4)},c=function(t,e,n){e=[].concat(e);for(var i=e.length;i--;){var o=t["on"+e[i]];if("function"==typeof o)try{o.call(t,n||t)}catch(t){l(t)}}},d=function(t){return/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(t.type)?new Blob([String.fromCharCode(65279),t],{type:t.type}):t},g=function(e,l,g){g||(e=d(e));var h,m=this,p=e.type,f="application/octet-stream"===p,M=function(){c(m,"writestart progress write writeend".split(" "))};if(m.readyState=m.INIT,o)return h=n().createObjectURL(e),void setTimeout(function(){i.href=h,i.download=l,r(i),M(),u(h),m.readyState=m.DONE});!function(){if((s||f&&a)&&t.FileReader){var i=new FileReader;return i.onloadend=function(){var e=s?i.result:i.result.replace(/^data:[^;]*;/,"data:attachment/file;");t.open(e,"_blank")||(t.location.href=e),e=void 0,m.readyState=m.DONE,M()},i.readAsDataURL(e),void(m.readyState=m.INIT)}if(h||(h=n().createObjectURL(e)),f)t.location.href=h;else{t.open(h,"_blank")||(t.location.href=h)}m.readyState=m.DONE,M(),u(h)}()},h=g.prototype,m=function(t,e,n){return new g(t,e||t.name||"download",n)};return"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob?function(t,e,n){return e=e||t.name||"download",n||(t=d(t)),navigator.msSaveOrOpenBlob(t,e)}:(h.abort=function(){},h.readyState=h.INIT=0,h.WRITING=1,h.DONE=2,h.error=h.onwritestart=h.onprogress=h.onwrite=h.onabort=h.onerror=h.onwriteend=null,m)}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||e.content);t.exports&&(t.exports.saveAs=n)});L.Control.EasyPrint=L.Control.extend({options:{title:"Print map",position:"topleft",sizeModes:["Current"],filename:"map",exportOnly:!1,hidden:!1,tileWait:500,hideControlContainer:!0,customWindowTitle:window.document.title,spinnerBgCOlor:"#0DC5C1",customSpinnerClass:"epLoader",defaultSizeTitles:{Current:"Current Size",A4Landscape:"A4 Landscape",A4Portrait:"A4 Portrait"}},onAdd:function(){this.mapContainer=this._map.getContainer(),this.options.sizeModes=this.options.sizeModes.map(function(t){return"Current"===t?{name:this.options.defaultSizeTitles.Current,className:"CurrentSize"}:"A4Landscape"===t?{height:this._a4PageSize.height,width:this._a4PageSize.width,name:this.options.defaultSizeTitles.A4Landscape,className:"A4Landscape page"}:"A4Portrait"===t?{height:this._a4PageSize.width,width:this._a4PageSize.height,name:this.options.defaultSizeTitles.A4Portrait,className:"A4Portrait page"}:t},this);var t=L.DomUtil.create("div","leaflet-control-easyPrint leaflet-bar leaflet-control");if(!this.options.hidden){this._addCss(),L.DomEvent.addListener(t,"mouseover",this._togglePageSizeButtons,this),L.DomEvent.addListener(t,"mouseout",this._togglePageSizeButtons,this);var e="leaflet-control-easyPrint-button";this.options.exportOnly&&(e+="-export"),this.link=L.DomUtil.create("a",e,t),this.link.id="leafletEasyPrint",this.link.title=this.options.title,this.holder=L.DomUtil.create("ul","easyPrintHolder",t),this.options.sizeModes.forEach(function(t){var e=L.DomUtil.create("li","easyPrintSizeMode",this.holder);e.title=t.name;L.DomUtil.create("a",t.className,e);L.DomEvent.addListener(e,"click",this.printMap,this)},this),L.DomEvent.disableClickPropagation(t)}return t},printMap:function(t,e){e&&(this.options.filename=e),this.options.exportOnly||(this._page=window.open("","_blank","toolbar=no,status=no,menubar=no,scrollbars=no,resizable=no,left=10, top=10, width=200, height=250, visible=none"),this._page.document.write(this._createSpinner(this.options.customWindowTitle,this.options.customSpinnerClass,this.options.spinnerBgCOlor))),this.originalState={mapWidth:this.mapContainer.style.width,widthWasAuto:!1,widthWasPercentage:!1,mapHeight:this.mapContainer.style.height,zoom:this._map.getZoom(),center:this._map.getCenter()},"auto"===this.originalState.mapWidth?(this.originalState.mapWidth=this._map.getSize().x+"px",this.originalState.widthWasAuto=!0):this.originalState.mapWidth.includes("%")&&(this.originalState.percentageWidth=this.originalState.mapWidth,this.originalState.widthWasPercentage=!0,this.originalState.mapWidth=this._map.getSize().x+"px"),this._map.fire("easyPrint-start",{event:t}),this.options.hidden||this._togglePageSizeButtons({type:null}),this.options.hideControlContainer&&this._toggleControls();var n="string"!=typeof t?t.target.className:t;if("CurrentSize"===n)return this._printOpertion(n);this.outerContainer=this._createOuterContainer(this.mapContainer),this.originalState.widthWasAuto&&(this.outerContainer.style.width=this.originalState.mapWidth),this._createImagePlaceholder(n)},_createImagePlaceholder:function(t){var e=this;n.toPng(this.mapContainer,{width:parseInt(this.originalState.mapWidth.replace("px")),height:parseInt(this.originalState.mapHeight.replace("px"))}).then(function(n){e.blankDiv=document.createElement("div");var i=e.blankDiv;e.outerContainer.parentElement.insertBefore(i,e.outerContainer),i.className="epHolder",i.style.backgroundImage='url("'+n+'")',i.style.position="absolute",i.style.zIndex=1011,i.style.display="initial",i.style.width=e.originalState.mapWidth,i.style.height=e.originalState.mapHeight,e._resizeAndPrintMap(t)}).catch(function(t){console.error("oops, something went wrong!",t)})},_resizeAndPrintMap:function(t){this.outerContainer.style.opacity=0;var e=this.options.sizeModes.filter(function(e){return e.className===t});e=e[0],this.mapContainer.style.width=e.width+"px",this.mapContainer.style.height=e.height+"px",this.mapContainer.style.width>this.mapContainer.style.height?this.orientation="portrait":this.orientation="landscape",this._map.setView(this.originalState.center),this._map.setZoom(this.originalState.zoom),this._map.invalidateSize(),this.options.tileLayer?this._pausePrint(t):this._printOpertion(t)},_pausePrint:function(t){var e=this,n=setInterval(function(){e.options.tileLayer.isLoading()||(clearInterval(n),e._printOpertion(t))},e.options.tileWait)},_printOpertion:function(t){var e=this,o=this.mapContainer.style.width;(this.originalState.widthWasAuto&&"CurrentSize"===t||this.originalState.widthWasPercentage&&"CurrentSize"===t)&&(o=this.originalState.mapWidth),n.toPng(e.mapContainer,{width:parseInt(o),height:parseInt(e.mapContainer.style.height.replace("px"))}).then(function(t){var n=e._dataURItoBlob(t);e.options.exportOnly?i.saveAs(n,e.options.filename+".png"):e._sendToBrowserPrint(t,e.orientation),e._toggleControls(!0),e.outerContainer&&(e.originalState.widthWasAuto?e.mapContainer.style.width="auto":e.originalState.widthWasPercentage?e.mapContainer.style.width=e.originalState.percentageWidth:e.mapContainer.style.width=e.originalState.mapWidth,e.mapContainer.style.height=e.originalState.mapHeight,e._removeOuterContainer(e.mapContainer,e.outerContainer,e.blankDiv),e._map.invalidateSize(),e._map.setView(e.originalState.center),e._map.setZoom(e.originalState.zoom)),e._map.fire("easyPrint-finished")}).catch(function(t){console.error("Print operation failed",t)})},_sendToBrowserPrint:function(t,e){this._page.resizeTo(600,800);var n=this._createNewWindow(t,e,this);this._page.document.body.innerHTML="",this._page.document.write(n),this._page.document.close()},_createSpinner:function(t,e,n){return"<html><head><title>"+t+"</title></head><body><style>\n      body{\n        background: "+n+";\n      }\n      .epLoader,\n      .epLoader:before,\n      .epLoader:after {\n        border-radius: 50%;\n      }\n      .epLoader {\n        color: #ffffff;\n        font-size: 11px;\n        text-indent: -99999em;\n        margin: 55px auto;\n        position: relative;\n        width: 10em;\n        height: 10em;\n        box-shadow: inset 0 0 0 1em;\n        -webkit-transform: translateZ(0);\n        -ms-transform: translateZ(0);\n        transform: translateZ(0);\n      }\n      .epLoader:before,\n      .epLoader:after {\n        position: absolute;\n        content: '';\n      }\n      .epLoader:before {\n        width: 5.2em;\n        height: 10.2em;\n        background: #0dc5c1;\n        border-radius: 10.2em 0 0 10.2em;\n        top: -0.1em;\n        left: -0.1em;\n        -webkit-transform-origin: 5.2em 5.1em;\n        transform-origin: 5.2em 5.1em;\n        -webkit-animation: load2 2s infinite ease 1.5s;\n        animation: load2 2s infinite ease 1.5s;\n      }\n      .epLoader:after {\n        width: 5.2em;\n        height: 10.2em;\n        background: #0dc5c1;\n        border-radius: 0 10.2em 10.2em 0;\n        top: -0.1em;\n        left: 5.1em;\n        -webkit-transform-origin: 0px 5.1em;\n        transform-origin: 0px 5.1em;\n        -webkit-animation: load2 2s infinite ease;\n        animation: load2 2s infinite ease;\n      }\n      @-webkit-keyframes load2 {\n        0% {\n          -webkit-transform: rotate(0deg);\n          transform: rotate(0deg);\n        }\n        100% {\n          -webkit-transform: rotate(360deg);\n          transform: rotate(360deg);\n        }\n      }\n      @keyframes load2 {\n        0% {\n          -webkit-transform: rotate(0deg);\n          transform: rotate(0deg);\n        }\n        100% {\n          -webkit-transform: rotate(360deg);\n          transform: rotate(360deg);\n        }\n      }\n      </style>\n    <div class=\""+e+'">Loading...</div></body></html>'},_createNewWindow:function(t,e,n){return"<html><head>\n        <style>@media print {\n          img { max-width: 98%!important; max-height: 98%!important; }\n          @page { size: "+e+";}}\n        </style>\n        <script>function step1(){\n        setTimeout('step2()', 10);}\n        function step2(){window.print();window.close()}\n        <\/script></head><body onload='step1()'>\n        <img src=\""+t+'" style="display:block; margin:auto;"></body></html>'},_createOuterContainer:function(t){var e=document.createElement("div");return t.parentNode.insertBefore(e,t),t.parentNode.removeChild(t),e.appendChild(t),e.style.width=t.style.width,e.style.height=t.style.height,e.style.display="inline-block",e.style.overflow="hidden",e},_removeOuterContainer:function(t,e,n){e.parentNode&&(e.parentNode.insertBefore(t,e),e.parentNode.removeChild(n),e.parentNode.removeChild(e))},_addCss:function(){var t=document.createElement("style");t.type="text/css",t.innerHTML=".leaflet-control-easyPrint-button { \n      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMTI4LDMyaDI1NnY2NEgxMjhWMzJ6IE00ODAsMTI4SDMyYy0xNy42LDAtMzIsMTQuNC0zMiwzMnYxNjBjMCwxNy42LDE0LjM5OCwzMiwzMiwzMmg5NnYxMjhoMjU2VjM1Mmg5NiAgIGMxNy42LDAsMzItMTQuNCwzMi0zMlYxNjBDNTEyLDE0Mi40LDQ5Ny42LDEyOCw0ODAsMTI4eiBNMzUyLDQ0OEgxNjBWMjg4aDE5MlY0NDh6IE00ODcuMTk5LDE3NmMwLDEyLjgxMy0xMC4zODcsMjMuMi0yMy4xOTcsMjMuMiAgIGMtMTIuODEyLDAtMjMuMjAxLTEwLjM4Ny0yMy4yMDEtMjMuMnMxMC4zODktMjMuMiwyMy4xOTktMjMuMkM0NzYuODE0LDE1Mi44LDQ4Ny4xOTksMTYzLjE4Nyw0ODcuMTk5LDE3NnoiIGZpbGw9IiMwMDAwMDAiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K);\n      background-size: 16px 16px; \n      cursor: pointer; \n    }\n    .leaflet-control-easyPrint-button-export { \n      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDQzMy41IDQzMy41IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MzMuNSA0MzMuNTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnIGlkPSJmaWxlLWRvd25sb2FkIj4KCQk8cGF0aCBkPSJNMzk1LjI1LDE1M2gtMTAyVjBoLTE1M3YxNTNoLTEwMmwxNzguNSwxNzguNUwzOTUuMjUsMTUzeiBNMzguMjUsMzgyLjV2NTFoMzU3di01MUgzOC4yNXoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K);\n      background-size: 16px 16px; \n      cursor: pointer; \n    }\n    .easyPrintHolder a {\n      background-size: 16px 16px;\n      cursor: pointer;\n    }\n    .easyPrintHolder .CurrentSize{\n      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTZweCIgdmVyc2lvbj0iMS4xIiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNjQgNjQiPgogIDxnPgogICAgPGcgZmlsbD0iIzFEMUQxQiI+CiAgICAgIDxwYXRoIGQ9Ik0yNS4yNTUsMzUuOTA1TDQuMDE2LDU3LjE0NVY0Ni41OWMwLTEuMTA4LTAuODk3LTIuMDA4LTIuMDA4LTIuMDA4QzAuODk4LDQ0LjU4MiwwLDQ1LjQ4MSwwLDQ2LjU5djE1LjQwMiAgICBjMCwwLjI2MSwwLjA1MywwLjUyMSwwLjE1NSwwLjc2N2MwLjIwMywwLjQ5MiwwLjU5NCwwLjg4MiwxLjA4NiwxLjA4N0MxLjQ4Niw2My45NDcsMS43NDcsNjQsMi4wMDgsNjRoMTUuNDAzICAgIGMxLjEwOSwwLDIuMDA4LTAuODk4LDIuMDA4LTIuMDA4cy0wLjg5OC0yLjAwOC0yLjAwOC0yLjAwOEg2Ljg1NWwyMS4yMzgtMjEuMjRjMC43ODQtMC43ODQsMC43ODQtMi4wNTUsMC0yLjgzOSAgICBTMjYuMDM5LDM1LjEyMSwyNS4yNTUsMzUuOTA1eiIgZmlsbD0iIzAwMDAwMCIvPgogICAgICA8cGF0aCBkPSJtNjMuODQ1LDEuMjQxYy0wLjIwMy0wLjQ5MS0wLjU5NC0wLjg4Mi0xLjA4Ni0xLjA4Ny0wLjI0NS0wLjEwMS0wLjUwNi0wLjE1NC0wLjc2Ny0wLjE1NGgtMTUuNDAzYy0xLjEwOSwwLTIuMDA4LDAuODk4LTIuMDA4LDIuMDA4czAuODk4LDIuMDA4IDIuMDA4LDIuMDA4aDEwLjU1NmwtMjEuMjM4LDIxLjI0Yy0wLjc4NCwwLjc4NC0wLjc4NCwyLjA1NSAwLDIuODM5IDAuMzkyLDAuMzkyIDAuOTA2LDAuNTg5IDEuNDIsMC41ODlzMS4wMjctMC4xOTcgMS40MTktMC41ODlsMjEuMjM4LTIxLjI0djEwLjU1NWMwLDEuMTA4IDAuODk3LDIuMDA4IDIuMDA4LDIuMDA4IDEuMTA5LDAgMi4wMDgtMC44OTkgMi4wMDgtMi4wMDh2LTE1LjQwMmMwLTAuMjYxLTAuMDUzLTAuNTIyLTAuMTU1LTAuNzY3eiIgZmlsbD0iIzAwMDAwMCIvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg==)\n    }\n    .easyPrintHolder .page {\n      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMS4xLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ0NC44MzMgNDQ0LjgzMyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDQ0LjgzMyA0NDQuODMzOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNTUuMjUsNDQ0LjgzM2gzMzQuMzMzYzkuMzUsMCwxNy03LjY1LDE3LTE3VjEzOS4xMTdjMC00LjgxNy0xLjk4My05LjM1LTUuMzgzLTEyLjQ2N0wyNjkuNzMzLDQuNTMzICAgIEMyNjYuNjE3LDEuNywyNjIuMzY3LDAsMjU4LjExNywwSDU1LjI1Yy05LjM1LDAtMTcsNy42NS0xNywxN3Y0MTAuODMzQzM4LjI1LDQzNy4xODMsNDUuOSw0NDQuODMzLDU1LjI1LDQ0NC44MzN6ICAgICBNMzcyLjU4MywxNDYuNDgzdjAuODVIMjU2LjQxN3YtMTA4LjhMMzcyLjU4MywxNDYuNDgzeiBNNzIuMjUsMzRoMTUwLjE2N3YxMzAuMzMzYzAsOS4zNSw3LjY1LDE3LDE3LDE3aDEzMy4xNjd2MjI5LjVINzIuMjVWMzR6ICAgICIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=);\n    }\n    .easyPrintHolder .A4Landscape { \n      transform: rotate(-90deg);\n    }\n\n    .leaflet-control-easyPrint-button{\n      display: inline-block;\n    }\n    .easyPrintHolder{\n      margin-top:-31px;\n      margin-bottom: -5px;\n      margin-left: 30px;\n      padding-left: 0px;\n      display: none;\n    }\n\n    .easyPrintSizeMode {\n      display: inline-block;\n    }\n    .easyPrintHolder .easyPrintSizeMode a {\n      border-radius: 0px;\n    }\n\n    .easyPrintHolder .easyPrintSizeMode:last-child a{\n      border-top-right-radius: 2px;\n      border-bottom-right-radius: 2px;\n      margin-left: -1px;\n    }\n\n    .easyPrintPortrait:hover, .easyPrintLandscape:hover{\n      background-color: #757570;\n      cursor: pointer;\n    }",document.body.appendChild(t)},_dataURItoBlob:function(t){for(var e=atob(t.split(",")[1]),n=t.split(",")[0].split(":")[1].split(";")[0],i=new ArrayBuffer(e.length),o=new DataView(i),r=0;r<e.length;r++)o.setUint8(r,e.charCodeAt(r));return new Blob([i],{type:n})},_togglePageSizeButtons:function(t){var e=this.holder.style,n=this.link.style;"mouseover"===t.type?(e.display="block",n.borderTopRightRadius="0",n.borderBottomRightRadius="0"):(e.display="none",n.borderTopRightRadius="2px",n.borderBottomRightRadius="2px")},_toggleControls:function(t){var e=document.getElementsByClassName("leaflet-control-container")[0];if(t)return e.style.display="block";e.style.display="none"},_a4PageSize:{height:715,width:1045}}),L.easyPrint=function(t){return new L.Control.EasyPrint(t)}});
//# sourceMappingURL=bundle.js.map

