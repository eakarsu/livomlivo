<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="sec"
           uri="http://www.springframework.org/security/tags"%>

<div class="row">
    <div class="col-md-12">
        <div class="block-web">
            <div class="porlets-content">

                <div class="col-md-12">
                    <h1 class="text-left">
                        Authorization
                    </h1>
                </div>
                <div class="table-responsive">
                    <table class="table table-bordered table-striped table-condensed table-hover">
                        <thead>
                            <tr>
                                <th>Application<a class="btn btn-xs btn-default pull-right" href="javascript:void(0);"><i class="fa fa-filter"></i></a> </th>
                                <th>Authorized User Group<a class="btn btn-xs btn-default pull-right" href="javascript:void(0);"><i class="fa fa-filter"></i></a></th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Start of user list conditions -->
                            <c:choose>
                                <c:when test="${applications.size() > 0}">
                                    <c:set var="i" scope="page" value="0" />
                                    <c:forEach var="application" items="${applications}">
                                        <c:choose>
                                            <c:when test="${i mod 2 eq 0}">
                                                <tr class="gradeX odd">
                                                </c:when>
                                                <c:otherwise>
                                                <tr class="gradeX even">
                                                </c:otherwise>
                                            </c:choose>
                                            <td class=" "><b>${application.uniqueName}</b></td>
                                            <td class=" "> 
                                                <select id="authorizedUserGroupSelect">
                                                    <option value="systemUser">System Users</option>
                                                    <option value="any">Any</option>
                                                    <option value="noAuthorization">No Authorization</option>
                                                    <c:if test="${ldapConfigured}">
                                                        <option value="ldap">LDAP</option>
                                                    </c:if>
                                                </select>
                                            </td>
                                            <td>  
                                    <input type="button" id="save+'${application.uniqueName}'" name="save+'${application.uniqueName}'"  class="form-control btn btn-success btn-sm" value="Save"/>
                                    </td>
                                    </tr>
                                    <c:set var="i" scope="page" value="${i+1}" />
                                </c:forEach>
                            </c:when>
                            <c:otherwise>
                                An error has been occurred while retrieving list of applications!
                            </c:otherwise>
                        </c:choose>
                        </tbody>
                    </table>
                </div><!--/table-responsive-->
            </div>
        </div>
    </div> <!--/col-md-12-->
</div>
<!-- End of Services. -->
