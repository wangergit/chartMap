/**
 * 初始化标绘组件
 */
function initDrawToolbar(bool){
    if(drawTool) {
        if(!bool) destoryDrawToolbar();
        return
    }
    drawnItems.on("click",function(layer){
        drawItemTrigger(layer.layer);
    });
    drawTool = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems,
            poly : {
                allowIntersection : false
            }
        },
        draw: {
            polygon : {
                allowIntersection: false,
                showArea:true
            }
        }
    });
    map.addControl(drawTool);
    var _round = function(num, len) {
        return Math.round(num*(Math.pow(10, len)))/(Math.pow(10, len));
    };
    var strLatLng = function(latlng) {
        return "(" + _round(latlng.lat, 3) + ", " + _round(latlng.lng, 3) + ")";
    };
    var getPopupContent = function(layer) {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
            return strLatLng(layer.getLatLng());
        } else if (layer instanceof L.Circle) {
            var center = layer.getLatLng(),radius = layer.getRadius();
            return "Center: "+strLatLng(center)+"<br />" +"Radius: "+_round(radius, 2)+" m";
        } else if (layer instanceof L.Polygon) {
            var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
                area = L.GeometryUtil.geodesicArea(latlngs);
            return "Area: " + L.GeometryUtil.readableArea(area, true);
        } else if (layer instanceof L.Polyline) {
            var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
                distance = 0;
            if (latlngs.length < 2) {
                return "Distance: N/A";
            } else {
                for (var i = 0; i < latlngs.length-1; i++) {
                    distance += latlngs[i].distanceTo(latlngs[i+1]);
                }
                return "Distance: "+_round(distance, 2)+" m";
            }
        }
        return null;
    };
    map.on(L.Draw.Event.CREATED, function(event) {
        var layer = event.layer;
        //以下是点击弹出长度距离面积
        // var content = getPopupContent(layer)
        // if (content !== null) {
        //     layer.bindPopup(content)
        // }
        drawnItems.addLayer(layer);
    });
    map.on(L.Draw.Event.EDITED, function(event) {
        // var layers = event.layers,
        //     content = null
        // layers.eachLayer(function(layer) {
        //     content = getPopupContent(layer)
        //     if (content !== null) {
        //         layer.setPopupContent(content)
        //     }
        // })
    });
}

/**
 * 绘制图层点击事件触发函数
 * @param {*} feature 
 */
function drawItemTrigger(feature){
    if(bufferState){//缓冲区分析
        if($("#bufferItem")[0]){
            $("#bufferItem")[0].value = JSON.stringify(feature.toGeoJSON());
        }
    }else {//保存要素
    	var tmpjsonStr = feature.toGeoJSON();
		var index = parent.layer.getFrameIndex(wname);
		var body = parent.layer.getChildFrame('body', index);
		body.contents().find("#" + posObj).val(tmpjsonStr);
		console.log(tmpjsonStr);
		index = parent.layer.getFrameIndex(window.name); // 先得到当前iframe层的索引
		parent.layer.close(index); // 再执行关闭
    }
}

/**
 * 缓冲区
 */
function bufferTrigger(){
    var geojson;
    var radius ;
    if($("#bufferItem")[0] && $("#bufferItem")[0].value){
        geojson = JSON.parse($("#bufferItem")[0].value);
    }else{
        alert("请先选择要缓冲的要素");
        return
    }
    if($("#bufferValue")[0] && $("#bufferValue")[0].value){
        var value = parseFloat($("#bufferValue")[0].value);
        if(!isNaN(value)){
            radius = value;
        } else{
            alert("请输入正确的缓冲半径");
            return
        }
    }else{
        alert("请输入缓冲半径");
        return
    }
    bufferFeature = turf.buffer(geojson, radius, {
        units: 'meters'
    });
    if(bufferGeo){
        map.removeLayer(bufferGeo);
        bufferGeo = null;
    }
    bufferGeo = L.geoJSON(bufferFeature, {
        style: function() {
            return {
                color: 'red'
            };
        }
    }).addTo(map);
}

/**
 * 缓冲区分析
 */
