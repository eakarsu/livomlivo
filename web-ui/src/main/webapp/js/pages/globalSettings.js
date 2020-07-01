/*** Javascript codes of global settings page. ***/
var requireAuth = false;


$(document).on('click', '#mailConfigButtonSubmit', function (event) {

    event.preventDefault();
    $.ajax({
        url: "/configureEmailContent",
        type: "POST",
        data: {senderName: $("#senderName").val(), mailHeader: $("#mailHeader").val(), userCreateMailSubject: $("#userCreateMailSubject").val(), userCreateMailContent: $("#userCreateMailContent").val(), passwordChangeMailSubject: $("#passwordChangeMailSubject").val(), passwordChangeMailContent: $("#passwordChangeMailContent").val()},
        success: function (response) {
//                        clearConfigureMailContentFormParameters();
            $("#successModal").modal("show");
            document.getElementById("alertText").innerHTML = response;
            $("#globalSettings").click();
            $("#mailTab").show();
        },
        error: function (response) {
            $("#globalSettings").click();
            document.getElementById("emailContentError").innerHTML = response.responseText;

        }
    });

});


loadGlobalSettingsPage = function () {
    // SMTP Settings Progress Wizard 
    $('#smtpSettingsProgressWizard').bootstrapWizard();

    $('input[name="switch-authentication"]').bootstrapSwitch();

    $('input[name="switch-authentication"]').on('switchChange.bootstrapSwitch', function (event, state) {

        if (state) {
            $("#smtpUserName").prop('disabled', false);
            $("#smtpPassword").prop('disabled', false);
        } else {
            $("#smtpUserName").prop('disabled', true);
            $("#smtpPassword").prop('disabled', true);
        }
        requireAuth = state;
    });

//            document.getElementById("smtpSettingsTestButton").disabled = true;
    $("#smtpSettingsButtonSubmit").click(function ( ) {

        event.preventDefault();
        var p = document.getElementById("repeater");
        var loading = $('<div class="loading"><i class="fa fa-refresh fa-spin"></i></div>');
        var form = $("form#configureSmtpSettingsForm");
        var smtpServer = form.find("input[name='smtpServer']").val();
        var port = form.find("input[name='port']").val();
        var smtpUserName = form.find("input[name='smtpUserName']").val();
        var smtpPassword = form.find("input[name='smtpPassword']").val();
        var mailHostType = form.find("select[name='mailHostType']").val();
        var displayMail = form.find("input[name='displayMail']").val();
        requireAuth = $('#switch-authentication').is(':checked');
        if (requireAuth) {
            if (smtpUserName == "" || smtpPassword == "") {
                $("#ErrorModal").modal("show");
                document.getElementById("errorText").innerHTML = "Username and password fields are required.";
                return false;
            }
        } else if (!requireAuth) {
            smtpUserName = null;
            smtpPassword = null;

            if (displayMail == "") {
                $("#ErrorModal").modal("show");
                document.getElementById("errorText").innerHTML = "Mail from field is required.";
                return false;

            }
        }

        if (smtpServer == "" || port == "" || mailHostType == "") {
            $("#ErrorModal").modal("show");
            document.getElementById("errorText").innerHTML = "Fields are required.";
            return false;
        } else {
            $.ajax({
                url: "/configureSmtpSettings",
                type: "POST",
                data: {smtpServer: smtpServer, port: port, requireAuth: requireAuth, smtpUserName: smtpUserName, smtpPassword: smtpPassword, mailHostType: mailHostType, displayMail: displayMail},
                beforeSend: function () {

                    loading.appendTo(p);
                    loading.fadeIn();

                }, success: function (response) {
                    loading.fadeOut();
//                            document.getElementById("smtpSettingsTestButton").disabled = false;
                    $("#successModal").modal("show");
                    document.getElementById("alertText").innerHTML = response;
                    $("#idGlobalSettings").click();
                },
                error: function (response) {
                    loading.fadeOut();
                    $("#ErrorModal").modal("show");
                    document.getElementById("errorText").innerHTML = response.responseText;
                }

            });
        }

    });

    $("#smtpSettingsTestButton").click(function ( ) {
        event.preventDefault();
        var p = document.getElementById("repeater");
        var loading = $('<div class="loading"><i class="fa fa-refresh fa-spin"></i></div>');
        var form = $("form#configureSmtpSettingsForm");
        var smtpUserName = form.find("input[name='smtpUserName']").val();

        $.ajax({
            url: "/testSmtpSettings",
            type: "POST",
            beforeSend: function () {

                loading.appendTo(p);
                loading.fadeIn();

            },
            success: function (response) {
                loading.fadeOut();
                $("#successModal").modal("show");
                document.getElementById("alertText").innerHTML = response;

            },
            error: function (response) {
                loading.fadeOut();
                $("#ErrorModal").modal("show");
                document.getElementById("errorText").innerHTML = response.responseText;
            }

        });

    });

};    