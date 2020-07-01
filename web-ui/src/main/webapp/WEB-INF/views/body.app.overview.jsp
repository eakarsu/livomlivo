<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"%>
<%@ taglib prefix="sec"
           uri="http://www.springframework.org/security/tags"%>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<div class="row">
    <div class="col-md-3">
        <div class="block-web">
            <div class="header">
                <div class="actions"> <!-- <a href="#" class="refresh"><i class="fa fa-repeat"></i></a> --></div>
                <h3 class="content-header" id="displayAppName">Application Files</h3>

            </div>
            <div class="porlets-content">
                 
               
                <input type="hidden" name="frameworkName" id="frameworkName"  value="${frameworkName}"></input>
                <div  class="pagination margin-top-5" style=" padding-left:15px; padding-right:25px; margin-bottom:0px;">
       
                    <ul  class="jqueryFileTree" style="margin-bottom:0px; margin-left: -17px;"><li class="directory expanded hasmenu" ><a id="treeRoot" href="#" rel="root"  data-type="directory">../root folder</a></li></ul></div>

                <div id="testtree"  class="pagination " style="height:80%; width:100%; padding-left:15px; padding-right:25px; margin-top:0px; min-height: 200px; max-height:581px; overflow:auto;">
                </div>
            </div><!--/porlets-content--> 
        </div><!--/block-web--> 
    </div><!--/col-md-6--> 

    <div class="col-md-9">
        <c:choose>
            <c:when test="${frameworkName ==  'jquery'}">
                <div id="componentHeader" class="block-web" style="display: none;height:75px;">
                    <div class="btn-toolbar"  id="jquery-btn-toolbar1" >
                        <div class="btn-group">
                            <button id="icons" rel="images/framework/jquerymobile/components/icons.PNG"  type="button" class="btn btn-default">Icons</button>
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                <span class="caret"></span>
                                <span class="sr-only">Toggle Dropdown</span>
                            </button>
                            <ul  class="dropdown-menu" role="menu">
                                <li><a href="#" id="jquery-icons-default">Default Icon</a></li>
                                <li><a href="#" id="jquery-icons-linkedicon">Linked Icon</a></li>                
                            </ul>
                        </div>
                        <div class="btn-group">
                            <button  id="buttons" type="button" rel="images/framework/jquerymobile/components/buttons.PNG" class="btn btn-default">Buttons</button>
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                <span class="caret"></span>
                                <span class="sr-only">Toggle Dropdown</span>
                            </button>
                            <ul class="dropdown-menu" role="menu">
                                <li><a href="#" id="jquery-buttons-basic">Basic Button</a></li>
                                <li><a href="#" id="jquery-buttons-iconbutton">Icon Button</a></li>
                                <li><a href="#" id="jquery-buttons-minibutton">Mini Button</a></li>
                                <li><a href="#" id="jquery-buttons-nativebutton">Native Button</a></li>
                                <li><a href="#" id="jquery-buttons-icononlybutton">Icon Only Button</a></li>
                            </ul>
                        </div>
                        <div class="btn-group">
                            <button  id="listviews"   rel="images/framework/jquerymobile/components/listviews.PNG" type="button" class="btn btn-default">List Views</button>
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                <span class="caret"></span>
                                <span class="sr-only">Toggle Dropdown</span>
                            </button>
                            <ul class="dropdown-menu" role="menu">
                                <li><a href="#" id="jquery-list-view-plain">Plain </a></li>
                                <li><a href="#" id="jquery-list-view-ordered">Ordered </a></li>
                                <li><a href="#" id="jquery-list-view-linked">Linked </a></li>
                                <li><a href="#" id="jquery-list-view-searchfilter">Search Filter</a></li>
                                <li><a href="#" id="jquery-list-view-divider">Divider</a></li>
                                <li><a href="#" id="jquery-list-view-autodivider">Autodivider</a></li>
                                <li><a href="#" id="jquery-list-view-countbubbles">Count Bubbles</a></li>
                                <li><a href="#" id="jquery-list-view-icons16x16">Icons: 16x16</a></li>
                                <li><a href="#" id="jquery-list-view-thumbnails">Thumbnails</a></li>
                                <li><a href="#" id="jquery-list-view-splitbutton">Split button</a></li>
                                <li><a href="#" id="jquery-list-view-formattedcontent">Formatted content</a></li>
                            </ul>
                        </div>
                        <div class="btn-group">
                            <button id="checkboxWidget" rel="images/framework/jquerymobile/components/checkboxWidget.PNG" type="button" class="btn btn-default">Checkbox</button>
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                <span class="caret"></span>
                                <span class="sr-only">Toggle Dropdown</span>
                            </button>
                            <ul class="dropdown-menu" role="menu">
                                <li><a href="#" id="jquery-checkbox-basic">Basic example</a></li>
                                <li><a href="#" id="jquery-checkbox-mini-size">Mini Size</a></li>
                                <li><a href="#" id="jquery-checkbox-vertical-group">Vertical group</a></li>
                                <li><a href="#" id="jquery-checkbox-horizontal-group">Horizontal group</a></li>
                                <li><a href="#" id="jquery-checkbox-icon-position">Icon position</a></li>
                            </ul>
                        </div>

                        <div class="btn-group">
                            <button id="collapsible" rel="images/framework/jquerymobile/components/collapsibles.PNG" type="button" class="btn btn-default">Collapsible</button>
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                <span class="caret"></span>
                                <span class="sr-only">Toggle Dropdown</span>
                            </button>
                            <ul class="dropdown-menu" role="menu">
                                <li><a href="#" id="jquery-collapsible-basic">Basic example</a></li>
                                <li><a href="#" id="jquery-collapsible-Theme">Theme</a></li>
                                <li><a href="#" id="jquery-collapsible-Expanded">Expanded</a></li>
                                <li><a href="#" id="jquery-collapsible-Mini-sized">Mini sized</a></li>
                                <li><a href="#" id="jquery-collapsible-Legend">Legend</a></li>
                                <li><a href="#" id="jquery-collapsible-Non-inset">Non-inset collapsible</a></li>
                                <li><a href="#" id="jquery-collapsible-Set-of-individual">Set of individual collapsibles</a></li>
                                <li><a href="#" id="jquery-collapsible-Pre-rendered-markup">Pre-rendered markup</a></li>

                            </ul>
                        </div>

                        <div class="btn-group">
                            <button id="grids"  rel="images/framework/jquerymobile/components/grids.PNG" type="button" class="btn btn-default">Grids</button>
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                <span class="caret"></span>
                                <span class="sr-only">Toggle Dropdown</span>
                            </button>
                            <ul class="dropdown-menu" role="menu">
                                <li><a href="#" id="jquery-grids-two-column-grids">Two column grids</a></li>
                                <li><a href="#" id="jquery-grids-three-column-grids">Three-column grids</a></li>
                                <li><a href="#" id="jquery-grids-multiple-row-grids">Multiple row grids</a></li>
                                <li><a href="#" id="jquery-grids-horizontal-grid-solo-class">Grid solo class</a></li>
                            </ul>
                        </div>

                        <div class="btn-group" style="float:right;">
                            <button type="button" id="back-toolbar" class="btn btn-default" disabled="disabled"><</button>
                            <button type="button" id="next-toolbar" class="btn btn-default">></button>

                        </div>
                    </div>
                    <div class="btn-toolbar" id="jquery-btn-toolbar2" style="display: none;" >
                        <div class="btn-group">
                            <button id="formElement" rel="images/framework/jquerymobile/components/formElement.PNG" type="button" class="btn btn-default">Form elements</button>
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                <span class="caret"></span>
                                <span class="sr-only">Toggle Dropdown</span>
                            </button>
                            <ul class="dropdown-menu" role="menu">
                                <li><a href="#" id="jquery-formelements-horizontal-grouped-buttons">Horizontal grouped buttons</a></li>
                                <li><a href="#" id="jquery-formelements-sliders">Sliders</a></li>  
                                <li><a href="#" id="jquery-formelements-range-slider">Range slider</a></li>
                                <li><a href="#" id="jquery-formelements-flip-switch">Flip switch</a></li>  
                                <li><a href="#" id="jquery-formelements-checkboxes">Checkboxes</a></li>
                                <li><a href="#" id="jquery-formelements-radio-buttons">Radio buttons</a></li>  
                                <li><a href="#" id="jquery-formelements-selects">Selects</a></li>
                                <li><a href="#" id="jquery-formelements-text-inputs-textareas">Text inputs & Textareas</a></li>  
                                <li><a href="#" id="jquery-formelements-date-picker">Date Picker</a></li>  

                            </ul>
                        </div>
                        <div class="btn-group">
                            <button id="loader" rel="images/framework/jquerymobile/components/loader.PNG" type="button" class="btn btn-default">Loader</button>
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                <span class="caret"></span>
                                <span class="sr-only">Toggle Dropdown</span>
                            </button>
                            <ul class="dropdown-menu" role="menu">
                                <li><a href="#" id="jquery-loader-standard-loader">Standard loader</a></li>
                                <li><a href="#" id="jquery-loader-custom-HTML">Custom HTML</a></li>
                                <li><a href="#" id="jquery-loader-theme">Theme</a></li>
                            </ul>
                        </div>
                        <div class="btn-group">
                            <button id="tables"  rel="images/framework/jquerymobile/components/table.PNG"  type="button" class="btn btn-default">Table</button>
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                <span class="caret"></span>
                                <span class="sr-only">Toggle Dropdown</span>
                            </button>
                            <ul class="dropdown-menu" role="menu">
                                <li><a href="#" id="jquery-table-basic-table">Basic Table</a></li>
                                <li><a href="#" id="jquery-table-column-toggle">Column Toggle</a></li>

                            </ul>
                        </div>


                        <div class="btn-group">
                            <button id="popups" rel="images/framework/jquerymobile/components/popup.PNG" type="button" class="btn btn-default">Popup</button>
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                <span class="caret"></span>
                                <span class="sr-only">Toggle Dropdown</span>
                            </button>
                            <ul class="dropdown-menu" role="menu">
                                <li><a href="#" id="jquery-popup-popup-basic">Popup basics</a></li>
                                <li><a href="#" id="jquery-popup-tooltip">Tooltip</a></li>
                                <li><a href="#" id="jquery-popup-photo-lightbox">Photo lightbox</a></li>
                                <li><a href="#" id="jquery-popup-menu">Menu</a></li>
                                <li><a href="#" id="jquery-popup-nested-menu">Nested menu</a></li>
                                <li><a href="#" id="jquery-popup-form">Form</a></li>
                                <li><a href="#" id="jquery-popup-dialog">Dialog</a></li>
                                <li><a href="#" id="jquery-popup-adding-padding">Adding padding</a></li>
                                <li><a href="#" id="jquery-popup-position">Position</a></li>
                                <li><a href="#" id="jquery-popup-transitions">Transitions</a></li>
                                <li><a href="#" id="jquery-popup-theme">Theme</a></li>
                                <li><a href="#" id="jquery-popup-closing">Closing</a></li>
                            </ul>
                        </div>

                        <div class="btn-group">
                            <button id="toolbars" rel="images/framework/jquerymobile/components/toolbar.PNG" type="button" class="btn btn-default">Toolbar</button>
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                <span class="caret"></span>
                                <span class="sr-only">Toggle Dropdown</span>
                            </button>
                            <ul class="dropdown-menu" role="menu">
                                <li><a href="#" id="jquery-toolbar-Header">Header</a></li>
                                <li><a href="#" id="jquery-toolbar-Footer">Footer</a></li>
                                <li><a href="#" id="jquery-toolbar-Theme">Theme</a></li>
                                <li><a href="#" id="jquery-toolbar-Buttons-in-toolbars">Buttons in toolbars</a></li>
                                <li><a href="#" id="jquery-toolbar-grouped-buttons">Grouped buttons</a></li>
                            </ul>
                        </div>
                        <div class="btn-group">
                            <button id="tabs" rel="images/framework/jquerymobile/components/tabs.PNG" type="button" class="btn btn-default">Tabs</button>
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                <span class="caret"></span>
                                <span class="sr-only">Toggle Dropdown</span>
                            </button>
                            <ul class="dropdown-menu" role="menu">
                                <li><a href="#" id="jquery-tabs-use-navbar-for-tabs">Use navbar for tabs</a></li>
                                <li><a href="#" id="jquery-tabs-use-inset-listview-for-tabs">Use inset listview for tabs</a></li>
                            </ul>
                        </div>
                        <div class="btn-group" style="float:right;">
                            <button type="button" id="back-toolbar" class="btn btn-default" ><</button>
                            <button type="button" id="next-toolbar" class="btn btn-default" disabled="disabled">></button>

                        </div>
                    </div>
                </div>
            </c:when>
        </c:choose>

        <div class="row">
            <div class="col-md-12">
                <div class="block-web" id="repeater">
                    <div class="header">
                        <div class="actions"> <!-- <a href="#" class="refresh"><i class="fa fa-repeat"></i></a> -->


                        </div>
                        <div>
                            <div id="headerPreviewButtons" class="btn-group" style="float:right;display: none;" >
                                <button type="button" id="code_preview" class="btn btn-default"><span class="fa fa-code"></span> Code</button>
                                <button type="button" id="test_preview" class="btn btn-default" ><span class="fa fa-eye"></span> Preview</button>

                            </div><h3 class="content-header" id="displayFileName">File</h3>


                        </div>
                    </div>

                    <div class="porlets-content">
                        <div id="fileContent"  class="pagination margin-top-5" style="height:100%;width:100%;padding: 5px;"><p>
                                File content goes here!
                                Content depends on the file type.
                                So do highlighting and code completion.

                            </p></div> 
                    </div><!--/porlets-content--> 
                </div><!--/block-web--> 
            </div>
        </div>
    </div><!--/col-md-6--> 
</div><!--/row--> 
