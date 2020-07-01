<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"%>
<%@ taglib prefix="sec"
           uri="http://www.springframework.org/security/tags"%>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">

        <meta name="viewport" content="width=device-width, initial-scale=1">
        <META NAME="ROBOTS" CONTENT="NOINDEX, NOFOLLOW">
    <title>Livo - Web Administration Panel</title>

    <!-- Bootstrap -->
    <link href="../bootstrap/css/bootstrap.min.css" rel="stylesheet"/>

    <link href="../css/highlight.css" rel="stylesheet"/>
    <link href="../bootstrap/css/bootstrap-switch.css" rel="stylesheet"/>



    <link href="https://fonts.googleapis.com/icon?family=Material+Icons"  rel="stylesheet"/>
    <!--    <link href='http://fonts.googleapis.com/css?family=Open+Sans:400,300'
              rel='stylesheet' type='text/css'/>-->
    <link href="../css/font-awesome.min.css" rel="stylesheet"/>
    <link href="../css/style.css" rel="stylesheet"/>
    <link href="../css/style-responsive.css" rel="stylesheet"/>
    <link href="../css/jquery-ui.min.css" rel="stylesheet"/>

    <!-- jquery tree style -->
    <link href="../css/jqueryFileTree.css" rel="stylesheet" type="text/css" media="screen" />
    <!-- jquery tree style -->

    <!-- start of codemirror styles -->
    <link rel=stylesheet href="../css/docs.css"/>
    <!--<link href="http://getbootstrap.com/assets/css/docs.min.css" rel="stylesheet"/>-->
    <link href="../css/main.css" rel="stylesheet"/>

    <link rel="stylesheet" href="../css/codemirror.css"/>
    <link rel="stylesheet" href="../css/show-hint.css"/>
    <link rel="stylesheet" href="../css/fullscreen.css"/>
    <link rel="stylesheet" href="../css/eclipse.css"/>
    <!-- end of codemirror styles -->

    <!-- start of the preview style -->
    <link rel="stylesheet" type="text/css" href="../css/preview.css"/>
    <link rel="stylesheet" type="text/css" href="../css/previewstyle.css"/>
    <!-- end of preview style -->

    <!-- Start of data table style -->
    <link href="plugins/data-tables/DT_bootstrap.css" rel="stylesheet"/>
    <link href="plugins/advanced-datatable/css/demo_table.css" rel="stylesheet"/>
    <link href="plugins/advanced-datatable/css/demo_page.css" rel="stylesheet"/>
    <link href="../css/image-picker.css"  rel="stylesheet"/>

    <!-- End of data table style -->

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
          <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
          <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
        <![endif]-->
</head>
<body class="light-theme" >
<div class="header navbar navbar-inverse box-shadow navbar-fixed-top" id="headerBar">
    <div class="navbar-inner">
        <div class="header-seperation">
            <ul class="nav navbar-nav ">
                <li class="sidebar-toggle-box"><a href="#"><i
                            class="fa fa-bars"></i></a></li>
                <!--<li><a href="#"><strong>Livo - Administration </strong></a></li>-->
                <li> <a href="#" id="idDashboard" class="active" > 
                        <i class="fa fa-dashboard"></i> 
                        <span>Dashboard</span>
                        <!--                                                                                                        <b class="badge bg-danger pull-right">3</b>-->
                    </a></li>
                <!-- <li class="hidden-xs"> <a href="#"><i class="fa fa-angle-double-left"></i> Go to the front page</a> </li> -->
                <li class="hidden-xs">
                    <div class="hov">
                        <div id="preview" class="btn-group">
                            <a data-toggle="dropdown" href="" class="con" title="Preview Application"><span
                                    class="fa fa-eye"></span></a>
                        </div>

                        <!--                        <div id="savedStates" class="btn-group">
                                                    <a data-toggle="dropdown" href="" class="con" title="Save Application"><span
                                                            class="fa fa-save"></span><span id="count" class="label label-warning">1</span></a>
                                                    <ul role="menu" class="dropdown-menu pull-right dropdown-alerts">
                                                        <li class="title alert alert-warning"><span class="icon icon-bell"></span>&nbsp;&nbsp;There
                                                            are <strong><span id="count">1</span> saved states</strong> that is not deployed yet.</li>
                                                        <li class="alert prototype" style="display: none;">
                                                            <div class="alert-icon alt-default">
                                                                <span class="fa fa-info-circle"></span>
                                                            </div>
                                                            <div class="alert-content">Saved at: <span id="time">Time</span> in <span id="date">will be here soon</span></div>
                                                            <div class="alert-time">X seconds ago</div>
                                                        </li>
                        
                                                        <li></li>
                                                    </ul>
                                                </div>-->
                        <div id="deployment" class="btn-group">
                            <a data-toggle="dropdown" href="" class="con" title="Deploy Application"><span
                                    class="fa fa-cloud-upload"></span></a>
                            <!--                                                    <a data-toggle="dropdown" href="" class="con popovers" data-toggle="popover" 
                                                                                            data-placement="bottom" data-trigger="focus" data-content="Successfully deployed the application for devices to provision!" data-container="body"><span
                                                                                                    class="fa fa-upload"></span></a>-->
                        </div>
                        <div id="downloadApplication" class="btn-group" data-application-id="">
                            <a  data-toggle="dropdown" href="" class="con" title="Download Application" ><span
                                    class="fa fa-download"></span></a>
                        </div>

                        <div id="deleteApplication" class="btn-group" data-application-id="">
                            <a data-toggle="dropdown" href="" class="con"  title="Delete Application"><span 
                                    class="fa fa-trash-o"></span></a>
                        </div>

                        <div id="applicationSettings" class="btn-group" data-application-id="">
                            <a data-toggle="dropdown" href="" class="con" title="Application Properties"><span
                                    class="fa fa-cog"></span></a>
                        </div>

                    </div>
                </li>
                <li>

                </li>
                <ul class="nav navbar-nav pull-right" style="margin-right: 100px;">
                    <li style="margin-right: 100px;"> 
                        <div class="hov">
                            <div id="sendPushNotification" class="btn-group" data-application-id="">
                                <a data-toggle="dropdown" href="" class="con" title="Push Notification"><span
                                        class="fa fa-mobile-phone"></span></a>
                            </div>
                        </div>
                    </li>

                </ul>


                <li>   <a href="/logout" class="btn btn-link"><i class="fa fa-sign-in"></i> Log Out  </a>
                </li>

            </ul>

            <!--/nav navbar-nav-->
        </div>
        <!--/header-seperation-->
    </div>
    <!--/navbar-inner-->
</div>
<!--/header-->

<div class="page-container">
