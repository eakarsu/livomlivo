/*** Javascript codes of application settings page. ***/

//processing file creation

var pfBar = document.getElementById("probarfile");

var pfState = document.getElementById("progressStateFile");

$("form#fileUploading").ajaxForm({
    beforeSend: function (xhr, opts) {

        if (!$("form#fileUploading").find("input[name='applicationFile']").val())
            xhr.abort();

        else {

            $("#dontUpload").prop("disabled", true);

            $("#upLoadFile").prop("disabled", true);
        }

    },
    uploadProgress: function (event, position, total, percentComplete) {
        var percentVal = percentComplete + '%';
        var style = "width:" + percentVal + ";";
        pfBar.setAttribute("style", style);

        if (percentComplete == 100)
            pfState.innerHTML = "Saving File...";

        else
            pfState.innerHTML = percentVal;

    },
    success: function (data) {

        $("#dontUpload").prop("disabled", false);

        $("#upLoadFile").prop("disabled", false);

        $("#sUploadFile").modal('hide');

        doTrick(targetElement);

        pfBar.setAttribute("style", "width: 0%;");

        pfState.innerHTML = "";


    },
    error: function (response) {

        $("#dontUpload").prop("disabled", false);

        $("#upLoadFile").prop("disabled", false);

        pfBar.setAttribute("style", "width: 0%;");

        pfState.innerHTML = "";

        $("#fileUploadError").fadeIn(300, function () {

            document.getElementById("fileUploadError").innerHTML = response.responseText;

        });
    }

});

$("form#fileCreation").ajaxForm({
    beforeSend: function (xhr, opts) {

        if (!$("#inputFileName").val())
            xhr.abort();

        else {

            $("#closeFileCreate").prop("disabled", true);

            $("#saveFileCreate").prop("disabled", true);
        }

    },
    success: function (data) {

        $("#closeFileCreate").prop("disabled", false);

        $("#saveFileCreate").prop("disabled", false);

        $("#sCreateFile").modal('hide');

        doTrick(targetElement);



    },
    error: function (response) {

        document.getElementById("fileNameError").innerHTML = response.responseText;

        $("#closeFileCreate").prop("disabled", false);

        $("#saveFileCreate").prop("disabled", false);
    }


});

$("form#folderCreation").ajaxForm({
    beforeSend: function (xhr, opts) {

        if (!$("#inputFolderName").val())
            xhr.abort();

        else {

            $("#closeFolderCreate").prop("disabled", true);

            $("#saveFolderCreate").prop("disabled", true);
        }

    },
    success: function (data) {

        $("#closeFolderCreate").prop("disabled", false);

        $("#saveFolderCreate").prop("disabled", false);

        $("#sCreateFolder").modal('hide');

        doTrick(targetElement);



    },
    error: function (response) {

        document.getElementById("folderNameError").innerHTML = response.responseText;

        $("#closeFolderCreate").prop("disabled", false);

        $("#saveFolderCreate").prop("disabled", false);
    }


});

$("form#fileImportingForm").ajaxForm({
    uploadProgress: function (event, position, total, percentComplete) {
        var percentVal = percentComplete + '%';
        var style = "width:" + percentVal + ";";
        pBar.setAttribute("style", style);

        if (percentComplete == 100)
            pState.innerHTML = "Processing File...";
        else
            pState.innerHTML = percentVal;

    },
    success: function (response) {
//          alert(response);
//          document.getElementById("importFromFileResponse").innerHTML = response;
        $("#sImportNewUserFromFile").modal("hide");

        $("#successModal").modal("show");
        $("#idUsersList").click();
        document.getElementById("alertText").innerHTML = response;

    },
    error: function (response) {
        document.getElementById("importFromFileResponse").innerHTML = response.responseText;

        pBar.setAttribute("style", "width: 0%;");

        pState.innerHTML = "";

    }
});
// End of process code


