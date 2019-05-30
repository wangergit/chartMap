/* Copyright© 2000 - 2019 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html.*/
/**
 * Inspired by https://github.com/kartena/Proj4Leaflet
 */
window.proj4 = proj4;
window.Proj4js = proj4;
L.Proj = {};

L.Proj._isProj4Obj = function (a) {
    return (typeof a.inverse !== 'undefined' &&
        typeof a.forward !== 'undefined');
};

/**
 * @class L.Proj.Projection
 * @private
 * @classdesc Proj 投影定义类。
 * @category BaseTypes Projection
 * @extends {L.Class}
 * @param {string} code - proj srsCode
 * @param {string} def - 投影的 proj4 定义。{@link [详细]{http://iclient.supermap.io/web/introduction/leafletDevelop.html#projection}}
 * @param {L.bounds} bounds -  投影范围参数
 */
L.Proj.Projection = L.Class.extend({

    initialize: function (code, def, bounds) {
        var isP4 = L.Proj._isProj4Obj(code);
        this._proj = isP4 ? code : this._projFromCodeDef(code, def);
        var boundsOption = bounds;
        if (L.Util.isArray(bounds)) {
            boundsOption = L.bounds(bounds);
        }
        this.bounds = isP4 ? def : boundsOption;
    },

    /**
     * @function L.Proj.Projection.prototype.project
     * @description 通过地理坐标得到投影坐标。
     * @param  {L.Latlng} latlng -  经纬度坐标。
     * @returns {L.Point} 返回投影坐标点。
     */
    project: function (latlng) {
        var point = this._proj.forward([latlng.lng, latlng.lat]);
        return new L.Point(point[0], point[1]);
    },

    /**
     * @function L.Proj.Projection.prototype.unproject
     * @description 通过投影坐标得到地理坐标。
     * @param {L.Point} point - 坐标点。
     * @param {number} unbounded -  坐标点高程值等。
     * @returns {L.LatLng} 返回经纬度坐标
     */
    unproject: function (point, unbounded) {
        if (this.bounds) {
            point.x = point.x < this.bounds.min.x ? this.bounds.min.x : (point.x > this.bounds.max.x ? this.bounds.max.x : point.x);
            point.y = point.y < this.bounds.min.y ? this.bounds.min.y : (point.y > this.bounds.max.y ? this.bounds.max.y : point.y);
        }
        var point2 = this._proj.inverse([point.x, point.y]);
        return new L.LatLng(point2[1], point2[0], unbounded);
    },

    _projFromCodeDef: function (code, def) {
        if (def) {
            proj4.defs(code, def);
        } else if (proj4.defs[code] === undefined) {
            var urn = code.split(':');
            if (urn.length > 3) {
                code = urn[urn.length - 3] + ':' + urn[urn.length - 1];
            }
            if (proj4.defs[code] === undefined) {
                throw 'No projection definition for code ' + code;
            }
        }

        return proj4(code);
    },
    getUnits: function () {
        return this._proj.oProj.units || "degrees";
    }
});

/**
 * @class L.Proj.CRS
 * @classdesc 基于 Proj4 坐标系统扩展类。
 * 为计算级别，`options.scales` `options.scaleDenominators` `options.resolutions` `options.bounds` 必须指定一个，先后顺序已按优先级排列。
 * 当指定`options.bounds` 时，第 0 级为一张 256 切片包含整个 bounds，即`Math.max(bounds.getSize().x, bounds.getSize().y)/256` 。
 * 为保证切片行列号正确，`options.origin` `options.bounds` 必须指定一个。
 * 当指定`options.bounds` 时，切片原点为bounds的左上角。
 * @category BaseTypes Projection
 * @extends {L.Class}
 * @param {string} srsCode - proj srsCode。
 * @param {Object} options - 参数。
 * @param {string} options.def - 投影的proj4定义。[详细]{@link http://iclient.supermap.io/web/introduction/leafletDevelop.html#multiProjection}
 * @param {(Array.<number>|L.Point)} [options.origin] - 原点。
 * @param {Array.<number>} [options.scales] - 比例尺数组。
 * @param {Array.<number>} [options.scaleDenominators] - 比例尺分母数组。
 * @param {Array.<number>} [options.resolutions] - 分辨率数组。
 * @param {(Array.<number>|L.Bounds)} [options.bounds] - 范围。
 * @param {number} [options.dpi=96] - dpi。
 * @example
 *    var crs =L.Proj.CRS("EPSG:4326",{
 *          origin: [-180,90],
 *          scaleDenominators: [2000,1000,500,200,100,50,20,10],
 *    });
 *    var map=L.map('map', {
 *       crs: crs
 *      ...
 *    })
 */
