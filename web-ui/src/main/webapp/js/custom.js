var editor;
var targetElement;
var appIdHolder = "";
var appFramework = "";
var currentFile = "";
var jqueryComponentIdList = ["icons", "buttons", "listviews", "checkboxWidget", "collapsible", "grids", "formElement", "loader", "tables", "popups", "toolbars", "tabs"];
var previewSourceArray;
var previewCount;

var cutFileStatus = false;
var cutFilePath = "";

$(document).ready(function () {

    //HeartBeater
    $.ajax({
        url: "/heartbeater",
        type: "POST",
        data: "",
        processData: false,
        contentType: false,
        success: function (suc) {
        },
        error: function (response) {
        }
    });

    setInterval(function () {
        $.ajax({
            url: "/heartbeater",
            type: "POST",
            data: "",
            processData: false,
            contentType: false,
            success: function (suc) {
            },
            error: function (response) {
            }
        });

    }, 500000);

    /*==Left Navigation Accordion ==*/
    if ($.fn.dcAccordion) {
        $('#nav-accordion').dcAccordion({
            eventType: 'click',
            autoClose: true,
            saveState: true,
            disableLink: true,
            speed: 'slow',
            showCount: false,
            autoExpand: true,
            classExpand: 'dcjq-current-parent'
        });
    }
    /*==Slim Scroll ==*/
    if ($.fn.slimScroll) {
        $('.event-list').slimscroll({
            height: '305px',
            wheelStep: 20

        });
        $('.conversation-list').slimscroll({
            height: '360px',
            wheelStep: 35
        });
        $('.to-do-list').slimscroll({
            height: '300px',
            wheelStep: 35
        });
    }
    /*==Nice Scroll ==*/
    if ($.fn.niceScroll) {

        $(".leftside-navigation").niceScroll({
            cursorcolor: "#959595",
            cursorborder: "0px solid #fff",
            cursorborderradius: "0px",
            cursorwidth: "10px"
        });
        if ($(window).width() < 750)
        {
            $('#sidebar').addClass('hide-left-bar');
            $('#main-content').addClass('merge-left');
        }
        $(".leftside-navigation").getNiceScroll().resize();
        if ($('#sidebar').hasClass('hide-left-bar')) {
            $(".leftside-navigation").getNiceScroll().hide();
        }
        $(".leftside-navigation").getNiceScroll().show();

        $(".right-stat-bar").niceScroll({
            cursorcolor: "#959595",
            cursorborder: "0px solid #fff",
            cursorborderradius: "0px",
            cursorwidth: "2px"
        });

    }

    /*==Collapsible==*/
    $('.widget-head').click(function (e) {
        var widgetElem = $(this).children('.widget-collapse').children('i');

        $(this)
                .next('.widget-container')
                .slideToggle('slow');
        if ($(widgetElem).hasClass('ico-minus')) {
            $(widgetElem).removeClass('ico-minus');
            $(widgetElem).addClass('ico-plus');
        } else {
            $(widgetElem).removeClass('ico-plus');
            $(widgetElem).addClass('ico-minus');
        }
        e.preventDefault();
    });

    /*==Sidebar Toggle==*/

    $(".leftside-navigation .sub-menu > a").click(function () {
        var o = ($(this).offset());
        var diff = 80 - o.top;
        if (diff > 0)
            $(".leftside-navigation").scrollTo("-=" + Math.abs(diff), 500);
        else
            $(".leftside-navigation").scrollTo("+=" + Math.abs(diff), 500);
    });

    $('.sidebar-toggle-box').click(function (e) {

        $(".leftside-navigation").niceScroll({
            cursorcolor: "#959595",
            cursorborder: "0px solid #fff",
            cursorborderradius: "0px",
            cursorwidth: "10px"
        });

        $('#sidebar').toggleClass('hide-left-bar');
        if ($(window).width() < 750)
        {
            $('#sidebar').toggleClass('show-left-bar');
            $('#main-content').toggleClass('merge-right');
            $('#sidebar').toggleClass('hidden-xs');

        }
        if ($('#sidebar').hasClass('hide-left-bar')) {
            $(".leftside-navigation").getNiceScroll().hide();
        }
        $(".leftside-navigation").getNiceScroll().show();
        $('#main-content').toggleClass('merge-left');
        e.stopPropagation();


    });

    /*== to do list ==*/
    $('.task-finish').click(function () {
        if ($(this).is(':checked')) {
            $(this).parent().parent().addClass('selected');
        }
        else {
            $(this).parent().parent().removeClass('selected');
        }
    });

    /*==Delete to do list==*/
    $('.task-del').click(function () {
        var activeList = $(this).parent().parent();

        activeList.addClass('removed');

        setTimeout(function () {
            activeList.remove();
        }, 1000);

        return false;
    });



    /*==Porlets Actions==*/
    $('.minimize').click(function (e) {
        var h = $(this).parents(".header");
        var c = h.next('.porlets-content');
        var p = h.parent();

        c.slideToggle();

        p.toggleClass('closed');

        e.preventDefault();
    });

    $('.refresh').click(function (e) {
        var h = $(this).parents(".header");
        var p = h.parent();
        var loading = $('<div class="loading"><i class="fa fa-refresh fa-spin"></i></div>');

        loading.appendTo(p);
        loading.fadeIn();
        setTimeout(function () {
            loading.fadeOut();
        }, 1000);

        e.preventDefault();
    });

    $('.close-down').click(function (e) {
        var h = $(this).parents(".header");
        var p = h.parent();

        p.fadeOut(function () {
            $(this).remove();
        });
        e.preventDefault();
    });



    // tool tips
    $('.tooltips').tooltip();


    // popovers

    $('.popovers').popover();



    // icon tab
    $('#myTab a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
        calculateHeight();
    });



    // custom bar chart

    if ($(".custom-bar-chart")) {
        $(".bar").each(function () {
            var i = $(this).find(".value").html();
            $(this).find(".value").html("");
            $(this).find(".value").animate({
                height: i
            }, 2000);
        });
    }


    /*==mailbox jquerys ==*/

    //Check
    jQuery('.ckbox input').click(function () {
        var t = jQuery(this);
        if (t.is(':checked')) {
            t.closest('tr').addClass('selected');
        } else {
            t.closest('tr').removeClass('selected');
        }
    });

    // Star
    jQuery('.star').click(function () {
        if (!jQuery(this).hasClass('star-checked')) {
            jQuery(this).addClass('star-checked');
        }
        else
            jQuery(this).removeClass('star-checked');
        return false;
    });

    // Read mail
    jQuery('.table-email .media').click(function () {
        location.href = "read.html";
    });

    //custom scripts


    //Getting directory

    $.ajax({
        url: "/homedirpath",
        type: "POST",
        data: "",
        processData: false,
        contentType: false,
        success: function (response) {

            $("div#holder").data("holder-value", response);

        },
        error: function () {

            alert("there is an error");

            window.location = "";
        }
    });
    //end of getting directory

    $(document).contextmenu({
        delegate: ".hasmenu",
        preventContextMenuForPopup: true,
        preventSelect: true,
        taphold: false,
        menu: [
            {title: "New Folder", cmd: "createFolder", uiIcon: "ui-icon-folder-collapsed", disabled: true},
            {title: "New File", cmd: "createFile", uiIcon: "ui-icon-document", disabled: true},
            {title: "Delete", cmd: "deleteFile", uiIcon: "ui-icon-trash", disabled: true},
            {title: "Duplicate", cmd: "duplicateFile", uiIcon: "ui-icon-copy", disabled: true},
            {title: "Rename", cmd: "renameFile", uiIcon: "ui-icon-refresh", disabled: true},
            {title: "Upload File", cmd: "uploadFile", uiIcon: "ui-icon-arrowthickstop-1-n", disabled: true},
            {title: "Cut File", cmd: "cutFile", uiIcon: "ui-icon-scissors", disabled: true},
            {title: "Paste", cmd: "pasteFile", uiIcon: "ui-icon-paste", disabled: true}
        ],
        // Handle menu selection to implement a fake-clipboard
        select: function (event, ui) {
            switch (ui.cmd) {
                case "createFolder":
                    $("#sCreateFolder").modal({backdrop: 'static'});
                    $("#inputFolderPath").val($(ui.target).attr("rel"));
                    $("#inputFolderType").val("dir");
                    $("#inputFolderAppId").val(appIdHolder);
                    targetElement = ui.target;
                    break;
                case "createFile":
                    $("#sCreateFile").modal({backdrop: 'static'});
                    $("#inputFilePath").val($(ui.target).attr("rel"));
                    $("#inputFileType").val("file");
                    $("#inputAppId").val(appIdHolder);
                    targetElement = ui.target;
                    break;
                case "uploadFile":

                    $("#sUploadFile").modal({backdrop: 'static'});
                    $("#inputUpFilePath").val($(ui.target).attr("rel"));
                    $("#inputUpAppId").val(appIdHolder);
                    targetElement = ui.target;
                    break;
                case "deleteFile":

                    deleteFile(ui.target, appIdHolder);

                    break;
                case "duplicateFile":
                    console.log(ui.target);
                    targetElement = ui.target;
                    duplicateFile(ui.target, appIdHolder);

                    break;
                case "renameFile":
                    console.log(ui.target);
                    $("#sRenameFileModal").modal("show");
                    $("#inputRenameFilePath").val($(ui.target).attr("rel"));
                    $("#inputRenameFileType").val("file");
                    $("#inputRenameFileAppId").val(appIdHolder);
                    targetElement = ui.target;

                    break;
                case "cutFile":
                    console.log(ui.target);
                    targetElement = ui.target;
                    cutFile(ui.target, appIdHolder);

                    break;
                case "pasteFile":
                    console.log(ui.target);
                    targetElement = ui.target;
                    pasteFile(ui.target, appIdHolder);

                    break;
            }

        },
        // Implement the beforeOpen callback to dynamically change the entries
        beforeOpen: function (event, ui) {

            ui.menu.zIndex($(event.target).zIndex() + 1);

            // Optionally return false, to prevent opening the menu now
            if ($(ui.target).data("type") == "directory") {
                $(document).contextmenu("enableEntry", "createFolder", true);
                $(document).contextmenu("enableEntry", "createFile", true);
                $(document).contextmenu("enableEntry", "uploadFile", true);
                $(document).contextmenu("enableEntry", "deleteFile", true);
                $(document).contextmenu("enableEntry", "duplicateFile", false);
                $(document).contextmenu("enableEntry", "renameFile", true);
                $(document).contextmenu("enableEntry", "cutFile", false);
                if (cutFileStatus) {
                    console.log("cutfilestatus : " + cutFileStatus + "  cutfilepath : " + cutFilePath);
                    $(document).contextmenu("enableEntry", "pasteFile", true);
                } else {
                    $(document).contextmenu("enableEntry", "pasteFile", false);
                }

            } else {
                $(document).contextmenu("enableEntry", "createFolder", false);
                $(document).contextmenu("enableEntry", "createFile", false);
                $(document).contextmenu("enableEntry", "uploadFile", false);
                $(document).contextmenu("enableEntry", "deleteFile", true);
                $(document).contextmenu("enableEntry", "duplicateFile", true);
                $(document).contextmenu("enableEntry", "renameFile", true);
                $(document).contextmenu("enableEntry", "cutFile", true);
                if (cutFileStatus) {
                    console.log("cutfilestatus : " + cutFileStatus + "  cutfilepath : " + cutFilePath);
                    $(document).contextmenu("enableEntry", "pasteFile", true);
                } else {
                    $(document).contextmenu("enableEntry", "pasteFile", false);
                }
            }

        }
    });

    // Hide the saved states & deployment &deleteApp button groups
    $("#preview.btn-group").hide();
    $("#savedStates.btn-group").hide();
    $("#deployment.btn-group").hide();
    $("#deleteApplication.btn-group").hide();
    $("#applicationSettings.btn-group").hide();
    $("#downloadApplication.btn-group").hide();

    $("#preview.btn-group").click(function () {

        showPreview("");
    });
    $("#deployment.btn-group").click(function () {
        //this function in application.js
        deployApplication($("#deployment.btn-group").data("application-id"));

    });

    $("#sendPushNotification").click(function (event) {
        event.preventDefault();

        $("#sendPushNotificationModal").modal("show");

    });

    $(".leftside-navigation").mouseover(function () {
        $(".leftside-navigation").getNiceScroll().resize();
    });

    //$('.popovers').focusout(function () {

    //	$(this).popover("hide");
    //});

    // Start of user list retrieving code.
    $("#idUsersList").click(function (event) {

        event.preventDefault();

        $("div#idPageContent").load("/userTable", {"": ""}, function () {
            //this function in users.js
            loadUsersTableDynamics();
            //this function in users.js
            loadUserActions();

            buttonGroupFadeOut(500);
        });
    });

    $("#idUserGroups").click(function (event) {

        $("div#idPageContent").load("/groupTable", {"": ""}, function () {
            //this function in groups.js
            loadGroupsTableDynamics();
            //this function in groups.js
            loadGroupActions();

            buttonGroupFadeOut(500);
        });

    });

    //Start of user list retrieving code.
    $("#idWebUsersList").click(function (event) {

        event.preventDefault();

        $("div#idPageContent").load("/webUserTable", {"": ""}, function () {
            //this function in userManagement.js
            loadWebUsersTableDynamics();
            //this function in userManagement.js
            loadWebUserActions();

            buttonGroupFadeOut(500);
        });
    });
    $("#idKnowledgeBase").click(function (event) {
        event.preventDefault();
        $("div#idPageContent").load("/knowledgeBase", {"": ""}, function () {

        });
    });

    $("#idAuthentication").click(function (event) {
        event.preventDefault();
        $("div#idPageContent").load("/authentication", {"": ""}, function () {

        });
    });
    $("form#ImageUploading").submit(function (event) {
        //disable the default form submission
        event.preventDefault();
        //grab all form data  
        var formData = new FormData($(this)[0]);

        $.ajax({
            url: '/uploadImage',
            type: 'POST',
            data: formData,
            async: false,
            contentType: false,
            processData: false,
            success: function (returndata) {
                document.getElementById('logoIcon').src = returndata;
                document.getElementById('logoIconPreview').src = returndata;
                document.getElementById('imageUploadError').innerHTML = '';
            },
            error: function (response) {

                $("#imageUploadError").fadeIn(300, function () {

                    document.getElementById("imageUploadError").innerHTML = response.responseText;

                });
            }
        });

        return false;
    });

    $("#idGlobalSettings").click(function (event) {
        event.preventDefault();

        $("div#idPageContent").load("/globalSettings", {"": ""}, function () {
            //this function in globalSettings.js
            loadGlobalSettingsPage();

            buttonGroupFadeOut(500);

        });
    });

    $("#idLdapAD").click(function (event) {
        event.preventDefault();
        //this function in body.ldap.js
        loadLdapPage();

        buttonGroupFadeOut(500);

    });

    $("#idProfile").click(function (event) {
        event.preventDefault();
        $("#sUploadImage").modal("show");
        document.getElementById("modifyAccountError").innerHTML = "";
        $("#iDeveloperPassword").val("");
        $("#iRetypePassword").val("");
        $("#iDeveloperMail").val("");
    });

    $("#idInbox").click(function (event) {
        event.preventDefault();
        $("div#idPageContent").load("/inbox", {"": ""}, function () {

            buttonGroupFadeOut(500);

        });
    });

    $("#idDashboard").click(function (event) {
        event.preventDefault();

        $(".page-content").load("/getAnalyticReports", {"": ""}, function (responseText, textStatus, jqXHR) {
            //this function in dashboard.js 
            prepareDashboard();

        });

    });

    $("#idServices").click(function (event) {
        event.preventDefault();
        $("div#idPageContent").load("/services", {"": ""}, function () {

            //this function in serviceManagement.js
            loadServicesPage();

        });

    });

    $('#messageTypeSelect').on('change', function () {

        $("#messageTypeIcon").text(this.value);

    });

// End of user list retrieving code.
    $("a#applicationUploadSuggesstion").click(function (event) {

        event.preventDefault();

        if ($("input#applicationUpload").is(":visible")) {

            $("input#applicationUpload").removeAttr("required", "required");
            $("input#applicationUpload").removeAttr("data-parsley-trigger", "change");

            $("div#applicationUploadSuggestion").fadeIn(500, function () {

                $("div#applicationUpload").fadeToggle(500);

                $("a#applicationUploadSuggesstion").text("I want to upload my application template..");
            });

        } else {

            $("input#applicationUpload").attr("required", "required");
            $("input#applicationUpload").attr("data-parsley-trigger", "change");

            $("div#applicationUpload").fadeToggle(500, function () {

                $("div#applicationUploadSuggestion").fadeIn(500, function () {

                    $("a#applicationUploadSuggesstion").text("I don't want to upload my application template..");
                });
            });
        }
    });

    //reloader end.
//};
//

    $("select.image-picker").imagepicker({
        hide_select: true,
    });

    $("select.image-picker.show-labels").imagepicker({
        hide_select: true,
        show_label: true,
    });

    $("select.image-picker.limit_callback").imagepicker({
        limit_reached: function () {
            alert('We are full!')
        },
        hide_select: false
    });

    var container = $("select.image-picker.masonry").next("ul.thumbnails");
    container.imagesLoaded(function () {
        container.masonry({
            itemSelector: "li",
        });
    });


    $("#drafts-jquery-div").hide();
    $('#createApplication input[name=framework]').on('change', function () {
        var framework = $('input[name=framework]:checked', '#createApplication').val();
        switch (framework) {
            case 'jquery':
                $("#drafts-jquery-div").show();
                break;
            case 'empty' :
                $("#drafts-jquery-div").hide();
                break;
        }
    });

    $(document).on('click', '#jquery-btn-toolbar1', function (event) {
        var componentId = event.target.id;
        for (i = 0; i < jqueryComponentIdList.length; i++) {
            if (componentId == jqueryComponentIdList[i]) {
                return;
            }
        }
        if (componentId == "next-toolbar") {
            $("#jquery-btn-toolbar1").hide();
            $("#jquery-btn-toolbar2").show();
            return;
        } else if (componentId == "") {
            return;
        } else if (componentId == "jquery-btn-toolbar1") {
            return;
        }
        $.ajax({
            url: "/load/component",
            type: "POST",
            data: {componentName: componentId},
            success: function (response) {
                editor.replaceSelection(response, 'html');
//                $("#successModal").modal("show");
//                document.getElementById("alertText").innerHTML = "Component's example source code is added into the editor.";
                editor.markText({line: 1, ch: 1}, {line: 1, ch: 11}, {className: "styled-background"});
            },
            error: function (response) {

                $("#ErrorModal").modal("show");
                document.getElementById("errorText").innerHTML = response.responseText;
            }

        });

    });

    $(document).on('click', '#jquery-btn-toolbar2', function (event) {
        var componentId = event.target.id;
        for (i = 0; i < jqueryComponentIdList.length; i++) {
            if (componentId == jqueryComponentIdList[i]) {
                return;
            }
        }
        if (componentId == "back-toolbar") {
            $("#jquery-btn-toolbar1").show();
            $("#jquery-btn-toolbar2").hide();
            return;
        } else if (componentId == "") {
            return;
        } else if (componentId == "jquery-btn-toolbar2") {
            return;
        }
        $.ajax({
            url: "/load/component",
            type: "POST",
            data: {componentName: componentId},
            success: function (response) {
                editor.replaceSelection(response, 'html');
            },
            error: function (response) {

                $("#ErrorModal").modal("show");
                document.getElementById("errorText").innerHTML = response.responseText;
            }

        });

    });

    $(document).on('click', '#logoIcon', function () {

        $("#sUploadImage").modal("show");

    });

    $("form#ImageUploading").submit(function (event) {
        //disable the default form submission
        event.preventDefault();
        //grab all form data  
        var formData = new FormData($(this)[0]);

        $.ajax({
            url: '/uploadImage',
            type: 'POST',
            data: formData,
            async: false,
            contentType: false,
            processData: false,
            success: function (returndata) {
                document.getElementById('logoIcon').src = returndata;
                document.getElementById('logoIconPreview').src = returndata;
                document.getElementById('imageUploadError').innerHTML = '';
            },
            error: function (response) {

                $("#imageUploadError").fadeIn(300, function () {

                    document.getElementById("imageUploadError").innerHTML = response.responseText;

                });
            }
        });

        return false;
    });

    $("form#modifyAccountInfosForm").submit(function (event) {
        //disable the default form submission
        event.preventDefault();
        //grab all form data  
//      var formData = new FormData($(this)[0]);

        var userName = $("#iDeveloperUserName").val();
        var password = $("#iDeveloperPassword").val();
        var retypePassword = $("#iRetypePassword").val();
        var userMail = $("#iDeveloperMail").val();

        if (password !== "" && retypePassword === "") {
            document.getElementById("iDeveloperPasswordError").innerHTML = "Retype password  value is required.";
            return false;
        }

        $.ajax({
            url: '/modifySelfAccount',
            type: 'POST',
            data: {userName: userName, password: password, userMail: userMail},
            success: function () {
                $("#sUploadImage").modal("hide");
                $("#idDashboard").click();
            },
            error: function (response) {

                document.getElementById("modifyAccountError").innerHTML = response.responseText;

            }
        });

    });

    $("#idDashboard").click();

}); //document ready

