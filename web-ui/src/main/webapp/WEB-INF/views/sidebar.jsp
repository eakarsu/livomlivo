<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="sec"
           uri="http://www.springframework.org/security/tags"%>


<!--Start of edit user modal. -->
<div class="modal fade" id="changeUserAttributesModal"   data-backdrop="static" tabindex="-1"
     role="dialog" aria-labelledby="titleLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h4 class="modal-title" id="titleLabel">Change User Attributes</h4>
            </div>
            <div class="modal-body">

                <div class="tab-container">
                    <ul class="nav nav-tabs">
                        <!--<li class="active"><a href="#change-user-name" data-toggle="tab">Name</a></li>-->
                        <li class=""><a href="#change-user-password" data-toggle="tab">Password</a></li>
                        <!--<li class=""><a href="#change-user-role" data-toggle="tab">Role</a></li>-->
                        <li class=""><a href="#change-user-mail" data-toggle="tab">Mail</a></li>
                    </ul>
                    <div class="tab-content">
                        <div class="tab-pane cont active" id="change-user-password">
                            <form id="changeUserPasswordForm" 
                                  action="#"  data-parsley-validate novalidate>
                                <div class="form-group">
                                    <label class="col-sm-3 control-label">User Password</label>
                                    <div class="col-sm-7">
                                        <input  type="password" maxlength="32"  minlength="4" class="form-control parsley-validated "  data-parsley-trigger="change"	id="iUserPassword" placeholder="Password" required>
                                    </div>
                                    <button class="col-sm-2 btn btn-primary" type="button" style="font-size: 10px;" id="generatePassButton">Auto Generate</button>
                                </div>

                                <div class="form-group">
                                    <label class="col-sm-3 control-label">Retype Password</label>
                                    <div class="col-sm-7">
                                        <input id="iRetypeUserPassword" type="password"  class="form-control parsley-validated "	data-parsley-equalto="#iUserPassword" data-parsley-trigger="change" placeholder="Password"   required> 
                                            <span id="iUserPasswordError"></span>
                                    </div>
                                    <div class="col-sm-2"></div>
                                </div>
                                <div class="col-sm-3"></div>
                                <div class="col-sm-9">
                                    <button id="submitUserPasswordChange" type="submit" class="btn btn-primary">Change</button>
                                    <button  type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                                </div>
                            </form>
                        </div>
                        <div class="tab-pane" id="change-user-mail">
                            <form id="changeUserMailForm" class="form-horizontal row-border"
                                  action="" method="post" enctype="multipart/form-data" data-parsley-validate>
                                <div class="form-group">
                                    <label class="col-sm-3 control-label">User Mail</label>
                                    <div class="col-sm-9">
                                        <input name="nick" type="email" class="form-control"
                                               data-parsley-trigger="change"
                                               id="iUserMail"
                                               data-parsley-required-message="Please enter user's mail."
                                               data-parsley-errors-container="span#changeUserMailError"
                                               required> <span id="changeUserMailError"></span>
                                    </div>
                                </div>
                                <div class="col-sm-3"></div>
                                <div class="col-sm-9">
                                    <button id="submitUserMailChange" type="submit" class="btn btn-primary">Change</button>
                                    <button  type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    </div>
</div>
<!-- End of edit user modal. -->

<!-- Create new groups modal start. -->
<div id ="sCreateNewGroup" class="modal fade "   data-backdrop="static"  tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="#"  id ="createNewGroupForm" data-parsley-validate>

                <div class="modal-header">
                    <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                    <h4 id="ModalLabel" class="modal-title">Create New Group</h4>
                </div>
                <div class="modal-body">

                    <div class="form-group">
                        <label class="col-sm-3 control-label">Group Name</label>
                        <div class="col-sm-9">
                            <input name="groupName" id="cGroupName" type="text" class="form-control"
                                   data-parsley-trigger="change"
                                   data-parsley-required-message="Please enter a group name."
                                   data-parsley-errors-container="span#groupNameError"
                                   required> <span id="groupNameError"></span>
                        </div>
                    </div>
                    <!--                    <div class="form-group">
                                            <label class="col-sm-3 control-label">Domain</label>
                                            <div class="col-sm-9">
                                                <input name="domain" id ="cGroupDomain" type="text" class="form-control"
                                                       data-parsley-trigger="change"
                                                       data-parsley-required-message="Please enter group's domain."
                                                       data-parsley-errors-container="span#groupDomainError"
                                                       required> <span id="groupDomainError"></span>
                                            </div>
                                        </div>-->
                    <div class="form-group">
                        <label class="col-sm-3 control-label">Description</label>
                        <div class="col-sm-9">
                            <input id="cGroupDescription" name="cGroupDescription" type="text" class="form-control"
                                   data-parsley-trigger="change"
                                   data-parsley-required-message="Please enter group's description."
                                   data-parsley-errors-container="span#groupDescriptionError"
                                   required><span id="groupDescriptionError"></span>
                                <span id="groupCreationResult"></span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="border-top: none; padding:19px 35px 20px;">
                    <button class="btn btn-primary" id="createNewGroupButton" type="submit">Create</button>
                    <button data-dismiss="modal" class="btn btn-default">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</div>
<!-- Create new group modal end. -->


<!-- Create new web user modal start. -->
<div id ="sCreateNewWebUser" class="modal fade "   data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="#"  id ="createNewWebUserForm" method="post" data-parsley-validate>

                <div class="modal-header">
                    <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                    <h4 id="ModalLabel" class="modal-title">Create New Developer</h4>
                </div>
                <div class="modal-body">

                    <div class="form-group">
                        <label class="col-sm-3 control-label">User Name</label>
                        <div class="col-sm-9">
                            <input name="nick" id="cWebUserName" type="text" class="form-control"
                                   data-parsley-trigger="change"
                                   data-parsley-required-message="Please enter a user name."
                                   data-parsley-errors-container="span#userNameError"
                                   required> <span id="userNameError"></span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-3 control-label">User Mail</label>
                        <div class="col-sm-9">
                            <input name="nick" id ="cWebUserMail" type="email" class="form-control"
                                   data-parsley-trigger="change"
                                   data-parsley-required-message="Please enter user's mail."
                                   data-parsley-errors-container="span#userMailError"
                                   required> <span id="userMailError"></span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-3 control-label">User Password</label>
                        <div class="col-sm-9">
                            <input name="password2" type="password"
                                   class="form-control"
                                   data-parsley-trigger="change"
                                   data-parsley-required-message="Please enter a password."
                                   data-parsley-errors-container="span#userPass1Error"
                                   id="cWebUserPass"
                                   required> <span id="userPass1Error"></span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-sm-3 control-label">Retype Password</label>
                        <div class="col-sm-9">
                            <input name="password2" type="password" class="form-control"
                                   data-parsley-trigger="change"
                                   data-parsley-equalto="#cWebUserPass"
                                   data-parsley-required-message="Please enter a password."
                                   data-parsley-errors-container="span#userPass2Error"
                                   required> <span id="userPass2Error"></span>
                                <span id="webUserCreationResult"></span>
                        </div>
                    </div>

                </div>
                <div class="modal-footer" style="border-top: none; padding:19px 35px 20px;">
                    <button class="btn btn-primary" id="createNewWebUserButton" name="createNewWebUserButton" type="button">Submit</button>
                    <button data-dismiss="modal" class="btn btn-default">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</div>
<!-- Create new web user modal end. -->

