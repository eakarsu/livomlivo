/*** Javascript codes of service management page. ***/
 
var serviceName = "";
var serviceDescription = {name: "", baseUrl: "", operations: [], defaultHeaders: [], authentication: {}};
var serviceOperations = [];
var parameter = {};

var headerCounter = 1;
var parameterCounter = 1;
var operationCounter = 1;
var limit = 5;

$("#addHeader").click(function () {

        addFormInput('headersForm');

    });
   $("#addOperation").click(function () {

        var name = $("#operationName").val();
        var method = $("#methodType option:selected").text();
        var path = $("#path").val();
        var authState = $('#requiredOperationAuthSwitch').bootstrapSwitch('state');
        if (name === "" || method === "" || path === "") {
            $("#ErrorModal").modal("show");
            document.getElementById("errorText").innerHTML = "All fields is required.";
            return false;
        }

        if (authState === true) {
            var username = $("#operationUserName").val();
            var pass = $("#operationPassword").val();


            serviceOperations.push({name: name, path: path, method: method, authentication: {user: username, password: pass}, parameters: []});
        } else {
            serviceOperations.push({name: name, path: path, method: method, authentication: {user: username, password: pass}, parameters: []});
        }
        addOperationInput("operationForm", name, method, path, authState);
        clearOperationsFormInputs();
    });

    $('#operationList').on('change', function (e) {
        var optionSelected = $("option:selected", this);
        var valueSelected = this.value;
//        console.log(valueSelected);

        $("#dynamicParametersDiv").empty();

        if (valueSelected !== 0) {
            $("#parametersOperationName").val(valueSelected);

            $("#addParametersDiv").show();


            for (var i = 0; i < serviceOperations.length; i++) {
//                console.log(serviceOperations.length);

                if (serviceOperations[i].name === valueSelected) {
//                    console.log(serviceOperations[i].name);
                    var parameters = serviceOperations[i].parameters;

                    for (var j = 0; j < parameters.length; j++) {
//                        console.log(parameters[j].name, parameters[j].value, parameters[j].type, parameters[j].required);
                        addOperationParamsInput(parameters[j].name, parameters[j].value, parameters[j].type, parameters[j].required);

                    }

                }


            }

        } else {
            $("#addParametersDiv").hide();
        }
    });

    $("#addParams").click(function () {
        var name = $("#paramName").val();
        var value = $("#paramValue").val();
        var required = false;
        var fieldName = $("#fieldName").val();
        var hidden = false;
        var type = $('#paramType option:selected').val();

        if ($('#requiredParameterCheckbox:checkbox:checked').length > 0) {
            required = true;
        }
        if ($('#hiddenParameterCheckbox:checkbox:checked').length > 0) {
            hidden = true;
        }

        if (name === "") {
            alert("Parameter name field is required.");
            return false;
        } else {

            $("#parameterListDiv").show();
            addOperationParamsInput(name, value, fieldName, type, required, hidden);
            var selectedOperationName = $('#operationList option:selected').val();

            for (var i = 0; i < serviceOperations.length; i++) {
                if (serviceOperations[i].name === selectedOperationName) {
                    var parameterCount = serviceOperations[i].parameters.length;
                    parameter = {name: name, value: value, required: required, type: type, fieldName: fieldName, hidden: hidden};
                    serviceOperations[i].parameters[parameterCount] = parameter;
                    break;
                }
            }

        }
        clearParametersFormInputs();
    });