loadContent = function (url, post, arg) {

    if ($(".page-content").is(":visible"))
        $(".page-content").fadeOut(200, function () {

            if (post)
                $(".page-content").load(url, {applicationId: arg}, function () {

                    if (!$(".page-content").is(":visible"))
                        $(".page-content").fadeIn(200, function () {
                            document.getElementById("displayAppName").innerHTML = "Application Files - " + appIdHolder;

                            $("#treeRoot").attr("rel", $("div#holder").data("holder-value") + "/assets/" + arg);

                            $('#testtree').fileTree({root: $("div#holder").data("holder-value") + "/assets/" + arg, script: '../tree/jqueryFileTree.jsp', multiFolder: false, expandSpeed: 750, collapseSpeed: 750}, function (file) {
                                currentFile = file;

                                loadFileContent("/file/content", file);
                            });


                        });

                });
            else
                $(".page-content").load(url, function () {
                    if (!$(".page-content").is(":visible"))
                        $(".page-content").fadeIn(200, function () {
                            document.getElementById("displayAppName").innerHTML = "Application Files - " + appIdHolder;
                            $("#treeRoot").attr("rel", $("div#holder").data("holder-value") + "/assets/" + arg);

                            $('#testtree').fileTree({root: $("div#holder").data("holder-value") + "/assets/" + arg, script: '../tree/jqueryFileTree.jsp', multiFolder: false, expandSpeed: 750, collapseSpeed: 750}, function (file) {
                                currentFile = file;
                                loadFileContent("/file/content", file);
                            });

                        });

                });

        });
    else if (post)
        $(".page-content").load(url, {applicationId: arg}, function () {
            if (!$(".page-content").is(":visible"))
                $(".page-content").fadeIn(200, function () {

                    document.getElementById("displayAppName").innerHTML = "Application Files -" + " " + appIdHolder;
                    $("#treeRoot").attr("rel", $("div#holder").data("holder-value") + "/assets/" + arg);

                    $('#testtree').fileTree({root: $("div#holder").data("holder-value") + "/assets/" + arg, script: '../tree/jqueryFileTree.jsp', multiFolder: false, expandSpeed: 750, collapseSpeed: 750}, function (file) {
                        currentFile = file;
                        loadFileContent("/file/content", file);
                    });

                });

        });
    else
        $(".page-content").load(url, function () {
            if (!$(".page-content").is(":visible"))
                $(".page-content").fadeIn(200, function () {

                    document.getElementById("displayAppName").innerHTML = "Application Files -" + " " + appIdHolder;

                    $("#treeRoot").attr("rel", $("div#holder").data("holder-value") + "/assets/" + arg);

                    $('#testtree').fileTree({root: $("div#holder").data("holder-value") + "/assets/" + arg, script: '../tree/jqueryFileTree.jsp', multiFolder: false, expandSpeed: 750, collapseSpeed: 750}, function (file) {
                        currentFile = file;
                        loadFileContent("/file/content", file);
                    });
                });
        });

    cutFileStatus = false;

};

