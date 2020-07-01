/*** Javascript codes of application settings page. ***/

$("#applicationSettings").click(function (event) {
        event.preventDefault();
        
        $("#componentHeader").hide();
        $("#headerPreviewButtons").hide();
        
        if (appIdHolder != $("#applicationSettings.btn-group").data("application-id")) {

            alert("Why are you trying dirty things????");
        } else {
            setTimeout(function () {
                $("div#fileContent").load("/apps/settings/" + appIdHolder, {"": ""}, function (responseText, textStatus, jqXHR) {
                    document.getElementById("displayFileName").innerHTML = "APPLICATION PROPERTIES";

                    $("form#androidPushNotificationForm").submit(function () {

                        var formData = new FormData($(this)[0]);
//        console.log(formData);
                        $.ajax({
                            url: "/apps/notifications/pushNotification/android",
                            type: 'POST',
                            data: formData,
                            async: false,
                            success: function (response) {
                                $("#successModal").modal("show");
                                document.getElementById("alertText").innerHTML = response;
                            }, error: function (response) {
                                $("#ErrorModal").modal("show");
                                document.getElementById("errorText").innerHTML = response.responseText;
                            },
                            cache: false,
                            contentType: false,
                            processData: false
                        });

                        return false;
                    });

                    $('#pnPlatformSelect').on('change', function (e) {
//                        var platformType = $("option:selected", this);
                        var valueSelected = this.value;
                        if (valueSelected !== 0) {
                            if (valueSelected === "android") {
                                $("#IOSNotificationSettings").hide();
                                $("#androidNotificationSettings").show();
                            } else if (valueSelected === "ios") {
                                $("#androidNotificationSettings").hide();
                                $("#IOSNotificationSettings").show();

                            } else {
                                $("#androidNotificationSettings").hide();
                                $("#IOSNotificationSettings").hide();
//                                alert("00");
                            }

                        } else {
//                            alert("0");
                            $("#androidNotificationSettings").hide();
                            $("#IOSNotificationSettings").hide();
                        }
                    });



                    $('#authorizedUserGroupSelect').on('change', function (e) {

                        var valueSelected = this.value;

                        if (valueSelected !== "0") {

                            if (valueSelected === "any") {


                            } else if (valueSelected === "noAuthorization") {


                            } else if (valueSelected === "ldap") {
                                // Groups Combobox add ldap connections groups    

                            } else if (valueSelected === "systemUser") {
                                // Groups Combobox add system  groups    

                            } else if (valueSelected === "any") {


                            }
                        } else {
//                          
                        }
                    });

                });
            }, 800);
        }
    });