function bufferAnalysisTrigger(){
    var layerName = $("#businessSelect")[0].value ;
    if(!layerName){
    	alert("请选择数据！");
    	return;
    }
    if(!bufferFeature){
    	alert("请先生成缓冲区！");
    	return;
    }
    var result = syncGetData(layerName);
    var results = [];
    for(var i = 0 ; i < result.data.length ; i ++){
        var pt = turf.point([result.data[i].longtitude,result.data[i].latitude]);
        if(turf.booleanPointInPolygon(pt, bufferFeature)){
            results.push(result.data[i]);
        }  
    }
    if(results.length > 0){
        pagingControl(results);
    }else{
        if($("#paging")[0]) ($("#paging")[0].innerHTML = "");
        if($("#infoContainer")[0])($("#infoContainer")[0].innerHTML = "范围内无查询结果");
    }
}

/**
 * 销毁标绘组件
 */
function destoryDrawToolbar(){
    map.removeControl(drawTool);
    drawTool.remove();
    drawTool = null;
    //drawnItems.removeLayers()
    // map.removeLayer(drawnItems)
    // drawnItems = null
}

/**
 * 图层检索要素
 */
function initSearchControl(){
    if(placeSearchControl) placeSearchControl._container.style.display = "none";
    if(searchControl){
        if(searchControl._container.style.display == "block" || !searchControl._container.style.display){
            searchControl._container.style.display = "none";
        }else{
            searchControl._container.style.display = "block";
        }
        return
    }
    searchControl = L.control.search({
        layer: poiLayers,
        initial: false,
        geoLayer : plotLayer,
        textPlaceholder : "请输入关键字...",
        position : config.searchPosition,
        propertyName: 'name',
        buildTip: function(text, val) {
            var type = val.layer.feature.properties.amenity
            return '<a href="#" class="' + type  +'">' + text + '<b>' + type + '</b></a>'
        }
    });
    //searchControl.options.propertyName = "name"
    searchControl.addTo(map);
}

/**
 * poi地名检索要素
 */
function initPlaceSearchControl(){
    if(searchControl) searchControl._container.style.display = "none";
    if(placeSearchControl){
        if(placeSearchControl._container.style.display == "block" || !placeSearchControl._container.style.display){
            placeSearchControl._container.style.display = "none";
        }else{
            placeSearchControl._container.style.display = "block";
            placeSearchControl._container.style.zIndex = 99999;
        }
        return
    }
    //var layer = L.geoJson(chinaGeojson,{})
    //var placeLayers = L.layerGroup();
    //placeLayers.addLayer(layer);
    placeSearchControl = L.control.search({
        //layer: placeLayers,
    	url: 'http://api.tianditu.gov.cn/search?postStr={"keyWord":{s},"mapBound":"-180,-90,180,90","level":"11","queryType":"1","count":"1000","start":"0"}&type=query&tk=cc21055096bec13946261115fc8c8c01',
        geoLayer : plotLayer,
        propertyLoc : "lonlat",
        textPlaceholder : "请输入地名关键字...",
        initial: false,
        position : config.searchPosition,
        propertyName: 'name',
        //layerSymbol : true,
        buildTip : function(text, val) {
            //var type = val.layer.feature.properties.amenity
            return '<a href="#">' + text + '</a>';
        }
    });
    placeSearchControl.addTo(map);
}

/**
 * 处理地图搜索
 * @param type
 */