var CRS = L.Class.extend({
    includes: L.CRS,

    options: {
        transformation: new L.Transformation(1, 0, -1, 0)
    },

    initialize: function (srsCode, options) {
        var code, proj, def;

        if (L.Proj._isProj4Obj(srsCode)) {
            proj = srsCode;
            code = proj.srsCode;
            options = options || {};

            this.projection = new L.Proj.Projection(proj, options.bounds);
        } else {
            code = srsCode;
            options = options || {};
            def = options.def || '';
            this.projection = new L.Proj.Projection(code, def, options.bounds);
        }

        L.Util.setOptions(this, options);
        this.code = code;
        this.transformation = this.options.transformation;
        this.options.dpi=this.options.dpi||96;
        if (this.options.bounds) {
            this.options.bounds = L.bounds(this.options.bounds);
        }
        if (!this.options.origin && this.options.bounds) {
            this.options.origin = [this.options.bounds.min.x, this.options.bounds.max.y];
        }
        if (this.options.origin) {
            if (this.options.origin instanceof L.Point) {
                this.options.origin = [this.options.origin.x, this.options.origin.y];
            }
            this.transformation =
                new L.Transformation(1, -this.options.origin[0], -1, this.options.origin[1]);
        }

        if (this.options.scales && this.options.scales.length > 0) {
            this.scales = this.options.scales;
            this._scales = this._toProj4Scales(this.options.scales, this.options.dpi);
        } else if (this.options.scaleDenominators && this.options.scaleDenominators.length > 0) {
            this.scales = [];
            for (let i = 0; i < this.options.scaleDenominators.length; i++) {
                this.scales[i] = 1 / this.options.scaleDenominators[i];
            }
            this._scales = this._toProj4Scales(this.scales, this.options.dpi);
        } else if (this.options.resolutions && this.options.resolutions.length > 0) {
            this._scales = [];
            for (let i = this.options.resolutions.length - 1; i >= 0; i--) {
                if (this.options.resolutions[i]) {
                    this._scales[i] = 1 / this.options.resolutions[i];
                }
            }
        } else if (this.options.bounds) {
            this._scales = this._getDefaultProj4ScalesByBounds(this.options.bounds);
        }
        this._rectify();
        this.infinite = !this.options.bounds;

    },
    _rectify: function () {
        if (this._scales) {
            if (!this.resolutions) {
                this.resolutions = [];
                this.resolutions = this._proj4ScalesToResolutions(this._scales);
            }
            if (!this.scales) {
                this.scales = [];
                for (let i = 0; i < this.resolutions.length; i++) {
                    var scaleD = this.resolutions[i] * this.options.dpi * (1 / 0.0254) * this._getMeterPerMapUnit(this.projection.getUnits());
                    this.scales[i] = 1.0 / scaleD;
                }
            }
        }
    },
    /**
     * @function L.Proj.CRS.prototype.scale
     * @description 通过缩放级别获取比例尺值。
     * @param {number} zoom - 缩放级别。
     * @returns 比例尺值。
     */
    scale: function (zoom) {
        var iZoom = Math.floor(zoom),
            baseScale,
            nextScale,
            scaleDiff,
            zDiff;
        if (zoom === iZoom) {
            return this._scales[zoom];
        } else {
            // Non-integer zoom, interpolate
            baseScale = this._scales[iZoom];
            nextScale = this._scales[iZoom + 1];
            scaleDiff = nextScale - baseScale;
            zDiff = (zoom - iZoom);
            return baseScale + scaleDiff * zDiff;
        }
    },

    /**
     * @function L.Proj.CRS.prototype.zoom
     * @description 根据比例尺返回缩放级别。
     * @param {number} scale - 比例尺。
     * @returns {number} 缩放级别。
     */
    zoom: function (scale) {
        // Find closest number in this._scales, down
        var downScale = this._closestElement(this._scales, scale),
            downZoom = this._scales.indexOf(downScale),
            nextScale,
            nextZoom,
            scaleDiff;
        // Check if scale is downScale => return array index
        if (scale === downScale) {
            return downZoom;
        }
        // Interpolate
        nextZoom = downZoom + 1;
        nextScale = this._scales[nextZoom];
        if (nextScale === undefined) {
            return Infinity;
        }
        scaleDiff = nextScale - downScale;
        return (scale - downScale) / scaleDiff + downZoom;
    },

    distance: L.CRS.Earth.distance,

    R: L.CRS.Earth.R,

    /* Get the closest lowest element in an array */
    _closestElement: function (array, element) {
        var low;
        for (var i = array.length; i--;) {
            if (array[i] <= element && (low === undefined || low < array[i])) {
                low = array[i];
            }
        }
        return low;
    },
    _proj4ScalesToResolutions(_scales) {
        var resolutions = [];
        if (!_scales) {
            return resolutions;
        }
        for (var i = 0; i < _scales.length; i++) {
            resolutions[i] = 1.0 / _scales[i];
        }
        return resolutions;

    },
    _toProj4Scales: function (scales, dpi) {
        var proj4Scales = [];
        if (!scales) {
            return proj4Scales;
        }
        for (var i = 0; i < scales.length; i++) {
            var a = this.projection ? this._getMeterPerMapUnit(this.projection.getUnits()) : 1;
            proj4Scales[i] = 1 / (0.0254 / ((dpi || 96) * scales[i]) / a);
        }
        return proj4Scales;
    },
    _getMeterPerMapUnit: function (mapUnit) {
        var earchRadiusInMeters = 6378137;
        var meterPerMapUnit = 1;
        if (mapUnit === "meter") {
            meterPerMapUnit = 1;
        } else if (mapUnit === "degrees") {
            // 每度表示多少米。
            meterPerMapUnit = Math.PI * 2 * earchRadiusInMeters / 360;
        } else if (mapUnit === "kilometer") {
            meterPerMapUnit = 1.0E-3;
        } else if (mapUnit === "inch") {
            meterPerMapUnit = 1 / 2.5399999918E-2;
        } else if (mapUnit === "feet") {
            meterPerMapUnit = 0.3048;
        }
        return meterPerMapUnit;
    },
    _getDefaultProj4ScalesByBounds: function (bounds) {
        if (!bounds) {
            return [];
        }
        var boundsSize = bounds.getSize();
        var extendsSize = Math.max(boundsSize.x, boundsSize.y);
        var resolution = extendsSize / 256;
        var scales = [];
        var maxZoom = 23;
        for (var i = 0; i < maxZoom; i++) {
            scales[i] = Math.pow(2, i) / resolution;
        }
        return scales;
    }
});
var crs = function (srsCode, options) {
    return new CRS(srsCode, options)
};
L.Proj.CRS = crs;