loadServicesPage = function (){
    
            $('input[name="switch-animate-service-status"]').bootstrapSwitch();
            $('input[name="switch-animate-service-status"]').on('switchChange.bootstrapSwitch', function (event, state) {

                if (state === true) {
                    
                } else if (state === false) {
                    
                }

            });

            $("#addNewService").click(function (event) {
                event.preventDefault();
                $("#idIntegrationWizard").show();
                $("#serviceType").show();

            });

            $(".generate-form").click(function () {
                $("#formGeneratorModal").modal("show");

                serviceName = $(this).data("service");

            });

            $("#addFormToAppButton").click(function () {
//                alert("addFormToAppButton");

                var applicationValue = $("#applicationList option:selected").val();
                if (applicationValue != 0) {

                    callAddServiceFormToApplication(applicationValue, serviceName);

                } else {
                    document.getElementById("errorMsgText").innerHTML = "Application must be selected.";
                    return false;
                }

            });

            $('#serviceType').on('change', function (e) {
                var serviceType = $("option:selected", this);
                var valueSelected = this.value;

//                console.log(valueSelected);

                if (valueSelected !== 0) {

                    $("#idIntegrationWizard").show();

                } else {
                    $("#idIntegrationWizard").hide();
                }
            });


            $("#idIntegrationWizard").click(function (event) {
                event.preventDefault();
                var serviceType = $('#serviceType').val();
                if (serviceType == 0) {
                    $("#ErrorModal").modal("show");
                    document.getElementById("errorText").innerHTML = "Choose a service type!";

                }
                if (serviceType === "REST") {
                    $("#restServiceWizardModal").modal("show");
                } else if (serviceType === "SOAP") {
                    $("#soapServiceWizardModal").modal("show");
                } else if (serviceType === "SAP") {
                    $("#sapServiceWizardModal").modal("show");
                }

                $("#addParametersDiv").hide();
                $("#parameterListDiv").hide();


                $('input[name="requiredAuthSwitch"]').bootstrapSwitch();

                $('input[name="requiredAuthSwitch"]').on('switchChange.bootstrapSwitch', function (event, state) {

                    if (state === true) {
                        $("#authenticationComponentsDiv").show();
                    } else if (state === false) {
                        $("#authenticationComponentsDiv").hide();
                    }

                });

                $('input[name="requiredOperationAuthSwitch"]').bootstrapSwitch();

                $('input[name="requiredOperationAuthSwitch"]').on('switchChange.bootstrapSwitch', function (event, state) {

                    if (state == true) {
                        $("#operationAuthComponentsDiv").show();
                    } else if (state == false) {
                        $("#operationAuthComponentsDiv").hide();
                    }

                });

            });
 
};

function callAddServiceFormToApplication(applicationName, serviceName) {
    event.preventDefault();
    var p = document.getElementById("repeater");
    var loading = $('<div class="loading"><i class="fa fa-refresh fa-spin"></i></div>');

    $.ajax({
        url: "/addServiceFormToApplication",
        type: "POST",
        data: {applicationName: applicationName, serviceName: serviceName},
        beforeSend: function () {
            loading.appendTo(p);
            loading.fadeIn();

        },
        success: function (response) {
            loading.fadeOut();
            $("#formGeneratorModal").modal("hide");
            $("#successModal").modal("show");
            document.getElementById("alertText").innerHTML = response;
        },
        error: function (response) {
            loading.fadeOut();

            $("#formGeneratorModal").modal("hide");
            $("#ErrorModal").modal("show");
            document.getElementById("errorText").innerHTML = response.responseText;
        }

    });
}


function prepareServiceDescription() {
    //Base URL 
    serviceDescription.name = $("#servicename").val().trim().replace(" ","");
    serviceDescription.baseUrl = $("#baseUrl").val().trim().replace(" ","");
    if (serviceDescription.name === "") {
        $("#ErrorModal").modal("show");
        document.getElementById("errorText").innerHTML = "Service name can not be empty.";
        $("#restServiceWizardModal").modal("hide");
        return false;
    }
    if (serviceDescription.baseUrl === "") {
        $("#ErrorModal").modal("show");
        document.getElementById("errorText").innerHTML = "Service base url can not be empty.";
        $("#restServiceWizardModal").modal("hide");
        return false;
    }

    var authState = $('#requiredAuthSwitch').bootstrapSwitch('state');

    if (authState === true) {
        var username = $("#serviceUserName").val().trim();
        var pass = $("#serviceUserPassword").val().trim();
//        serviceDescription.authentication.push({user: username, password: pass});
        serviceDescription.authentication.user = username;
        serviceDescription.authentication.password = pass;
    }
    //Headers
    for (var i = 1; i < headerCounter; i++) {

        var name = $("#headerkey" + (i + 1)).val().trim();
        var value = $("#headervalue" + (i + 1)).val().trim();
        if (name !== "") {
            serviceDescription.defaultHeaders.push({name: name, value: value});
        }
    }

    //Operations
    for (var i = 0; i < serviceOperations.length; i++) {
        serviceDescription.operations.push(serviceOperations[i]);
    }
//    console.log(JSON.stringify(serviceDescription));

}

