/*** Javascript codes of application settings page. ***/

var userHolder;
var clientUserName;

//Start usercreate submission.
$(document).on('click', '#createNewUserButton', function (event) {
    document.getElementById("userCreationResult").innerHTML = "";
    if ($("#cUserPassword").val().length >= 6) {

        if ($("#createNewUserForm").parsley().isValid()) {
            event.preventDefault();
            $.ajax({
                url: "/createnewuser",
                type: "POST",
                data: {userName: $("#cUserName").val(), userMail: $("#cUserMail").val(), userGroupName: $("#selectGroupForUser").val(), Mail: $("#cUserMail").val(), userPassword: $("#cUserPassword").val()},
                success: function () {
                    clearNewUserFormParameters();
                    $("#sCreateNewUser").modal("hide");
                    $("#idUsersList").click();

                },
                error: function (response) {
                    clearNewUserFormParameters();
                    $("#sCreateNewUser").modal("hide");
                    $("#idUsersList").click();
                    document.getElementById("userCreationResult").innerHTML = response.responseText;

                }
            });
        }
    } else {
        document.getElementById("userPass1Error").innerHTML = "User password length must be minimum 6 characters.";
    }
    return false;
});
//
//Start of user list retrieving code.
//User mail change.
$("#submitUserMailChange").click(function (event) {



    if ($("#changeUserMailForm").parsley().isValid()) {
        event.preventDefault();

        $.ajax({
            url: "/changeusermail",
            type: "POST",
            data: {userId: userHolder, userMail: $("#iUserMail").val()},
            success: function () {

                document.getElementById("changeUserMailError").innerHTML = "";
                $("#changeUserAttributesModal").modal("hide");
                $("#idUsersList").click();


            },
            error: function (response) {

                document.getElementById("changeUserMailError").innerHTML = response.responseText;

            }
        });
    }
});


//User name change.
$("#submitUserNameChange").click(function (event) {



    if ($("#changeUserNameForm").parsley().isValid()) {
        event.preventDefault();

        $.ajax({
            url: "/changeUserNameWithNew",
            type: "POST",
            data: {userId: userHolder, userName: $("#iUserName").val()},
            success: function () {

                document.getElementById("changeUserNameError").innerHTML = "";
                $("#changeUserAttributesModal").modal("hide");
                $("#idUsersList").click();


            },
            error: function (response) {

                document.getElementById("changeUserNameError").innerHTML = response.responseText;

            }

        });


    }

});

//User pasword change.
$("#submitUserPasswordChange").click(function (event) {



    if ($("#changeUserPasswordForm").parsley().isValid()) {
        event.preventDefault();
        if ($("#iUserPassword").val().length >= 4) {


            $.ajax({
                url: "/changeuserpassword",
                type: "POST",
                data: {userId: userHolder, userName: clientUserName, userPassword: $("#iUserPassword").val()},
                success: function () {

                    document.getElementById("iUserPasswordError").innerHTML = "";
                    $("#changeUserAttributesModal").modal("hide");
                    $("#idUsersList").click();


                },
                error: function (response) {

                    document.getElementById("iUserPasswordError").innerHTML = response.responseText;

                }

            });


        } else {

            document.getElementById("iUserPasswordError").innerHTML = "User password length must be minimum 4 characters.";
        }
    }
});


$("#deleteUserButton").click(function () {

    $.ajax({
        url: "/deleteuser",
        type: "POST",
        data: {userId: userHolder},
        success: function () {

            $("#deleteUserModal").modal("hide");

            document.getElementById("deleteUserError").innerHTML = "";

            $("#idUsersList").click();

        },
        error: function (response) {

            document.getElementById("deleteUserError").innerHTML = response.responseText;

        }

    });

});

//Import users from file
$("#controlSuccessButton").click(function (event) {
    event.preventDefault();

    $("#ImportUsersWarningModal").modal("hide");
    $("#sImportNewUserFromFile").modal("show");
});

loadUsersTableDynamics = function () {

    $('#dynamic-table').dataTable({
        "aaSorting": [[4, "desc"]]
    });

    /*
     * Insert a 'details' column to the table
     */
    var nCloneTh = document.createElement('th');
    var nCloneTd = document.createElement('td');
    nCloneTd.innerHTML = '<img src="plugins/advanced-datatable/images/details_open.png">';
    nCloneTd.className = "center";

    $('#hidden-table-info thead tr').each(function () {
        this.insertBefore(nCloneTh, this.childNodes[0]);
    });

    $('#hidden-table-info tbody tr').each(function () {
        this.insertBefore(nCloneTd.cloneNode(true), this.childNodes[0]);
    });

    /*
     * Initialse DataTables, with no sorting on the 'details' column
     */
    var oTable = $('#hidden-table-info').dataTable({
        "aoColumnDefs": [
            {"bSortable": false, "aTargets": [0]}
        ],
        "aaSorting": [[1, 'asc']]
    });

    /* Add event listener for opening and closing details
     * Note that the indicator for showing which row is open is not controlled by DataTables,
     * rather it is done here
     */
    $('#hidden-table-info tbody td img').click(function () {
        var nTr = $(this).parents('tr')[0];
        if (oTable.fnIsOpen(nTr))
        {
            /* This row is already open - close it */
            this.src = "plugins/advanced-datatable/images/details_open.png";
            oTable.fnClose(nTr);
        }
        else
        {
            /* Open this row */
            this.src = "plugins/advanced-datatable/images/details_close.png";
            oTable.fnOpen(nTr, fnFormatDetails(oTable, nTr), 'details');
        }
    });
};

