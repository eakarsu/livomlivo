<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="sec"
           uri="http://www.springframework.org/security/tags"%>


<!-- Start of Services. -->
<style>
    #navTabs{
        padding: 10px; 
        height: auto;
        width: auto;
    }

    #operationListDiv{
        padding: 10px; 
        height: auto;
        width: auto;

    }

    #tab-content{
        border-radius: 5px;
        border: 1px solid #8AC007;
        padding: 10px; 
        height: auto;
        width: auto;
        margin-top: 5px;
    }

</style>


<div class="row">
    <div class="col-md-12">
        <div class="block-web">
            <div id="pageHeader" class="header">
                <div class="actions"> <a href="#" class="minimize"><i class="fa fa-chevron-down"></i></a> <a href="#" class="refresh"><i class="fa fa-repeat"></i></a> <a href="#" class="close-down"><i class="fa fa-times"></i></a> </div>
                <h3 class="content-header">RestService Wizard</h3>
            </div>
            <div class="porlets-content">
                <div id="progressWizard" class="basic-wizard">
                    <ul id="navTabs" class="nav nav-pills nav-justified">
                        <li><a href="#ptab1" id="tab1" data-toggle="tab"><span>Base URL</span></a></li>
                        <li><a href="#ptab2" id="tab2" data-toggle="tab"><span>Headers</span></a></li>
                        <li><a href="#ptab3" id="tab3" data-toggle="tab"><span>Operations</span></a></li>
                        <li><a href="#ptab4" id="tab4" data-toggle="tab"><span>Parameters</span></a></li>
                    </ul>
                    <div id="tab-content" class="tab-content">
                        <div class="progress progress-striped active">
                            <div class="progress-bar" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <div class="tab-pane" id="ptab1">
                            <div class="row">
                                <form class="form">
                                    <div class="form-group">
                                        <label class="col-sm-4">Service Name</label>
                                        <div class="col-sm-8">
                                            <input type="text" id="servicename" name="servicename" placeholder="Service Name"  class="form-control" value=""/>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label class="col-sm-4">Base URL</label>
                                        <div class="col-sm-8">
                                            <input type="text" id="baseUrl" name="baseUrl"  placeholder="Base URL" class="form-control" value="" />
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-sm-4">
                                            <label for="requiredAuthSwitch">Requires authentication</label>
                                        </div>
                                        <div class="col-sm-8">

                                            <input id="requiredAuthSwitch" name="requiredAuthSwitch" type="checkbox" checked data-size="small"></input>
                                         
                                        </div>

                                    </div>
                                    <div class="form-group">
                                        <div class="col-sm-12" style="margin-top:15px;">
                                            <div class="row" id="authenticationComponentsDiv" >

                                                <div class="form-group">
                                                    <div class="col-sm-4">
                                                        <label for="serviceUserName">User Name</label>   
                                                    </div>
                                                    <div class="col-sm-8">
                                                        <input type="text"  id="serviceUserName"  name="serviceUserName" placeholder="Service User Name" class="form-control" value="" />
                                                    </div>
                                                </div>
                                                <div class="form-group">
                                                    <div class="col-sm-4">
                                                        <label for="serviceUserPassword">Password</label>      
                                                    </div>
                                                    <div class="col-sm-8">
                                                        <input type="password"  id="serviceUserPassword" name="serviceUserPassword" placeholder="Service Password" class="form-control" value="" />
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </form>




                            </div>
                        </div>


                        <div class="tab-pane" id="ptab2">
                            <form class="form" id="headersForm">
                                <div class="form-group">
                                    <label class="col-sm-11">Default Headers:</label>
                                </div>
                                <div class="form-group">
                                    <div class="col-sm-5">
                                        <input type="text" id="headerkey1" name="headerkey1" placeholder="Header Name" class="form-control"  />
                                    </div>

                                    <div class="col-sm-5">
                                        <input type="text" id="headervalue1" name="headervalue1" placeholder="Header Value" class="form-control" />
                                    </div>
                                    <div class="col-sm-2"> 
                                        <input type="button" id="addHeader" name="addHeader" class="form-control btn btn-success btn-sm" value="Add"/>
                                    </div>
                                </div>

                            </form>
                        </div>

                        <div class="tab-pane" id="ptab3">

                            <form class="form" id="operationForm">
                                <div id="operations">
                                    <div class="form-group">
                                        <label class="col-sm-12"><h3>Operations:</h3></label>
                                    </div>

                                    <div class="row">
                                        <div class="form-group" style="margin: 5px;">
                                            <div class="col-sm-2">
                                                <input type="text" id="operationName" name="operationName" placeholder="Operation Name" class="form-control"  />
                                            </div>
                                            <div class="col-sm-2">
                                                <select id="methodType" class="form-control">
                                                    <option value="GET">GET</option>
                                                    <option value="POST">POST</option>
                                                    <option value="PUT">PUT</option>
                                                    <option value="PATCH">PATCH</option>
                                                    <option value="DELETE">DELETE</option>
                                                    <option value="HEAD">HEAD</option>
                                                    <option value="OPTIONS">OPTIONS</option>
                                                </select>
                                            </div>                                         
                                            <div class="col-sm-4">
                                                <input type="text" id="path" name="path" placeholder="Path" class="form-control" />
                                            </div>
                                            <div class="col-sm-1">
                                                <label for="requiredOperationAuthSwitch">Requires auth.</label>
                                            </div>
                                            <div class="col-sm-1">
                                                <input id="requiredOperationAuthSwitch" name="requiredOperationAuthSwitch" type="checkbox" data-toggle="toggle" checked data-size="mini" ></input>
                                            </div>
                                            <div class="col-sm-2"> 
                                                <input type="button" id="addOperation" name="addOperation" class="form-control btn btn-success btn-sm" value="Add"/>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="col-sm-4">
                                            </div>
                                            <div class="col-sm-8">
                                            </div>
                                        </div>
                                        <div id="operationAuthComponentsDiv" class="col-md-12" style="margin-top: 10px;">
                                            <div class="form-group" >
                                                <div class="col-sm-4">
                                                </div>
                                                <div class="col-sm-3">
                                                    <label for="operationUserName">User name</label>
                                                </div>
                                                <div class="col-sm-5"  >
                                                    <input type="text" id="operationUserName" name="operationUserName" placeholder="Operation User Name" class="form-control" value=""/>
                                                </div>
                                            </div>
                                            <div class="form-group">
                                                <div class="col-sm-4">
                                                </div>
                                                <div class="col-sm-3">
                                                    <label for="operationPassword">Password</label>
                                                </div>
                                                <div class="col-sm-5">
                                                    <input type="password" id="operationPassword" name="operationPassword" placeholder="Operation Password" class="form-control" value=""/>
                                                </div>

                                            </div>
                                        </div>

                                    </div>

                                </div>


                            </form>
                        </div>

                        <div class="tab-pane" id="ptab4">
                            <div class="row" id="operationListDiv">
                                <div class="form-group">
                                    <select id="operationList" class="form-control">
                                        <option value="0">Operation Select.. </option>
                                    </select>
                                </div>
                            </div>
                            <div class="row" id="addParametersDiv">
                                <div class="form-group">

                                    <input type="hidden" id="parametersOperationName" value=""></input>

                                    <div class="col-sm-12"> 
                                        <label><h3>Parameters</h3></label>    
                                    </div>

                                </div>
                                <div class="row" style="margin:5px;">
                                    <div class="form-group">
                                        <div class="col-sm-2">
                                            <select id="paramType" class="form-control">
                                                <option value="FORM"> FORM </option>
                                                <option value="ROUTE"> ROUTE </option>
                                                <option value="QUERY"> QUERY </option>
                                                <option value="HEADER"> HEADER </option>
                                            </select>
                                        </div>
                                        <div class="col-sm-3">
                                            <input type="text" id="paramName" name="paramName" placeholder="Parameter name" class="form-control" />
                                        </div>
                                        <div class="col-sm-3">
                                            <input type="text" id="paramValue" name="paramValue" placeholder="Parameter value(Optional)" class="form-control" />
                                        </div>
                                        <div class="col-sm-1">
                                            <label for="requiredParameterSwitch"><h3>Required</h3></label> 
                                        </div>
                                        <div class="col-sm-1">
                                            <input id="requiredParameterSwitch"   name="requiredParameterSwitch" type="checkbox"  data-toggle="toggle" data-on="Required" data-off="Not Required" data-onstyle="success" data-offstyle="danger" checked data-size="mini"></input>
                                        </div>
                                        <div class="col-sm-2"> 
                                            <input type="button" id="addParams"   name="addParams"  style="width: 90%;" class="form-control btn btn-success btn-sm  pull-right" value="Add"/>
                                        </div>
                                    </div>
                                </div>


                            </div>

                            <div class="row" id="dynamicParametersDiv"  style="margin: 5px;">
                                
                                
                                
                            </div>


                        </div>

                    </div>



                    <ul class="pager wizard">
                        <li class="previous first"><a href="javascript:;">First</a></li>
                        <li class="previous"><a href="javascript:;">Previous</a></li>
                        <li class="next last"><a href="javascript:;">Last</a></li>
                        <li class="next"><a href="javascript:;">Next</a></li>
                        <li class="next finish" style="display:none;"><a href="javascript:;">Finish</a></li>
                    </ul>

                </div><!--/progressWizard-->
            </div><!--/porlets-content--> 
        </div><!--/block-web--> 

        <!--/block-web-->
    </div>
    <!--/col-md-12-->
    <script type="text/javascript"  src="../js/form-wizard.js"></script> 
</div>
<!-- End of Services. -->
