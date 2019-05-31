//全局变量
var map = null;
var basemaps = [] ;//底图
var osm ;//openStreetMap
var tiles ;//tileLayer
var leafletView = null ;//聚合图
var heatMapLayer = null; //热力图
var windowInterval = null;
var printer = null ;
var config = {};
var drawnItems; //标注要素图层
var drawTool ;//绘制工具
var poiLayers ; // 数据查询
var searchControl ;//业务数据搜索的工具
var placeSearchControl ;//地名数据搜索的工具
var superHeatMapLayer ;// 
var liveRenderer ;//
var liveDataSet ;//
var liveLayerOption ;//
var bufferState = false ;//缓冲区分析的状态值
var bufferFeature ;//当前缓冲分析的要素
var pagingData ;//分页数据
var bufferGeo ;//缓冲后的geojson
var plotLayer ;//常用标绘图层   小图标啥的
var realtimeWidget ;//实时数据展示控件
var overlayMaps = {}; //全局图层对象声明
var MapSearchControl = null;
var echartsLegend = null; 
var windowControl = null ;//弹出框
var editLayer = null;
var editGeoJson = null;
var spaceMaintenance = false;

/**
 * 初始化地图组件
 * @param {json} data 
 */
function initMap(data){
    config = data;
    var online = networkPort();
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    osm = new L.TileLayer(osmUrl, {minZoom: 5, maxZoom: 18});

    //创建地图组件
    map = new L.Map('map' ,{
        editable: true,
        zoomControl: false ,//缩放控件
        attributionControl : false,//属性控件
        contextmenu: false,
        contextmenuWidth: 140,
        contextmenuItems: [{
            text: 'Center',
            callback: function(){}
        }]
    });
    for(var i = 0 ; i < config.tiledLayers.length ; i ++){
    	if(online){
            new L.tileLayer(config.tiledLayers[i].pathOnLine1, {
                label : config.tiledLayers[i].label,
                maxZoom : config.tiledLayers[i].maxZoom,
                minZoom : config.tiledLayers[i].minZoom,
                errorTileUrl : config.errorTileUrl,
                visible : config.tiledLayers[i].visible
            }).addTo(map);
        }
        tiles = new L.tileLayer(online?config.tiledLayers[i].pathOnLine:config.tiledLayers[i].path, {
            label : config.tiledLayers[i].label,
            maxZoom : config.tiledLayers[i].maxZoom,
            minZoom : config.tiledLayers[i].minZoom,
            errorTileUrl : config.errorTileUrl,
            visible : config.tiledLayers[i].visible
        }).addTo(map);
        basemaps.push(tiles);
    }
    //书签
    //if (!map.restoreView()) {
    map.setView(config.center, config.zoom);
    //}
    drawnItems = L.featureGroup();
    map.addLayer(drawnItems);
    attributionControl();
    zoomControl();
    fullscreenControl();
    measureControl();
    scaleControl();
    navbarControl();
    mousePositioControl();
    printerControl();
    magnifyingGlassControl();
    getBusinessData();
    miniMapControl();
    basemapsControl();
    initMenu(config.menuList);
    clearEasyButton();
    stepLoadScripts();
}

//请求配置文件
function getConfig (){
    sendAjax("config/config.json","GET",initMap);
}

/**
 * 底图快捷切换工具
 */
function basemapsControl(){
    config.basemapsControl ? L.control.basemaps({
        basemaps: basemaps,
        tileX: 0,
        tileY: 0,
        tileZ: 1
    }).addTo(map) : null;
}

/**
 * 比例尺
 */
function scaleControl(){
    config.scaleControl ? L.control.scale({
        imperial : false , 
        position : config.scalePosition
    }).addTo(map) : null;
}

/**
 * 平移
 */
function panControl(){
    L.control.pan().addTo(map);
}

/**
 * 缩放
 */
