<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Livo - Web Administration Panel</title>

<base href="../" />

<!-- Bootstrap -->
<link href="bootstrap/css/bootstrap.min.css" rel="stylesheet">
<link href='http://fonts.googleapis.com/css?family=Open+Sans:400,300'
	rel='stylesheet' type='text/css'>
<link href="css/font-awesome.min.css" rel="stylesheet">
<link href="css/style.css" rel="stylesheet">
<link href="css/style-responsive.css" rel="stylesheet">
<!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
<!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>
<body>
	<div class="login-container">
		<div class="middle-login">
			<div class="block-web col-sm-12">
				<div class="head">
					<h3 class="text-center">Livo - Administrator</h3>
				</div>
				<div style="background: #fff;" class="col-sm-12">
					<form id="login-form" action="/login/process" method="post"
						class="form-horizontal" style="margin-bottom: 0px !important;"
						data-parsley-validate>
						<div class="content">
							<h4 class="title">Login Access</h4>
							<c:if test="${error}">
								<div class="alert alert-danger">
									<strong>Authentication Failure.</strong><br />Please check the
									information you provided and try again.
								</div>
							</c:if>
							<div class="form-group">
								<div class="col-sm-12">
									<div class="input-group">
										<span class="input-group-addon"><i class="fa fa-user"></i></span>
										<input type="text" class="form-control" id="companyId"
											placeholder="Username" name="username"
											data-parsley-trigger="change"
											data-parsley-required-message="Please enter the provided company ID"
											data-parsley-errors-container="span#companyIdError" required>
									</div>
									<span id="companyIdError"></span>
								</div>
							</div>
							<div class="form-group">
								<div class="col-sm-12">
									<div class="input-group">
										<span class="input-group-addon"><i class="fa fa-lock"></i></span>
										<input type="password" class="form-control" id="companySecret"
											placeholder="Password" name="password"
											data-parsley-trigger="change"
											data-parsley-required-message="Please enter the provided company secret"
											data-parsley-errors-container="span#companySecretError"
											required>
									</div>
									<span id="companySecretError"></span>
								</div>
							</div>
						</div>
						<div class="foot">
							<a href="register.html"><button type="button"
									disabled="disabled" data-dismiss="modal"
									class="btn btn-default">Register</button></a> <a href="login.html"><button
									type="submit" data-dismiss="modal" class="btn btn-primary">Log
									in</button></a>
						</div>
					</form>
				</div>
			</div>
			<div class="text-center out-links">
				<a href="http://www.livomobile.com" target="_blank">&copy; Copyright
					Livo Mobile 2014-2015. </a>
			</div>
		</div>
	</div>
	<input id="companyIdEmptyMsg" type="hidden"
		value="Please enter a valid company ID" />
	<input id="companySecretEmptyMsg" type="hidden"
		value="Please enter the provided company secret" />

	<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	<script src="js/jquery-2.0.2.min.js"></script>
	<!-- Include all compiled plugins (below), or include individual files as needed -->
	<script src="bootstrap/js/bootstrap.min.js"></script>
	<script src="js/accordion.js"></script>
	<script src="js/common-script.js"></script>
	<script src="js/jquery.nicescroll.js"></script>
	<script src="plugins/validation/parsley.min.js"></script>
</body>
</html>