function disposeMapSearch(type){
	if(MapSearchControl){
		map.removeControl(MapSearchControl);
		MapSearchControl.remove();
		MapSearchControl = null;
	}
	switch(type){
	case 1://poi地名
		MapSearchControl = L.control.search({
	    	url: 'http://api.tianditu.gov.cn/search?postStr={"keyWord":{s},"mapBound":"-180,-90,180,90","level":"11","queryType":"1","count":"1000","start":"0"}&type=query&tk=cc21055096bec13946261115fc8c8c01',
	        geoLayer : plotLayer,
	        propertyLoc : "lonlat",
	        textPlaceholder : "请输入地名关键字...",
	        initial: false,
	        position : config.searchPosition,
	        propertyName: 'name',
	        layerSymbol : false,
	        buildTip : function(text, val) {
	            return '<a href="#">' + text + '</a>';
	        }
	    });
		break;
	case 2://图层检索
		MapSearchControl = L.control.search({
	        layer: poiLayers,
	        initial: false,
	        geoLayer : plotLayer,
	        textPlaceholder : "请输入关键字...",
	        position : config.searchPosition,
	        propertyName: 'name',
	        layerSymbol : false,
	        buildTip: function(text, val) {
	            var type = val.layer.feature.properties.amenity;
	            return '<a href="#" class="' + type  +'">' + text + '<b>' + type + '</b></a>';
	        }
	    });
		break;
	case 3://行政区检索
		MapSearchControl = L.control.search({
	    	url: '/authentic/webgis/regionQuery.do?name={s}',
	        geoLayer : plotLayer,
	        propertyLoc : "lonlat",
	        textPlaceholder : "请输入行政区关键字...",
	        initial: false,
	        position : config.searchPosition,
	        propertyName: 'name',
	        layerSymbol : true,
	        buildTip : function(text, val) {
	            return '<a href="#">' + text + '</a>';
	        }
	    });
		break;
	default:
		break;
	}
	MapSearchControl.addTo(map);
}

/**
* 调用浏览器尺寸
* @returns
*/
function windowSize() {
    var xScroll, yScroll, windowWidth, windowHeight, pageWidth, pageHeight;
    // innerHeight获取的是可视窗口的高度，IE不支持此属性  
    if (window.innerHeight && window.scrollMaxY) {
        xScroll = document.body.scrollWidth;
        yScroll = window.innerHeight + window.scrollMaxY;
    } else if (document.body.scrollHeight > document.body.offsetHeight) { // all but Explorer Mac  
        xScroll = document.body.scrollWidth;
        yScroll = document.body.scrollHeight;
    } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari  
        xScroll = document.body.offsetWidth;
        yScroll = document.body.offsetHeight;
    }

    if (self.innerHeight) {    // all except Explorer  
        windowWidth = self.innerWidth;
        windowHeight = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode  
        windowWidth = document.documentElement.clientWidth;
        windowHeight = document.documentElement.clientHeight;
    } else if (document.body) { // other Explorers  
        windowWidth = document.body.clientWidth;
        windowHeight = document.body.clientHeight;
    }

    // for small pages with total height less then height of the viewport  
    if (yScroll < windowHeight) {
        pageHeight = windowHeight;
    } else {
        pageHeight = yScroll;
    }

    // for small pages with total width less then width of the viewport  
    if (xScroll < windowWidth) {
        pageWidth = windowWidth;
    } else {
        pageWidth = xScroll;
    }

    return {
        'pageWidth': pageWidth,
        'pageHeight': pageHeight,
        'windowWidth': windowWidth,
        'windowHeight': windowHeight
    }
}

/**
 * 图层要素点击事件
 * @param feature
 */
function clickLayerFeature(feature){
	var layerName;
	try{
		layerName = feature.layer.feature.properties.amenity;
	}catch(e){
		return;
	}
	var properties = feature.layer.feature.properties;
	var path = "";
	var drawArea = false;
	for (var int = 0; int < config.businessData.length; int++) {
		if(config.businessData[int].name === layerName){
			var items = config.businessData[int].clickItem;
			path = config.host + items.url + ssoid + "";
			if(items.Distinguish){
				path = items.Distinguish.url[properties[items.Distinguish.field]] + ssoid + "";
			}
			if(items.parameter){
				for ( var item in items.parameter) {
					path += "&" + item + "=" + properties[items.parameter[item]];
				}
			}
			drawArea = items.drawArea;
			break;
		}
	}
	if(path) {
		if(drawArea){
			if(!feature.layer.feature.properties.clickcount){
				drawJsonList(syncGetData(null,path),layerName);
				feature.layer.feature.properties.clickcount = 1;
			}
		}else{
			top.layer.open({
				type : 2,
				title : '详情信息',
				maxmin : true,
				content : path,
				area : [ '807px', '460px' ]
			});
		}
	}
}