function zoomControl(){
    //L.control.zoom().addTo(map);
    config.zoomControl ? L.control.slider({
        map : map,
        position : config.zoomPosition,
        countryLevel : config.zoomLevel.countryLevel,
        provinceLevel : config.zoomLevel.provinceLevel,
        cityLevel : config.zoomLevel.cityLevel ,
        streetLevel : config.zoomLevel.streetLevel
    }) : null;
}

/**
 * 漫游记忆
 */
function navbarControl(){
    config.navbarControl ? L.control.navbar({
        position : config.navbarPosition
    }).addTo(map) : null;
}

/**
 * 鼠标信息
 */
function mousePositioControl(){
    config.mousePositionControl ? L.control.mousePosition({
        lngFirst : true,
        position : config.mousePosition,
        numDigits : 6
    }).addTo(map) : null;
}

/**
 * 打印
 */
function printerControl(){
    config.printerControl ? printer = L.easyPrint({
        tileLayer: tiles,
        sizeModes: ['Current'],
        filename: 'myMap',
        exportOnly: true,
        hideControlContainer: true,
        position : config.printerPosition
    }).addTo(map) : null;
}

/**
 * 执行打印
 */
function manualPrint() {
    printer.printMap('CurrentSize', 'MyManualPrint');
}

/**
 * 属性信息
 */
function attributionControl(){
    config.attributionControl ? L.control.attribution({
        "prefix" : "<a href='" + config.attribute.link + "' title='" + config.attribute.title + "' target='_blank'>" + config.attribute.name + "</a>"
    }).addTo(map) : null;
}

/**
 * 鹰眼图
 */
function miniMapControl() {
    if(!config.miniMapControl) return
    var miniMap = new L.Control.MiniMap(osm, { toggleDisplay: true }).addTo(map);
    miniMap.on("toggle", function(data) {
    });
    miniMap.on("minimize", function() {
    });
    miniMap.on("restore", function() {
    });
    var actionButton = new (L.Control.extend({
        options: {
            position: config.miniMapPosition,
            html: "#",
            toggleClass: "toggle",
            status: true,
            listeners: []
        },
        initialize: function (options) {
            L.setOptions(this, options);
            this._status = this.options.status;
        },
        onAdd: function () {
            var container = L.DomUtil.create('div', 'leaflet-control-actionbtn leaflet-bar leaflet-control');
            var link = this._link = L.DomUtil.create('a', '', container);
            link.href = '#';
            link.innerHTML = this.options.html;
            link.title = this.options.title || this.options.html;
            L.DomEvent.on(link, 'click', this._onBtnClick, this);
            if (this.options.status) {
                this._toggle();
            }
            this._addListeners();
            return container;
        },
        toggle: function () {
            this._toggle();
            if (this.options.action) {
                this._removeListeners();
                this._forListeners(null, function (listener) {
                    listener[0].once(listener[1], this._addListeners, this);
                });
                this.options.action.call(this, this._status);
            }
        },
        _toggle: function () {
            this._status = !this._status;
            if (!this._status) {
                L.DomUtil.addClass(this._link, this.options.toggleClass);
            } else {
                L.DomUtil.removeClass(this._link, this.options.toggleClass);
            }
        },
        _addListeners: function () {
            this._forListeners();
        },
        _removeListeners: function () {
            this._forListeners(true);
        },
        _forListeners: function (off, func) {
            if (this.options.listeners.length) {
                for (var fry = 0; fry < this.options.listeners.length; fry++) {
                    var listener = this.options.listeners[fry];
                    var action = listener[0] && listener[0][off ? "off" : "on"];
                    if (action && typeof listener[1] === 'string') {
                        if (func) {
                            func.call(this, listener);
                        } else {
                            action.call(listener[0], listener[1], this._toggle, this);
                        }
                    }
                }
            }
        },
        _onBtnClick: function (e) {
            L.DomEvent.stop(e);
            this.toggle();
        }
    }))({
        action: function() { miniMap._toggleDisplayButtonClicked(); },
        status: !miniMap._minimized,
        html: "MINI",
        listeners: [[miniMap, "toggle"]]
    });
    miniMap._toggleDisplayButtonClicked();//收起
    actionButton.addTo(map);
}