/*** Changing the name of the application file ***/
$("#renameFileButton").click(function (event) {
    var filePath = $("#inputRenameFilePath").val();
    var newFileName = $("#newFileName").val();
    var fileType = $("#inputRenameFileType").val();
    var appId = $("#inputRenameFileAppId").val();

    $.ajax({
        url: "/rename/appFile",
        type: "POST",
        data: {filePath: filePath, fileType: fileType, appId: appId, newFileName: newFileName},
        success: function () {
            $("#sRenameFileModal").modal("hide");

            loadContent("/apps/", true, appId);

        },
        error: function (response) {

            $("#ErrorModal").modal("show");

            document.getElementById("errorText").innerHTML = response.responseText;

        }

    });

});


$("#downloadApplication").click(function (event) {

    var lastWordOfApp = "Are you sure to download the application with name: " + appIdHolder + " ?";

    document.getElementById("downloadApplicationText").innerHTML = lastWordOfApp;

    $("#downloadApplicationModal").modal('show');
});

$("#downloadAppButton").click(function (event) {

    if (appIdHolder != $("#downloadApplication.btn-group").data("application-id")) {

        alert("Why are you trying dirty things????");
    }
    else {
        $("#downloadApplicationModal").modal('hide');
        setTimeout(function () {
            $(".page-content").load("/apps/download", {applicationId: appIdHolder}, function (responseText, textStatus, jqXHR) {
            });
        }, 800);
    }
});

$("#deleteApplication.btn-group").click(function (event) {

    var lastWordOfApp = "Are you sure to delete permanently the application with name: " + appIdHolder + " ?";

    document.getElementById("deleteAppText").innerHTML = lastWordOfApp;

    $("#deleteAppModal").modal('show');

});
/*** Delete Application processes ***/
$("#deleteAppButton").click(function (event) {

    if (appIdHolder != $("#deployment.btn-group").data("application-id")) {

        alert("Why are you trying dirty things????");
    }

    else {

        $("#deleteAppModal").modal('hide');
        setTimeout(function () {
            $("#sidebarContainer").load("/apps/" + appIdHolder + "/delete", {"": ""}, function (responseText, textStatus, jqXHR) {

                $(".page-content").load("/bodyWelcome", {"": ""}, function () {

//					$(reloader());
                    location.reload();
                });

            });
        }, 800);


    }

});

//Processing application creation
var pBar = document.getElementById("probar"); //div element

var pState = document.getElementById("progressState");//<P> element

$("form#createApplication").ajaxForm({
    beforeSend: function (xhr, opts) {

        if (!($("form#createApplication").find("input[name='name']").val() && $("form#createApplication").find("textarea[name='description']").val() && $("form#createApplication").find("select[name='templateName']").val()))
            xhr.abort();
        else {

            if ($("div#applicationUpload").is(":visible")) {

                if ($("input#applicationUpload").val()) {

                    $("#CloseForm").prop("disabled", true);

                    $("#SubmitForm").prop("disabled", true);

                } else {

                    xhr.abort();
                }
            }
        }
        $("#applicationUploadError").fadeIn(200, function () {

            document.getElementById("applicationUploadError").innerHTML = "";

        });

    },
    uploadProgress: function (event, position, total, percentComplete) {
        var percentVal = percentComplete + '%';
        var style = "width:" + percentVal + ";";
        pBar.setAttribute("style", style);

        if (percentComplete == 100)
            pState.innerHTML = "Processing App...";

        else
            pState.innerHTML = percentVal;

    },
    success: function (data) {
        var appId = $("form#createApplication").find("input[name='name']").val();
        $("#createApplicationModal").modal('hide');

        $("#CloseForm").prop("disabled", false);

        $("#SubmitForm").prop("disabled", false);

        setTimeout(function () {
            $("#sidebarContainer").load("/loadSideBar", {"": ""}, function (responseText, textStatus, jqXHR) {

                $(".page-content").load("/bodyWelcome", {"": ""}, function () {
                    location.reload();

                });
//                            $(".page-content").load("/apps/" + appId, {"": ""}, function () {
//                                appIdHolder = appId;
//                            });

            });
        }, 1800);
        //                             location.reload();

    },
    error: function (response) {

        $("#CloseForm").prop("disabled", false);

        $("#SubmitForm").prop("disabled", false);

        pBar.setAttribute("style", "width: 0%;");

        pState.innerHTML = "";
        $("#createApplicationModal").modal('hide');
        $("#ErrorModal").modal("show");

        document.getElementById("errorText").innerHTML = response.responseText;

        $("#applicationUploadError").fadeIn(300, function () {

            document.getElementById("applicationUploadError").innerHTML = response.responseText;

        });
    }
});
// End of process code

