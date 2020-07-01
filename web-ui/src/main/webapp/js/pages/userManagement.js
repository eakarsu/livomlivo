/*** Javascript codes of application settings page. ***/
var webUserName;



$(document).on('click', '#createNewWebUserButton', function (event) {

    if ($("#cWebUserPass").val().length >= 6) {

        if ($("#cWebUserPass").parsley().isValid()) {
            event.preventDefault();
            $.ajax({
                url: "/createNewWebUser",
                type: "POST",
                data: {userName: $("#cWebUserName").val(), userMail: $("#cWebUserMail").val(), userPassword: $("#cWebUserPass").val()},
                success: function () {

                    document.getElementById("userCreationResult").innerHTML = "";
                    $("#sCreateNewWebUser").modal("hide");
                    $("#idWebUsersList").click();

                },
                error: function (response) {

                    document.getElementById("webUserCreationResult").innerHTML = response.responseText;
                }
            });
        }
    } else {
        document.getElementById("webUserCreationResult").innerHTML = "User password length must be minimum 6 characters.";
    }
});
//Web User mail change.
$("#submitWebUserMailChange").click(function (event) {

    if ($("#changeWebUserMailForm").parsley().isValid()) {
        event.preventDefault();

        $.ajax({
            url: "/modifyWebUserMail",
            type: "POST",
            data: {userName: webUserName, newUserMail: $("#iWebUserMail").val()},
            success: function () {

                document.getElementById("changeWebUserMailError").innerHTML = "";
                $("#changeWebUserAttributesModal").modal("hide");
                $("#idWebUsersList").click();

            },
            error: function (response) {

                document.getElementById("changeWebUserMailError").innerHTML = response.responseText;

            }
        });
    }
});

//Web User name change.
$("#submitWebUserNameChange").click(function (event) {

    if ($("#changeWebUserNameForm").parsley().isValid()) {
        event.preventDefault();

        $.ajax({
            url: "/WebUserName",
            type: "POST",
            data: {userName: webUserName, newUserName: $("#iWebUserName").val()},
            success: function () {

                document.getElementById("changeWebUserNameError").innerHTML = "";
                $("#changeWebUserAttributesModal").modal("hide");
                $("#idWebUsersList").click();

            },
            error: function (response) {

                document.getElementById("changeWebUserNameError").innerHTML = response.responseText;

            }

        });


    }

});
//web User pasword change.
$("#submitWebUserPasswordChange").click(function (event) {

    if ($("#changeWebUserPasswordForm").parsley().isValid()) {
        event.preventDefault();

        $.ajax({
            url: "/modifyWebUserPassword",
            type: "POST",
            data: {userName: webUserName, userPassword: $("#iWebUserPassword").val()},
            success: function () {

                document.getElementById("iUserPasswordError").innerHTML = "";
                $("#changeWebUserAttributesModal").modal("hide");
                $("#idWebUsersList").click();

            },
            error: function (response) {

                document.getElementById("iWebUserPasswordError").innerHTML = response.responseText;

            }

        });
    }
});


$("#deleteWebUserButton").click(function () {

    $.ajax({
        url: "/deleteWebUser",
        type: "POST",
        data: {userName: webUserName},
        success: function () {

            $("#deleteWebUserModal").modal("hide");

            document.getElementById("deleteWebUserError").innerHTML = "";

            $("#idWebUsersList").click();

        },
        error: function (response) {

            document.getElementById("deleteWebUserError").innerHTML = response.responseText;

        }

    });

});

loadWebUsersTableDynamics = function () {

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

loadWebUserActions = function () {

    //User creation start.
    $("#idCreateNewWebUser").click(function (event) {

        event.preventDefault();
        $("#sCreateNewWebUser").modal("show");
        document.getElementById("webUserCreationResult").innerHTML = "";

    });

    $(document).on('click', '.editWebUser', function (event) {

        $("#changeWebUserAttributesModal").modal("show");

        webUserName = $(this).data("username");

    });

    $(document).on('click', '.deleteWebUser', function (event) {

        webUserName = $(this).data("username");

        $("#deleteWebUserModal").modal("show");

        document.getElementById("deleteWebUserText").innerHTML = "Are you sure to delete user: " + webUserName;

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