/**
 * 绘制现场区域子集要素
 * @param result 数据集
 * @param parentType 父级类型
 */
function drawJsonList(result,parentType){
	for (var i = 0; i < result.data.length; i++) {
		var tmpEle = result.data[i];
		var tmpScope = eval("(" + tmpEle.locationData + ")");
		var myElement = undefined;
		var fieldColor = "blue";
		if (tmpEle.bussinessCategory == "90400001") {
			fieldColor = "green";
		} else if (tmpEle.bussinessCategory == "90400002") {
			fieldColor = "black";
		}
		if (tmpScope != undefined && tmpScope.type != undefined) {
			if (tmpEle.shapeCategory == '90300001') {// 中心点
				myElement = new L.Marker(tmpScope.data[0], {
					icon : markerIcon,
					type : tmpEle.bussinessCategoryName,
					description : tmpEle.description
				});
			} else if (tmpEle.shapeCategory == '90300002') {// 线段路径
				myElement = new L.polyline(tmpScope.data, {
					color : fieldColor,
					weight : 2,
					type : tmpEle.bussinessCategoryName,
					description : tmpEle.description
				});
			} else if (tmpEle.shapeCategory == '90300003') {// 多边形范围
				myElement = new L.Polygon(tmpScope.data, {
					color : fieldColor,
					weight : 2,
					type : tmpEle.bussinessCategoryName,
					description : tmpEle.description
				});
			} else if (tmpEle.shapeCategory == '90300004') {// 图片叠加
				myElement = new L.imageOverlay("/authentic/dfs/download.do?id=" + tmpEle.fileId, tmpScope.data, {
					opacity : 0.5
				});
			} else if (tmpEle.shapeCategory == '90300005') {// 普通全景
				myElement = new L.Marker(tmpScope.data[0], {
					icon : skyboxIcon,
					type : tmpEle.bussinessCategoryName,
					imgType : 'normal',
					fileId : tmpEle.fileId,
					description : tmpEle.description
				});
			} else if (tmpEle.shapeCategory == '90300006') {// 深度全景
				myElement = new L.Marker(tmpScope.data[0], {
					icon : skyboxIcon,
					type : tmpEle.bussinessCategoryName,
					imgType : 'skybox',
					fileId : tmpEle.fileId,
					description : tmpEle.description
				});
			}
		}
		if (myElement != undefined) {
			myElement.on("mouseover", function(e) {
				var latlng = e.latlng;
				var imgType = this.options.imgType;
				var pophtml = '<div class="hintDiv"';
				if (imgType != undefined && imgType != "" && imgType != "null") {
					pophtml += 'style="height:150px;overflow:hidden"><h5>' + this.options.type + '</h5><br>';
					pophtml += '<img style="width:100%" src="/authentic/dfs/download.do?id=' + this.options.fileId + '"/><br>';
				} else {
					pophtml += '><h5>' + this.options.type + '</h5><br>';
					if (this.options.description != undefined) {
						pophtml += '' + this.options.description + '<br>';
					} else {
						pophtml += '<br>';
					}
				}
				pophtml += '</div>';
				layerPopup = L.popup({
					offset : L.point(0, -25),
					autoPan : false
				});
				layerPopup.setLatLng(latlng);
				layerPopup.setContent(pophtml);
				layerPopup.openOn(map);
			});
			myElement.on("click", function(e) {
				var imgType = this.options.imgType;
				if (imgType != undefined && imgType != "" && imgType != "null") {
					parent.layer.open({
						type : 2,
						title : '全景展示',
						maxmin : true,
						content : "/authentic/webgis/panorama.do?imgType=" + imgType + "&fileId=" + this.options.fileId,
						area : [ '807px', '460px' ]
					});
				}
			});
			overlayMaps[parentType].addLayer(myElement);
		}
	}
}

/**
 * 处理文本（未定义字符串处理）
 * @param text
 */
function disposeString(text){
	return text ? text : "";
}