/* Copyright© 2000 - 2019 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html.*/
/**
 * attribution版权相关配置
 */

var Attributions = {

    Prefix: "<a href='http://leafletjs.com' title='A JS library for interactive maps'>Leaflet</a><span>© <a href='http://iclient.supermap.io' title='SuperMap iClient' target='_blank'>SuperMap iClient</a></span>",

    Common: {
        attribution: "Map Data <span>© <a href='http://support.supermap.com.cn/product/iServer.aspx' title='SuperMap iServer' target='_blank'>SuperMap iServer</a></span>"
    },

    Online: {
        attribution: "Map Data <span>© <a href='http://www.supermapol.com' title='SuperMap Online' target='_blank'>SuperMap Online</a></span>"
    },

    ECharts: {
        attribution: "© 2018 百度 ECharts"
    },

    MapV: {
        attribution: "© 2018 百度 MapV"
    },

    Turf: {
        attribution: "<span>© <a href='http://turfjs.org/' title='turfjs' target='_blank'>turfjs</a></span>"
    },

    Baidu: {
        attribution: "Map Data © 2018 Baidu - GS(2016)2089号 - Data © 长地万方"
    },

    Cloud: {
        attribution: "Map Data ©2014 SuperMap - GS(2014)6070号-data©Navinfo"
    },

    Tianditu: {
        attribution: "Map Data <a href='http://www.tianditu.com' target='_blank'><img style='background-color:transparent;bottom:2px;opacity:1;' src='http://api.tianditu.com/img/map/logo.png' width='53px' height='22px' opacity='0'></a>"
    }
};
/* Copyright© 2000 - 2019 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html.*/
/**
 * @namespace L
 * @category BaseTypes Namespace
 */
