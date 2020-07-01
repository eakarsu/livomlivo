<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="sec"
	uri="http://www.springframework.org/security/tags"%>


<div class="row">
	<div class="col-md-12">
		<div class="block-web">
			<div class="block-web" id="repeater">
				<div class="header">
					<div class="actions">
						<a href="#" class="minimize"><i class="fa fa-chevron-down"></i></a>
						<a href="#" class="refresh"><i class="fa fa-repeat"></i></a> <a
							href="#" class="close-down"><i class="fa fa-times"></i></a>
					</div>
					<h3 class="content-header">Download Application</h3>
				</div>
				<div class="porlets-content">

					<c:set var="isDelete" value="${isDelete}" />
					<c:set var="error" value="${error}" />
					<c:set var="message" value="${message}" />


					<c:choose>
						<c:when test="${error != true}">
							<div class="alert alert-success">
								<strong>Well done! </strong>${message} <br>
								<h2>
									<a href="/downloadApplicationToClient/${applicationId}/">Click
										here to download file</a>
								</h2>
							</div>

						</c:when>
						<c:otherwise>

							<div class="alert alert-danger">
								<strong>Warning!</strong>${message}
							</div>

						</c:otherwise>

					</c:choose>


				</div>
				<!--/porlets-cont
                       </div><!--/block-web-->
			</div>
			<!-- /repeater -->
		</div>
		<!--/row-->
		<!-- Modal for errors -->