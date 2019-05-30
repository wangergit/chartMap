<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>
<%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort()
			+ path + "/static/gis/chartMap/";
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <base href="<%=basePath%>">
    <meta charset="utf-8">
    <title>GIS一张图</title>
    <meta name="renderer" content="webkit">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="format-detection" content="telephone=no">
    <!-- css -->
    <link rel="stylesheet" href="css/leaflet.css" />
    <link rel="stylesheet" href="css/L.control.css" />
    <link rel="stylesheet" href="css/font-awesome.min.css" />
    <link rel="stylesheet" href="css/flat-ui.min.css" />
    <link rel="stylesheet" href="css/bootstrap.min.css" />
    <link rel="stylesheet" href="css/index.css" />
	<!--  js  -->
    <script type="text/javascript" src="js/leaflet.js"></script>
    <script type="text/javascript" src="js/jquery.js"></script>
    <script type="text/javascript" src="js/echarts.min.js"></script>
    <script type="text/javascript" src="js/jquery.tinycarousel.min.js"></script>
    <script type="text/javascript" src="js/L.Controls.js"></script>
    <script type="text/javascript" src="js/leaflet-measure.js"></script> 
    <script type="text/javascript" src="js/data.js"></script> 
    <script type="text/javascript" src="js/exchangeData.js"></script> 
    <script type="text/javascript" src="js/customToolbar.js"></script>
    <script type="text/javascript" src="js/index.js"></script>
</head>
<body>
	<div class="mainDiv">
      <div id="map"></div>
      <div id="videoDock">
        <div id="dockContainer" class="dock-container"></div>
      </div>
    </div>
	<script>
    	//所有取后台传递过来的参数       都必须在jsp页面执行
    	var ssoid = "${sessionScope.ssoid}";
    	var wname = '${pd.get("wname")}';//索引参数记录
	    var posObj = '${pd.get("posObj")}';
		jQuery.ajaxSetup({cache: true}); //jquery缓存页面 
		/*var centerPoint={"longitude":107,"latitude":34,"zoom":4};    
	    <c:if test='${pd.get("longitude")!=null && pd.get("latitude")!=null}'>
	    	centerPoint.latitude = ${pd.get("latitude")};
	    	centerPoint.longitude = ${pd.get("longitude")};
	    </c:if>
	    <c:if test='${pd.get("zoom")!=null}'>
	    	centerPoint.zoom = ${pd.get("zoom")};
	    </c:if>*/
	    window.onload = function(){
	    	getConfig();
		}	
	</script>
</body>
</html>