$(".dcjq-parent-li.app #app").click(function (event) {

    event.preventDefault();

    var applicationId = $(this).parent().data("application-id");

    if ($("#savedStates.btn-group,#deployment.btn-group,#deleteApplication.btn-group,#preview.btn-group,#applicationSettings.btn-group,#downloadApplication.btn-group").is(":visible")) {

        if (appIdHolder == applicationId) {

//			$("#savedStates.btn-group,#deployment.btn-group,#deleteApplication.btn-group,#preview.btn-group,#applicationSettings.btn-group").fadeOut(500);
            buttonGroupFadeOut(500);
//                    	$("#savedStates.btn-group,#deployment.btn-group,#deleteApplication.btn-group,#preview.btn-group,#applicationSettings.btn-group").fadeIn(500);
            buttonGroupFadeIn(500);
        } else {

            //give id of the app to hold for later use
            $("#savedStates.btn-group").data("application-id", applicationId);

            $("#deployment.btn-group").data("application-id", applicationId);

            $("#deleteApplication.btn-group").data("application-id", applicationId);

            $("#preview.btn-group").data("application-id", applicationId);

            $("#applicationSettings.btn-group").data("application-id", applicationId);

            $("#downloadApplication.btn-group").data("application-id", applicationId);

        }

        //loadContent("/welcome", true);
        loadContent("/apps/", true, applicationId);

        appIdHolder = $(this).parent().data("application-id");

    } else {

        //show save|delete|deploy buttons
//			$("#savedStates.btn-group,#deployment.btn-group,#deleteApplication.btn-group,#preview.btn-group,#applicationSettings.btn-group").fadeIn(500);
        buttonGroupFadeIn(500);
        //give id of the app to hold for later use
        $("#savedStates.btn-group").data("application-id", applicationId);

        $("#deployment.btn-group").data("application-id", applicationId);

        $("#deleteApplication.btn-group").data("application-id", applicationId);

        $("#preview.btn-group").data("application-id", applicationId);

        $("#applicationSettings.btn-group").data("application-id", applicationId);

        $("#downloadApplication.btn-group").data("application-id", applicationId);

        //save current app id to global holder
        appIdHolder = $(this).parent().data("application-id");

        loadContent("/apps/", true, applicationId);

        loadApplicationSavedStates(applicationId);
    }
});

$(".dcjq-parent-li:not(.app)").click(function (event) {

//		$("#savedStates.btn-group,#deployment.btn-group,#deleteApplication.btn-group,#preview.btn-group,#applicationSettings.btn-group").fadeOut(400);
    buttonGroupFadeOut(400);
});

//Deploy application method
deployApplication = function (appId) {
    var p = document.getElementById("repeater");
    var loading = $('<div class="loading"><i class="fa fa-refresh fa-spin"></i></div>');
    $.ajax({
        url: "/deployApplication",
        type: "POST",
        data: {id: appId},
        beforeSend: function () {

            loading.appendTo(p);
            loading.fadeIn();
            $("div.sidebarContainer").css("display", "block");
            $("div.changeUserAttributesModal").css("display", "block");
        },
        success: function (response) {
            $("div.sidebarContainer").css("display", "none");
            $("div.changeUserAttributesModal").css("display", "none");

            $("#successModal").modal("show");
            document.getElementById("alertText").innerHTML = response;

            setTimeout(function () {
                loading.fadeOut();
            }, 1000);
        },
        error: function (response) {
            $("div.sidebarContainer").css("display", "none");
            $("div.changeUserAttributesModal").css("display", "none");
            loading.fadeOut();

            $("#ErrorModal").modal('show');

            document.getElementById("errorText").innerHTML = response.responseText;
        }

    });

};

$("#editorSubmitAndDeploy").click(function () {

    saveAndDeploy();

    return false;
});

//source code saved in editor 
saveEditor = function () {
    var form = $("#rawScreenEditor");
    form.submit();
};

//source code saved in editor and deploy application
saveAndDeploy = function () {
    saveEditor();
    deployApplication($("#deployment.btn-group").data("application-id"));
};

