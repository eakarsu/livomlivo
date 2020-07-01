/*** Javascript codes of dashboard page. ***/


prepareDashboard = function () {

    buttonGroupFadeOut(500);
    var colors_array = ["#b43004", "#3b4b98", "#cbece8"];
    var json = JSON.parse($("#platformCountJson").text());
    var activeUserCountJson = JSON.parse($("#activeUserCountJson").text());
    var activeUserAllCountJson = JSON.parse($("#activeUserAllCountJson").text());
    var serviceObjectRequestCountJson = JSON.parse($("#serviceObjectRequestCountJson").text());//{ServiceObjectName,32}
    var serviceObjectRequestValuesJson = JSON.parse($("#serviceObjectRequestValuesJson").text());//{0,32}

    var scaleValueServiceObjectReport = 25;
    var scaleValueActiveUserReport = 10;
    var scaleValueActiveUserAllTimeReport = 10;

    scaleValueServiceObjectReport = setScaleParameter(scaleValueServiceObjectReport, serviceObjectRequestValuesJson);
    scaleValueActiveUserReport = setScaleParameter(scaleValueActiveUserReport, activeUserCountJson);
    scaleValueActiveUserAllTimeReport = setScaleParameter(scaleValueActiveUserAllTimeReport, activeUserAllCountJson);


    if (json.Android === 0 && json.iOS === 0) {
        Morris.Donut({
            element: 'platformCountDonut',
            colors: colors_array,
            data: [
                {label: "No Data", value: 0}
            ]
        });

    } else {
        Morris.Donut({
            element: 'platformCountDonut',
            colors: colors_array,
            data: [
                {label: "Android", value: json.Android},
                {label: "iOS", value: json.iOS}
            ]
        });

    }


    $('#activeUserCountAllGraph').graphify({
//        options: false,
        start: 'area',
        obj: {
            id: 'activeUserCountAll',
            legend: true,
            title: 'All Time Daily Active User Count',
            showPoints: true,
            width: '100%',
            height: 375,
            xGrid: false,
            points: activeUserAllCountJson,
            pointRadius: 3,
            colors: ['blue'],
            xDist: 30,
            scale: scaleValueActiveUserAllTimeReport,
            dataNames: ['Active User All'],
//            x: Object.keys(activeU serCountJson),
            x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
            tooltipWidth: 23,
            animations: true,
            pointAnimation: true,
            averagePointRadius: 5,
            design: {
                tooltipColor: '#fff',
                gridColor: '#f3f1f1',
                tooltipBoxColor: '#d9534f',
                averageLineColor: '#d9534f',
                pointColor: '#d9534f',
                lineStrokeColor: 'grey',
            }
        }

    });

    $('#activeUserCountGraph').graphify({
//        options: false,
        start: 'area',
        obj: {
            id: 'activeUserCount',
            legend: true,
            title: 'Daily Active User Count',
            showPoints: true,
            width: '100%',
            height: 375,
            xGrid: false,
            points: activeUserCountJson,
            pointRadius: 3,
            colors: ['blue'],
            xDist: 30,
            scale: scaleValueActiveUserReport,
            dataNames: ['Active User'],
//            x: Object.keys(activeUserCountJson),
            x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
            tooltipWidth: 23,
            animations: true,
            pointAnimation: true,
            averagePointRadius: 5,
            design: {
                tooltipColor: '#fff',
                gridColor: '#f3f1f1',
                tooltipBoxColor: '#d9534f',
                averageLineColor: '#d9534f',
                pointColor: '#d9534f',
                lineStrokeColor: 'grey',
            }
        }

    });

    $('#serviceObjectRequestCountGraph').graphify({
        start: 'bar',
        obj: {
            id: 'lol',
            legend: false,
            title: 'Total Number of Service Request',
            showPoints: true,
            width: '100%',
            legendX: 450,
            pieSize: 200,
            shadow: true,
            height: 440,
            xGrid: false,
            animations: true,
            points: serviceObjectRequestValuesJson,
            x: Object.keys(serviceObjectRequestCountJson),
            xDist: 1000 / (Object.keys(serviceObjectRequestCountJson).length + 3),
            scale: scaleValueServiceObjectReport,
            yDist: 35,
            grid: false,
            dataNames: ['ServiceObjectNames'],
            design: {
                lineColor: '#d9534f',
                tooltipFontSize: '20px',
                pointColor: '#d9534f',
                barColor: '#428bca',
                areaColor: '#f0ad4e'
            }
        }
    });

    bar.init();

};

function setScaleParameter(scaleValue, jsonString) {
    var maxServisRequestCount = 0;
    for (i in jsonString)
    {
        var serviceValue = parseInt(jsonString[i]);
        if (maxServisRequestCount < serviceValue) {
            maxServisRequestCount = serviceValue;
        }
    }
    //Scale value set, max Y length %120.
    scaleValue = Math.ceil(maxServisRequestCount * (120 / 100) / 10);
    if (scaleValue == 0) {
        scaleValue = 1;
    }
    return scaleValue;
}