/**
 * 创建echarts图表
 * @param data  {
		"北京市" : {
			"直接访问" : 123,
			"邮件营销" : 123,
			"联盟广告" : 123
		},
		"安徽省" : {
			"直接访问" : 123,
			"邮件营销" : 123,
			"联盟广告" : 123
		}
	}
 * @param type "pie" / "bar"
 * @param name 标题
 */
function divIconEcharts(data,type,name){
	clearMap();
	if(echartsLegend){
    	map.removeControl(echartsLegend);
    	echartsLegend.remove();
    	echartsLegend = null;
    }
	var option ;
	var legends = [];
	var latlngs = [];
	var integratedData = [];
	for(var attr in data){
		var items = [];
		var latlng = config.provinceCenter[attr];
		latlngs.push([latlng[1],latlng[0]]);
		for(var item in data[attr]){
			if(legends.indexOf(item) == -1) legends.push(item);
			switch(type){
			case "pie":
				items.push({
					value: data[attr][item], 
					name: item
				});
				break;
			case "bar":
				items.push(data[attr][item]);
				break;
			default:
				console.error("统计上图类型未定义！");
				return;
			}
		}
		integratedData.push(items);
	}
	switch(type){
	case "pie":
		option = {
			color: ['#7cb5ec','#939398','#90ed7d','#f7a35c','#8085e9','#f15c80','#e4d354','#2b908f','#f45b5b','#91e8e1'],  
	        tooltip: {
	            trigger: 'item',
	            formatter: "{a} <br/>{b} : {c} ({d}%)"
	        },
	        toolbox: {
	            show : false,
	            feature : {
	                mark : {show: true},
	                dataView : {show: true, readOnly: false},
	                magicType : {
	                    show: true, 
	                    type: ['pie', 'funnel'],
	                    option: {
	                        funnel: {
	                            x: '25%',
	                            width: '50%',
	                            funnelAlign: 'left',
	                            max: 1548
	                        }
	                    }
	                },
	                restore : {show: true},
	                saveAsImage : {show: true}
	            }
	        },
	        series: [{
	            name: name,
	            type: 'pie',
	            radius: '55%',
	            center: ['50%', '50%'],
	            label: {
	                normal: {
	                    show: false
	                },
	                emphasis: {
	                    show: false
	                }
	            },
	            lableLine: {
	                normal: {
	                    show: false
	                },
	                emphasis: {
	                    show: false
	                }
	            },
	            itemStyle: {
	                emphasis: {
	                    shadowBlur: 10,
	                    shadowOffsetX: 0,
	                    shadowColor: 'rgba(0, 0, 0, 0.5)'
	                }
	            }
	        }]
	    };
		break;
	case "bar":
		option = {
			color: ['#7cb5ec','#939398','#90ed7d','#f7a35c','#8085e9','#f15c80','#e4d354','#2b908f','#f45b5b','#91e8e1'],
		    title : {
		        text : name,
		        show : false
		    },
		    tooltip : {
		        trigger: 'axis'
		    },
//		    legend: {
//		        data:[name]
//		    },
		    toolbox: {
		        show : false,
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: false},
		            magicType : {show: true, type: ['line', 'bar']},
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    calculable : true,
		    xAxis : [
		        {
		            type : 'category',
		            data : legends
		        }
		    ],
		    yAxis : [
		        {
		            type : 'value'
		        }
		    ],
		    series : [
		        {
		            name : name,
		            type:'bar',
		            markPoint : {
		                data : [
		                    {type : 'max', name: '最大值'},
		                    {type : 'min', name: '最小值'}
		                ]
		            },
		            markLine : {
		                data : [
		                    {type : 'average', name: '平均值'}
		                ]
		            }
		        }
		    ]
		};
		break;
	default :
		console.error("统计上图类型未定义！");
		return;
	}
	option.datas = integratedData;
    echartsIcon(plotLayer, latlngs, option);
    //图例
    var legendOption = {
        orient: 'vertical',
        left: 'left',
        width: "90px",
        height: "140px",
        data: legends
    };
    addEchartsLegend(map, legendOption);
}

