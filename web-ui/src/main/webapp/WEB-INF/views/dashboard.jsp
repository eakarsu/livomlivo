<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"%>
<%@ taglib prefix="sec"
           uri="http://www.springframework.org/security/tags"%>
<div class="row" style="height: 400px;">
    <div class="col-md-6">
        <div class="block-web">
            <div class="header">
                <div class="actions">

                </div>
                <h3 class="content-header">Top 5 Active Users</h3>
            </div>
            <div class="porlets-content" style="height: 300px;">
                <!--            <div class="alert alert-info">
                    <button data-dismiss="alert" class="close"> × </button>
                    <i class="fa-fw fa fa-info"></i> Enables hover effect <code>&lt;table&gt;</code> by adding the <code>.table-hover</code> with the base class </div>-->
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>User</th>
                                <th>Duration (min.)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <c:forEach var="topFiveActiveUsersMap" items="${topFiveActiveUsersMap}" begin="0" end="10" varStatus="loop">

                                <c:set var="percentage" scope="request" value="${topFiveActiveUsersMap.value / maxDuration * 100 }"/> 
                                <fmt:parseNumber var="i" integerOnly="true" type="number" value="${percentage}" />
                                <c:set var="percentageCount" scope="request" value="${i}"/> 

                                <tr>
                                    <td>${loop.index+1}</td>
                                    <td>${topFiveActiveUsersMap.key}</td>
                                    <td><div class="progress progress-hieght"
                                     style="height: 20px;">
                                <div class="progress-bar" role="progressbar"
                                     aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"
                                     style="width: ${percentage}%;">${topFiveActiveUsersMap.value}</div>
                            </div></td>
                            </tr>
                        </c:forEach>

                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div class="col-md-6">

        <p id="platformCountJson" type="hidden" style="display: none;">${platformCountJson}</p>

        <div class="block-web">
            <div class="header">
                <div class="actions">

                </div>
                <h3 class="content-header">OS Distribution</h3>
            </div>

            <div class="porlets-content">
                <div id="platformCountDonut" style="height: 300px;"></div>
            </div>
        </div>

    </div>
</div>

<div class="row">
    <div class="col-md-6">
        <p id="activeUserCountJson" type="hidden" style="display: none;">${activeUserCountJson}</p>

        <div class="block-web">
            <div class="porlets-content">
                <div id="activeUserCountGraph"></div>

            </div>

        </div>
        <!--/block-web-->
    </div>
    <!--/col-md-6-->
    <div class="col-md-6">
        <p id="activeUserAllCountJson" type="hidden" style="display: none;">${activeUserCountAllTimeJson}</p>

        <div class="block-web">
            <div class="porlets-content">
                <div id="activeUserCountAllGraph"></div>

            </div>

        </div>
        <!--/block-web-->
    </div>
    <!--/col-md-6-->
</div>
<!--/row-->

<div class="row">
    <div class="col-md-12">
        <p id="serviceObjectRequestCountJson" type="hidden" style="display: none;">${serviceObjectRequestCountJson}</p>
        <p id="serviceObjectRequestValuesJson" type="hidden" style="display: none;">${serviceObjectRequestValuesJson}</p>

        <div class="block-web">
            <div class="porlets-content">
                <div id="serviceObjectRequestCountGraph"></div>
            </div>
        </div>
        <!--/block-web-->
    </div>
    <!--/col-md-12-->
</div>
<!--/row-->

<!--/row-->