loadFileContent = function (url, path) {

    $("div#fileContent").load(url, {"appname": $("#deployment.btn-group").data("application-id"), "fileurl": path}, function () {

        var fileName = path.split("/");

        document.getElementById("displayFileName").innerHTML = "File - " + fileName[fileName.length - 1];

        if (document.getElementById("rawScreenEditor")) {
            currentEditor($("#typeHolder").data("type"), path);

            if (previewCount == null) {
                previewCount = 0;
            }
            if (previewSourceArray == null) {
                previewSourceArray = [];
            }
            previewSourceArray[previewCount] = editor.doc.getValue();

        } else {
            $("#componentHeader").hide();
            $("#headerPreviewButtons").hide();
        }
    });

};

currentEditor = function (a, b) {
    switch (a) {
        case "html":
            editor = CodeMirror.fromTextArea(document.getElementById("rawScreenEditor"), {
                lineNumbers: true,
                theme: "eclipse",
                styleSelectedText: true,
                gutters: ["CodeMirror-linenumbers", "breakpoints"],
                extraKeys: {
                    "Shift-Ctrl-Z": function () {
                        if (previewCount - 1 >= 0) {
                            editor.setValue(previewSourceArray[previewCount - 1]);
                            previewCount--;
                        }
                    },
                    "Shift-Ctrl-Y": function () {
                        if (previewSourceArray.length >= previewCount + 1) {
                            editor.setValue(previewSourceArray[previewCount + 1]);
                            previewCount++;
                        }
                    },
                    "Ctrl-Space": "autocomplete",
                    "Ctrl-S": function () {
                        $("#rawScreenEditor").submit();
                    },
                    "Ctrl-D": function () {
                        saveAndDeploy();
                    },
                    "F11": function (cm) {

                        document.getElementById("headerBar").setAttribute("style", "display:none;");

                        cm.setOption("fullScreen", true);
                    },
                    "Esc": function (cm) {

                        document.getElementById("headerBar").removeAttribute("style");

                        cm.setOption("fullScreen", false);
                    }
                },
                mode: "htmlmixed"
            });

            editor.on("gutterClick", function (cm, n) {
                var info = cm.lineInfo(n);
                cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMarker());
            });

            appFramework = $("#frameworkName").val();
            $("#componentHeader").show();
            if (appFramework == 'jquery') {
                registerImagePreview(jqueryComponentIdList);
            }
            $("#headerPreviewButtons").show();
            break;
        case "js":
            editor = CodeMirror.fromTextArea(document.getElementById("rawScreenEditor"), {
                lineNumbers: true,
                theme: "eclipse",
                extraKeys: {
                    "Ctrl-Space": "autocomplete",
                    "Ctrl-S": function () {
                        $("#rawScreenEditor").submit();
                    },
                    "Ctrl-D": function () {
                        saveAndDeploy();
                    },
                    "F11": function (cm) {

                        document.getElementById("headerBar").setAttribute("style", "display:none;");

                        cm.setOption("fullScreen", true);
                    },
                    "Esc": function (cm) {

                        document.getElementById("headerBar").removeAttribute("style");

                        cm.setOption("fullScreen", false);
                    }
                },
                mode: {name: "javascript", globalVars: true}
            });
            $("#componentHeader").hide();
            $("#headerPreviewButtons").hide();
            break;
        case "css":
            editor = CodeMirror.fromTextArea(document.getElementById("rawScreenEditor"), {
                lineNumbers: true,
                theme: "eclipse",
                extraKeys: {
                    "Ctrl-Space": "autocomplete",
                    "Ctrl-S": function () {
                        $("#rawScreenEditor").submit();
                    },
                    "Ctrl-D": function () {
                        saveAndDeploy();
                    },
                    "F11": function (cm) {

                        document.getElementById("headerBar").setAttribute("style", "display:none;");

                        cm.setOption("fullScreen", true);
                    },
                    "Esc": function (cm) {

                        document.getElementById("headerBar").removeAttribute("style");

                        cm.setOption("fullScreen", false);
                    }
                },
                mode: {name: "css"}
            });
            $("#componentHeader").hide();
            $("#headerPreviewButtons").hide();
            break;
        case "plain":
            editor = CodeMirror.fromTextArea(document.getElementById("rawScreenEditor"), {
                lineNumbers: true,
                theme: "eclipse",
                extraKeys: {
                    "Ctrl-S": function () {
                        $("#rawScreenEditor").submit();
                    },
                    "Ctrl-D": function () {
                        saveAndDeploy();
                    },
                    "F11": function (cm) {

                        document.getElementById("headerBar").setAttribute("style", "display:none;");

                        cm.setOption("fullScreen", true);
                    },
                    "Esc": function (cm) {

                        document.getElementById("headerBar").removeAttribute("style");

                        cm.setOption("fullScreen", false);
                    }
                },
                mode: {name: "javascript", globalVars: true}
            });
            $("#componentHeader").hide();
            $("#headerPreviewButtons").hide();
            break;
        default :
            $("#editorSubmit").prop("disabled", true);
            $("#editorSubmitAndDeploy").prop("disabled", true);
            $("#componentHeader").hide();
            $("#headerPreviewButtons").hide();

    }

    bindForm(b);
};