<!-- Create new user modal start. -->
<div id ="sCreateNewUser" class="modal fade "  data-backdrop="static"  tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="modal-content">
            <form  action="#"  id ="createNewUserForm"  method="post" data-parsley-validate>

                <div class="modal-header">
                    <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                    <h4 id="ModalLabel" class="modal-title">Create New Client</h4>
                </div>
                <div class="modal-body">

                    <div class="form-group">
                        <label class="col-sm-3 control-label">User Name</label>
                        <div class="col-sm-9">
                            <input name="cUserName" id="cUserName" type="text" class="form-control"
                                   data-parsley-trigger="change"
                                   data-parsley-required-message="Please enter a user name."
                                   data-parsley-errors-container="span#userName2Error"
                                   required> <span id="userName2Error"></span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-3 control-label">User Mail</label>
                        <div class="col-sm-9">
                            <input name="cUserMail" id ="cUserMail" type="email" class="form-control"
                                   data-parsley-trigger="change"
                                   data-parsley-required-message="Please enter user's mail."
                                   data-parsley-errors-container="span#userMail2Error"
                                   required> <span id="userMail2Error"></span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-sm-3 control-label">Group</label>
                        <div class="col-sm-9">
                            <select id="selectGroupForUser" class="form-control"  >
                                <option value="0">Select a Group</option>
                                <c:choose>
                                    <c:when test="${groups.size() > 0}">
                                        <c:forEach var="group" items="${groups}">
                                            <option value="${group.name}">${group.name}</option>
                                        </c:forEach>
                                    </c:when>
                                </c:choose>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-3 control-label">User Password</label>
                        <div class="col-sm-9">
                            <input id="cUserPassword" name="cUserPassword" type="password" maxlength="32"  minlength="6"
                                   class="form-control"
                                   data-parsley-trigger="change"
                                   data-parsley-required-message="Please enter a password."
                                   data-parsley-errors-container="span#userPass2Error"
                                   id="cUserPass"
                                   required> <span id="userPass2Error"></span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-sm-3 control-label">Retype Password</label>
                        <div class="col-sm-9">
                            <input  id="cReTypePassword" name="cReTypePassword" type="password" class="form-control"
                                    data-parsley-trigger="change"
                                    data-parsley-equalto="#cUserPassword"
                                    data-parsley-required-message="Please enter a password."
                                    data-parsley-errors-container="span#userPass2Error"
                                    required> <span id="userPass2Error"></span>
                                <span id="userCreationResult"></span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="border-top: none; padding:19px 35px 20px;">
                    <button class="btn btn-primary" id="createNewUserButton" name="createNewUserButton" type="button">Submit</button>
                    <button data-dismiss="modal" class="btn btn-default">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</div>
<!-- Create new user modal end. -->
<!--Start of edit web user modal. -->
<div class="modal fade" id="changeWebUserAttributesModal"   data-backdrop="static" tabindex="-1"
     role="dialog" aria-labelledby="titleLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h4 class="modal-title" id="titleLabel">Change Web User Attributes</h4>
            </div>
            <div class="modal-body">

                <div class="tab-container">
                    <ul class="nav nav-tabs">
                        <!--<li class="active"><a href="#change-web-user-name" data-toggle="tab">Name</a></li>-->
                        <li class=""><a href="#change-web-user-password"  data-toggle="tab">Password</a></li>
                        <!--<li class=""><a href="#change-user-role" data-toggle="tab">Role</a></li>-->
                        <li class=""><a href="#change-web-user-mail" data-toggle="tab">Mail</a></li>
                    </ul>
                    <div class="tab-content">
                        <!--                        <div class="tab-pane cont active" id="change-web-user-name">
                                                    <form id="changeWebUserNameForm" class="form-horizontal row-border"
                                                          action="#"   data-parsley-validate>
                                                        <div class="form-group">
                                                            <label class="col-sm-3 control-label">User Name</label>
                                                            <div class="col-sm-9">
                                                                <input  type="text" class="form-control" id="iWebUserName"
                                                                        data-parsley-trigger="change"
                                                                        data-parsley-required-message="Please enter a user name."
                                                                        data-parsley-errors-container="span#changeWebUserNameError"
                                                                        required> <span id="changeWebUserNameError"></span>
                                                            </div>
                                                        </div>
                                                        <div class="col-sm-3"></div>
                                                        <div class="col-sm-9">
                        
                                                            <button id="submitWebUserNameChange" type="submit" class="btn btn-primary">Change</button>
                                                            <button  type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                                                        </div>
                                                    </form>
                                                </div>-->
                        <div class="tab-pane cont active" id="change-web-user-password">
                            <form id="changeWebUserPasswordForm" 
                                  action="#"   data-parsley-validate>
                                <div class="form-group">
                                    <label class="col-sm-3 control-label">User Password</label>
                                    <div class="col-sm-9">
                                        <input id="iWebUserPassword" class="form-control" type="password"  maxlength="32"  minlength="4" class="form-control parsley-validated" data-parsley-trigger="change" data-parsley-trigger="change"  placeholder="Password" required>
                                            <span id="iWebUserPasswordError"></span>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label class="col-sm-3 control-label">Retype Password</label>
                                    <div class="col-sm-9">
                                        <input id="iWebUserReTypePassword" class="form-control" type="password"  maxlength="32"  minlength="4" class="form-control parsley-validated"	data-parsley-equalto="#iWebUserPassword" data-parsley-trigger="change" placeholder="Password" required> 
                                            <span id="iWebUserReTypePasswordError"></span>
                                    </div>
                                </div>
                                <div class="col-sm-3"></div>
                                <div class="col-sm-9">

                                    <button id="submitWebUserPasswordChange" type="submit" class="btn btn-primary">Change</button>
                                    <button  type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                                </div>
                            </form>
                        </div>

                        <div class="tab-pane" id="change-web-user-mail">
                            <form id="changeWebUserMailForm" class="form-horizontal row-border"
                                  action="" method="post" enctype="multipart/form-data" data-parsley-validate>
                                <div class="form-group">
                                    <label class="col-sm-3 control-label">User Mail</label>
                                    <div class="col-sm-9">
                                        <input name="nick" type="email" class="form-control"
                                               data-parsley-trigger="change"
                                               id="iWebUserMail"
                                               data-parsley-required-message="Please enter user's mail."
                                               data-parsley-errors-container="span#changeWebUserMailError"
                                               required> <span id="changeWebUserMailError"></span>
                                    </div>
                                </div>
                                <div class="col-sm-3"></div>
                                <div class="col-sm-9">
                                    <button id="submitWebUserMailChange" type="submit" class="btn btn-primary">Change</button>
                                    <button  type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    </div>
</div>
<!-- End of edit web user modal. -->


<!-- Start of create new application modal. -->
<div class="modal fade" id="createApplicationModal"   data-backdrop="static" tabindex="-1"
     role="dialog" aria-labelledby="titleLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <form id="createApplication" class="form-horizontal row-border"
                  action="/apps/create" method="post" enctype="multipart/form-data" accept-charset='ISO-8859-1' data-parsley-validate >
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                    <h4 class="modal-title" id="titleLabel">Create new application</h4>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="col-sm-3 control-label">Name</label>
                        <div class="col-sm-9">
                            <input name="name" type="text" class="form-control" 
                                   data-parsley-trigger="change"   minlength="6"
                                   data-parsley-stringlength-message="The full name must be more than 6" 
                                   data-parsley-required-message="Please enter a name for the new application"
                                   data-parsley-errors-container="span#applicationNameError"
                                   required> <span id="applicationNameError"></span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-3 control-label">Description</label>
                        <div class="col-sm-9">
                            <textarea name="description" class="form-control"
                                      data-parsley-trigger="change"
                                      data-parsley-required-message="Please enter a description for the new application"
                                      data-parsley-errors-container="span#applicationDescriptionError"
                                      required></textarea>
                            <span id="applicationDescriptionError"></span>
                        </div>
                    </div>

                    <div id="applicationUpload" class="form-group" style="display: none;">
                        <label class="col-sm-3 control-label">Application Archive</label>
                        <div class="col-sm-9">

                            <input id="applicationUpload" type="file" name="applicationArchive" accept=".zip"
                                   data-parsley-required-message="Please select an archive containing the application"
                                   data-parsley-errors-container="span#applicationUploadError" style="width:100%;"><span id="applicationUploadError"></span>
                                <br>
                                <div class="progress progress-striped active" align="center">
                                    <div id="probar" style="width:0%" aria-valuemax="100" aria-valuemin="0" aria-valuenow="60" role="progressbar" class="progress-bar progress-bar-primary"> 
                                        <p id="progressState"></p> </div>
                                </div>

                        </div>

                    </div>
                    <div id="applicationUploadSuggestion" class="form-group">
                        <div class="col-sm-3 control-label"></div>
                        <div class="col-sm-9" style="text-align: right;">
                            <a id="applicationUploadSuggesstion" href="#" style="color: #36a6ff;">I want to upload my application template...</a>
                        </div>
                    </div>

                </div>

                <div class="form-group" id="appFrameworkSelectDiv">
                    <label class="col-sm-3 control-label">Framework</label>
                    <div class="col-sm-9">
                        <div class="radio">
                            <label>
                                <input type="radio" value="jquery" id="optionJquery" name="framework">
                                    <span class="custom-radio"></span>Jquery Mobile </label>
                        </div>
                        <div class="radio">
                            <label>
                                <input type="radio"  checked="checked" value="empty" id="optionEmpty" name="framework">
                                    <span class="custom-radio"></span>Free Form</label>
                        </div>
                    </div>
                </div>

                <div class="form-group" id="drafts-jquery-div"  style="display: none;" >
                    <div class="col-md-1"></div>
                    <div class="picker">
                        <select id="templateName" name="templateName" class="image-picker show-html  show-labels">
                            <option id="template1" data-img-src="/images/framework/jquerymobile/template1.png" value="template1">Bottom Tabs</option>
                            <option id="template2" data-img-src="/images/framework/jquerymobile/template2.png" value="template2">Kiosk</option>
                            <option id="template3"   data-img-src="/images/framework/jquerymobile/nightly.png" value="nightly">Top SideBar</option>
                            <option id="template4"   data-img-src="/images/framework/jquerymobile/emdot.png" value="emdot">Corporate</option>
                        </select>
                    </div>
                </div>
                <div class="alert alert-danger"> 
                    <strong>Warning:</strong> You can't retrieve or change this in the future..</div>

                <div class="modal-footer">
                    <button id="CloseForm" type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button id="SubmitForm" type="submit" class="btn btn-primary">Create</button>
                </div>
            </form>
        </div>
    </div>