/**
 * @namespace L.supermap
 * @category BaseTypes Namespace
 */
/**
 * SuperMap Leaflet基类
 * 定义命名空间
 * 提供公共模块
 */

L.supermap = L.supermap || {};
L.supermap.control = L.supermap.control || {};
L.supermap.widgets = L.supermap.widgets || {};

L.Control.Attribution.include({
    options: {
        position: 'bottomright',
        prefix: Attributions.Prefix
    }
});


function wrapToGeoJSON(objClassArray) {
    objClassArray.map((objClass) => {
        objClass.defaultFunction = objClass.prototype.toGeoJSON;
        objClass.include({
            toGeoJSON: function (precision) {
                return objClass.defaultFunction.call(this, precision || 10);
            }
        })
        return objClass;
    })
}

wrapToGeoJSON([L.Polyline, L.Polygon, L.Marker, L.CircleMarker, L.Circle, L.LayerGroup]);
/* Copyright© 2000 - 2019 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html.*/

/**
 * @name L.CRS.BaiduCRS
 * @description 百度的坐标对象。
 * @namespace
 * @category BaseTypes Projection
 */
var BaiduCRS = L.CRS.Baidu = L.extend({}, L.CRS.EPSG3857, {
    code: 'Baidu',
    scale: function (zoom) {
        return (6378137 * Math.PI * 2) / Math.pow(2, 18 - zoom);
    },

    transformation: (function () {
        var scale = 0.5 / (Math.PI * 6378137);
        return new L.Transformation(scale, 0, -scale, 0);
    }())
});

var tdt_WGS84_resolutions = [];

for (var i = 1; i < 19; i++) {
    tdt_WGS84_resolutions.push(0.703125 * 2 / (Math.pow(2, i)));
}

/**
 * @name L.CRS.TianDiTu_WGS84CRS
 * @description 天地图 WGS84 坐标对象。
 * @namespace
 * @category BaseTypes Projection
 */
var TianDiTu_WGS84CRS = L.CRS.TianDiTu_WGS84 = L.Proj.CRS("EPSG:4326",{
    origin: [-180, 90],
    resolutions: tdt_WGS84_resolutions,
    bounds: L.bounds([-180, -90], [180, 90])
});

var tdt_Mercator_resolutions = [];
for (var i = 1; i < 19; i++) {
    tdt_Mercator_resolutions.push(78271.5169640203125 * 2 / (Math.pow(2, i)));
}