/**
 * 放大镜
 */
function magnifyingGlassControl() {
    if(!config.magnifyingGlassControl) return
    L.Control.MagnifyingGlass = L.Control.extend({
        _magnifyingGlass: false,
        options: {
            position: config.magnifyingGlassPosition,
            title: '放大镜',
            forceSeparateButton: false
        },
        initialize: function (magnifyingGlass, options) {
            this._magnifyingGlass = magnifyingGlass;
            for (var i in options) if (options.hasOwnProperty(i) && this.options.hasOwnProperty(i)) this.options[i] = options[i];
        },
        onAdd: function (map) {
            var className = 'leaflet-control-magnifying-glass', container;
            if (map.zoomControl && !this.options.forceSeparateButton) container = map.zoomControl._container;
            else container = L.DomUtil.create('div', 'leaflet-bar');
            this._createButton(this.options.title, className, container, this._clicked, map, this._magnifyingGlass);
            return container;
        },
        _createButton: function (title, className, container, method, map, magnifyingGlass) {
            var link = L.DomUtil.create('a', className, container);
            link.href = '#';
            link.title = title;
            L.DomEvent
            .addListener(link, 'click', L.DomEvent.stopPropagation)
            .addListener(link, 'click', L.DomEvent.preventDefault)
            .addListener(link, 'click', function() {method(map, magnifyingGlass);}, map);
            return link;
        },
        _clicked: function (map, magnifyingGlass) {
            if (!magnifyingGlass) return
            if (map.hasLayer(magnifyingGlass)) map.removeLayer(magnifyingGlass);
            else magnifyingGlass.addTo(map);
        }
    });
    
    L.control.magnifyingglass = function (magnifyingGlass, options) {
        return new L.Control.MagnifyingGlass(magnifyingGlass, options);
    };
    var magnifyingGlass = L.magnifyingGlass({
        zoomOffset: 3,
        layers: osm
    });
    L.control.magnifyingglass(magnifyingGlass, {
        forceSeparateButton: true
    }).addTo(map);
}

/**
 * 全屏
 */
function fullscreenControl(){
    config.fullscreenControl ? L.control.fullscreen({
        position : config.fullscreenPosition,
        title : "全屏浏览",
        titleCancel : "退出全屏"
    }).addTo(map) : null;
}

/**
 * 测量
 */
function measureControl(){
	config.measureControl ? L.control.measure({
        position : config.measurePosition
    }).addTo(map) : null;
}

/**
 * 初始化菜单
 * @param [] results 
 */
function initMenu(results) {
    var pageSize = windowSize();
    $("#videoDock")[0].style.top = (pageSize.pageHeight - 100) + "px";
    if (results == null && results.length == 0) return
    var content = "";
    content += "<div id='slider1'> <a class='buttons prev' href='#'>left</a>  ";
    content += "<div class='viewport'>";
    content += "<ul class='overview'>";
    for (var i = 0; i < results.length; i++) {
        content += "<li onclick='menuClick(" + results[i]["menuId"] + ")'><img src='images/appleToolbar/" + results[i]["img"] + "' alt='" + results[i]["name"] + "' /><span>" + results[i]["name"] + "</span></li>";
    }
    content += "</ul></div><a class='buttons next' href='#'>right</a></div>";
    $("#dockContainer")[0].innerHTML = content;
    $('#slider1').tinycarousel();
}

/**
 * 菜单点击事件
 */