</div>
<!-- End of create application modal. -->
<!-- Delete application modal start-->
<div id ="deleteAppModal" class="modal fade "    data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                <h4 id="ModalLabel" class="modal-title">Delete Application</h4>
            </div>
            <div class="modal-body">

                <span class="col-sm-12" id="deleteAppText"></span>

            </div>
            <div class="modal-footer">
                <button   id="deleteAppButton" class="btn btn-danger" type="button" >Delete</button>
                <button data-dismiss="modal" class="btn btn-default" type="button" >Nope</button>
            </div>

        </div>
    </div>
</div>
<!-- Delete application modal end -->

<!-- Delete user modal start. -->
<div id ="deleteUserModal" class="modal fade "   data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                <h4 id="DeleteUserModalLabel" class="modal-title">Delete Application</h4>
            </div>
            <div class="modal-body">

                <span class="col-sm-12" id="deleteUserText"></span>
                <span id="deleteUserError"></span>

            </div>
            <div class="modal-footer">
                <button   id="deleteUserButton" class="btn btn-danger" type="button" >Delete</button>
                <button data-dismiss="modal" class="btn btn-default" type="button" >Nope</button>
            </div>

        </div>
    </div>
</div>

<!-- Delete user modal end. -->
<!-- Delete web user modal start. -->
<div id ="deleteWebUserModal" class="modal fade "   data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                <h4 id="DeleteWebUserModalLabel" class="modal-title">Delete Application</h4>
            </div>
            <div class="modal-body">

                <span class="col-sm-12" id="deleteWebUserText"></span>
                <span id="deleteWebUserError"></span>

            </div>
            <div class="modal-footer">
                <button   id="deleteWebUserButton" class="btn btn-danger" type="button" >Delete</button>
                <button data-dismiss="modal" class="btn btn-default" type="button" >Nope</button>
            </div>

        </div>
    </div>
</div>

<!-- Delete web user modal end. -->
<!-- Download application modal start. -->
<div id ="downloadApplicationModal" class="modal fade "   data-backdrop="static"  tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                <h4 id="downloadApplicationModalLabel" class="modal-title">Download Application</h4>
            </div>
            <div class="modal-body">

                <span class="col-sm-12" id="downloadApplicationText"></span>
                <span id="downloadApplicationError"></span>

            </div>
            <div class="modal-footer">
                <button  id="downloadAppButton" class="btn btn-primary" type="button" >Download Application</button>
                <button data-dismiss="modal" class="btn btn-default" type="button" >Nope</button>
            </div>

        </div>
    </div>
</div>
<!-- Download application modal end. -->
<!-- Modal for folder creation -->
<div id ="sCreateFolder" class="modal fade "   data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <form id="folderCreation" class="form-horizontal row-border"
                  action="/app/fileCreate" method="post"  data-parsley-validate>

                <div class="modal-header">
                    <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                    <h4 id="ModalLabel" class="modal-title">Create Folder</h4>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="col-sm-2 control-label">Folder Name</label>
                        <div class="col-sm-6">

                            <input name="filepath" id ="inputFolderPath" type="hidden"/>
                            <input name="filetype" id ="inputFolderType" type="hidden"/>
                            <input name="appId" id ="inputFolderAppId" type="hidden"/>

                            <input name="filename" id="inputFolderName" type="text" class="form-control"
                                   data-parsley-trigger="change"
                                   data-parsley-required-message="Please enter a name for the file"
                                   data-parsley-errors-container="span#folderNameError"
                                   required/> <span id="folderNameError"></span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button data-dismiss="modal" class="btn btn-default" type="button" id="closeFolderCreate">Close</button>
                    <button class="btn btn-primary" type="submit" id="saveFolderCreate">Save File</button>
                </div>
            </form>


        </div>
    </div>
</div>

<!-- Modal for file creation -->
<div id ="sCreateFile" class="modal fade "    data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <form id="fileCreation" class="form-horizontal row-border"
                  action="/app/fileCreate" method="post"  data-parsley-validate>

                <div class="modal-header">
                    <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                    <h4 id="ModalLabel" class="modal-title">Create File</h4>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="col-sm-2 control-label">File Name</label>
                        <div class="col-sm-6">

                            <input name="filepath" id ="inputFilePath" type="hidden"/>
                            <input name="filetype" id ="inputFileType" type="hidden"/>
                            <input name="appId" id ="inputAppId" type="hidden"/>

                            <input name="filename" id="inputFileName" type="text" class="form-control"
                                   data-parsley-trigger="change"
                                   data-parsley-required-message="Please enter a name for the file"
                                   data-parsley-errors-container="span#fileNameError"
                                   required/> <span id="fileNameError"></span>
                        </div>
                    </div>

                </div>
                <div class="modal-footer">
                    <button data-dismiss="modal" class="btn btn-default" type="button" id="closeFileCreate">Close</button>
                    <button class="btn btn-primary" type="submit" id="saveFileCreate">Save File</button>
                </div>
            </form>


        </div>
    </div>
</div>