/**
 * @name L.CRS.TianDiTu_MercatorCRS
 * @description 天地图墨卡托坐标对象。
 * @category BaseTypes Projection
 * @namespace
 */
var TianDiTu_MercatorCRS = L.CRS.TianDiTu_Mercator = L.Proj.CRS("EPSG:3857",{
    origin: [-20037508.3427892, 20037508.3427892],
    resolutions: tdt_Mercator_resolutions,
    bounds: L.bounds([-20037508.3427892, -20037508.3427892], [20037508.3427892, 20037508.3427892])
});
L.CRS.BaiduCRS = BaiduCRS;
L.CRS.TianDiTu_WGS84CRS = TianDiTu_WGS84CRS;
L.CRS.TianDiTu_MercatorCRS = TianDiTu_MercatorCRS;

/* Copyright© 2000 - 2019 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html.*/

L.Projection = {};

/**
 * @private
 * @class L.Projection.NonProjection
 * @classdesc 平面无投影对象。
 * @category BaseTypes Projection
 * @extends {L.Class}
 * @param {L.bounds} bounds - 坐标范围
 */
var NonProjection = L.Class.extend({

    initialize: function (bounds) {
        this.bounds = bounds;
    },

    project: function (latlng) {
        return new L.Point(latlng.lng, latlng.lat);
    },

    unproject: function (point) {
        return new L.LatLng(point.y, point.x);
    }
});

var nonProjection = function (bounds) {
    return new NonProjection(bounds)
};

/**
 * @class L.CRS.NonEarthCRS
 * @classdesc 平面无投影坐标类。
 * @category BaseTypes Projection
 * @extends {L.Class}
 * @param {Object} options - 构建平面无投影坐标对象参数。
 * @param {Object} options.origin - 原点。
 * @param {L.bounds} options.bounds - 范围。
 * @param {Array.<number>} [options.resolutions] - 分辨率。
 */
var NonEarthCRS = L.Class.extend({

    /** 
     * @member {Object} [L.CRS.NonEarthCRS.prototype.includes=L.CRS]
     * @description 包含的坐标对象。
     */
    includes: L.CRS,

    initialize: function (options) {
        if (options.origin) {
            this.transformation =
                new L.Transformation(1, -options.origin.x,
                    -1, options.origin.y);
        }
        this.projection = L.Projection.NonProjection(options.bounds);
        this.bounds = options.bounds;
        this.origin = options.origin;
        this.resolutions = options.resolutions;
    },

    /**
     * @function L.CRS.NonEarthCRS.prototype.scale
     * @description 通过缩放级别计算比例尺。
     * @param {number} zoom - 缩放级别。
     * @returns {number} 得到的比例尺。
     */
    scale: function (zoom) {
        if (!this.resolutions || this.resolutions.length === 0) {
            var width = Math.max(this.bounds.getSize().x, this.bounds.getSize().y);
            var defaultScale = 1.0 / (width / 256);
            return defaultScale * Math.pow(2, zoom);
        }
        return 1.0 / this.resolutions[zoom];
    },

    /**
     * @function L.CRS.NonEarthCRS.prototype.zoom
     * @description 通过比例尺计算范围。
     * @param {number} scale - 比例尺。
     * @returns {number} 返回空间范围值。
     */
    zoom: function (scale) {
        if (!this.resolutions || this.resolutions.length === 0) {
            var width = Math.max(this.bounds.getSize().x, this.bounds.getSize().y);
            var defaultScale = 1 / (width / 256);
            return  Math.log(scale / defaultScale) / Math.LN2;
        }
        for (var i = 0; i < this.resolutions.length; i++) {
            if (1.0 / this.resolutions[i] == scale) {
                return i
            }
        }
        return -1;
    },

    /**
     * @function L.CRS.NonEarthCRS.prototype.distance
     * @description 通过两个坐标点计算之间的距离。
     * @param {L.latLng} latlng1 - 坐标点1。
     * @param {L.latLng} latlng2 - 坐标点2。
     * @returns {number} 返回距离长度。
     */
    distance: function (latlng1, latlng2) {
        var dx = latlng2.lng - latlng1.lng,
            dy = latlng2.lat - latlng1.lat;

        return Math.sqrt(dx * dx + dy * dy);
    },

    infinite: false
});
var nonEarthCRS = function (options) {
    return new NonEarthCRS(options)
};
L.Projection.NonProjection = nonProjection;