//application show preview actions
showPreview = function (arg) {

    $("div#fileContent").load("/show/preview/application", {"appId": $("#deployment.btn-group").data("application-id"), "currentFile": arg}, function () {
        if (arg === "") {

            document.getElementById("displayFileName").innerHTML = "Application " + $("#deployment.btn-group").data("application-id") + " preview.";

        } else {

            var fileName = currentFile.split("/");
            document.getElementById("displayFileName").innerHTML = "Preview - " + fileName[fileName.length - 1];

        }


        $("#changeOrientation").click(function (e) {
            if ($("#previewDevice").hasClass("landscape")) {

                $("#previewDevice").removeClass("landscape");

            }
            else
                $("#previewDevice").addClass("landscape");



        });

        $("#nexusPre").click(function () {

            if ($("#previewDevice").hasClass("landscape"))
                document.getElementById("previewDevice").setAttribute("class", "marvel-device nexus5 landscape");
            else
                document.getElementById("previewDevice").setAttribute("class", "marvel-device nexus5");


        });

        $("#iphonePre").click(function () {

            if ($("#previewDevice").hasClass("landscape"))
                document.getElementById("previewDevice").setAttribute("class", "marvel-device iphone5s black landscape");
            else
                document.getElementById("previewDevice").setAttribute("class", "marvel-device iphone5s black");


        });

        $("#tabletPre").click(function () {

            if ($("#previewDevice").hasClass("landscape"))
                document.getElementById("previewDevice").setAttribute("class", "marvel-device ipad landscape");
            else
                document.getElementById("previewDevice").setAttribute("class", "marvel-device ipad");


        });


    });

};
// load application saved states -- Disable now 
loadApplicationSavedStates = function (applicationId) {

    $.ajax({
        url: "/apps/" + applicationId + "/savedStates",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success: function (data) {

            if (data.length == 0) {

                $("#savedStates #count.label").text("");
                $("#savedStates .title.alert").removeClass("alert-warning").addClass("alert-success");
                $("#savedStates #count:not(.label)").text("0");

                $("#savedStates ul li:not(.title):not(.prototype)").remove();

            } else {

                $("#savedStates #count.label").text("" + data.length);
                $("#savedStates .title.alert").removeClass("alert-success").addClass("alert-warning");

                $("#savedStates ul li:not(.title):not(.prototype)").remove();

                for (var state in data) {

                    var clonedItem = $("#savedStates li.prototype").clone();

                    clonedItem.children(".alert-content").children("#time").text(state.time);
                    clonedItem.children(".alert-content").children("#date").text(state.date);

                    clonedItem.children(".alert-time").text(state.summary);

                    clonedItem.removeClass("prototype");
                    clonedItem.removeAttr("style");

                    $("#savedStates ul").append(clonedItem);
                }

                $("#savedStates ul").append("<li></li>");
            }


        }
    });
};

deleteFile = function (el, app) {

    $.ajax({
        url: "/delete/appfile",
        type: "POST",
        data: {fileUrl: $(el).attr("rel"), appId: app},
        success: function () {

            $(el).parent().remove();
        },
        error: function (response) {

            $("#ErrorModal").modal("show");

            document.getElementById("errorText").innerHTML = response.responseText;

        }

    });

};

duplicateFile = function (el, app) {

    $.ajax({
        url: "/duplicate/appfile",
        type: "POST",
        data: {fileUrl: $(el).attr("rel"), appId: app},
        success: function () {

            loadContent("/apps/", true, app);

        },
        error: function (response) {

            $("#ErrorModal").modal("show");

            document.getElementById("errorText").innerHTML = response.responseText;

        }

    });

};

renameFile = function (el, app) {

    newFileName = "";
    $.ajax({
        url: "/rename/appFile",
        type: "POST",
        data: {fileUrl: $(el).attr("rel"), appId: app, newFileName: newFileName},
        success: function () {

            $(el).parent().remove();
        },
        error: function (response) {

            $("#ErrorModal").modal("show");

            document.getElementById("errorText").innerHTML = response.responseText;

        }

    });

};

cutFile = function (el, app) {
// Cut file status is true for file paste.
    cutFilePath = $(el).attr("rel");
    cutFileStatus = true;

};