<!-- Modal for file uploading-->
<div id ="sUploadFile" class="modal fade "    data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="ModalLabel2" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="modal-content">
            <form id="fileUploading" class="form-horizontal row-border"
                  action="/app/fileUpload" method="post" enctype="multipart/form-data" data-parsley-validate>

                <div class="modal-header">
                    <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                    <h4 id="ModalLabel2s" class="modal-title">Upload File</h4>
                </div>
                <div class="modal-body">

                    <div  class="form-group" >
                        <label class="col-sm-3 control-label">File to Upload</label>
                        <div class="col-sm-9">

                            <input type="hidden" name="upFilePath" id="inputUpFilePath"/>
                            <input name="appId" id ="inputUpAppId" type="hidden"/>
                            <input id="fileUpload_1" type="file" name="applicationFile" 
                                   data-parsley-required-message="Please select a file to upload"
                                   data-parsley-errors-container="span#fileUploadError" style="width:100%;"/>
                            <span id="fileUploadError"></span>
                            <br>
                            <div class="progress progress-striped active" align="center">
                                <div id="probarfile" style="width:0%" aria-valuemax="100" aria-valuemin="0" aria-valuenow="60" role="progressbar" class="progress-bar progress-bar-primary"> 
                                    <p id="progressStateFile"></p> </div>
                            </div>

                        </div>

                    </div>
                </div>
                <div class="modal-footer">
                    <button data-dismiss="modal" class="btn btn-default" type="button" id ="dontUpload">Close</button>
                    <button class="btn btn-primary" type="submit" id="upLoadFile">Save File</button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="nav-collapse top-margin fixed box-shadow2 hidden-xs" id="sidebar">
    <div class="leftside-navigation">
        <div class="sidebar-section sidebar-user clearfix">
            <div class="sidebar-user-avatar">
                <img id="logoIcon" alt="" src="${userIconSrc}" ></img>
            </div>
            <div class="sidebar-user-name">
                <sec:authentication property="principal.userName"/>
            </div> 
            <div class="sidebar-user-links">
                <a title="" data-placement="bottom" data-toggle="" href="#"  id="idProfile" data-original-title="User">
                    <i class="fa fa-user"></i></a> 
                <!--                <a id="idInbox"  title="" data-placement="bottom" data-toggle="" href="inbox.html" data-original-title="Messages">
                                    <i class="fa fa-envelope-o"></i></a> -->
                <!--                <a title="" data-placement="bottom" data-toggle="" href="/logout" data-original-title="Logout">
                                    <i class="fa fa-sign-out"></i></a>-->
            </div>
        </div>
        <ul id="nav-accordion" class="sidebar-menu">
            <li>
                <h3>
                    Applications<a id="createApplication" data-toggle="modal"
                                   data-target="#createApplicationModal" data-backdrop="static" href="#"
                                   style="float: right; width: 18px; height: 18px; padding: 3px; margin: 0;"><i
                            class="fa fa-plus"></i></a>
                </h3>
            </li>

            <c:choose>
                <c:when test="${applications.size() > 0}">
                    <c:forEach var="application" items="${applications}">
                        <li class="app dcjq-parent-li" data-application-id="${application.name}">
                            <a id="app" href="/apps/">  
                                <!--<img src="../images/mobile-icon.png" style="width: 24px; height: 24px; border-radius: 10px; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box;">-->
                                <i class="fa fa-angle-right"></i>
                                <!--<span class="glyphicon glyphicon-th"></span>--> 
                                <span style="padding-left: 10px">${application.name}</span>
                            </a>
                            <!--   	<ul class="sub">
                            <c:choose>
                                <c:when test="${application.screens.size() > 0}">
                                    <c:forEach items="${application.screens}" var="entry">
                                            <li class="screen" data-screen-id="${entry.key}"><a href="#"><i class="fa fa-angle-right"></i>
                                                            <i class="fa fa-code"></i> <c:out value="${entry.value.title}" /></a></li>
                                    </c:forEach>
                                    
                                </c:when>
                                <c:otherwise>
                                        <li><span
                                                style="display: block; font-size: 10pt; margin: 10px; text-align: center;">You
                                                        don't have any screens.</span></li>
                                </c:otherwise>
                            </c:choose>
                    </ul>
                            -->

                        </li>
                    </c:forEach>
                </c:when>
                <c:otherwise>

                    <li><span style="display: block; margin: 10px;">You
                            don't have any applications.</span></li>

                </c:otherwise>

            </c:choose>
            <div id="holder" data-holder-value ="" style="display:none;"> </div> 
            <li>
                <h3>Administration</h3>
            </li> 

            <c:if test="${checkAdmin}">
                <li>
                    <a href="javascript:return false;" id="idWebUsersList"> 
                        <i class="fa fa-user-md"></i> 
                        <span>User Management </span>
                        <!--                    <b class="badge bg-danger pull-right">3</b>-->
                    </a>
                </li>
            </c:if>
            <li><a href="javascript:return false;" id ="licensing">
                    <i class="fa fa-certificate"></i> 
                    <span>Licensing</span>
                </a>

            </li>
            <li class="sub-menu dcjq-parent-li"><a href="javascript:;" class="dcjq-parent">
                    <i class="fa fa-user"></i> 
                    <span>Client Management</span>
                </a>
                <ul class="sub">
                    <li><a href="#" id="idUserGroups"><i
                                class="fa fa-angle-right"></i> <i  class="fa fa-users"></i>
                            System Groups</a></li>
                    <li><a href="#" id="idUsersList"><i
                                class="fa fa-angle-right"></i> <i  class="fa fa-users"></i>
                            System Users</a></li>
                    <li><a href="#" id="idLdapAD"><i
                                class="fa fa-angle-right"></i> <i  class="fa fa-list-alt"></i>
                            LDAP / AD</a></li>
                    <li><a href="#" id="idAuthentication"><i
                                class="fa fa-angle-right"></i> <i  class="fa fa-key"></i>
                            AA</a></li>


                </ul>


            </li>


            <li><a href="javascript:return false;" id="idServices">
                    <i class="fa fa-cogs"></i> 
                    <span>Service Management</span>
                </a>
                <!--<ul class="sub">-->
                <!--                    <li><a href="#" id="idServices"><i
                                                class="fa fa-angle-right"></i> <i  class="fa fa-cogs"></i>
                                            Services</a></li>
                                    <li><a href="#" id="idFormGenerator"><i
                                                class="fa fa-angle-right"></i> <i  class="fa fa-table"></i>
                                            Form Generator</a></li>-->
                <!--</ul>-->

            </li>


            <!--             <li class="sub-menu dcjq-parent-li"><a href="#" id ="idServices">
                                <i class="fa fa-road"></i>
                                <span>Services</span>
                            </a>
                             
                              <ul class="sub">
                                <li><a href="#" id="idIntegrationWizard"><i
                                            class="fa fa-angle-right"></i> <i  class="fa fa-users"></i>
                                        Integration Wizard</a></li>
                                <li><a href="#" id="idManageServices"><i class="fa fa-angle-right"></i> <i
                                            class="fa fa-cogs"></i> Manage Services</a></li>
                            </ul>
                             
                        </li>-->

            <!--        <li class="sub-menu dcjq-parent-li"><a href="javascript:;"
                                                               class="dcjq-parent"> <i class="fa fa-bar-chart-o"></i> <span>Reports</span></a>
                            <ul class="sub">
                                <li><a href="javascript:return false;"><i
                                            class="fa fa-angle-right"></i> Analytics</a></li>
                                <li><a href="#"><i class="fa fa-angle-right"></i> Logs</a></li>
                            </ul>
                        </li>-->


            <li> <a href="#" id="idGlobalSettings">
                    <i class="fa fa-wrench"></i> 
                    <span>Global Settings</span>
                </a>
            </li>

            <li class="sub-menu dcjq-parent-li"><a href="javascript:;" class="dcjq-parent"> <i
                        class="fa fa-info" style="width: 22px; text-align: center;"></i> <span>
                        Support</span>
                </a>
                <ul class="sub">
                    <li><a href="#" id="idKnowledgeBase"><i
                                class="fa fa-angle-right"></i> <i class="fa fa-book"></i>
                            Knowledge Base</a></li>
                    <li><a href="#"><i class="fa fa-angle-right"></i> <i
                                class="fa fa-question"></i> FAQ</a></li>
                </ul></li>
            <li><div style="height: 30px;"></div></li>
        </ul>
        <!--/nav-accordion sidebar-menu-->
    </div>
    <!--/leftside-navigation-->
</div>

<div id ="successModal" class="modal fade "    data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header modal-header-success">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h1><i class="glyphicon glyphicon-thumbs-up"></i> Success</h1>
            </div>
            <div class="modal-body">
                <div class="alert alert-success" id="alertText"> 
                    <!--<span class="col-sm-12" id="informationText"></span>-->
                </div>
            </div>
            <div class="modal-footer">
                <button data-dismiss="modal" class="btn btn-default" type="button" >Close</button>
            </div>

        </div>
    </div>
</div>

