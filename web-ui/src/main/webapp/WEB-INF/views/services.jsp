<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="sec"
           uri="http://www.springframework.org/security/tags"%>

<div class="row">
    <div class="col-md-12">
        <div class="block-web">
            <div class="porlets-content">
                <form   role="form">
                    <div class="form-group col-md-4" >
                        <!--idIntegrationWizard-->
                        <button id="addNewService" class="form-control btn btn-primary col-md-6">
                            Add New Service <i class="fa fa-plus"></i>
                        </button>
                    </div>
                    <div class="form-group col-md-4" >
                        <select id="serviceType" class="form-control col-md-6"  style="display:none">
                            <option value="0">Choose a service type.. </option>
                            <option value="REST">REST</option>
                            <option value="SOAP">SOAP</option>
                            <option value="SAP">SAP</option>
                        </select>
                    </div>
                    <div class="form-group col-md-4" >
                        <button id="idIntegrationWizard" style="display:none" class="form-control btn btn-primary btn right col-md-6">
                            Open Wizard <i class="fa fa-external-link-square"></i>
                        </button>
                    </div>
                </form>

                <div class="col-md-12">

                    <h1 class="text-left">
                        Service List
                    </h1>
                </div>
                <div class="table-responsive">
                    <table class="table table-bordered table-striped table-condensed table-hover">
                        <thead>
                            <tr>

                                <th>Service Name<a class="btn btn-xs btn-default pull-right" href="javascript:void(0);"><i class="fa fa-filter"></i></a> </th>
                                <th>Base Url<a class="btn btn-xs btn-default pull-right" href="javascript:void(0);"><i class="fa fa-filter"></i></a></th>
                                <th>Type<a class="btn btn-xs btn-default pull-right" href="javascript:void(0);"><i class="fa fa-filter"></i></a></th>
                                <th>Generate Form</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Start of user list conditions -->
                            <c:choose>
                                <c:when test="${restServiceList.size() > 0}">
                                    <c:set var="i" scope="page" value="0" />
                                    <c:forEach var="service" items="${restServiceList}">
                                        <c:choose>
                                            <c:when test="${i mod 2 eq 0}">
                                                <tr class="gradeX odd">
                                                </c:when>
                                                <c:otherwise>
                                                <tr class="gradeX even">
                                                </c:otherwise>
                                            </c:choose>
                                            <td class=" "><b>${service.name}</b></td>
                                            <td class=" "><b>${service.baseUrl}</b></td>
                                            <td class=" "><b>REST</b></td>
                                            <td class=" "><input type="button" id="generateFormToApp${i}" name="generateFormToApp${i}"  class="form-control btn btn-success btn-sm generate-form" data-service="${service.name}" value="Generate"/>
                                    </td>
                                    <td>  
                                    <input type="button" id="removeServiceConfiguration" name="removeServiceConfiguration"  onclick="removeServiceConfiguration('${service.name}');" class="form-control btn btn-danger btn-sm" value="Remove"/>
                                    </td>
                                    </tr>
                                    <c:set var="i" scope="page" value="${i+1}" />
                                </c:forEach>
                            </c:when>                         
                        </c:choose>
                        <c:choose>
                            <c:when test="${soapServiceList.size() > 0}">

                                <c:forEach var="soapService" items="${soapServiceList}">
                                    <c:choose>
                                        <c:when test="${i mod 2 eq 0}">
                                            <tr class="gradeX odd">
                                            </c:when>
                                            <c:otherwise>
                                            <tr class="gradeX even">
                                            </c:otherwise>
                                        </c:choose>
                                        <td class=" "><b>${soapService.key}</b></td>
                                        <td class=" "><b>${soapService.value}</b></td>
                                        <td class=" "><b>SOAP</b></td>
                                        <td class=" "><input type="button" id="generateFormToApp${i}" name="generateFormToApp${i}"  class="form-control btn btn-success btn-sm generate-form" data-service="${soapService.key}" value="Generate"/>
                                    </td>
                                    <td>  
                                    <input type="button" id="removeServiceConfiguration" name="removeServiceConfiguration"  onclick="removeServiceConfiguration('${soapService.key}');" class="form-control btn btn-danger btn-sm" value="Remove"/>
                                    </td>
                                    </tr>

                                </c:forEach>
                            </c:when>
                            <c:when test="${sapServiceList.size() > 0}">

                                <c:forEach var="sapService" items="${sapServiceList}">
                                    <c:choose>
                                        <c:when test="${i mod 2 eq 0}">
                                            <tr class="gradeX odd">
                                            </c:when>
                                            <c:otherwise>
                                            <tr class="gradeX even">
                                            </c:otherwise>
                                        </c:choose>
                                        <td class=" "><b>${sapService.key}</b></td>
                                        <td class=" "><b>${sapService.value}</b></td>
                                        <td class=" "><b>SAP</b></td>
                                        <td class=" "><input type="button" id="generateFormToApp${i}" name="generateFormToApp${i}"  class="form-control btn btn-success btn-sm generate-form" data-service="${sapService.key}" value="Generate" disabled/>
                                    </td>
                                    <td>  
                                    <input type="button" id="removeServiceConfiguration" name="removeServiceConfiguration"  onclick="removeServiceConfiguration('${sapService.key}');" class="form-control btn btn-danger btn-sm" value="Remove"/>
                                    </td>
                                    </tr>

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