pasteFile = function (el, app) {

    var targetFilePath = $(el).attr("rel");
    if (cutFilePath == "") {

        $("#ErrorModal").modal("show");
        document.getElementById("errorText").innerHTML = "Cut file path is empty.!";
        return false;
    }
    console.log("filePath : " + cutFilePath + " targetFilePath  : " + targetFilePath + "    appId : " + app);

    $.ajax({
        url: "/move/appfile",
        type: "POST",
        data: {filePath: cutFilePath, targetFilePath: targetFilePath, appId: app},
        success: function () {
            loadContent("/apps/", true, app);
        },
        error: function (response) {

            $("#ErrorModal").modal("show");
            document.getElementById("errorText").innerHTML = response.responseText;
            cutFileStatus = false;
        }

    });

};


$("#sendPushNotificationButton").click(function () {

    var application = $("#applicationSelect option:selected").text();

    var title = $("#pushNotificationTitle").val();

    var message = $("#pushNotificationMessage").val();

    var messageType = $("#messageTypeSelect option:selected").text();


    if (application === "") {

        document.getElementById("errorText").innerHTML = "All fields is required.";
    } else if (title === "") {
        document.getElementById("pushTittleError").innerHTML = "Please enter a title.";
    } else if (message === "") {
        document.getElementById("pushMessageContentError").innerHTML = "Please enter a message.";
    } else if (messageType === "") {
        document.getElementById("pushTittleError").innerHTML = "Please select a message type.";
    }

    if (application === "" || title === "" || message === "" || messageType === "") {
        $("#sendPushNotificationModal").modal("hide");
        $("#ErrorModal").modal("show");
        document.getElementById("errorText").innerHTML = "All fields is required.";
        return false;
    }

    sendPushNotification(application, title, message);

    clearNotificationFormInputs();
});


function sendPushNotification(application, title, message, messageType) {
    event.preventDefault();
    var p = document.getElementById("repeater");
    var loading = $('<div class="loading"><i class="fa fa-refresh fa-spin"></i></div>');

    $.ajax({
        url: "/notification/sendNotification",
        type: "POST",
        data: {appName: application, pushNotificationTitle: title, pushNotificationMessage: message, pushNotificationMessageType: messageType},
        beforeSend: function () {
            loading.appendTo(p);
            loading.fadeIn();

        },
        success: function (response) {
            loading.fadeOut();
            $("#sendPushNotificationModal").modal("hide");
            $("#successModal").modal("show");
            document.getElementById("alertText").innerHTML = response;
        },
        error: function (response) {
            loading.fadeOut();
            $("#sendPushNotificationModal").modal("hide");
            $("#ErrorModal").modal("show");
            document.getElementById("errorText").innerHTML = response.responseText;
        }

    });
}


function clearNotificationFormInputs() {
    $("#applicationSelect").val(0)
    $("#messageTypeSelect").val(0)
    $("#pushNotificationTitle").val('');
    $("#pushNotificationMessage").val('');
}



$(document).on('click', '#test_preview', function (event) {
    saveEditor();

    previewCount++;
    previewSourceArray[previewCount] = editor.doc.getValue();

    showPreview(currentFile);
});

$(document).on('click', '#code_preview', function (event) {

    loadFileContent("/file/content", currentFile);

});


doTrick = function (target) {

    var tf = "a";

    if ($(target).data("type") == "directory") {

        if ($(target).attr("id") == "treeRoot")
        {
            $('#testtree').fileTree({root: $(target).attr("rel"), script: '../tree/jqueryFileTree.jsp', multiFolder: false, expandSpeed: 750, collapseSpeed: 750}, function (file) {

                currentFile = file;
                loadFileContent("/file/content", file);
            });
        }
        else {

            var list = $(target).parent().attr("class").split(/\s+/);

            for (var i = 0; i < list.length; i++) {

                if (list[i] == "expanded")
                {
                    tf = "aa";
                }
            }

            if (tf === "aa") {

                $(target).click();

                setTimeout(function () {

                    $(target).click();

                }, 500);
            }

            else
                $(target).click();


        }
    }
};


function showShortcuts() {

    $("#Shortcuts").modal("show");

}