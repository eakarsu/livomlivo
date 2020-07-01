/*** Javascript codes of application settings page. ***/


$(document).on('click', '#addNewLdapSettings', function (event) {
     $("#ldapSettingsWizardModal").modal("show");
    return false;
});

$(document).on('click', '#ldapSettingsButtonSubmit', function (event) {

    event.preventDefault();
    var p = document.getElementById("repeater");
    var loading = $('<div class="loading"><i class="fa fa-refresh fa-spin"></i></div>');

    var form = $("form#configureLdapSettingsForm");
    var serverAddress = form.find("input[name='serverAddress']").val();
    var serverPort = form.find("input[name='serverPort']").val();
    var baseDn = form.find("input[name='baseDn']").val();
    var dnKey = form.find("input[name='dnKey']").val();
    var connectionName = form.find("input[name='connectionName']").val();
    if (connectionName == "" || serverAddress == "" || serverPort == "" || baseDn == "" || dnKey == "") {
        document.getElementById("ldapSettingsError").innerHTML = "All fields is required.";
        return false;
    }
    if (connectionName == "") {
        document.getElementById("ldapSettingsError").innerHTML = "Configuration Name field is required.";
        return false;
    } else if (serverAddress == "") {
        document.getElementById("ldapSettingsError").innerHTML = "Server Address field is required.";
        return false;
    } else if (serverPort == "") {
        document.getElementById("ldapSettingsError").innerHTML = "Server port field is required.";
        return false;

    } else if (baseDn == "") {
        document.getElementById("ldapSettingsError").innerHTML = "Base Dn field is required.";
        return false;

    } else if (dnKey == "") {
        document.getElementById("ldapSettingsError").innerHTML = "Dn Key field is required.";
        return false;

    } else {
        $.ajax({
            url: "/configureLdapSettings",
            type: "POST",
            data: {
                connectionName: connectionName,
                serverAddress: serverAddress,
                serverPort: serverPort,
                baseDn: baseDn,
                dnKey: dnKey
            },
            beforeSend: function() {
                loading.appendTo(p);
                loading.fadeIn();
            },
            success: function(response) {
                loading.fadeOut();
                clearLdapFormParameters();
                $("#ldapSettingsWizardModal").modal("hide");
                document.getElementById("ldapSettingsTestButton").disabled = false;
                $("#successModal").modal("show");
                document.getElementById("alertText").innerHTML = response;
            },
            error: function(response) {
                loading.fadeOut();
                document.getElementById("ldapSettingsError").innerHTML = response.responseText;
            }

        });
    }

});

$("#ldapSettingsTestButton").click(function() {
    event.preventDefault();
    var p = document.getElementById("repeater");
    var loading = $('<div class="loading"><i class="fa fa-refresh fa-spin"></i></div>');
    var form = $("form#configureLdapSettingsForm");

});

loadLdapPage = function() {
    $("div#idPageContent").load("/ldapSettings", {
        "": ""
    }, function() {

        document.getElementById("ldapSettingsTestButton").disabled = true;
    });

};

function removeLdapConfiguration(connectionName) {

    var p = document.getElementById("repeater");
    var loading = $('<div class="loading"><i class="fa fa-refresh fa-spin"></i></div>');

    $.ajax({
        url: "/removeLdapConfiguration",
        type: "POST",
        data: {
            connectionName: connectionName
        },
        beforeSend: function() {

            loading.appendTo(p);
            loading.fadeIn();

        },
        success: function(response) {
            loading.fadeOut();
            $("#successModal").modal("show");
            document.getElementById("alertText").innerHTML = response;
            $("#idLdapAD").click();
        },
        error: function(response) {
            loading.fadeOut();
            $("#ErrorModal").modal("show");
            document.getElementById("errorText").innerHTML = response.responseText;
        }

    });

}


function clearLdapFormParameters() {

    $("#connectionName").val('');
    $("#serverAddress").val('');
    $("#serverPort").val('');
    $("#baseDn").val('');
    $("#dnKey").val('');

}