<!--Modal for image uploading-->
<div id ="sUploadImage" class="modal fade "   data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="ModalLabel2" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="modal-content col-md-9">
            <div class="row " >
                <div class="col-md-12">
                    <div class="block-web">
                        <form id="ImageUploading" class="form-horizontal row-border"
                              action="/uploadImage" method="post" enctype="multipart/form-data" data-parsley-validate>

                            <div class="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                                <h4 id="ModalLabel2s" class="modal-title">Account Settings</h4>
                            </div>
                            <div  class="form-group" >
                                <img  class="col-sm-3" style="max-width: 100%;max-height: 100%;" id="logoIconPreview" alt="avatar" src="${userIconSrc}" ></img>
                                <div class="col-sm-9">
                                    <h5>Change profile image</h5> 

                                    <div class="fallback">
                                        <input id="file" type="file" name="file"  style="width:100%;"  />
                                    </div>

                                    <input id="uploadButton" type="submit"  class="btn btn-primary pull-right"  value="Upload" /> 
                                    <span id="imageUploadError"></span>
                                    <br>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="block-web">
                        <div class="tab-pane cont active" id="change-web-user-attributes">
                            <form id="modifyAccountInfosForm" class="form-horizontal row-border"
                                  action="#"   data-parsley-validate>

                                <input  type="hidden" class="form-control" id="iDeveloperUserName" value="${user.userName}"></input>


                                <div class="form-group">
                                    <label class="col-sm-3 control-label">User Password</label>
                                    <div class="col-sm-9">
                                        <input  type="password" maxlength="32"  minlength="4" class="form-control parsley-validated " data-parsley-trigger="change" id="iDeveloperPassword" placeholder="Password">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label class="col-sm-3 control-label">Retype Password</label>
                                    <div class="col-sm-9">
                                        <input  type="password"  class="form-control parsley-validated " data-parsley-equalto="#iDeveloperPassword"  id="iRetypePassword" data-parsley-trigger="change" placeholder="Password"> 
                                            <span id="iDeveloperPasswordError"></span>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-3 control-label">User Mail</label>
                                    <div class="col-sm-9">
                                        <input name="nick" type="email" class="form-control"
                                               data-parsley-trigger="change"
                                               id="iDeveloperMail"
                                               placeholder="Email"
                                               data-parsley-required-message="Please enter user's mail."
                                               data-parsley-errors-container="span#changeDeveloperMailError"
                                               value="${user.userMail}"> <span id="changeDeveloperMailError"></span>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="col-sm-3"></div>
                                    <div class="col-sm-9">
                                        <button id="submitModifyDeveloper" type="submit" class="btn btn-primary pull-right">Change</button>
                                        <button  type="button" class="btn btn-default pull-right" style="margin-right: 5px;" data-dismiss="modal">Close</button>
                                        <span id="modifyAccountError"></span>
                                    </div>

                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>


<!-- Modal for errors -->
<div id ="ErrorModal" class="modal fade "   data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                <h4 id="ModalLabel" class="modal-title">Error</h4>
            </div>
            <div class="modal-body">
                <div class="alert alert-danger" style="height:50px;"> <span class="col-sm-12" id="errorText" ></span> </div>


            </div>
            <div class="modal-footer">
                <button data-dismiss="modal" class="btn btn-default" type="button">Close</button>
            </div>

        </div>
    </div>
</div>



<!-- Modal for importUsers -->
<div id ="ImportUsersWarningModal"   data-backdrop="static"  class="modal fade " tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                <h4 id="ModalLabel" class="modal-title">Warning</h4>
            </div>
            <div class="modal-body">
                <div class="alert alert-danger" style="height:60px;"> <span class="col-sm-12" id="warningText" ></span> </div>


            </div>
            <div class="modal-footer">
                <button data-dismiss="modal" class="btn btn-default" type="button">No</button>
                <button class="btn btn-primary" type="button" id="controlSuccessButton">Yes</button>
            </div>

        </div>
    </div>
</div>

<!-- Shortcuts modal start. -->
<div id ="Shortcuts" class="modal fade "   data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="#"  id ="shortcutsForm" data-parsley-validate>

                <div class="modal-header">
                    <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                    <h4 id="ModalLabel" class="modal-title">Shortcuts</h4>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="col-sm-3 control-label">F11</label>
                        <div class="col-sm-9">
                            <label class="col-sm-9 control-label">Full screen mode</label>
                        </div>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="col-sm-3 control-label ">ESC</label>
                        <div class="col-sm-9">
                            <label class="col-sm-9 control-label">Full screen mode close it.</label>
                        </div>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="col-sm-3 control-label ">CTRL-S</label>
                        <div class="col-sm-9">
                            <label class="col-sm-9 control-label">Application save.</label>
                        </div>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="col-sm-3 control-label ">CTRL-D</label>
                        <div class="col-sm-9">
                            <label class="col-sm-9 control-label">Application save and deploy.</label>
                        </div>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="col-sm-3 control-label ">CTRL-SPACE</label>
                        <div class="col-sm-9">
                            <label class="col-sm-9 control-label">Auto-complete.</label>
                        </div>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="col-sm-3 control-label ">CTRL-Z</label>
                        <div class="col-sm-9">
                            <label class="col-sm-9 control-label">Undo last change</label>
                        </div>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="col-sm-3 control-label ">CTRL-Y</label>
                        <div class="col-sm-9">
                            <label class="col-sm-9 control-label">Redo last change(Reverse Z)</label>
                        </div>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="col-sm-3 control-label ">CTRL-Shift-Z</label>
                        <div class="col-sm-9">
                            <label class="col-sm-9 control-label">Undo after preview</label>
                        </div>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="col-sm-3 control-label ">CTRL-Shift-Y</label>
                        <div class="col-sm-9">
                            <label class="col-sm-9 control-label">Redo after preview</label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="border-top: none; padding:19px 35px 20px;">
                    <button data-dismiss="modal" class="btn btn-default">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!--<style>
    #restServiceWizardModalDiv{
        width:1024px;
    }
    #soapServiceWizardModalDiv{
        width:1024px;
    }
</style>-->

<!--Start of edit rest service modal. -->
<div class="modal fade" id="restServiceWizardModal"   data-backdrop="static" tabindex="-1"
     role="dialog" aria-labelledby="titleLabel" aria-hidden="true">
    <div id="restServiceWizardModalDiv" class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h4 class="modal-title" id="titleLabel">REST Service Wizard</h4>

            </div>
            <div class="modal-body">

                <div class="row">
                    <div class="col-md-12">
                        <div class="block-web">
                            <!--                            <div id="pageHeader" class="header">
                                                            <div class="actions"> <a href="#" class="minimize"><i class="fa fa-chevron-down"></i></a> <a href="#" class="refresh"><i class="fa fa-repeat"></i></a> <a href="#" class="close-down"><i class="fa fa-times"></i></a> </div>
                                                            <h3 class="content-header">Service Wizard</h3>
                                                        </div>-->
                            <div class="porlets-content">
                                <div id="restProgressWizard" class="basic-wizard">
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
                                                            <div class="col-sm-3">
                                                                <input type="text" id="path" name="path" placeholder="Path" class="form-control" />
                                                            </div>
                                                            <div class="col-sm-1">
                                                                <label for="requiredOperationAuthSwitch">Requires auth.</label>
                                                            </div>

                                                            <div class="col-sm-1">
                                                                <input id="requiredOperationAuthSwitch" name="requiredOperationAuthSwitch" type="checkbox" data-toggle="toggle" checked data-size="mini" ></input>
                                                            </div>
                                                            <div class="col-sm-1"></div>
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
                                                            <!--<label>Param Type </label>-->
                                                        </div>
                                                        <div class="col-sm-2">
                                                            <label>Param Name </label>
                                                        </div>
                                                        <div class="col-sm-2">
                                                            <label>Param Value </label>
                                                        </div>
                                                        <div class="col-sm-2">
                                                            <label>Field Name </label>
                                                        </div>
                                                        <div class="col-md-1">
                                                            <label>Required</label>
                                                        </div>
                                                        <div class="col-md-1">
                                                            <label>Hidden</label>
                                                        </div>
                                                        <div class="col-sm-2"> 
                                                            <!--<label>Action</label>-->
                                                        </div>
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
                                                        <div class="col-sm-2">
                                                            <input type="text" id="paramName" name="paramName" placeholder="Name" class="form-control" />
                                                        </div>
                                                        <div class="col-sm-2">
                                                            <input type="text" id="paramValue" name="paramValue" placeholder="Value(Optional)" class="form-control" />
                                                        </div>
                                                        <div class="col-sm-2">
                                                            <input type="text" id="fieldName" name="fieldName" placeholder="Placeholder value(Optional)" class="form-control" />
                                                        </div>
                                                        <div class="col-md-1">
                                                            <div class="checkbox">
                                                                <label>
                                                                    <input type="checkbox" id="requiredParameterCheckbox" value=""  />
                                                                    <span class="custom-checkbox"></span> </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-1">
                                                            <div class="checkbox">
                                                                <label>
                                                                    <input type="checkbox" id="hiddenParameterCheckbox" value=""  />
                                                                    <span class="custom-checkbox"></span> </label>

                                                                <!--<input id="requiredParameterSwitch"   name="requiredParameterSwitch" type="checkbox"  data-label-text="Required" data-toggle="toggle" data-on-text="ON" data-off-text="OFF" data-onstyle="success" data-offstyle="danger" checked data-size="small"></input>-->
                                                            </div>
                                                            <!--<input id="hiddenParameterSwitch"   name="hiddenParameterSwitch"  type="checkbox" data-label-text="Hidden"  data-toggle="toggle" data-on-text="ON" data-off-text="OFF" data-onstyle="success" data-offstyle="danger" checked data-size="small"></input>-->
                                                        </div>
                                                        <div class="col-sm-2"> 
                                                            <input type="button" id="addParams"   name="addParams" class="form-control btn btn-success btn-sm  pull-right" value="Add"/>
                                                        </div>
                                                    </div>

                                                </div>


                                            </div>

                                            <div class="row" id="dynamicParametersDiv"  style="margin: 5px;">



                                            </div>


                                        </div>

                                    </div>



                                    <ul class="pager wizard">
                                        <!--<li class="previous first"><a href="javascript:;">First</a></li>-->
                                        <li class="previous"><a href="javascript:;">Previous</a></li>
                                        <!--<li class="next last"><a href="javascript:;">Last</a></li>-->
                                        <li class="next"><a href="javascript:;">Next</a></li>
                                        <li class="next finish" style="display:none;"><a href="javascript:;">Finish</a></li>
                                    </ul>

                                </div><!--/progressWizard-->
                            </div><!--/porlets-content--> 
                        </div><!--/block-web--> 

                        <!--/block-web-->
                    </div>
                    <!--/col-md-12-->

                </div>
                <!-- End of Services. -->

            </div>
        </div>
    </div>