L.CRS.NonEarthCRS = nonEarthCRS;

/* Copyright© 2000 - 2019 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html.*/

/**
 * @class L.supermap.echartsLayer
 * @classdesc 百度 ECharts 图层类。
 * @category  Visualization ECharts
 * @extends {L.Layer}
 * @param {Object} echartsOptions - 图表参数。
 * @param {Object} options - 可选图层参数。
 * @param {boolean} [options.loadWhileAnimating=false] - 是否在移动时实时绘制。
 * @param {string} [options.attribution='© 2018 百度 ECharts'] - 版权信息。
 */
var EchartsLayer = L.Layer.extend({

    includes: [],
    _echartsContainer: null,
    _map: null,
    _ec: null,
    _resizeHandler : null,
    _echartsOptions: null,

    options: {
        attribution: Attributions.ECharts.attribution,
        loadWhileAnimating: false
    },

    initialize: function (echartsOptions, options) {
        L.Util.setOptions(this, options);
        this.setOption(echartsOptions);
    },
    /**
     * @function L.supermap.echartsLayer.prototype.setOption
     * @description 设置图表地图参数。
     * @param {Object} echartsOptions - 图表参数。
     * @param {string} lazyUpdate - 后台自动更新。
     * @param {boolean} [notMerge] - 是否合并参数。
     */
    setOption: function (echartsOptions, notMerge, lazyUpdate) {
        const baseOption = echartsOptions.baseOption || echartsOptions;
        baseOption.LeafletMap = baseOption.LeafletMap || {
            roam: true
        };
        baseOption.animation = baseOption.animation === true;
        this._echartsOptions = echartsOptions;
        this._ec && this._ec.setOption(echartsOptions, notMerge, lazyUpdate);
    },
    getEcharts: function () {
        return this._ec;
    },
    _disableEchartsContainer: function () {
        this._echartsContainer.style.visibility = "hidden";
    },
    _enableEchartsContainer: function () {
        this._echartsContainer.style.visibility = "visible";
    },

    /**
     * @private
     * @function L.supermap.echartsLayer.prototype.onAdd
     * @description 添加地图。
     * @param {L.Map} map - 待添加的地图。
     */
    onAdd: function (map) {
        this._map = map;
        this._initEchartsContainer();
        this._ec = echarts.init(this._echartsContainer);
        echarts.leafletMap = map;
        const me = this;
        map.on("zoomstart", function () {
            me._disableEchartsContainer();
        });
        !me.options.loadWhileAnimating && map.on("movestart", function () {
            me._disableEchartsContainer();
        });
        echarts.registerAction({
            type: 'LeafletMapLayout',
            event: 'LeafletMapLayout',
            update: 'updateLayout'
        }, function (payload, ecModel) { // eslint-disable-line no-unused-vars

        });
        echarts.registerCoordinateSystem(
            'leaflet', LeafletMapCoordSys
        );
        echarts.extendComponentModel({
            type: 'LeafletMap',
            getBMap: function () {
                return this.__LeafletMap;
            },
            defaultOption: {
                roam: false
            }
        });
        echarts.extendComponentView({
            type: 'LeafletMap',
            render: function (LeafletMapModel, ecModel, api) {
                let rendering = true;
                const leafletMap = echarts.leafletMap;
                const viewportRoot = api.getZr().painter.getViewportRoot();

                const animated = leafletMap.options.zoomAnimation && L.Browser.any3d;
                viewportRoot.className = ' leaflet-layer leaflet-zoom-' + (animated ? 'animated' : 'hide') + ' echarts-layer';

                const originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']);
                viewportRoot.style[originProp] = '50% 50%';

                const coordSys = LeafletMapModel.coordinateSystem;

                const ecLayers = api.getZr().painter.getLayers();

                const moveHandler = function () {
                    if (rendering) {
                        return;
                    }
                    const offset = me._map.containerPointToLayerPoint([0, 0]);
                    const mapOffset = [offset.x || 0, offset.y || 0];
                    viewportRoot.style.left = mapOffset[0] + 'px';
                    viewportRoot.style.top = mapOffset[1] + 'px';

                    if (!me.options.loadWhileAnimating) {
                        for (var item in ecLayers) {
                            if (!ecLayers.hasOwnProperty(item)) {
                                continue;
                            }
                            ecLayers[item] && clearContext(ecLayers[item].ctx);
                        }
                        me._enableEchartsContainer();
                    }
                    coordSys.setMapOffset(mapOffset);
                    LeafletMapModel.__mapOffset = mapOffset;

                    api.dispatchAction({
                        type: 'LeafletMapLayout'
                    });


                };

                function clearContext(context) {
                    context && context.clearRect && context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                }

                function zoomEndHandler() {
                    if (rendering) {
                        return;
                    }

                    api.dispatchAction({
                        type: 'LeafletMapLayout'
                    });
                    me._enableEchartsContainer();
                }

                if (me._oldMoveHandler) {
                    leafletMap.off(me.options.loadWhileAnimating ? 'move' : 'moveend', me._oldMoveHandler);
                }
                if (me._oldZoomEndHandler) {
                    leafletMap.off('zoomend', me._oldZoomEndHandler);

                }

                leafletMap.on(me.options.loadWhileAnimating ? 'move' : 'moveend', moveHandler);
                leafletMap.on('zoomend', zoomEndHandler);
                me._oldMoveHandler = moveHandler;
                me._oldZoomEndHandler = zoomEndHandler;
                rendering = false;
            }
        });
        this._ec.setOption(this._echartsOptions);
    },

    onRemove: function () {
        // 销毁echarts实例
        this._ec.clear();
        this._ec.dispose();
        delete this._ec;
        L.DomUtil.remove(this._echartsContainer);
        
        if (this._oldZoomEndHandler) {
            this._map.off("zoomend", this._oldZoomEndHandler);
            this._oldZoomEndHandler = null;
        }
        if (this._oldMoveHandler) {
            this._map.off(this.options.loadWhileAnimating ? 'move' : 'moveend', this._oldMoveHandler);
            this._oldMoveHandler = null;
        }
        if (this._resizeHandler) {
            this._map.off('resize', this._resizeHandler);
            this._resizeHandler = null;
        }
        delete this._map;
    },

    _initEchartsContainer: function () {
        const size = this._map.getSize();

        const _div = document.createElement('div');
        _div.style.position = 'absolute';
        _div.style.height = size.y + 'px';
        _div.style.width = size.x + 'px';
        _div.style.zIndex = 10;
        this._echartsContainer = _div;

        this._map.getPanes().overlayPane.appendChild(this._echartsContainer);
        const me = this;

        function _resizeHandler(e) {
            let size = e ? e.newSize : this._map._size;
            me._echartsContainer.style.width = size.x + 'px';
            me._echartsContainer.style.height = size.y + 'px';
            me._ec.resize();
        }

        this._map.on('resize', _resizeHandler);
        this._resizeHandler = _resizeHandler
    }

});