bindForm = function (b) {
    $("form#rawScreenEdit").on("submit", function (event) {
        event.preventDefault();
        var p = document.getElementById("repeater");
        var loading = $('<div class="loading"><i class="fa fa-refresh fa-spin"></i></div>');

        $.ajax({
            url: "/app/filecontent/update",
            type: "POST",
            data: {fileUrl: b, content: editor.doc.getValue()},
            beforeSend: function () {

                loading.appendTo(p);
                loading.fadeIn();

            },
            success: function (data) {

                loading.fadeOut();

            },
            error: function (response) {

                loading.fadeOut();

                $("#ErrorModal").modal('show');

                document.getElementById("errorText").innerHTML = response.responseText;
            }
        });

    });


};

createMorrisBar = function (id) {
    var contextid = id;
    Morris.Bar({
        element: contextid,
        data: [
            {y: '2006', a: 100, b: 90, c: 10},
            {y: '2007', a: 75, b: 65, c: 10},
            {y: '2008', a: 50, b: 40, c: 10},
            {y: '2009', a: 75, b: 65, c: 10},
            {y: '2010', a: 50, b: 40, c: 10},
            {y: '2011', a: 75, b: 65, c: 10},
            {y: '2012', a: 100, b: 90, c: 10}
        ],
        xkey: 'y',
        ykeys: ['a', 'b', 'c'],
        labels: ['Series A', 'Series B', 'Series C']
    });
};