function menuClick(menuId){
    bufferState = false;//缓冲区状态恢复
    if(windowControl){
    	map.removeControl(windowControl);
    	//windowControl.remove();
    	windowControl = null;
    }
    var html = "";
    switch(menuId){
        case 1 ://经纬度定位
            html += '<input id="jd" type="text" value="" placeholder="经度" class="form-control input-sm" style="width: 120px;margin-top: 3px;">';
            html += '<input id="wd" type="text" value="" placeholder="纬度" class="form-control input-sm" style="width: 120px;margin-top: 3px;">';
            html += '<input id="zoom" type="text" value="" placeholder="级别" class="form-control input-sm" style="width: 120px;margin-top: 3px;">';
            html += '</br><button type="button" class="btn btn-primary" onclick="centerAndZoom()">定位</button>';
            windowControl = L.control.window("map",{
                visible : true,
                title : "经纬度定位",
                content : html
            });
            break;
        case 12 ://poi地名查询
        	disposeMapSearch(1);
            break;
        case 3 ://数据查询
        	disposeMapSearch(2);
            break;
        case 2 ://行政区查询
        	disposeMapSearch(3);
            break;
        case 4 ://聚合
            html = '<select id="businessSelect" data-toggle="select" class="select-info mrs mbm select2-container form-control select " style="background-color: #007bff;color: white;">';
            html = getOptionsContent(html);
            html += '</select>';
            html += '<select id="typeSelect" data-toggle="select" class="select-info mrs mbm select2-container form-control select " style="background-color: #007bff;color: white;">';
            html += '<option>---请选择展现形式---</option><option value="1">点聚合</option><option value="2">网格图</option></select>';
            html += '<div href="#" id="size" style="display:none;">Cluster size: <input type="range" value="160" min="35" max="500" step="1" id="sizeInput"/><span id="currentSize">160</span></div>';
            html += '<button type="button" class="btn btn-primary" onclick="PruneClusterLayer()">聚合</button>';
            html += '<button type="button" class="btn btn-primary" onclick="clearPruneClusterLayer()" style="margin-left: 35px;">清除</button>';
            windowControl = L.control.window("map",{
                visible : true,
                title : "聚合分析",
                content : html
            });
            var currentSizeSpan = document.getElementById('currentSize');
            var updateSize = function () {
                currentSizeSpan.firstChild.data = this.value;
            };
            document.getElementById('sizeInput').onchange = updateSize;
            document.getElementById('sizeInput').oninput = updateSize;
            document.getElementById('typeSelect').onchange = function(e){
            	document.getElementById('size').style.display = document.getElementById('typeSelect').value == "1" ? "block" : "none";
            };
            break;
        case 5://热力图
            html = '<select id="businessSelect" data-toggle="select" class="select-info mrs mbm select2-container form-control select " style="background-color: #007bff;color: white;">';
            html = getOptionsContent(html);
            html += '</select>';
            html += '<button type="button" class="btn btn-primary" onclick="HeatLayer()">分析</button>';
            html += '<button type="button" class="btn btn-primary" onclick="clearHeatLayer()" style="margin-left: 35px;">清除</button>';
            windowControl = L.control.window("map",{
                visible : true,
                title : "热力分析",
                content : html
            });
            break;
        case 6 ://标注
            initDrawToolbar();
            break;
        case 7 ://缓冲区分析
            initDrawToolbar(true);
            bufferState = true;
            html = '<p id="bufferReminder">请先自绘制要素，然后点击进行缓冲区分析。</p>';
            html += '<select id="businessSelect" data-toggle="select" class="select-info mrs mbm select2-container form-control select " style="background-color: #007bff;color: white;">';
            html = getOptionsContent(html);
            html += '</select>';
            html += '要素：<input id="bufferItem" type="text" value="" placeholder="请选择要缓冲的要素" class="form-control input-sm" style="width: 190px;display: inline-block;"></br>';
            html += '半径：<input id="bufferValue" type="text" value="" placeholder="缓冲半径（仅支持数字类型）/米" class="form-control input-sm" style="margin-top: 5px;width: 190px;display: inline-block;margin-bottom: 5px;"></br>';
            html += '<button type="button" class="btn btn-primary" onclick="bufferTrigger()" style="margin-left: 35px;">缓冲</button>';
            html += '<button type="button" class="btn btn-primary" onclick="bufferAnalysisTrigger()" style="margin-left: 35px;">分析</button>';
            html += '<button type="button" class="btn btn-primary" onclick="clearbufferAnalysis()" style="margin-left: 35px;">清除</button>';
            html += '<div id="pageContainer" class="pageContainer" ><div class="infoContainer" id="infoContainer"></div><div id="paging" class="paging"></div></div>';
            windowControl = L.control.window("map",{
                visible : true,
                title : "缓冲区分析",
                content : html,
                //width : 600
            });
            break;
        case 8://Echarts图表
            initEchartsLayer() ; 
            break;
        case 9://网格分析
            //initGridLayer()  ;
            html = '<select id="businessSelect" data-toggle="select" class="select-info mrs mbm select2-container form-control select " style="background-color: #007bff;color: white;">';
            html = getOptionsContent(html);
            html += '</select>';
            html += '<button type="button" class="btn btn-primary" onclick="initGridLayer()">分析</button>';
            html += '<button type="button" class="btn btn-primary" onclick="clearGridLayer()" style="margin-left: 35px;">清除</button>';
            windowControl = L.control.window("map",{
                visible : true,
                title : "网格分析",
                content : html
            });
            break;
        case 10://实时数据展示
            initRealtimeWidget();
            break;
        case 11://统计上图
        	html = '<select id="businessSelect" data-toggle="select" class="select-info mrs mbm select2-container form-control select " style="background-color: #007bff;color: white;">';
            html = getOptionsContent(html);
            html += '</select>';
            html += '<select id="typeSelect" data-toggle="select" class="select-info mrs mbm select2-container form-control select " style="background-color: #007bff;color: white;">';
            html += '<option value="">---请选择展现形式---</option><option value="pie">饼状图</option><option value="bar">柱状图</option></select>';
            html += '<button type="button" class="btn btn-primary" id="picturedAboveBtn">上图</button>';
            html += '<button type="button" class="btn btn-primary" style="margin-left: 35px;" id="clearPicturedAboveBtn">清除</button>';
            windowControl = L.control.window("map",{
                visible : true,
                title : "统计上图",
                content : html
            });
            $("#picturedAboveBtn")[0].onclick = function(){
            	if(!$("#typeSelect")[0].value) alert("请选择展现形式");
            	else {
            		divIconEcharts(chartData,$("#typeSelect")[0].value,"统计上图");
            	}
            };
            $("#clearPicturedAboveBtn")[0].onclick = function(){
            	clearMap();
            };
        	//divIconEcharts(chartData,"pie","统计上图");
        	break;
        case 13 ://三维
        	window.open("http://ienc.123nat.com:18080/Cesium/index.html","Cesium");
        	break;
        case 14://全景展示
        	parent.layer.open({
				type: 2,
				title:'全景展示',
				maxmin:true,
				content: "/authentic/webgis/panorama.do?imgType="+imgType+"&fileId="+this.options.fileId,
				area: ['807px', '460px']
			});
            break;
        case 15://空间维护
            if(spaceMaintenance){
                spaceMaintenance = false;
                if(editLayer){
                    editLayer.disableEdit();
                }
            }else{
                spaceMaintenance = true;
                html = '请先点击需要维护的图层进行编辑后，点击下方保存按钮<br/>';
                html += '<button type="button" class="btn btn-primary" id="saveEditBtn" style="margin-top: 20px;margin-right:20px;">保存</button>';
                html += '<button type="button" class="btn btn-primary" id="" style="margin-top: 20px;">重置</button>';
                windowControl = L.control.window("map",{
                    visible : true,
                    title : "空间维护",
                    content : html
                });
                $("#saveEditBtn")[0].onclick = saveEdit;
            }
        	break;
        default:
            break;
    }
}