</div>
<!-- End of edit rest service modal. -->

<!--Start of edit soap service modal. -->
<div class="modal fade" id="soapServiceWizardModal"   data-backdrop="static" tabindex="-1"
     role="dialog" aria-labelledby="titleLabel" aria-hidden="true">
    <div id="soapServiceWizardModalDiv" class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h4 class="modal-title" id="titleLabel">Soap Service Wizard</h4>
            </div>
            <div class="modal-body">

                <div class="row">
                    <div class="col-md-12">
                        <div class="block-web">
                            <!--                            <div id="pageHeader" class="header">
                                                            <div class="actions"> <a href="#" class="minimize"><i class="fa fa-chevron-down"></i></a> <a href="#" class="refresh"><i class="fa fa-repeat"></i></a> <a href="#" class="close-down"><i class="fa fa-times"></i></a> </div>
                                                            <h3 class="content-header">Service Wizard</h3>
                                                        </div>-->
                            <div class="porlets-content">
                                <div id="soapProgressWizard" class="basic-wizard">
                                    <ul id="navTabs" class="nav nav-pills nav-justified">

                                        <li><a href="#stab1" id="soapTab1" data-toggle="tab"><span>Soap Configurations</span></a></li>

                                    </ul>
                                    <div id="tab-content" class="tab-content">

                                        <div class="tab-pane" id="stab1">
                                            <div class="row">
                                                <form  action="#"    data-parsley-validate id="soapProgressWizardForm">
                                                    <div class="form-group">
                                                        <label class="col-sm-4">Service Name</label>
                                                        <div class="col-sm-8">
                                                            <input type="text" id="serviceName" name="serviceName" placeholder="Service Name"  class="form-control parsley-validated" data-parsley-trigger="change" required/>
                                                        </div>
                                                    </div>
                                                    <div class="form-group">
                                                        <label class="col-sm-4">WSDL Adress</label>
                                                        <div class="col-sm-8">
                                                            <input type="text" id="wsdlAddress" name="wsdlAddress"  placeholder="Wsdl Address" class="form-control parsley-validated" data-parsley-trigger="change"  required/>
                                                        </div>
                                                    </div>

                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                    <ul class="pager wizard">
                                        <!--<li class="previous first"><a href="javascript:;">First</a></li>-->
                                        <!--<li class="previous"><a href="javascript:;">Previous</a></li>-->
                                        <!--<li class="next last"><a href="javascript:;">Last</a></li>-->
                                        <!--<li class="next"><a href="javascript:;">Next</a></li>-->
                                        <li class="next finish" style="display:none;"><a href="javascript:;">Finish</a></li>
                                    </ul>
                                </div><!--/progressWizard-->
                            </div><!--/porlets-content--> 
                        </div><!--/block-web--> 
                        <!--/block-web-->
                    </div>
                    <!--/col-md-12-->

                </div>
                <!-- End of Services. -->
            </div>
        </div>
    </div>
</div>
<!-- End of edit soap service modal. -->


<!--Start of edit SAP service modal. -->
<div class="modal fade" id="sapServiceWizardModal"   data-backdrop="static" tabindex="-1"
     role="dialog" aria-labelledby="titleLabel" aria-hidden="true">
    <div id="sapServiceWizardModalDiv" class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h4 class="modal-title" id="titleLabel">SAP Service Wizard</h4>
            </div>
            <div class="modal-body">

                <div class="row">
                    <div class="col-md-12">
                        <div class="block-web">

                            <div class="porlets-content">

                                <div id="sapProgressWizard" class="basic-wizard">
                                    <ul id="navTabs" class="nav nav-pills nav-justified">
                                        <li><a href="#saptab1" id="soapTab1" data-toggle="tab"><span>SAP Configuration</span></a></li>

                                    </ul>
                                    <div id="tab-content" class="tab-content">

                                        <div class="tab-pane" id="saptab1">
                                            <div class="row">
                                                <form  action="#"  data-parsley-validate id="sapProgressWizardForm">
                                                    <div class="form-group">
                                                        <label class="col-sm-4">Service Name</label>
                                                        <div class="col-sm-8">
                                                            <input type="text" id="sapServiceName" name="sapServiceName" placeholder="Service Name "  class="form-control parsley-validated" data-parsley-trigger="change" required/>
                                                        </div>
                                                    </div>
                                                    <div class="form-group">
                                                        <label class="col-sm-4">Host</label>
                                                        <div class="col-sm-8">
                                                            <input type="text" id="sapHost" name="sapHost" placeholder="Host "  class="form-control parsley-validated" data-parsley-trigger="change" required/>
                                                        </div>
                                                    </div>
                                                    <div class="form-group">
                                                        <label class="col-sm-4">System Number</label>
                                                        <div class="col-sm-8">
                                                            <input type="text" id="sapSysnr" name="sapSysnr"  placeholder="System Number" class="form-control parsley-validated" data-parsley-trigger="change"  required/>
                                                        </div>
                                                    </div>
                                                    <div class="form-group">
                                                        <label class="col-sm-4">Client</label>
                                                        <div class="col-sm-8">
                                                            <input type="text" id="sapClient" name="sapClient"  placeholder="Client" class="form-control parsley-validated" data-parsley-trigger="change"  required/>
                                                        </div>
                                                    </div>
                                                    <div class="form-group">
                                                        <label class="col-sm-4">User Name</label>
                                                        <div class="col-sm-8">
                                                            <input type="text" id="sapUserName" name="sapUserName"  placeholder="User Name" class="form-control parsley-validated" data-parsley-trigger="change"  required/>
                                                        </div>
                                                    </div>
                                                    <div class="form-group">
                                                        <label class="col-sm-4">Password</label>
                                                        <div class="col-sm-8">
                                                            <input type="password" id="sapPassword" name="sapPassword"  placeholder="Password" class="form-control parsley-validated" data-parsley-trigger="change"  required/>
                                                        </div>
                                                    </div>
                                                    <div class="form-group">
                                                        <label class="col-sm-4">Language</label>
                                                        <div class="col-sm-8">
                                                            <input type="text" id="sapLanguage" name="sapLanguage"  placeholder="Language (Optional)" class="form-control"/>
                                                        </div>
                                                    </div>
                                                    <div class="form-group">
                                                        <label class="col-sm-4">Expiration Time</label>
                                                        <div class="col-sm-8">
                                                            <input type="text" id="sapExpirationTime" name="sapExpirationTime"  placeholder="Expiration Time (Optional)" class="form-control"/>
                                                        </div>
                                                    </div>
                                                    <div class="form-group">
                                                        <label class="col-sm-4">Capacity</label>
                                                        <div class="col-sm-8">
                                                            <input type="text" id="sapCapacity" name="sapCapacity"  placeholder="Capacity (Optional)" class="form-control"/>
                                                        </div>
                                                    </div>
                                                    <div class="form-group">
                                                        <label class="col-sm-4">Limit</label>
                                                        <div class="col-sm-8">
                                                            <input type="text" id="sapLimit" name="sapLimit"  placeholder="Limit (Optional)" class="form-control"/>
                                                        </div>
                                                    </div>
                                                    <div class="form-group">
                                                        <label class="col-sm-4">SAP Router</label>
                                                        <div class="col-sm-8">
                                                            <input type="text" id="sapRouter" name="sapRouter"  placeholder="SAP Router (Optional)" class="form-control"/>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                    <ul class="pager wizard">
                                        <!--<li class="previous first"><a href="javascript:;">First</a></li>-->
                                        <!--<li class="previous"><a href="javascript:;">Previous</a></li>-->
                                        <!--<li class="next last"><a href="javascript:;">Last</a></li>-->
                                        <!--<li class="next"><a href="javascript:;">Next</a></li>-->
                                        <li class="next finish" style="display:none;"><a href="javascript:;">Finish</a></li>
                                    </ul>
                                </div><!--/progressWizard-->

                            </div><!--/porlets-content--> 
                        </div><!--/block-web--> 
                    </div> <!--/col-md-12-->
                </div>
                <!-- End of Services. -->
            </div>
        </div>
    </div>