buttonGroupFadeOut = function (ms) {
    $("#savedStates.btn-group,#deployment.btn-group,#deleteApplication.btn-group,#preview.btn-group,#applicationSettings.btn-group,#downloadApplication.btn-group").fadeOut(ms);
};

buttonGroupFadeIn = function (ms) {
    $("#savedStates.btn-group,#deployment.btn-group,#deleteApplication.btn-group,#preview.btn-group,#applicationSettings.btn-group,#downloadApplication.btn-group").fadeIn(ms);
};

registerImagePreview = function (list) {
    var i = 0;
    while (list[i]) {
        var component = document.getElementById(list[i]);
        $(component).imgPreview({
            containerID: 'imgPreviewWithStyles',
            /* Change srcAttr to rel: */
            srcAttr: 'rel',
            imgCSS: {
                // Limit preview size:
                height: 300
            },
            // When container is shown:
            onShow: function (link) {
                // Animate link:
                $(link).stop().animate({opacity: 0.4});
                // Reset image:
                $('img', this).stop().css({opacity: 0});
            },
            // When image has loaded:
            onLoad: function () {
                // Animate image
                $(this).animate({opacity: 1}, 500);
            },
            // When container hides: 
            onHide: function (link) {
                // Animate link:
                $(link).stop().animate({opacity: 1});
            }

        });
        i++;
    }

};

function makeMarker() {
    var marker = document.createElement("div");
    marker.style.color = "#822";
    marker.innerHTML = "x";
    return marker;
}

function addFields() {
    // Number of inputs to create
    var number = document.getElementById("member").value;
    // Container <div> where dynamic content will be placed
    var container = document.getElementById("ptab2");
    // Clear previous contents of the container
    while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }
    for (i = 0; i < number; i++) {
        // Append a node with a random text
        container.appendChild(document.createTextNode("Member " + (i + 1)));
        // Create an <input> element, set its type and name attributes
        var input = document.createElement("input");
        input.type = "text";
        input.name = "member" + i;
        container.appendChild(input);
        // Append a line break 
        container.appendChild(document.createElement("br"));
    }
}