function addFormInput(formName) {
    if (headerCounter >= limit) {
        alert("You have reached the limit of adding " + headerCounter + " inputs");
    } else {
        var headerKey = $("#headerkey1").val();
        var headerValue = $("#headervalue1").val();


        var form1 = "<div class=\"form-group\"  id=\"form-group" + (headerCounter + 1) + "\"><div class=\"col-sm-5\"><input type=\"text\" id=\"headerkey" + (headerCounter + 1) + "\" name=\"headerkey" + (headerCounter + 1) + "\"" + "placeholder=\"Header Name\" class=\"form-control\"  disabled value=\"" + headerKey + "\" /></div>"
                + "<div class=\"col-sm-5\"> <input type=\"text\" id=\"headervalue" + (headerCounter + 1) + "\" name=\"headervalue" + (headerCounter + 1) + "\"" + " placeholder=\"Header Value\" class=\"form-control\" disabled value=\"" + headerValue + "\" /> </div> <div class=\"col-sm-2\">"
                + "<input type=\"button\" id=\"removeHeader" + (headerCounter + 1) + "\" onclick=\"removeHeader(this);\" name=\"removeHeader" + (headerCounter + 1) + "\" class=\"form-control btn btn-danger btn-sm\" value=\"Remove\"/>"
                + "</div></div>";

        if (formName == "headersForm") {
            var headerDiv = document.createElement('div');
            headerDiv.innerHTML = form1;
            document.getElementById(formName).appendChild(headerDiv);
            headerCounter++;


            $("#headerkey1").val('');
            $("#headervalue1").val('');
        }

    }

}

function addOperationInput(formName, name, method, path, required) {

    if (formName === "operationForm") {
//        console.log(required);
        var parameterDiv = document.getElementById("ptab3");
//        for (var i = 0; serviceOperations.length; i++) {
//            name = serviceOperations[i].name;
//            method = serviceOperations[i].method;
//            path = serviceOperations[i].path;
//            required = serviceOperations[i].required;
//        }

        var newParamDiv = "<div class=\"form-group\" style=\"margin:5px;\">";
        newParamDiv += "                                            <div class=\"col-sm-2\">";
        newParamDiv += "                                                <input type=\"text\" id=\"operationName" + (operationCounter + 1) + "\"  name=\"operationName" + (operationCounter + 1) + "\" placeholder=\"Operation Name\" class=\"form-control\" disabled value=\"" + name + "\"\/>";
        newParamDiv += "                                            <\/div>";
        newParamDiv += "                                            <div class=\"col-sm-2\">";
        newParamDiv += "                                                <select id=\"methodType" + (operationCounter + 1) + "\" class=\"form-control\" disabled >";
        newParamDiv += "                                                    <option value=\"" + method + "\" selected>" + method + "<\/option>";
        newParamDiv += "                                                <\/select>";
        newParamDiv += "                                            <\/div>                                         ";
        newParamDiv += "                                            <div class=\"col-sm-4\">";
        newParamDiv += "                                                <input type=\"text\" id=\"path" + (operationCounter + 1) + "\" name=\"path" + (operationCounter + 1) + "\" placeholder=\"Path\" class=\"form-control\" disabled  value=\"" + path + "\" \/>";
        newParamDiv += "                                            <\/div>";
        newParamDiv += "                                            <div class=\"col-sm-1\">";
        newParamDiv += "                                                 <label for=\"requiredOperationAuthSwitch" + (operationCounter + 1) + "\">Requires auth..<\/label>";
        newParamDiv += "                                            <\/div>";
        newParamDiv += "                                            <div class=\"col-sm-1\">";
        newParamDiv += "                                                <input id=\"requiredOperationAuthSwitch" + (operationCounter + 1) + "\" name=\"requiredOperationAuthSwitch" + (operationCounter + 1) + "\" type=\"checkbox\" data-toggle=\"toggle\" disabled ";
        if (required === true) {
            newParamDiv += "checked ";
        }
        newParamDiv += "data-size=\"mini\" ><\/input>";
        newParamDiv += "                                            <\/div>";
        newParamDiv += "                                            <div class=\"col-sm-2\"> ";
        newParamDiv += "                                                <input type=\"button\" id=\"removeOperation" + (operationCounter + 1) + "\" name=\"removeOperation" + (operationCounter + 1) + "\" onclick=\"removeOperation(this);\" class=\"form-control btn btn-danger btn-sm\" value=\"Remove\"\/>";
        newParamDiv += "                                            <\/div>";
        newParamDiv += "<\/div>";

// Now create and append to parameterDiv
        var innerDiv = document.createElement('div');
        innerDiv.className = 'row';
        innerDiv.innerHTML = newParamDiv;
// The variable iDiv is still good... Just append to it.
        parameterDiv.appendChild(innerDiv);

        var sId = "requiredOperationAuthSwitch" + (operationCounter + 1);
        $("input[name=" + sId + "]").bootstrapSwitch();
        operationCounter++;
    }

}

