<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="sec"
	uri="http://www.springframework.org/security/tags"%>


<c:choose>
	<c:when test="${what==true}">

		<div id="typeHolder" style="display: none;" data-type="${type}"></div>
		<form id="rawScreenEdit" method="post"
			class="form-horizontal row-border" action="">
			<input type="hidden" name="applicationId"
				value="${application.name}"> <br>
			<div class="form-group">

				<div class="col-sm-12">
					<textarea id="rawScreenEditor" style="width: 99%;"
						class="form-control" name="editor" rows="24"><c:out
							value="${content}" /></textarea>
				</div>
			</div>
			<span>Go inside of editor and press <code>F11</code> to open
				full screen mode, <code>ESC</code> to close it, <code>CTRL-S</code>
				to save it, <code>CTRL-D</code> to save and deploy and <code>CTRL-SPACE</code>
                                to auto-complete. Please  <a href="javascript:showShortcuts();" id="idShortcuts">click </a>for all shortcuts.
			</span>

			<div class="bottom " style="background: none; border: none;">
				<button class="btn btn-primary"
					style="float: right; margin-right: 5px;" type="button"
					value="editorSubmitAndDeploy"
					onclick="saveAndDeploy();
                            return false;"
					id="editorSubmitAndDeploy">&nbsp;&nbsp;Save And
					Deploy&nbsp;&nbsp;</button>
				<button class="btn btn-primary"
					style="float: right; margin-right: 5px;" type="submit"
					value="editorSubmit" id="editorSubmit">&nbsp;&nbsp;Save&nbsp;&nbsp;</button>
			</div>
		</form>
	</c:when>
	<c:otherwise>
		<img src="data:image/jpeg;base64,${content}" alt=""
			style="max-width: 99%; margin: auto;">
	</c:otherwise>
</c:choose>