/**
 * @class L.supermap.LeafletMapCoordSys
 * @private
 * @classdesc 地图坐标系统类。
 * @param {L.Map} leafletMap - 地图。
 */
function LeafletMapCoordSys(leafletMap) {
    this._LeafletMap = leafletMap;
    this.dimensions = ['lng', 'lat'];
    this._mapOffset = [0, 0];
}

LeafletMapCoordSys.prototype.dimensions = ['lng', 'lat'];

LeafletMapCoordSys.prototype.setMapOffset = function (mapOffset) {
    this._mapOffset = mapOffset
};

LeafletMapCoordSys.prototype.getBMap = function () {
    return this._LeafletMap
};

LeafletMapCoordSys.prototype.prepareCustoms = function () {
    const zrUtil = echarts.util;

    const rect = this.getViewRect();
    return {
        coordSys: {
            // The name exposed to user is always 'cartesian2d' but not 'grid'.
            type: 'leaflet',
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
        },
        api: {
            coord: zrUtil.bind(this.dataToPoint, this),
            size: zrUtil.bind(dataToCoordSize, this)
        }
    };

    function dataToCoordSize(dataSize, dataItem) {
        dataItem = dataItem || [0, 0];
        return zrUtil.map([0, 1], function (dimIdx) {
            const val = dataItem[dimIdx];
            const halfSize = dataSize[dimIdx] / 2;
            const p1 = [];
            const p2 = [];
            p1[dimIdx] = val - halfSize;
            p2[dimIdx] = val + halfSize;
            p1[1 - dimIdx] = p2[1 - dimIdx] = dataItem[1 - dimIdx];
            return Math.abs(this.dataToPoint(p1)[dimIdx] - this.dataToPoint(p2)[dimIdx]);
        }, this);
    }
};