/**
 * 缩放到坐标
 * @param {*} x 
 * @param {*} y 
 * @param {*} zoom 
 */
function centerAndZoom(x,y,zoom){
    if(x && y && typeof(zoom) == "number"){
        map.setView([parseFloat(y),parseFloat(x)], parseInt(zoom));
        addPositionMarker(x,y);
    }else{
        var jd = $("#jd")[0].value;
        var wd = $("#wd")[0].value;
        var zoom = $("#zoom")[0].value;
        if(jd && wd && zoom) {
        	map.setView([parseFloat(wd),parseFloat(jd)], parseInt(zoom));
            addPositionMarker(jd,wd);
        }else alert("请输入正确的经纬度及缩放比例");
    }
}

/**
 * 添加定位图标
 * @param {*} x 
 * @param {*} y 
 */
function addPositionMarker(x,y){
    plotLayer.clearLayers();
    var myIcon = L.icon({
        iconUrl: config.positionImg,
        iconSize : config.positionImgSize
    });
    L.marker(L.latLng(y, x), {
        icon : myIcon
    }).addTo(plotLayer).bindTooltip("坐标：" + x + "," + y);
}

/**
 * 加载业务数据
 */
function getBusinessData(){
    overlayMaps = {"个人标注" : drawnItems};
    poiLayers = L.layerGroup();
    plotLayer = L.layerGroup();
    map.addLayer(plotLayer);
    for(var i = 0 ; i < config.businessData.length ; i ++){
    	var tooltip = config.businessData[i].tooltip ? config.businessData[i].tooltip : [];
        var geojsonOpts = {
            editable: true,
            tableName : config.businessData[i].xhrUrl.split("table=")[1].split("&")[0],
            layerName : config.businessData[i].name,
            pointToLayer : function(feature, latlng) {
                var myIcon = L.icon({
                    iconUrl: config.businessData[i].icon,
                    iconSize : config.businessData[i].iconSize,
                    popupAnchor : config.businessData[i].popupAnchor
                });
            	return L.marker(latlng, {
                    icon : myIcon
                });
            },
            onEachFeature : function(feature,layer){//遍历图层要素，适合添加点击事件或弹出框
                var str = "";
            	for (var int = 0; int < tooltip.length; int++) {
            		str += (int > 0 ? "</br>" : "") + tooltip[int].name + (tooltip[int].name?":":"") + disposeString(feature.properties[tooltip[int].field]);
                }
                layer.bindTooltip(str)
            },
            style : function (feature) {
                switch (feature.properties.type) {//按照字段属性来符号渲染
                    case "1":
                        return {
                            color: '#FF0000',
                            fillColor: '#FF0000',
                            fillOpacity: 0.3,
                            //weight: 2,
                            //dashArray: '10'
                        };
                    case "2":
                        return {
                            color: '#0000ff',
                            fillColor: '#0000ff',
                            fillOpacity: 0.3
                        };
                }
                return {
                    color: '#0000ff',
                    fillColor: '#0000ff',
                    fillOpacity: 0.3
                };
            }
        };
        var results = syncGetData("",config.host + config.businessData[i].xhrUrl);
        var layer = L.geoJson(results,geojsonOpts);
        layer.editable = true;
        //overlayMaps["<span class='basinessSpan' style='background-image:url(" + config.businessData[i].icon + ")'></span>" + config.businessData[i].name] = L.geoJson(results,geojsonOpts)
        overlayMaps[config.businessData[i].name] = layer;
        poiLayers.addLayer(layer);
        layer.on("click",function(feature){
            if(!spaceMaintenance){
                return
            }
            if(editLayer && editLayer != feature.layer){
                editLayer.disableEdit();
            }
            editLayer = feature.layer;
            if(feature.layer.editEnabled()){
                feature.layer.disableEdit()
            }else{
                editGeoJson = feature.layer.toGeoJSON();
                feature.layer.enableEdit();
            }
        	//clickLayerFeature(feature);
        });
    }
    var baseMaps = {};
    for(var i = 0 ; i < basemaps.length ; i ++){
        baseMaps[basemaps[i].options.label] = basemaps[i];
    }
    L.control.layers(baseMaps,overlayMaps).addTo(map);
}