loadUserActions = function () {

    //User creation start.

    $("#idCreateNewUser").click(function (event) {

        event.preventDefault();
        $("#sCreateNewUser").modal("show");
        document.getElementById("userCreationResult").innerHTML = "";
    });
    $("#idImportFromFile").click(function (event) {

        event.preventDefault();


        $.ajax({
            url: "/controlSmtpMailProperties",
            type: 'POST',
            success: function () {
//            alert(response);
                $("#sImportNewUserFromFile").modal("show");
//            $("#successModal").modal("show");
//            document.getElementById("alertText").innerHTML = response;
            }, error: function (response) {

                $("#ImportUsersWarningModal").modal("show");
                document.getElementById("warningText").innerHTML = response.responseText;
            },
        });

//      $("#sImportNewUserFromFile").modal("show");
        document.getElementById("importFromFileResponse").innerHTML = "";
    });

    $(document).on('click', '.editClientUser', function (event) {

        $("#changeUserAttributesModal").modal("show");

        userHolder = $(this).data("user");
        clientUserName = $(this).data("username");


    });

    $(document).on('click', '.deleteClientUser', function (event) {

        $("#deleteUserModal").modal("show");

        document.getElementById("deleteUserText").innerHTML = "Are you sure to delete user: " + $(this).data("username");

        userHolder = $(this).data("user");

    });

    $('.selectpicker-users-group').on('change', function () {
        var selected = $(this).find("option:selected").val();
        //users list from selected group
        getUsersFromGroup(this);

    });

    $('input[name="switch-animate"]').on('switchChange.bootstrapSwitch', function (event, state) {

        //UserName children[0]
        var userName = event.target.parentElement.parentElement.parentElement.parentElement.children[0].innerHTML;
        //UserRole children[1]
//                var userRole = $(event.target).parent().parent().parent().parent().children().eq(1).data("userrole");

        $.ajax({
            url: "/suspendUser",
            type: "POST",
            data: {userName: userName, isActive: state},
            success: function () {
                $("#idUsersList").click();
//                        $('input[name="switch-animate"]').bootstrapSwitch('state', !state, state);

            },
            error: function (response) {
                $(event.target).parent().parent().parent().parent().children().eq(3).children().eq(0).children().eq(0).children().eq(3).bootstrapSwitch('state', !state, !state);
                $("#ErrorModal").modal("show");
                document.getElementById("errorText").innerHTML = response.responseText;
            }

        });

    });

};

function fnFormatDetails(oTable, nTr)
{
    var aData = oTable.fnGetData(nTr);
    var sOut = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
    sOut += '<tr><td>Rendering engine:</td><td>' + aData[1] + ' ' + aData[4] + '</td></tr>';
    sOut += '<tr><td>Link to source:</td><td>Could provide a link here</td></tr>';
    sOut += '<tr><td>Extra info:</td><td>And any further details here (images etc)</td></tr>';
    sOut += '</table>';

    return sOut;
}

function getUsersFromGroup(group) {

    event.preventDefault();

    $("div#idPageContent").load("/userTableFromGroup", {group: group.value}, function () {

        loadUsersTableDynamics();

        loadUserActions();

//          $("#savedStates.btn-group,#deployment.btn-group,#deleteApplication.btn-group,#preview.btn-group,#applicationSettings.btn-group").fadeOut(500);

        $('input[name="switch-animate"]').on('switchChange.bootstrapSwitch', function (event, state) {

            //UserName children[0]
            var userName = event.target.parentElement.parentElement.parentElement.parentElement.children[0].innerHTML;
            //UserRole children[1]
//                var userRole = $(event.target).parent().parent().parent().parent().children().eq(1).data("userrole");

            $.ajax({
                url: "/suspendUser",
                type: "POST",
                data: {userName: userName, isActive: state},
                success: function () {
                    $("#idUsersList").click();
//                        $('input[name="switch-animate"]').bootstrapSwitch('state', !state, state);

                },
                error: function (response) {
                    $(event.target).parent().parent().parent().parent().children().eq(3).children().eq(0).children().eq(0).children().eq(3).bootstrapSwitch('state', !state, !state);
                    $("#ErrorModal").modal("show");
                    document.getElementById("errorText").innerHTML = response.responseText;
                }

            });
        });
        buttonGroupFadeOut(500);
    });

}

// Auto generate password
$(document).on('click', '#generatePassButton', function (event) {
    event.preventDefault();
    document.getElementById("iUserPasswordError").innerHTML = "";

    $.ajax({
        url: "/autoGeneratePassword",
        type: "POST",
        data: {},
        success: function (data) {

//                $("#changeUserAttributesModal").modal("hide");
//                $("#idUsersList").click();
            $("#iUserPassword").val(data);
            $("#iRetypeUserPassword").val(data);
        },
        error: function (response) {
            $("#iUserPassword").val("newPassword");
            $("#iRetypeUserPassword").val("newPassword");
            document.getElementById("iUserPasswordError").innerHTML = response.responseText;

        }

    });

});

function clearNewUserFormParameters() {

    $("#cUserName").val('');
    $("#cUserMail").val('');
    $("#cUserPassword").val('');
    $("#cReTypePassword").val('');

}