/**
 * echartsIcon DivIcon
 * @param  {L.map} map     leaflet地图类
 * @param  {[[],[]]} latlngs 坐标数组
 * @param  {Object} option  [配置对象]
 *   其中重要的是option.datas 传送数据，如：
 *   option.datas = [
        [
            { value: 335, name: '直接访问' },
            { value: 310, name: '邮件营销' },
            { value: 234, name: '联盟广告' },
            { value: 135, name: '视频广告' },
            { value: 1548, name: '搜索引擎' }
        ]
    ];
 */
var chartOptions = {};
function echartsIcon(layer, latlngs, option) {
	chartOptions = option;
	chartOptions["latlngs"] = latlngs;
    for (var i = 0; i < latlngs.length; i++) {
    	//var latlng = latlngs[i].reverse();//倒叙
        var latlng = latlngs[i];
        var newClassName = 'icon-' + latlng.join('-');
        var myIcon = L.divIcon({
            className: 'my-div-icon',
            html: "<div class='echarts-icon " + newClassName + "'></div>"
        });
        var marker = L.marker(latlng, { 
        	icon: myIcon ,
        	riseOffset : 0
        }).addTo(layer);
        marker.on("click",function(e){
        	windowControl = L.control.window("map",{
                visible : true,
                title : "统计上图",
                content : '<div style="width:100%;height:350px;" id="chartsIcon"></div>',
                width : 600,
                height : 400
            });
        	if(chartOptions.toolbox) chartOptions.toolbox.show = true;
        	if(chartOptions.series[0].label){
        		chartOptions.series[0].label.normal.show = true;
        		chartOptions.series[0].label.emphasis.show = true;
        	}
        	if(chartOptions.series[0].lableLine){
        		chartOptions.series[0].lableLine.normal.show = true;
        		chartOptions.series[0].lableLine.emphasis.show = true;
        	}
        	var myChart = echarts.init(document.getElementById("chartsIcon"));
        	for(var j = 0 ; j < chartOptions["latlngs"].length ; j ++){
        		if(chartOptions["latlngs"][j][0] == e.target.getLatLng().lat && chartOptions["latlngs"][j][1] == e.target.getLatLng().lng){
        			chartOptions.series[0].data = chartOptions.datas[j];
                    myChart.setOption(chartOptions);
                    break;
        		}
        	}
        });
        var myChart = echarts.init(document.getElementsByClassName(newClassName)[0]);
        option.series[0].data = option.datas[i];
        myChart.setOption(option);
    }
}

/**
 * [echartsLegend description]
 * @param  {L.map} map     leaflet地图类
 * @param  {Object} option  [配置对象]
 * 配置项 option = {
        orient: 'vertical',
        left: 'left',
        width: "90px",
        height: "140px",
        data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
    };
 */
function addEchartsLegend(map, option) {
    if(!option||!option.data){
        console.warn("没有图例的数据或者图例数据不是数组");
        return;
    }
    echartsLegend = L.Control.echartsLegend().addTo(map);
    var dom = document.getElementsByClassName('leaflet-control-echarts-legend')[0];
    dom.style.width = option.width || "90px";
    dom.style.height =  option.height || "140px";
    var myLegendChart = echarts.init(dom);
    var legendOption = {
        legend: {
            orient:option.orient || 'vertical',
            left:option.left || 'left',
            data:option.data 
        },

        series: [{
            type: 'pie',
            data: [],
            label: {
                normal: {
                    show: false
                },
                emphasis: {
                    show: false
                }
            },
            lableLine: {
                normal: {
                    show: false
                },
                emphasis: {
                    show: false
                }
            },
            itemStyle: {
                normal: {
                    opacity: 0
                },
                emphasis: {
                    opacity: 0
                }
            }
        }]
    };
    for (var i = 0; i < option.data.length; i++) {
        var datai = option.data[i];
        legendOption.series[0].data.push({name:datai});
    }
    myLegendChart.setOption(legendOption);
}

/**
 * 网络及端口测试
 * 返回值 true/false
 */
function networkPort(){
	var bool = false;
	if(navigator.onLine){
		if(syncGetData(null,"http://t1.tianditu.com/DataServer")) bool = true;
	}
	return bool;
}





