</div>
<!-- End of edit SAP service modal. -->

<!--Start of form generator modal. -->
<div class="modal fade" id="formGeneratorModal"   data-backdrop="static" tabindex="-1"
     role="dialog" aria-labelledby="titleLabel" aria-hidden="true">
    <div id="formGeneratorModalDiv" class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h4 class="modal-title" id="titleLabel">Copy to App</h4>
            </div>
            <div class="modal-body">

                <div class="row">
                    <div class="col-md-12">
                        <div class="block-web">

                            <div class="porlets-content">
                                <div id="applicationListDiv">
                                    <form action="#"    data-parsley-validate id="soapProgressWizardForm">
                                        <div class="form-group">
                                            <select id="applicationList" class="form-control" required>
                                                <option value="">Application Select.. </option>
                                                <c:choose>
                                                    <c:when test="${applications.size() > 0}">
                                                        <c:forEach var="application" items="${applications}">
                                                            <option value="${application.name}">${application.name}</option>
                                                        </c:forEach>
                                                    </c:when>
                                                </c:choose>
                                            </select>
                                            <span id="errorMsgText"></span>  

                                        </div>
                                        <div class="form-group">
                                            <button id="addFormToAppButton" type="button" class="btn btn-success pull-right" data-dismiss="modal">Copy to App</button>
                                        </div>
                                    </form>
                                </div>               


                            </div><!--/porlets-content--> 
                        </div><!--/block-web--> 
                    </div> <!--/col-md-12-->
                </div>
                <!-- End of Services. -->
            </div>
        </div>
    </div>
</div>

<!--modal for file uploading-->
<div id ="sImportNewUserFromFile" class="modal fade "   data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="ModalLabel2" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="modal-content">
            <!--<form id="fileImportingForm" method="POST" class="form-horizontal row-border"  enctype="multipart/form-data" data-parsley-validate>-->
            <form id="fileImportingForm" class="form-horizontal row-border" 
                  action="/createUserFromFile" method="POST"  class="form-horizontal row-border" enctype="multipart/form-data" accept-charset='ISO-8859-1' data-parsley-validate >
                <div class="modal-header">
                    <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                    <h4 class="modal-title">Import From File</h4>
                </div>
                <div class="modal-body">
                    <div  class="form-group" >
                        <label class="col-sm-3 control-label">Group</label>
                        <div class="col-sm-9">
                            <div class="btn-group">
                                <select id="selectGroupForUserList" name="group" class="form-control col-md-12" >
                                    <option value="0">Select a Group</option>
                                    <c:choose>
                                        <c:when test="${groups.size() > 0}">
                                            <c:forEach var="group" items="${groups}">
                                                <option value="${group.name}">${group.name}</option>
                                            </c:forEach>
                                        </c:when>
                                    </c:choose>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div  class="form-group" >
                        <label class="col-sm-3 control-label">File to Upload</label>
                        <div class="col-sm-9">
                            <h3>CSV File Format </h3>  <h3>Mail ; Full Name </h3>
                            <div class="fallback">
                                <input id="importUserFile" type="file" name="importUserFile" 
                                       data-parsley-required-message="Please select a file to upload"
                                       data-parsley-errors-container="span#fileUploadError" style="width:100%;"/>
                                <span id="fileUploadError"></span>
                            </div>


                        </div>

                        <span id="importFromFileResponse"></span>
                    </div>

                </div>
                <div class="modal-footer">
                    <button data-dismiss="modal" class="btn btn-default" type="button" id ="dontUpload">Close</button>
                    <button class="btn btn-primary" type="submit" id="importUserFromFileButton">Import</button>
                </div>
            </form>
        </div>
    </div>
</div>
<!--Start of edit ldap Settings Wizard Modal. -->
<div class="modal fade" id="ldapSettingsWizardModal" tabindex="-1"
     role="dialog" aria-labelledby="titleLabel" aria-hidden="true">
    <div id="ldapSettingsWizardModalDiv" class="modal-dialog modal-lg">

        <div class="col-md-12">
            <div class="block-web">
                <div class="header">
                    <h3 class="content-header">Add New LDAP Settings</h3>
                </div>
                <div class="porlets-content">
                    <div id="ldapProgressWizard" class="basic-wizard">
                        <ul class="nav nav-tabs nav-justified">
                            <li><a href="#ldapTab1" id="tab4" data-toggle="tab">LDAP Settings</a></li>
                        </ul>
                        <div class="tab-content" >
                            <div class="progress progress-striped active">
                                <div class="progress-bar" role="progressbar" aria-valuenow="45"
                                     aria-valuemin="0" aria-valuemax="100"></div>
                            </div>

                            <div class="tab-pane" id="ldapTab1">
                                <form id="configureLdapSettingsForm" class="form-horizontal row-border" autocomplete="off" action="/configureLdapSettings" method="POST">

                                    <div class="form-group">
                                        <label class="col-sm-3 control-label"> <span>Connection Name</span>
                                        </label>
                                        <div class="col-sm-3">
                                            <input  id="connectionName" name="connectionName" type="text" placeholder="Connection Name"  class="form-control" required></input>
                                        </div>
                                    </div>
                                    <!--/form-group-->
                                    <div class="form-group">
                                        <label class="col-sm-3 control-label"> <span> Server Address </span>
                                        </label>
                                        <div class="col-sm-3">
                                            <c:if test="${serverAddress != null }">
                                                <input id="serverAddress" name="serverAddress" type="text"  placeholder="Server adress" value="${serverAdress}" class="form-control" required></input>
                                            </c:if>
                                            <c:if test="${serverAddress == null }">
                                                <input id="serverAddress" name="serverAddress" type="text"  value=""  placeholder="Server adress" class="form-control" required></input>

                                            </c:if>
                                        </div>
                                        <label class="col-sm-1 control-label"> <span>Port</span>
                                        </label>
                                        <div class="col-sm-2">

                                            <c:if test="${serverPort != '' }">
                                                <input  id="serverPort" name="serverPort" type="text"  value="${serverPort}" placeholder="389" class="form-control" required></input>
                                            </c:if> 
                                            <c:if test="${serverPort == '' }">
                                                <input  id="serverPort" name="serverPort" type="text"  value=""  placeholder="389" class="form-control" required></input>
                                            </c:if>
                                        </div>


                                    </div>
                                    <!--/form-group-->
                                    <div class="form-group">
                                        <label class="col-sm-3 control-label"> <span>Base DN</span>
                                        </label>
                                        <div class="col-sm-3">
                                            <c:if test="${baseDn != '' }">
                                                <input  id="baseDn" name="baseDn" type="text" value="${baseDn}" placeholder="Base Dn"  class="form-control" required></input>
                                            </c:if>
                                            <c:if test="${baseDn == '' }">
                                                <input  id="baseDn" name="baseDn" type="text" value="" placeholder="Base Dn" class="form-control" required></input>
                                            </c:if>
                                        </div>
                                    </div>
                                    <!--/form-group-->
                                    <div class="form-group">
                                        <label class="col-sm-3 control-label"> <span>Bind Attribute</span>
                                        </label>
                                        <div class="col-sm-3">
                                            <c:if test="${dnKey != '' }">
                                                <input id="dnKey" name="dnKey" type="text" value="${dnKey}" placeholder="Bind Attribute" class="form-control" required></input>
                                            </c:if>
                                            <c:if test="${dnKey == '' }">
                                                <input id="dnKey" name="dnKey" type="text" value="" placeholder="Bind Attribute" class="form-control" required></input>
                                            </c:if>
                                        </div>
                                    </div>
                                    <!--/form-group-->
                                    <div class="form-group">
                                        <label class="col-sm-6 control-label"><span id="ldapSettingsError"></span>
                                        </label>
                                    </div>

                                    <!--/form-group-->

                                    <div class="bottom " style="background: none; border: none;">

                                        <button id="ldapSettingsButtonSubmit" class="btn btn-primary"
                                                style="float: right; margin-right: 5px;"   type="button">Save</button>
                                        <button id="ldapSettingsTestButton" class="btn btn-success"
                                                style="float: right; margin-right: 5px;"  disabled  type="button">Test</button>
                                    </div>
                                </form>

                            </div>
                        </div>
                        <!-- /tab-content -->

                    </div>
                    <!--/progressWizard-->

                </div>
                <!--/col-md-6-->
            </div>
            <!--/row-->

        </div>
        <!--/row-->

    </div>
