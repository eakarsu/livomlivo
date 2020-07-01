<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="sec"
           uri="http://www.springframework.org/security/tags"%>


<!-- Start of WebUser Table. -->
<div class="row">
    <div class="col-md-12">
        <div class="block-web">
            <div class="header">
                <h3 class="content-header">Users</h3>
            </div>
            <div class="porlets-content">
                <div class="table-responsive">
                    <div class="clearfix">
                        <div class="btn-group">
                            <button id="idCreateNewWebUser" class="btn btn-primary">
                                Add New User <i class="fa fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="margin-top-10"></div>
                    <div id="dynamic-table_wrapper"
                         class="dataTables_wrapper form-inline" role="grid">
                        <table
                            class="display table table-bordered table-striped dataTable"
                            id="dynamic-table" aria-describedby="dynamic-table_info">
                            <thead>
                                <tr role="row">
                                    <th class="sorting" role="columnheader" tabindex="0"
                                        aria-controls="dynamic-table" rowspan="1" colspan="1"
                                        aria-label="Activate to sort column ascending"
                                        style="width: 379px;">User Name</th>
                                    <!--                                    <th class="sorting" role="columnheader" tabindex="0"
                                                                            aria-controls="dynamic-table" rowspan="1" colspan="1"
                                                                            aria-label="Activate to sort column ascending"
                                                                            style="width: 347px;">WebUser Password</th>-->
                                    <!--                                    <th class=" sorting" role="columnheader" tabindex="0"
                                                                            aria-controls="dynamic-table" rowspan="1" colspan="1"
                                                                            aria-label="Activate to sort column ascending"
                                                                            style="width: 253px;">WebUser Role</th>-->
                                    <th class=" sorting" role="columnheader" tabindex="0"
                                        aria-controls="dynamic-table" rowspan="1" colspan="1"
                                        aria-sort="descending"
                                        aria-label="Activate to sort column ascending"
                                        style="width: 179px;">User Mail</th>
                                    <th class="sorting" role="columnheader" tabindex="0"
                                        aria-controls="dynamic-table" rowspan="1" colspan="1"
                                        aria-label="Activate to sort column ascending"
                                        style="width: 179px;">Edit</th>
                                    <th class="sorting" role="columnheader" tabindex="0"
                                        aria-controls="dynamic-table" rowspan="1" colspan="1"
                                        aria-label="Activate to sort column ascending"
                                        style="width: 179px;">Delete</th>
                                </tr>
                            </thead>

                            <tfoot>
                                <tr>
                                    <th rowspan="1" colspan="1">User Name</th>
                                    <!--<th rowspan="1" colspan="1">WebUser Password</th>-->
                                    <!--<th rowspan="1" colspan="1">WebUser Role</th>-->
                                    <th rowspan="1" colspan="1">User Mail</th>
                                    <th rowspan="1" colspan="1">Edit</th>
                                    <th rowspan="1" colspan="1">Delete</th>
                                </tr>
                            </tfoot>
                            <tbody role="alert" aria-live="polite" aria-relevant="all">

                                <!-- Start of user list conditions -->
                                <c:choose>
                                    <c:when test="${users.size() > 0}">
                                        <c:set var="i" scope="page" value="0" />
                                        <c:forEach var="user" items="${users}">
                                            <c:choose>
                                                <c:when test="${i mod 2 eq 0}">
                                                    <tr class="gradeX odd">
                                                    </c:when>
                                                    <c:otherwise>
                                                    <tr class="gradeX even">
                                                    </c:otherwise>
                                                </c:choose>
                                                <td class=" ">${user.id}</td>
                                                <!--<td class=" ">*********</td>-->
                                                <td class="left">${user.mail}</td>

                                                <td class="center">
                                        <input type="button" class="btn btn-success  editWebUser"  data-username="${user.id}"  value="Edit"/>
                                        </td>
                                        <td class="center ">
                                        <input type="button" class="btn btn-danger  deleteWebUser"  data-user="${user.id}" data-username="${user.id}" value="Delete"/>
                                        </td>
                                        </tr>
                                        <c:set var="i" scope="page" value="${i+1}" />
                                    </c:forEach>
                                </c:when>

                                <c:otherwise>
                                    An error has been occurred while retrieving list of users!
                                </c:otherwise>
                               
                            </c:choose>

                            <!-- End of user list conditions -->
                            </tbody>
                        </table>
                    </div>
                </div>
                <!--/table-responsive-->
            </div>
            <!--/porlets-content-->


        </div>
        <!--/block-web-->
    </div>
    <!--/col-md-12-->
</div>
<!-- End of WebUser Table. -->




































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