function addOperationParamsInput(key, value, fieldName, paramType, required, hidden) {
    var operationDiv = document.getElementById("dynamicParametersDiv");

    var newParamDiv = "<div class=\"form-group\" style=\"margin:5px;\" >";
    newParamDiv += "                                        <div class=\"col-sm-2\">";
    newParamDiv += "                                            <select id=\"paramType\"  class=\"form-control\" disabled>";
    newParamDiv += "                                                <option value=\"" + paramType + "\" selected>" + paramType + "<\/option>";
    newParamDiv += "                                            <\/select>";
    newParamDiv += "                                        <\/div>";
    newParamDiv += "                                        <div class=\"col-sm-2\">";
    newParamDiv += "                                            <input type=\"text\" id=\"paramkey" + (parameterCounter + 1) + "\" name=\"paramkey" + (parameterCounter + 1) + "\"" + " placeholder=\"Parameter name\" class=\"form-control\" disabled value=\"" + key + "\" \/>";
    newParamDiv += "                                        <\/div>";
    newParamDiv += "                                        <div class=\"col-sm-2\">";
    newParamDiv += "                                            <input type=\"text\"  id=\"paramvalue" + (parameterCounter + 1) + "\" name=\"paramvalue" + (parameterCounter + 1) + "\"" + "   placeholder=\"Parameter value(Optional)\" class=\"form-control\" disabled value=\"" + value + "\" \/>";
    newParamDiv += "                                        <\/div>";
    newParamDiv += "                                        <div class=\"col-sm-2\">";
    newParamDiv += "                                            <input type=\"text\"  id=\"fieldName" + (parameterCounter + 1) + "\" name=\"fieldName" + (parameterCounter + 1) + "\"" + "   placeholder=\"Placeholder value(Optional)\" class=\"form-control\" disabled value=\"" + fieldName + "\" \/>";
    newParamDiv += "                                        <\/div>";
    newParamDiv += "                                        <div class=\"col-md-1\">";
    newParamDiv += "                                            <div class=\"checkbox\"><label>";
    newParamDiv += "                                                <input type=\"checkbox\" id=\"requiredParameterCheckbox" + (parameterCounter + 1) + "\" disabled value=\"\"  ";
    if (required === true) {
        newParamDiv += "checked ";
    }
    newParamDiv += "                                                  /><span class=\"custom-checkbox\"></span></label></div></div>";

    newParamDiv += "                                        <div class=\"col-md-1\">";
    newParamDiv += "                                            <div class=\"checkbox\"><label>";
    newParamDiv += "                                                <input type=\"checkbox\" id=\"hiddenParameterCheckbox" + (parameterCounter + 1) + "\" disabled value=\"\"  ";
    if (hidden === true) {
        newParamDiv += "checked ";
    }
    newParamDiv += "                                                  /><span class=\"custom-checkbox\"></span></label></div></div>";
    newParamDiv += "                                        <div class=\"col-sm-2\"> ";
    newParamDiv += "                                            <input type=\"button\" id=\"removeParameter" + (parameterCounter + 1) + "\" onclick=\"removeParameter(this);\" name=\"removeParameter" + (parameterCounter + 1) + "\"  style=\"width: 90%;\" class=\"form-control btn btn-danger btn-sm  pull-right\" value=\"Remove\"\/>";
    newParamDiv += "                                        <\/div>";
    newParamDiv += "                                    <\/div>";


    //Create and append to parameterDiv
    var innerDiv = document.createElement('div');
    innerDiv.className = 'row';
    innerDiv.innerHTML = newParamDiv;
    //The variable iDiv is still good... Just append to it.
    operationDiv.appendChild(innerDiv);

    var sId = "requiredOperationAuthSwitch" + (parameterCounter + 1);
    $("input[name=" + sId + "]").bootstrapSwitch();
    parameterCounter++;


}