</div>
<!-- End of edit ldap Settings Wizard Modal. -->

<!--Modal for image uploading-->
<div id ="sendPushNotificationModal" class="modal fade " tabindex="-1" role="dialog" aria-labelledby="ModalLabel2" aria-hidden="true" style="display: none;">
    <div class="modal-dialog  modal-lg">

        <div class="col-md-12">
            <div class="block-web">
                <div class="header">
                    <h3 class="content-header">Send Push Notification</h3>
                </div>

                <c:choose>
                    <c:when test="${applications.size() > 0}">

                        <form id="sendPushNotificationForm" class="form-horizontal row-border"
                              action="/notifications/sendNotification" data-parsley-validate>
                            <div class="form-group">
                                <label class="col-sm-3 control-label">Target Application</label>
                                <div class="col-sm-9">
                                    <select id="applicationSelect" name="applicationSelect" type="text" class="form-control" >
                                        <option value="0">Select an application..</option>
                                        <c:forEach var="application" items="${applications}">
                                            <option value="${application.name}">${application.name}</option>
                                        </c:forEach>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="col-sm-3 control-label">Tittle</label>
                                <div class="col-sm-9">
                                    <input id="pushNotificationTitle" name="pushNotificationTitle"  class="form-control" type="text"
                                           data-parsley-trigger="change" maxlength="30"
                                           data-parsley-required-message="Please enter a tittle for the push notification"
                                           data-parsley-errors-container="span#pushTittleError"
                                           required> </textarea>
                                        <span id="pushTittleError"></span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="col-sm-3 control-label">Message Type</label>
                                <div class="col-sm-6">
                                    <select id="messageTypeSelect" name="messageTypeSelect" type="text" class="form-control" >
                                        <option value="0">Select a message type..</option>
                                        <option value="message">Message</option>
                                        <option value="email">Email</option>
                                        <option value="info">Info</option>
                                        <option value="notifications active">Alert</option>
                                        <option value="warning">Warning</option>
                                        <option value="error">Error</option>
                                    </select>
                                </div>
                                <div class="col-sm-3">
                                    <i id="messageTypeIcon" class="material-icons">message</i>
                                </div>
                            </div>


                            <div class="form-group">
                                <label class="col-sm-3 control-label">Message</label>
                                <div class="col-sm-9">
                                    <textarea  id="pushNotificationMessage"  name="pushNotificationMessage"  class="form-control"
                                               data-parsley-trigger="change" maxlength="120"
                                               data-parsley-required-message="Please enter a message content for the push notification"
                                               data-parsley-errors-container="span#pushMessageContentError"
                                               required> </textarea>
                                    <span id="pushMessageContentError"></span>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-sm-3"></div>
                                <div class="col-sm-9">
                                    <button id="sendPushNotificationButton" style="margin-left: 5px;" type="button" class="btn btn-primary pull-right">Send</button>
                                    <button data-dismiss="modal" class="btn btn-default pull-right">Cancel</button>
                                </div>
                            </div>
                        </form>

                    </c:when>
                    <c:otherwise>
                        <div class="alert alert-danger"> 
                            <strong>Warning:</strong> You don't have any applications.</div>

                    </c:otherwise>

                </c:choose>





            </div>
        </div>
    </div>
</div>

<!-- Modal for folder creation -->
<div id ="sRenameFileModal" class="modal fade "   data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="modal-content">
            <form id="renameFileForm" class="form-horizontal row-border"
                  action="/rename/appFile" method="post"  data-parsley-validate>

                <div class="modal-header">
                    <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                    <h4 id="ModalLabel" class="modal-title">Rename File</h4>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="col-sm-3 control-label">New File Name</label>
                        <div class="col-sm-9">

                            <input name="filePath" id ="inputRenameFilePath" type="hidden"/>
                            <input name="fileType" id ="inputRenameFileType" type="hidden"/>
                            <input name="appId" id ="inputRenameFileAppId" type="hidden"/>

                            <input name="newFileName" id="newFileName" type="text" class="form-control"
                                   data-parsley-trigger="change"
                                   data-parsley-required-message="Please enter a name for the file"
                                   data-parsley-errors-container="span#newFileNameError"
                                   required/> <span id="newFileNameError"></span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button data-dismiss="modal" class="btn btn-default" type="button" id="closeRenameModal">Close</button>
                    <button class="btn btn-primary" type="button" id="renameFileButton">Rename File</button>
                </div>
            </form>


        </div>
    </div>
</div>
<!--Start of edit group modal. -->
<div class="modal fade" id="changeGroupAttributesModal"   data-backdrop="static"  tabindex="-1"
     role="dialog" aria-labelledby="titleLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="#"  id ="updateGroupForm" data-parsley-validate>
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                    <h4 class="modal-title" id="titleLabel">Update Group Attributes</h4>
                </div>
                <div class="modal-body" style="height:150px;">
                    <!--                <form id="updateGroupForm" action="#"  data-parsley-validate novalidate>-->
                    <div class="form-group">
                        <label class="col-sm-3 control-label">Group Name</label>
                        <div class="col-sm-9">

                            <input type="text" class="form-control parsley-validated" data-parsley-trigger="change" id="iGroupName" placeholder="Group Name" required>

                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-3 control-label">Group Description</label>
                        <div class="col-sm-9">

                            <input type="text" class="form-control parsley-validated" data-parsley-trigger="change" id="iGroupDescription" placeholder="Group Description" required>

                        </div>
                    </div>
                    <!--</form>-->
                </div>
                <div class="modal-footer">
                    <button  type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button id="updateGroupButton" type="button" class="btn btn-primary">Update</button>
                </div>
            </form>

        </div>
    </div>
</div>
<!-- End of edit group modal. -->

<!-- Delete group modal start. -->
<div id ="deleteGroupModal" class="modal fade "    data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>
                <h4 id="DeleteGroupModalLabel" class="modal-title">Delete Group</h4>
            </div>
            <div class="modal-body">

                <span class="col-sm-12" id="deleteGroupText"></span>
                <span id="deleteGroupError"></span>

            </div>
            <div class="modal-footer">
                <button  id="deleteGroupButton" class="btn btn-danger" type="button" >Delete</button>
                <button data-dismiss="modal" class="btn btn-default" type="button" >Nope</button>
            </div>

        </div>
    </div>
</div>
<!-- Delete group modal end. -->