/**
 * 动态引入js文件
 * @param {*} url 
 * @param {*} callback 
 */
function loadScript(url, callback) {  
    var script = document.createElement("script") ;
    script.type = "text/javascript";
    if(typeof(callback) != "undefined"){  
        if (script.readyState) {  
            script.onreadystatechange = function () {  
                if (script.readyState == "loaded" || script.readyState == "complete") {  
                    script.onreadystatechange = null ;
                    callback();
                }  
            } ;
        } else {  
            script.onload = function () {  
                callback();  
            };
        }  
    } 
    script.src = url;
    document.body.appendChild(script) ;
}

/**
 * 分步加载脚本
 */
function stepLoadScripts(){
	loadScript("js/leaflet-search.js",function(){});
	loadScript("js/turf.min.js",function(){});
	loadScript("js/proj4.js",function(){});
	loadScript("js/PruneCluster.js",function(){});
	loadScript("js/leaflet-heat.js",function(){});
	loadScript("js/drawPlugin.js",function(){
		loadScript("js/editDrawPlugin.js",function(){
			loadScript("js/EchartsLayerPlugin.js",function(){
				loadScript("js/GridLayerPlugin.js",function(){
					loadScript("js/extPlugin.js",function(){});
				});
			});
		});
	});
	loadScript("js/myPagination.js",function(){});
	loadScript("js/leaflet-realtime.js",function(){});
}