LeafletMapCoordSys.prototype.dataToPoint = function (data) {
    //处理数据中的null值
    if (data[1] === null) {
        data[1] = L.CRS.EPSG3857.projection.MAX_LATITUDE;
    }
    //平面坐标系不能这么处理
    //data[1] = this.fixLat(data[1]);

    const px = this._LeafletMap.latLngToLayerPoint([data[1], data[0]]);

    const mapOffset = this._mapOffset;
    return [px.x - mapOffset[0], px.y - mapOffset[1]];
};

LeafletMapCoordSys.prototype.fixLat = function (lat) {
    if (lat >= 90) {
        return 89.99999999999999;
    }
    if (lat <= -90) {
        return -89.99999999999999;
    }
    return lat;
};

LeafletMapCoordSys.prototype.pointToData = function (pt) {
    let mapOffset = this._mapOffset;
    let point = this._LeafletMap.layerPointToLatLng([pt[0] + mapOffset[0], pt[1] + mapOffset[1]]);
    return [point.lng, point.lat];
};

LeafletMapCoordSys.prototype.getViewRect = function () {
    const size = this._LeafletMap.getSize();
    return new echarts.graphic.BoundingRect(0, 0, size.x, size.y);
};

LeafletMapCoordSys.prototype.getRoamTransform = function () {
    return echarts.matrix.create();
};
LeafletMapCoordSys.dimensions = LeafletMapCoordSys.prototype.dimensions;

LeafletMapCoordSys.create = function (ecModel) {
    let coordSys;

    ecModel.eachComponent('LeafletMap', function (leafletMapModel) {
        if (!coordSys) {
            coordSys = new LeafletMapCoordSys(echarts.leafletMap);
        }
        leafletMapModel.coordinateSystem = coordSys;
        leafletMapModel.coordinateSystem.setMapOffset(leafletMapModel.__mapOffset || [0, 0]);
    });
    ecModel.eachSeries(function (seriesModel) {
        if (!seriesModel.get('coordinateSystem') || seriesModel.get('coordinateSystem') === 'leaflet') {
            if (!coordSys) {
                coordSys = new LeafletMapCoordSys(echarts.leafletMap);
            }
            seriesModel.coordinateSystem = coordSys;
            seriesModel.animation = seriesModel.animation === true;
        }
    })
};
var echartsLayer = function (echartsOptions, options) {
    return new EchartsLayer(echartsOptions, options);
};

L.supermap.echartsLayer = echartsLayer;