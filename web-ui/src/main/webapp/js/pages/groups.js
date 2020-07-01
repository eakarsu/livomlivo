/*** Javascript codes of groups page. ***/

/* Global variables definition */
var groupHolder;
var groupDescriptionHolder;




$(document).on('click', '#createNewGroupButton', function (event) {
    document.getElementById("groupCreationResult").innerHTML = "";

    if ($("#createNewGroupForm").parsley().isValid()) {
        event.preventDefault();
        $.ajax({
            url: "/createNewGroup",
            type: "POST",
            data: {groupName: $("#cGroupName").val(), groupDescription: $("#cGroupDescription").val()},
            success: function () {
//                        clearNewGroupFormParameters();
                $("#sCreateNewGroup").modal("hide");
                $("#idUserGroups").click();

            },
            error: function (response) {
//                        clearNewUserFormParameters();
                $("#idUserGroups").click();
                document.getElementById("groupCreationResult").innerHTML = response.responseText;

            }
        });
    }

    return false;
});


$(document).on('click', '.editGroup', function (event) {
    $("#changeGroupAttributesModal").modal("show");

    groupHolder = $(this).data("group");

    groupDescriptionHolder = $(this).data("description");

    $("#iGroupName").val(groupHolder);
    $("#iGroupDescription").val(groupDescriptionHolder);

//    console.log(groupHolder + groupDescriptionHolder);

});

$(document).on('click', '.deleteGroup', function (event) {

//        alert("Delete Group.");
    $("#deleteGroupModal").modal("show");
//
    document.getElementById("deleteGroupText").innerHTML = "Are you sure to delete group: " + $(this).data("group");
//
    groupHolder = $(this).data("group");

});


$("#updateGroupButton").click(function (event) {
    var newGroupName = $("#iGroupName").val();
    var newGroupDescription = $("#iGroupDescription").val();

    $.ajax({
        url: "/updateGroup",
        type: "POST",
        data: {groupName: groupHolder, newGroupName: newGroupName, newGroupDescription: newGroupDescription},
        success: function () {
            $("#changeGroupAttributesModal").modal("hide");

            $("div#idPageContent").load("/groupTable", {"": ""}, function () {

                loadGroupsTableDynamics();

                loadGroupActions();

                buttonGroupFadeOut(500);
            });

        },
        error: function (response) {
            $("#changeGroupAttributesModal").modal("hide");

            $("#ErrorModal").modal("show");

            document.getElementById("errorText").innerHTML = response.responseText;
        }
    });
});

$("#deleteGroupButton").click(function (event) {
    var newGroupName = $("#iGroupName").val();
    var newGroupDescription = $("#iGroupDescription").val();

    $.ajax({
        url: "/deleteGroup",
        type: "POST",
        data: {groupName: groupHolder},
        success: function () {
            $("#deleteGroupModal").modal("hide");

            $("div#idPageContent").load("/groupTable", {"": ""}, function () {

                loadGroupsTableDynamics();

                loadGroupActions();

                buttonGroupFadeOut(500);
            });

        },
        error: function (response) {
            $("#deleteGroupModal").modal("hide");
            $("#ErrorModal").modal("show");

            document.getElementById("errorText").innerHTML = response.responseText;

        }

    });


});

loadGroupsTableDynamics = function () {

    $('#dynamic-table-groups').dataTable({
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


loadGroupActions = function () {
    //User creation start.
    $("#idCreateNewGroup").click(function (event) {

        event.preventDefault();
        $("#sCreateNewGroup").modal("show");
        document.getElementById("userCreationResult").innerHTML = "";
    });

};