function callIntegrationRestService() {
    event.preventDefault();
    var p = document.getElementById("repeater");
    var loading = $('<div class="loading"><i class="fa fa-refresh fa-spin"></i></div>');
    $.ajax({
        url: "/integrationRestService",
        type: "POST",
        data: {serviceDescriptionJson: JSON.stringify(serviceDescription)},
        beforeSend: function () {

            loading.appendTo(p);
            loading.fadeIn();

        },
        success: function (response) {
            loading.fadeOut();
            $("#restServiceWizardModal").modal("hide");
            $("#successModal").modal("show");

            document.getElementById("alertText").innerHTML = response;
            //serviceDescription and serviceOperations objects  is cleaning
            serviceDescription = {name: "", baseUrl: "", operations: [], defaultHeaders: [], authentication: {}};
            serviceOperations = [];

            $("#idServices").click();
        },
        error: function (response) {
            loading.fadeOut();

            $("#restServiceWizardModal").modal("hide");
            $("#ErrorModal").modal("show");

            document.getElementById("errorText").innerHTML = response.responseText;

            $("#idServices").click();
        }

    });
}
;

function callIntegrationSoapService() {
    event.preventDefault();
    var p = document.getElementById("repeater");
    var loading = $('<div class="loading"><i class="fa fa-refresh fa-spin"></i></div>');

    var serviceName = $("#serviceName").val().trim().replace(" ","");
    var wsdlAddress = $("#wsdlAddress").val().trim();


    $.ajax({
        url: "/integrationSoapService",
        type: "POST",
        data: {serviceName: serviceName, wsdlAddress: wsdlAddress},
        beforeSend: function () {

            loading.appendTo(p);
            loading.fadeIn();

        },
        success: function (response) {
            loading.fadeOut();

            $("#soapServiceWizardModal").modal("hide");

            $("#successModal").modal("show");

            document.getElementById("alertText").innerHTML = response;

            $("#idServices").click();
        },
        error: function (response) {
            loading.fadeOut();
            $("#soapServiceWizardModal").modal("hide");

            $("#ErrorModal").modal("show");
            document.getElementById("errorText").innerHTML = response.responseText;
            $("#idServices").click();
        }

    });
}
;
function callIntegrationSapService() {
    event.preventDefault();
    var p = document.getElementById("repeater");
    var loading = $('<div class="loading"><i class="fa fa-refresh fa-spin"></i></div>');

    var serviceName = $("#sapServiceName").val().trim().replace(" ","");;
    var sapHost = $("#sapHost").val().trim();
    var sapSysnr = $("#sapSysnr").val().trim();
    var sapClient = $("#sapClient").val().trim();
    var sapUserName = $("#sapUserName").val().trim();
    var sapPassword = $("#sapPassword").val().trim();
    var sapLanguage = $("#sapLanguage").val().trim();
    var expirationTime = $("#sapExpirationTime").val().trim();
    var sapCapacity = $("#sapCapacity").val().trim();
    var sapLimit = $("#sapLimit").val().trim();
    var sapRouter = $("#sapRouter").val().trim();


    $.ajax({
        url: "/integrationSapService",
        type: "POST",
        data: {serviceName: serviceName, host: sapHost, sysnr: sapSysnr, client: sapClient, userName: sapUserName,
            password: sapPassword, lang: sapLanguage, expirationTime: expirationTime, capacity: sapCapacity, limit: sapLimit, rooter: sapRouter},
        beforeSend: function () {

            loading.appendTo(p);
            loading.fadeIn();

        },
        success: function (response) {
            loading.fadeOut();

            $("#sapServiceWizardModal").modal("hide");

            $("#successModal").modal("show");

            document.getElementById("alertText").innerHTML = response;

            $("#idServices").click();
        },
        error: function (response) {
            loading.fadeOut();
            $("#sapServiceWizardModal").modal("hide");

            $("#ErrorModal").modal("show");
            document.getElementById("errorText").innerHTML = response.responseText;
            $("#idServices").click();
        }

    });
}
;

