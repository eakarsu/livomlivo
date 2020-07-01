<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"%>
<%@ taglib prefix="sec"
           uri="http://www.springframework.org/security/tags"%>

<div class="row">
    <div class="col-md-12">
        <div class="block-web">
            <div class="porlets-content">
                <form class="form-horizontal" role="form">
                    <div class="form-group">
                        <div class="col-md-6">
                            <button id="addNewLdapSettings" class="btn btn-primary">
                                Add New LDAP Connection <i class="fa fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </form>

                <div class="col-md-12">
                    <h1 class="text-left">Connections
                    </h1>
                </div>
                <div class="table-responsive">
                    <table class="table table-bordered table-striped table-condensed table-hover">
                        <thead>
                            <tr>
                                <th>Connection Name<a class="btn btn-xs btn-default pull-right" href="javascript:void(0);"><i class="fa fa-filter"></i></a> </th>
                                <th>Server Address<a class="btn btn-xs btn-default pull-right" href="javascript:void(0);"><i class="fa fa-filter"></i></a></th>
                                <th>Port<a class="btn btn-xs btn-default pull-right" href="javascript:void(0);"><i class="fa fa-filter"></i></a></th>
                                <th>Base DN</th>
                                <th>Bind Attribute</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Start of user list conditions -->
                            <c:choose>
                                <c:when test="${ldapConnectionList.size() > 0}">
                                    <c:set var="i" scope="page" value="0" />
                                    <c:forEach var="ldapSettings" items="${ldapConnectionList}">
                                        <c:choose>
                                            <c:when test="${i mod 2 eq 0}">
                                                <tr class="gradeX odd">
                                                </c:when>
                                                <c:otherwise>
                                                <tr class="gradeX even">
                                                </c:otherwise>
                                            </c:choose>
                                            <td class=" "><b>${ldapSettings.connectionName}</b></td>
                                            <td class=" "><b>${ldapSettings.serverAddress}</b></td>
                                            <td class=" "><b>${ldapSettings.serverPort}</b></td>
                                            <td class=" "><b>${ldapSettings.baseDn}</b></td>
                                            <td class=" "><b>${ldapSettings.dnKey}</b></td>
                                            <td>
                                    <input type="button" id="removeLdapConfiguration" name="removeLdapConfiguration"  onclick="removeLdapConfiguration('${ldapSettings.connectionName}');" class="form-control btn btn-danger btn-sm" value="Remove"/>
                                    </td>
                                    </tr>
                                    <c:set var="i" scope="page" value="${i+1}" />
                                </c:forEach>
                            </c:when>                         
                        </c:choose>
                        </tbody>
                    </table>
                </div><!--/table-responsive-->

            </div>
        </div>
    </div> <!--/col-md-12-->
</div>
<!-- End of Services. -->