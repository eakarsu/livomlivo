// Basic Wizard
$('#basicWizard').bootstrapWizard();
// ldap Progress Wizard  
$('#ldapProgressWizard').bootstrapWizard();

// soapProgressWizard
$('#soapProgressWizard').bootstrapWizard({
    'nextSelector': '.next',
    'previousSelector': '.previous',
    onNext: function (tab, navigation, index) {
        var $total = navigation.find('li').length;
        var $current = index + 1;
        var $percent = ($current / $total) * 100;
        jQuery('#soapProgressWizard').find('.progress-bar').css('width', $percent + '%');

    },
    onPrevious: function (tab, navigation, index) {
        var $total = navigation.find('li').length;
        var $current = index + 1;
        var $percent = ($current / $total) * 100;
        jQuery('#soapProgressWizard').find('.progress-bar').css('width', $percent + '%');
//      alert("onPrevious" + $current);

    },
    onTabShow: function (tab, navigation, index) {

        var $total = navigation.find('li').length;
        var $current = index + 1;
        var $percent = ($current / $total) * 100;
        jQuery('#soapProgressWizard').find('.progress-bar').css('width', $percent + '%');

        // If it's the last tab then hide the last button and show the finish instead
        if ($current >= $total) {
            $('#soapProgressWizard').find('.pager .next').hide();
            $('#soapProgressWizard').find('.pager .finish').show();
            $('#soapProgressWizard').find('.pager .finish').removeClass('disabled');
        } else {
            $('#soapProgressWizard').find('.pager .next').show();
            $('#soapProgressWizard').find('.pager .finish').hide();
        }



    }
});
$('#soapProgressWizard .finish').click(function (event) {

    if ($("#soapProgressWizardForm").parsley().isValid()) {

        event.preventDefault();
        callIntegrationSoapService();
    }
});


// soapProgressWizard
$('#sapProgressWizard').bootstrapWizard({
    'nextSelector': '.next',
    'previousSelector': '.previous',
    onNext: function (tab, navigation, index) {
        var $total = navigation.find('li').length;
        var $current = index + 1;
        var $percent = ($current / $total) * 100;
        jQuery('#sapProgressWizard').find('.progress-bar').css('width', $percent + '%');

    },
    onPrevious: function (tab, navigation, index) {
        var $total = navigation.find('li').length;
        var $current = index + 1;
        var $percent = ($current / $total) * 100;
        jQuery('#sapProgressWizard').find('.progress-bar').css('width', $percent + '%');
//      alert("onPrevious" + $current);

    },
    onTabShow: function (tab, navigation, index) {

        var $total = navigation.find('li').length;
        var $current = index + 1;
        var $percent = ($current / $total) * 100;
        jQuery('#sapProgressWizard').find('.progress-bar').css('width', $percent + '%');

        // If it's the last tab then hide the last button and show the finish instead
        if ($current >= $total) {
            $('#sapProgressWizard').find('.pager .next').hide();
            $('#sapProgressWizard').find('.pager .finish').show();
            $('#sapProgressWizard').find('.pager .finish').removeClass('disabled');
        } else {
            $('#sapProgressWizard').find('.pager .next').show();
            $('#sapProgressWizard').find('.pager .finish').hide();
        }
    }
});
$('#sapProgressWizard .finish').click(function (event) {

    if ($("#sapProgressWizardForm").parsley().isValid()) {

        event.preventDefault();
        callIntegrationSapService();
    }
});

// Progress Wizard
$('#restProgressWizard').bootstrapWizard({
    'nextSelector': '.next',
    'previousSelector': '.previous',
    onNext: function (tab, navigation, index) {
        var $total = navigation.find('li').length;
        var $current = index + 1;
        var $percent = ($current / $total) * 100;
        jQuery('#restProgressWizard').find('.progress-bar').css('width', $percent + '%');


    },
    onPrevious: function (tab, navigation, index) {
        if (index < 0) {

            return false;

        }
        else {

            var $total = navigation.find('li').length;
            var $current = index + 1;
            var $percent = ($current / $total) * 100;
            jQuery('#restProgressWizard').find('.progress-bar').css('width', $percent + '%');
//        alert("onPrevious" + $current +"-"+ $percent +"-"+ $total);
        }

    },
    onTabShow: function (tab, navigation, index) {

        var $total = navigation.find('li').length;
        var $current = index + 1;
        var $percent = ($current / $total) * 100;
        jQuery('#restProgressWizard').find('.progress-bar').css('width', $percent + '%');

        // If it's the last tab then hide the last button and show the finish instead
        if ($current >= $total) {
            $('#restProgressWizard').find('.pager .next').hide();
            $('#restProgressWizard').find('.pager .finish').show();
            $('#restProgressWizard').find('.pager .finish').removeClass('disabled');
        } else {
            $('#restProgressWizard').find('.pager .next').show();
            $('#restProgressWizard').find('.pager .finish').hide();
        }

        switch (index) {
            case 1://Base URL next Headers tab loading
                break;
            case 2 ://Headers next Operations tab loading

                break;
            case 3 ://Operations next parameters tab loading
                //Operations
                var selectElement = document.getElementById("operationList");
                var options = selectElement.options;

                $('#operationList').find('option').remove().end().append('<option value="0">Operation Select.. </option>').val(0);

                for (var i = 0; i < serviceOperations.length; i++) {
                    var option = document.createElement("option");
                    option.text = serviceOperations[i].name;
                    option.value = serviceOperations[i].name;
                    options.add(option);
                }
                break;

        }

    }
});

$('#restProgressWizard .finish').click(function () {

    var result = prepareServiceDescription();
    if (result !== false) {
        callIntegrationRestService();
    }

});

// Form Toggles
jQuery('.toggle').toggles({on: true});

jQuery('.toggle-chat1').toggles({on: false});

// Chosen Select
jQuery('.chosen-select').chosen({'width': '100%', 'white-space': 'nowrap'});
