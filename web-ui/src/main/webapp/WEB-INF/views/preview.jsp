<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="sec"
	uri="http://www.springframework.org/security/tags"%>

<div style="width: 100%; height: 100%; text-align: center;">

	<div id="previewDevice" class="marvel-device nexus5">
		<div class="top-bar"></div>
		<div class="sleep"></div>
		<div class="volume"></div>
		<div class="camera"></div>
		<div class="sensor"></div>
		<div class="speaker"></div>
		<div class="screen" style="overflow: hidden;">
			<iframe src="${host}"
				style="width: 100%; height: 100%; border: none;" frameborder="0"></iframe>
		</div>
		<div class="home"></div>
		<div class="bottom-bar"></div>
	</div>

</div>
<br>
<div align="center">
	<div class="btn-group dropup">
		<button data-toggle="dropdown" class="btn btn-primary dropdown-toggle">
			Devices & Orientation <span class="caret"></span>
		</button>
		<ul class="dropdown-menu">
			<li><a href="#" id="changeOrientation">Change Orientation</a></li>
			<li><a href="#" id="nexusPre">Nexus 5 Preview</a></li>
			<li><a href="#" id="iphonePre">Iphone 5 Preview</a></li>
			<li><a href="#" id="tabletPre">Tablet Preview</a></li>
		</ul>
	</div>
</div>