function removeHeader(event) {

    $(event).closest('.form-group').remove();
    headerCounter--;
}
;


function removeOperation(event) {

    var removedOperationName = $(event).parent().siblings(':first-child').children().val();
//    console.log("Removing operationg: " + removedOperationName);
    for (var i = 0; i < serviceOperations.length; i++) {

        if (serviceOperations[i].name === removedOperationName) {
//            console.log("removed serviceOperation :" + removedOperationName + " : " + JSON.stringify(serviceOperations));

            serviceOperations.splice(i, 1);// i. item removed.
            break;
        }

    }
    $(event).closest('.form-group').remove();
    operationCounter--;
    if (operationCounter === 0) {
        $("#parameterListDiv").hide();
    }
}
;

function removeParameter(event) {


    var removedKey = $(event).parent().siblings(':first-child').next().children().val();

    var selectedOperationName = $('#operationList option:selected').val();
    for (var i = 0; i < serviceOperations.length; i++) {

        if (serviceOperations[i].name === selectedOperationName) {
            var parameterCount = serviceOperations[i].parameters.length;
            for (var j = 0; j < parameterCount; j++) {
//                console.log("removing key :" + removedKey);
                if (serviceOperations[i].parameters[j].name === removedKey) {
//                    console.log("removed key :" + removedKey + " : " + JSON.stringify(serviceOperations));

                    serviceOperations[i].parameters.splice(j, 1);// j. item removed.
                    break;
                }

            }
            break;
        }
    }


    $(event).closest('.form-group').remove();
    parameterCounter--;
    if (parameterCounter === 0) {
        $("#parameterListDiv").hide();
    }
}
;

function clearOperationsFormInputs() {
    $("#operationName").val('');
    $("#path").val('');
    $("#operationUserName").val('');
    $("#operationPassword").val('');
}


function clearParametersFormInputs() {
    $("#paramName").val('');
    $("#paramValue").val('');
    $("#fieldName").val('');
}


function addOperationParametersJSON() {

    for (var i = 0; i < serviceOperations.length; i++) {
        if (serviceOperations[i].name === selectedOperationName) {
            var parameterCount = serviceOperations[i].parameters.length;
            serviceOperations[i].parameters[parameterCount] = parameter;
            break;
        }
    }

}
function  removeServiceConfiguration(serviceName) {

    var p = document.getElementById("repeater");
    var loading = $('<div class="loading"><i class="fa fa-refresh fa-spin"></i></div>');

    $.ajax({
        url: "/removeServiceConfiguration",
        type: "POST",
        data: {serviceName: serviceName},
        beforeSend: function () {

            loading.appendTo(p);
            loading.fadeIn();

        },
        success: function (response) {
            loading.fadeOut();
            $("#successModal").modal("show");
            document.getElementById("alertText").innerHTML = response;
            $("#idServices").click();
        },
        error: function (response) {
            loading.fadeOut();
            $("#ErrorModal").modal("show");
            document.getElementById("errorText").innerHTML = response.responseText;
        }

    });

}
 