/**
 * 常用业务操作清除功能按钮
 */
function clearEasyButton(){
    config.menuButton ? L.easyButton("menuBtn", function (e) {
        if($("#videoDock")[0].style.display == "inline-block" || !$("#videoDock")[0].style.display) {$("#videoDock")[0].style.display = "none";}
        else  {$("#videoDock")[0].style.display = "inline-block";}
     }, '工具栏').addTo(map) : null;
    config.clearEasyButton ? L.easyButton("clearBtn", function (e) {
    	clearMap();
    }, '清除').addTo(map) : null;
}

function clearMap(){
	if(bufferGeo){
        map.removeLayer(bufferGeo);
        bufferGeo = null;
    }
    if(drawnItems) drawnItems.clearLayers();
    if(plotLayer) plotLayer.clearLayers();
    // map.eachLayer(function(item,index){
	// 	if(item._path) item.remove();
	// });
    if(MapSearchControl){
		map.removeControl(MapSearchControl);
		MapSearchControl.remove();
		MapSearchControl = null;
	}
    if(echartsLegend){
    	map.removeControl(echartsLegend);
    	echartsLegend.remove();
    	echartsLegend = null;
    }
}

function resizePage(){
    var pageSize = windowSize();
    $("#videoDock")[0] && ($("#videoDock")[0].style.top = (pageSize.windowHeight - 100) + "px");
}

/**
 * 保存编辑后的数据
 */
function saveEdit(){
    if(!editLayer){
        alert("请先进行数据编辑！");
        return
    }
    if(confirm("确认维护22222下的" + editLayer.options.layerName + "信息吗？")){
        editLayer.disableEdit();
        $.post("/MongoServer/update",{
            table : editLayer.options.tableName,
            update : JSON.stringify(editLayer.toGeoJSON().geometry.coordinates),
            key : "properties.id",
            value : editLayer.toGeoJSON().properties.id
        },function(result){
            if(JSON.parse(result).data == "success"){
                alert("保存成功！");
            }else{
                alert("保存失败！");
            }
        });
    }
}

//getConfig()//初始化

window.onresize = function() {
    resizePage();
};