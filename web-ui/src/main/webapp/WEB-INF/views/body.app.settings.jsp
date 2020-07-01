<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"%>
<%@ taglib prefix="sec"
           uri="http://www.springframework.org/security/tags"%>


<div class="row">

    <div class="col-md-12">

        <div class="porlets-content">
            <h4 class="modal-title" id="titleLabel"><strong>PUSH NOTIFICATION</strong></h4>

            <div class="block-web">
                <form id="androidPushNotificationForm" class="form-horizontal row-border"
                      action="/apps/notifications/pushNotification/android" method="post" enctype="multipart/form-data" accept-charset='ISO-8859-1' data-parsley-validate >
                    <div class="modal-header">
                        <h4 class="modal-title" id="titleLabel">ANDROID</h4>
                    </div>
                    <div class="modal-body">

                        <div class="form-group">
                            <div class="col-sm-12">
                                <input name="appName" type="hidden" class="form-control" value="${applicationId}"></input>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-3 control-label">Api Key</label>
                            <div class="col-sm-9">
                                <input name="apiKey" type="text" class="form-control"
                                       data-parsley-trigger="change"
                                       data-parsley-required-message="Please enter a api key for the application"
                                       data-parsley-errors-container="span#applicationApiKeyError"
                                       required> <span id="applicationApiKeyError"></span>
                            </div>
                        </div>
                        <div id="applicationUpload" class="form-group">
                            <label class="col-sm-3 control-label">GCM Service File</label>
                            <div class="col-sm-9">

                                <input id="androidPushNotificationUploadFile" type="file" name="androidPushNotificationUploadFile" accept=".json"
                                       data-parsley-required-message="Please select an google-services.json file"
                                       data-parsley-errors-container="span#pushNotificationUploadError" style="width:100%;"><span id="pushNotificationUploadError"></span>

                                    <!--                                    <div class="progress progress-striped active" align="center">
                                                                            <div id="probar" style="width:0%" aria-valuemax="100" aria-valuemin="0" aria-valuenow="60" role="progressbar" class="progress-bar progress-bar-primary"> 
                                                                                <p id="progressState"></p> </div>
                                                                        </div>-->

                            </div>

                        </div>



                    </div>


                    <div class="modal-footer">
                        <!--<button id="CloseForm" type="button" class="btn btn-default" data-dismiss="modal">Close</button>-->
                        <button id="SubmitForm" type="submit" class="btn btn-primary">Save</button>
                    </div>
                </form>

                <form id="applePushNotificationForm" class="form-horizontal row-border"
                      action="/apps/notifications/pushNotification/ios" method="post" enctype="multipart/form-data" accept-charset='ISO-8859-1' data-parsley-validate >
                    <div class="modal-header">
                        <h4 class="modal-title" id="titleLabel">APPLE</h4>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <div class="col-sm-12">
                                <input name="appName" type="hidden" class="form-control" value="${applicationId}"></input>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-3 control-label">Environment</label>
                            <div class="col-sm-9">
                                <select id="environmentSelect"  class="form-control">
                                    <option value="0">Select an environment</option>
                                    <option value="sandbox">Sandbox</option>
                                    <option value="production">Production</option>
                                </select>
                            </div>
                        </div>

                        <div id="applicationCertificateUpload" class="form-group">
                            <label class="col-sm-3 control-label">Certificate</label>
                            <div class="col-sm-9">

                                <input id="pushNotificationCertificateUploadFile" type="file" name="pushNotificationCertificateUploadFile" accept=".zip"
                                       data-parsley-required-message="Please select an certificate file"
                                       data-parsley-errors-container="span#pushNotificationUploadError" style="width:100%;"><span id="pushNotificationUploadError"></span>

                                    <!--                                    <div class="progress progress-striped active" align="center">
                                                                            <div id="probar" style="width:0%" aria-valuemax="100" aria-valuemin="0" aria-valuenow="60" role="progressbar" class="progress-bar progress-bar-primary"> 
                                                                                <p id="progressState"></p> </div>
                                                                        </div>-->

                            </div>

                        </div>
                        <div class="form-group">
                            <label class="col-sm-3 control-label">Password</label>
                            <div class="col-sm-9">
                                <input name="password" type="Password" class="form-control"
                                       data-parsley-trigger="change"
                                       data-parsley-required-message="Please enter a password for the application"
                                       data-parsley-errors-container="span#applicationPasswordError"
                                       required> <span id="applicationPasswordError"></span>
                            </div>
                        </div>

                    </div>
                    <div class="modal-footer">
                        <!--<button id="CloseForm" type="button" class="btn btn-default" data-dismiss="modal">Close</button>-->
                        <button id="SubmitForm" type="submit" class="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
            <form id="authorizationApplication" class="form-horizontal row-border"
                  action="/apps/authorizationSettings" method="post" enctype="multipart/form-data" accept-charset='ISO-8859-1' data-parsley-validate >
                <div class="modal-header">
                    <h4 class="modal-title" id="titleLabel"><strong>AUTHORIZATION</strong></h4>
                </div>
                <div class="modal-body">

                    <div class="form-group">
                        <label class="col-sm-3 control-label">Authorized Source</label>
                        <div class="col-sm-9">
                            <select id="authorizedUserGroupSelect" class="form-control">
                                <option value="0">Select a source..</option>
                                <option value="any">Any</option>
                                <option value="noAuthorization">No Authorization</option>
                                <option value="systemUser">System</option>
                                <option value="ldap">LDAP</option>
                                <c:forEach  var="ldapConfiguration" items="${ldapList}">
                                    <option value="${ldapConfiguration.fullName}">${ldapConfiguration[0].name}</option>
                                </c:forEach>
                            </select>
                        </div>
                    </div>

                </div>
                <div class="modal-footer">
                    <!--<button id="CloseForm" type="button" class="btn btn-default" data-dismiss="modal">Close</button>-->
                    <button id="SubmitForm" type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>


        </div>
        <!--/porlets-content-->

        <!--/col-md-12-->
    </div>
    <!--/row-->