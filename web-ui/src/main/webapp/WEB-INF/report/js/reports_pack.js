//
//
// emailUtil.js
//
// Used in Scheduler and Send Report By Email to handle recipient addresses
//
//
var emailUtil = {};
// AddressControl Class
emailUtil.AddressControl = function(containerElementId, addressElementWidth) {
	// alert('emailUtil.AddressControl');
	this.numberOfRows = 0; // The number of actuially build recipient rows
	this.addresses = []; // keeps the state upon validation and is also used to get the final email data
						// because they are written to addresses at validation time
	// Get a unique ID prefix
	var idPrefix = util.getUniqueElementId();
	this.idPrefix = idPrefix;
	this.addressDivId = idPrefix + ':addresses:div';
	this.addressTbodyId = idPrefix + ':addresses:tbody';
	this.isErrorIndication = false;
	this._build(containerElementId, idPrefix, addressElementWidth);
	YAHOO.util.Event.addListener(this.addressTbodyId, 'keyup', this._addressItemActicated, this);
}
emailUtil.AddressControl.prototype.init = function(addresses) {
	// addresses contains any default email addresses, 
	// i.e.: [{type:'to',  address:'abc@abc.com'}, {type:'cc', address:'first last <abc@abc.com>'}]
	var i;
	var idPrefix = this.idPrefix;
	if (addresses.length > 4) {
		// There are more than 4 default addresses, so we have to add additional rows
		var tbody = util.getE(this.addressTbodyId);
		var numberOfExistingRows = this.numberOfRows;
		var numberOfRequiredRows = addresses.length;
		for (i = numberOfExistingRows; i < numberOfRequiredRows; i++) {
			this._addRow(tbody, idPrefix, i);
			this._populateSelect(idPrefix, i);
		}
	}
	// Handle default addresses
	for (i = 0; i < addresses.length; i++) {
		var item =  addresses[i];
		util.setF(idPrefix + ':' + i + ':select', item.type);
		util.setF(idPrefix + ':' + i + ':input', item.address);
	}
}
emailUtil.AddressControl.prototype.validate = function() {
	// Validates the email addresses and handles error indication.
	// At least one valid email address must exist. If one of multiple
	// email addresses is not valid we show an error.
	// We validate and write email data to this.addresses.
	// this.addresses objects contains an isError property so that we know
	// if we must reset any color if an email address is indicated in Red
	// this.addresses is in the format: 
	// [{type:'to', name:'', email:'abc@abc.com', isError:false}, {type:'cc', name:'first last', email:'abc@abc.com',  isError:false}]
	var idPrefix = this.idPrefix;
	this.addresses = [];
	var isEmailAddress = false;
	var isAddressWithError = false;
	for (var i = 0; i < this.numberOfRows; i++) {
		var type = ''; // We only define a type if we find a valid email address
		var address = util.getF(idPrefix + ':' + i + ':input');
		var isError = false;
		if (address != '') {
			if (util.isEmailAddress(address)) {
				isEmailAddress = true;
				type = util.getF(idPrefix + ':' + i + ':select');
			}
			else {
				isAddressWithError = true;
				isError = true;
				var element = util.getE(idPrefix + ':' + i + ':input');
				element.style.color = 'Red';
			}
		}
		// Add object to this.addresses
		this.addresses[i] = {type:type, address:address, isError:isError};
	}
	if (isEmailAddress && !isAddressWithError) {
		return true;
	}
	else {
		// Handle error indication
		// alert('Error in recipient addresses');
		var msg = isAddressWithError ? langVar('lang_stats.general.invalid_email_address_in_recipients_msg') : langVar('lang_stats.general.no_recipient_address_message');
		util.updateT('email-address-grid:error', msg);
		util.showE('email-address-grid:error');
		this.isErrorIndication = true;
	}
	return false;
}
emailUtil.AddressControl.prototype._addressItemActicated = function(evt, self) {
	var element = evt.target || evt.srcElement;
	var elementId = element.id;
	// alert('_addressItemActicated() - id: ' + elementId);
	var dat = elementId.split(':');
	var rowIndex = parseInt(dat[1], 10);
	var elementType = dat[2];
	if (elementType == 'input') {
		// Handle error div on bottom
		if (self.isErrorIndication) {
			util.hideE('email-address-grid:error');
			self.isErrorIndication = false;
		}
		// Reset error of current row
		// Note, the row may not yet exist in this.addresses because it is only
		// added upon validation, so check for existence.
		var addresses = self.addresses;
		if (addresses[rowIndex]) {
			var address = addresses[rowIndex];
			if (address.isError) {
				element.style.color = 'Black';
				address.isError = false;
			}
		}
		// Add a new row if the current row is the last row
		var numberOfRows = self.numberOfRows;
		if (rowIndex == numberOfRows - 1) {
			var tbody = util.getE(self.addressTbodyId);
			self._addRow(tbody, self.idPrefix, numberOfRows);
			self._populateSelect( self.idPrefix, numberOfRows);
		}
	}
}
emailUtil.AddressControl.prototype.getAddresses = function() {
	// Returns all valid addresses
	// Valid addresses already exist in this.addresses since validation.
	// Valid addresses have a defined type, others not.
	var a = this.addresses;
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var item = a[i];
		if (item.type != '') {
			b[b.length] = {type:item.type, address:item.address};
		}
	}
	return b;
}
emailUtil.AddressControl.prototype.reset = function() {
	// Resets the control by:
	// a.) setting the row numbers to 4
	// b.) removing any error indication
	// c.) resetting form fields to "to:" address and empty input field
	var i;
	if (this.isErrorIndication) {
		util.hideE('email-address-grid:error');
		this.isErrorIndication = false;
	}
	this.addresses = [];
	//
	// Reset rows to four rows
	//
	var numberOfRows = this.numberOfRows;
	if (this.numberOfRows > 4) {
		// Remove rows
		var tbody = util.getE(this.addressTbodyId);
		var rows = tbody.getElementsByTagName('tr');
		for (i = rows.length - 1; i > 3; i--) {
			var theRow = rows[i];
			tbody.removeChild(theRow);
		}
		this.numberOfRows = 4;
	}
	//
	// Reset select and input elements
	//
	var idPrefix = this.idPrefix;
	for (i = 0; i < 4; i++) {
		util.setF(idPrefix + ':' + i + ':select', 'to');
		var input = util.getE(idPrefix + ':' + i + ':input');
		input.value = '';
		input.style.color = 'Black';
	}
}
emailUtil.AddressControl.prototype.disable = function(isDisable) {
	// isDisable is optional
	var makeDisabled = (isDisable != null) ? isDisable : true;
	var numberOfRows = this.numberOfRows;
	var idPrefix = this.idPrefix;
	var a = [];
	for (var i = 0; i < numberOfRows; i++) {
		a[a.length] = idPrefix + ':' + i + ':select';
		a[a.length] = idPrefix + ':' + i + ':input';
	}
	util.disableE(a, makeDisabled);
}
emailUtil.AddressControl.prototype.freezeOverflow = function(isFreeze) {
	// Fixes a firefox bug, we require to set overflow to hidden when
	// a subform is displayed above the div element where overflow is set
	// to scroll
	var overflow = (isFreeze == null || isFreeze == true) ? 'hidden' : 'auto';
	var element = util.getE(this.addressDivId);
	element.style.overflow = overflow;
}
emailUtil.AddressControl.prototype._build = function(containerElementId, idPrefix, addressElementWidth) {
	// containerElementId is usually a td element
	// Builds the control
	// We create four address rows as default, starting from row 0, 1, 2, 3
	var container = util.getE(containerElementId);
	var addressDiv = util.createE('div', {id:this.addressDivId, className:'email-address-grid', width:addressElementWidth + 'px'});
	var table = util.createE('table', {className:'email-address-grid', cellSpacing:0});
	var tbody = util.createE('tbody', {id:this.addressTbodyId});
	var i;
	for (i = 0; i < 4; i++) {
		this._addRow(tbody, idPrefix, i);
	}
	// Add a div for error indication
	var errorDiv = util.createE('div', {id:'email-address-grid:error', className:'form-error'});
	util.chainE([container, [addressDiv, [table, tbody]], errorDiv]);
	// Handle select elements
	// Populate select only works after the select element is part of the dom
	for (i = 0; i < 4; i++) {
		this._populateSelect(idPrefix, i);
	}
}
emailUtil.AddressControl.prototype._addRow = function(tbody, idPrefix, rowIndex) {
	// Builds a row with select and input element
	// We create four address rows as default, starting from row 0
	var selectId = idPrefix + ':' + rowIndex + ':select';
	var inputId = idPrefix + ':' + rowIndex + ':input';
	var tr = util.createE('tr');
	var th = util.createE('th', {padding:'0px'});
	var td = util.createE('td', {padding:'0px'});
	var select = util.createE('select', {id:selectId});
	var input = util.createE('input', {id:inputId, type:'text', value:''});
	util.chainE(tbody, [tr, [th, select], [td, input]]);
	this.numberOfRows = rowIndex + 1;
}
emailUtil.AddressControl.prototype._populateSelect = function(idPrefix, rowIndex) {
	var list = [{name:'to', label:langVar('lang_stats.general.email_to') + ':'}, {name:'cc', label:langVar('lang_stats.general.email_cc') + ':'}, {name:'bcc', label:langVar('lang_stats.general.email_bcc') + ':'}];
	var selectId = idPrefix + ':' + rowIndex + ':select';
	util.populateSelect(selectId, list, 'name', 'label');
	util.setF(selectId, 'to');
}
//
//
// creUtil.js (Customize Report Element utilities, used in Reports and Reports Editor)
// Contains helper utilities for cre*.js files
//
// 
var creUtil = {
	getReportElementGraphsObjectFromGraphsDb: function(graphsDb) {
		// Returns a graphs object as required to save in report element. The graphs object is created
		// from an up to date graphsDb object.
		var metaGraphType = graphsDb.metaGraphType;
		var isChrono = (metaGraphType.indexOf('chrono_') != -1);
		var graphs = {};
		var graphType = '';
		if (isChrono) {
			graphs = util.cloneObject(graphsDb.chrono_bar_line_graph);
			graphType = (metaGraphType == 'chrono_bar') ? 'bar' : 'line';
		}
		else {
			if (metaGraphType != 'pie') {
				graphs = util.cloneObject(graphsDb.bar_line_graph);
			}
			else {
				graphs = util.cloneObject(graphsDb.pie_chart);
			}
			graphType = metaGraphType;
		}
		graphs.graph_type = graphType;
		return graphs;
	},
	getIsChronoGraphSupport: function(reportFieldsDb, columns) {
		var isChronoGraphSupport = false;
		var numberOfTextFields = 0;
		var textFieldName = '';
		for (var i = 0; i < columns.length; i++) {
			// We assume that show_column is true for text field
			var isTextField = (columns[i].show_percent_column == null);
			if (isTextField) {
				textFieldName = columns[i].report_field;
				numberOfTextFields++;
			}
		}
		if (numberOfTextFields == 1) {
			// alert('textFieldName: ' + textFieldName);
			var category = reportFieldsDb[util.h(textFieldName)].category;
			// alert('category: ' + category);
			if (category == 'date_time' ||
				category == 'day_of_week' ||
				category == 'hour_of_day') {
				isChronoGraphSupport = true;
			}
		}
		return isChronoGraphSupport;
	},
	buildSortDirectionList: function(selectElementId) {
		// Populate sort direction list
		var sortDirectionList = [{name:'ascending', label:langVar('lang_stats.btn.ascending')}, {name:'descending', label:langVar('lang_stats.btn.descending')}];
		util.populateSelect(selectElementId, sortDirectionList, 'name', 'label');
	},
	getSortByFirstListEntryLabel: function(reportFieldsDb, columns, label) {
		// Label is the first list entrty in sort by select element. We add some spaces
		// so that the GUI doen's flicker when columns are unchecked
		var maxLength = 0;
		for (var i = 0; i < columns.length; i++) {
			var reportField = columns[i].report_field;
			var columnLabel = reportFieldsDb[util.h(reportField)].label;
			if (columnLabel.length > maxLength) {
				maxLength = columnLabel.length;
			}
		}
		for (var i = label.length; i < maxLength + 10; i++) {
			label += '\u00a0';
		}
		return label;
	}
}
//
//
// creGraphs.js (Customize Report Element Graphs Class, used in Reports and Reports Editor)
//
// Note, the sort by list for graphs is part of the graphs panel, so it is handled in graph options
// because most of the data required by sort by already exists in graph options and we don't want
// to duplicate this data here.
// However, graphs contains a reference to the graphOptions object to handle sort_by integrity
//
//
CreGraphs = function(queryFieldsDb) {
	// Manages the graphs form controls
	var YE = YAHOO.util.Event;
	var graphFieldsContainerId = 'cre_obj:graphs:fields_container';
	this.graphFieldsContainerId = graphFieldsContainerId;
	this.queryFieldsDb = queryFieldsDb; // A reference to all report fields from where we get the Field labels
	this.reportElementDb = {}; // A reference to the active report element data.
							   // reportElementDb keeps the state of any action taken in the Graphs
							   // The variable is set upon this.build()
	// this.graphsDb = {}; // A reference to the active graphs object
	// this.graphOptionsRef = null; // A reference to the graphOptions object to call graphOptions.checkSortByIntegrity()
	this.isTable = false; // Set upon this.init()
	// this.metaGraphTypePriorTabChange = ''; // Set upon init(), it is used to check whether the meta graph type
										   // changed in graph options. If it changed we may need to update
										   // sort by and/or show legend in the Graphs tab.
	var idPrefix = util.getUniqueElementId();
	this.idPrefix = idPrefix; // Used as prefix in all element Id's (checkboxes, etc.) and as self reference id
	// util.showObject(this.reportElementDb);
	YE.addListener('cre_obj:graphs:select_deselect_all_btn', 'click', this.selectDeselectAllActor, this);
	// Assign single table event
	YE.addListener(graphFieldsContainerId, 'click', this.itemActivated, this);
}
CreGraphs.prototype = {
//	setGraphOptionsReference: function(graphOptionsRef) {
//		this.graphOptionsRef = graphOptionsRef;
//	},
	init: function(reportElementDb) {
		// Field list element ID scheme (prefix:index:type:elementName), index matches the array position
		// sort colum: ueid_20:0:sort:td --> should be an image!
		// label column: re_field_list:0:label:td --> used to set the sort direction
		//
		// Init
		//
		// var metaGraphType = graphsDb.metaGraphType;
		this.reportElementDb = reportElementDb;
		// this.graphsDb = graphsDb;
		var isTable = reportElementDb.show_table;
		this.isTable = isTable;
		// this.metaGraphTypePriorTabChange = metaGraphType;
		var queryFieldsDb = this.queryFieldsDb;
		var columns = reportElementDb.columns;
		this.buildGraphFields(queryFieldsDb, columns);
	},
	//
	//
	//
	// Graphs list handling
	//
	//
	//
	//
	itemActivated: function(evt, self) {
		var element = evt.target || evt.srcElement;
		var elementId = element.id;
		if (elementId != '') {
			// alert('creUtil.Graphs.prototype.itemActivated(): ' + elementId);
			var dat = elementId.split(':');
			var idPrefix = dat[0];
			var objectIndex = parseInt(dat[1], 10);
			var type = dat[2];
			// alert('idPrefix: ' + idPrefix);
			// var self = creUtil.TableColumnsSelfReferences[idPrefix]; // self is equal this in terms of the TableColumns object!
			var reportElementDb = self.reportElementDb;
			var column = reportElementDb.columns[objectIndex];
			// alert('list.idPrefix: ' + list.idPrefix);
			// util.showObject(item);
			var isAggregatingField = (column.show_percent_column != null);
			var isChecked;
			if (isAggregatingField) {
				if (type == 'graph_label') {
					// User clicked on the text label (note, no label element exists, so the checkbox
					// does not automatically set its state by clicking on the text)
					var graphInput = util.getE(idPrefix + ':' + objectIndex + ':graph');
					isChecked = graphInput.checked;
					graphInput.checked = !isChecked;
					column.show_graph = !isChecked;
				}
				else if (type == 'graph') {
					isChecked = util.getF(idPrefix + ':' + objectIndex + ':' + type);
					column.show_graph = isChecked;
				}
				// self.graphOptionsRef.checkSortByIntegrity();
			}
		}
	},
	selectDeselectAllActor: function(evt, self) {
		var reportElementDb = self.reportElementDb;
		var columns = reportElementDb.columns;
		var idPrefix = self.idPrefix;
		//
		// Check if we check or uncheck all fields
		//
		var makeAllChecked = false;
		var i;
		var column;
		var isAggregatingField;
		for (i = 0; i < columns.length; i++) {
			column = columns[i];
			isAggregatingField = (column.show_percent_column != null);
			if (isAggregatingField && !column.show_graph) {
				makeAllChecked = true;
				break;
			}
		}
		// alert('makeAllChecked: ' + makeAllChecked);
		//
		// Check or uncheck all fields
		//
		for (i = 0; i < columns.length; i++) {
			column = columns[i];
			isAggregatingField = (column.show_percent_column != null);
			// alert('isAggregatingField: ' + isAggregatingField);
			if (isAggregatingField) {
				column.show_graph = makeAllChecked;
				util.setF(idPrefix + ':' + i + ':graph', makeAllChecked);
			}
		}
	},
	//
	//
	// Graph fields handling
	//
	//
	buildGraphFields: function(queryFieldsDb, columns) {
		var table = util.getE(this.graphFieldsContainerId);
		// Clean up the list
		while (table.firstChild != null) {
			var n = table.firstChild;
			table.removeChild(n);
		}
		var tbody = document.createElement('tbody');
		var i;
		var column;
		var isAggregatingField;
		for (i = 0; i < columns.length; i++) {
			column = columns[i];
			var reportField = column.report_field;
			var reportFieldLabel = queryFieldsDb[util.h(reportField)].label;
			isAggregatingField = (column.show_percent_column != null);
			var tr = document.createElement('tr');
			this.addCheckboxCell(tr, i, 'graph', '');
			this.addLabelCell(tr, i, reportFieldLabel);
			tbody.appendChild(tr);
		}
		table.appendChild(tbody);
		//
		// Upadate the checkbox state
		//
		var idPrefix = this.idPrefix;
		for (i = 0; i < columns.length; i++) {
			column = columns[i];
			isAggregatingField = (column.show_percent_column != null);
			var input = util.getE(idPrefix + ':' + i + ':graph');
			if (isAggregatingField) {
				input.checked = columns[i].show_graph;
			}
			else {
				// Text field, disable checkbox and label
				input.disabled = 'disabled';
				var labelTd = util.getE(idPrefix + ':' + i + ':graph_label');
				labelTd.className = 'label disabled';
			}
		}
	},
	addLabelCell: function(tr, index, label) {
		var td = document.createElement('td');
		td.id = this.idPrefix + ':' + index + ':graph_label';
		td.className = 'label';
		var text = document.createTextNode(label);
		util.chainE(tr, td, text);
	},
	addCheckboxCell: function(tr, index, type, label) {
		var td = document.createElement('td');
		var id = this.idPrefix + ':' + index + ':' + type;
		var input = document.createElement('input');
		input.id = id;
		input.type = 'checkbox';
		if (!util.userAgent.isIE) {
			// Give checkbox default margin
			input.style.margin = '3px';
		}
		td.appendChild(input);
		if (label != '') {
			var labelElement = document.createElement('label');
			labelElement.htmlFor = id;
			var text = document.createTextNode(' ' + label);
			labelElement.appendChild(text);
			td.appendChild(labelElement);
		}
		tr.appendChild(td);
	}
}
//
//
// creTable.js (Customize Report Element Table Class, used in Reports and Reports Editor)
//
//
CreTable = function(queryFieldsDb, isCustomizeInReports, hideLogDetailSortingMessage) {
	// Manages the report fields list
	// this.containerElementId = containerElementId;
	var YE = YAHOO.util.Event;
	var tableFieldsContainerId = 'cre_obj:table:fields_container';
	this.tableFieldsContainerId = tableFieldsContainerId;
	this.queryFieldsDb = queryFieldsDb; // A reference to all report fields from where we get the Field labels
	this.isCustomizeInReports = isCustomizeInReports;
	this.hideLogDetailSortingMessage = hideLogDetailSortingMessage;
	this.reportElementDb = {}; // A reference to the active report element data.
							   // reportElementDb keeps the state of any action taken in the TableColumns
							   // The variable is set upon this.build()
	this.sortByFirstListEntryLabel = ''; // Set upon init()
	this.totalRows = 0; // Set upon init(), it is used for the log detail warning message in the Reports GUI
	this.isTable = false;
	this.isOverview = false;
	this.isLogDetail = false; 
	var idPrefix = util.getUniqueElementId();
	this.idPrefix = idPrefix; // Used as prefix in all element Id's (checkboxes, etc.) and as self reference id
	// Populate sort direction list in Table Options
	creUtil.buildSortDirectionList('cre_obj:table:sort_direction');
	// util.showObject(this.reportElementDb);
	YE.addListener('cre_obj:table:sort_by', 'click', this.sortByActor, this);
	YE.addListener('cre_obj:table:sort_direction', 'click', this.sortDirectionActor, this);
	YE.addListener('cre_obj:table:select_deselect_all_btn', 'click', this.selectDeselectAllActor, this);
	// assign table event
	YE.addListener(tableFieldsContainerId, 'click', this.itemActivated, this);
};
CreTable.prototype = {
	init: function(reportElementDb, totalRows) {
		// Field list element ID scheme (prefix:index:type:elementName), index matches the array position
		// sort colum: ueid_20:0:sort:td --> should be an image!
		// label column: re_field_list:0:label:td --> used to set the sort direction
		// util.showObject(reportElementDb);
		//
		// Init
		//
		this.reportElementDb = reportElementDb;
		this.totalRows = totalRows;
		this.isTable = (reportElementDb.type == 'table');
		this.isOverview = (reportElementDb.type == 'overview');
		this.isLogDetail = (reportElementDb.type == 'log_detail');
		var queryFieldsDb = this.queryFieldsDb;
		var columns = reportElementDb.columns;
		var basicSortByFirstListEntryLabel = '(' + langVar('lang_stats.general.none') + ')'; // --> Label gets length of max column label to avoid GUI flicker
		this.sortByFirstListEntryLabel = creUtil.getSortByFirstListEntryLabel(queryFieldsDb, columns, basicSortByFirstListEntryLabel);
		this.buildTableFields(columns, queryFieldsDb);
		util.showEV('cre_obj:table:sort_by:div', !this.isOverview);
		util.disableE(['cre_obj:table:sort_by', 'cre_obj:table:sort_direction'], this.isOverview); // Disable so that we don't get focus on it if overview
		if (!this.isOverview) {
			this.updateSortBy();
			// Set initial sort direction
			util.setF('cre_obj:table:sort_direction', reportElementDb.sort_direction);
		}
	},
	itemActivated: function(evt, self) {
		var element = evt.target || evt.srcElement;
		var elementId = element.id;
		if (elementId != '') {
			// alert('creUtil.TableColumns.prototype.itemActivated(): ' + elementId);
			var dat = elementId.split(':');
			var idPrefix = dat[0];
			var objectIndex = parseInt(dat[1], 10);
			var type = dat[2];
			// alert('idPrefix: ' + idPrefix);
			// var self = creUtil.TableColumnsSelfReferences[idPrefix]; // self is equal this in terms of the TableColumns object!
			var reportElementDb = self.reportElementDb;
			var column = reportElementDb.columns[objectIndex];
			// alert('list.idPrefix: ' + list.idPrefix);
			// util.showObject(item);
			var isAggregatingField = (column.show_percent_column != null);
			// alert('isLogDetail: ' + isLogDetail);
			var isChecked;
			// var isUpdateSortBy = false;
			// if table report element
			if (self.isTable) {
				if (isAggregatingField) {
					if (type == 'table_label') {
						// We set the checkboxes depending on current state.
						// a.) If none is checked we check all
						// b.) If one or more are checked we uncheck all
						isChecked = column.show_column;
						column.show_column = !isChecked;
						column.show_percent_column = !isChecked;
						column.show_bar_column = !isChecked;
						// Update aggregating field state
						self.updateCheckboxState(objectIndex, column);
					}
					else {
						isChecked = util.getF(idPrefix + ':' + objectIndex + ':' + type);
						if (type == 'number') {
							column.show_column = isChecked;
							if (!isChecked) {
								column.show_percent_column = false;
								column.show_bar_column = false;
							}
							util.enableE(idPrefix + ':' + objectIndex + ':percent', isChecked);
							util.enableE(idPrefix + ':' + objectIndex + ':bar', isChecked);
							// util.showObject(column);
							// Update aggregating field state
							self.updateCheckboxState(objectIndex, column);
						}
						else if (type == 'percent') {
							column.show_percent_column = isChecked;
						}
						else if (type == 'bar') {
							column.show_bar_column = isChecked;
						}
					}
				}
			}
			else {
				// overview or log_detail report element which only has text and number
				// checkboxes and where text checkboxes are not disabled.
				// Note, a log_detail report element has show_percent_column and show_bar_column
				// nodes, though they are not in use, respectively always false.
				var typeDetail = isAggregatingField ? 'number' : 'text';
				var checkbox = util.getE(idPrefix + ':' + objectIndex + ':' + typeDetail);
				isChecked = checkbox.checked;
				if (type == 'table_label') {
					column.show_column = !isChecked;
					checkbox.checked = !isChecked;
				}
				else {
					column.show_column = isChecked;
				}
			}
			//
			// Handle sort_by
			// If a column becomes unchecked we have to remove it from
			// the sort_by list
			//
			if (!self.isOverview && !column.showColumn) {
				// Check if this is the active sort field
				if (column.report_field == reportElementDb.sort_by) {
					self.autoSortBy(objectIndex);
				}
				self.updateSortBy();
			}
		}
	},
	updateCheckboxState: function(objectIndex, column) {
		// Sets the checkbox state for the specified column item
		var isAggregatingField = (column.show_percent_column != null);
		var idPart = this.idPrefix + ':' + objectIndex + ':';
		// util.showObject(column);
		// alert('isAggregatingField: ' + isAggregatingField);
		var showColumn = column.show_column;
		if (!isAggregatingField) {
			util.setF(idPart + 'text', showColumn);
			if (this.isTable) {
				util.disableE(idPart + 'text');
			}
		}
		else {
			util.setF(idPart + 'number', showColumn);
			if (this.isTable) {
				var percentInput = util.getE(idPart + 'percent');
				var percentTd = percentInput.parentNode;
				var barInput = util.getE(idPart + 'bar');
				var barTd = barInput.parentNode;
				var className = showColumn ? '' : 'disabled';
				percentInput.checked = column.show_percent_column;
				percentInput.disabled = !showColumn;
				percentTd.className = className;
				barInput.checked = column.show_bar_column;
				barInput.disabled = !showColumn;
				barTd.className = className;
			}
		}
	},
	selectDeselectAllActor: function(evt, self) {
		var reportElementDb = self.reportElementDb;
		var columns = reportElementDb.columns;
		var isTable = self.isTable;
		var isOverview = self.isOverview;
		//
		// Check if we check or uncheck all fields
		//
		var makeAllChecked = false;
		var i;
		var column;
		var isAggregatingField;
		for (i = 0; i < columns.length; i++) {
			column = columns[i];
			// isAggregatingField = (column.show_percent_column != null);
			if (!column.show_column) {
				makeAllChecked = true;
				break;
			}
		}
		// alert('makeAllChecked: ' + makeAllChecked);
		//
		// Check or uncheck all fields
		//
		for (i = 0; i < columns.length; i++) {
			column = columns[i];
			isAggregatingField = (column.show_percent_column != null);
			// alert('isAggregatingField: ' + isAggregatingField);
			if (isTable) {
				if (isAggregatingField) {
					column.show_column = makeAllChecked;
					column.show_percent_column = makeAllChecked;
					column.show_bar_column = makeAllChecked;
					self.updateCheckboxState(i, column);
				}
			}
			else {
				column.show_column = makeAllChecked;
				self.updateCheckboxState(i, column);
			}
		}
		// Handle sort by
		if (!isOverview && !makeAllChecked) {
			reportElementDb.sort_by = '';
		}
		self.updateSortBy();
	},
	sortByActor: function(evt, self) {
		var previousSortByValue = self.reportElementDb.sort_by;
		var newSortByValue = util.getF('cre_obj:table:sort_by');
		// Set newSortByValue 
		self.reportElementDb.sort_by = newSortByValue;
		// Check if we need to show the log detail sorting message
		if (self.isLogDetail &&
			!self.hideLogDetailSortingMessage &&
			previousSortByValue == '' &&
			newSortByValue != '' &&
			(self.totalRows > 1000000 || !self.isCustomizeInReports)) {
			logDetailSortingMsg.openViaCustomizeReportElement(self.isCustomizeInReports);
		}
	},
	sortDirectionActor: function(evt, self) {
		self.reportElementDb.sort_direction = util.getF('cre_obj:table:sort_direction');
	},
	autoSortBy: function(objectIndex) {
		// The column of the given objectIndex has been unchecked, so the report_field
		// can't be used for sort_by, respectively it doesn't make sense.
		// In this case we automatically set set reportElementDb.sort_by to
		// the nearest checked column
		var reportElementDb = this.reportElementDb;
		var columns = reportElementDb.columns;
		var sortBy = '';
		var i;
		// we serach first upward and then downward for a checked column
		for (i = objectIndex + 1; i < columns.length; i++) {
			if (columns[i].show_column) {
				sortBy = columns[i].report_field;
				break;
			}
		}
		// If no sortBy has been found yet
		if (sortBy == '') {
			// Serach downward
			for (i = objectIndex - 1; i >= 0; i--) {
				if (columns[i].show_column) {
					sortBy = columns[i].report_field;
					break;
				}
			}
		}
		reportElementDb.sort_by = sortBy;
	},
	updateSortBy: function() {
		// Updates sort by fields list and selected item to the state
		// as in reportElementDb
		var queryFieldsDb = this.queryFieldsDb;
		var columns = this.reportElementDb.columns;
		var sortBy = this.reportElementDb.sort_by;
		var firstListLabel = this.sortByFirstListEntryLabel;
		var list = [{name:'', label:firstListLabel}];
		for (var i = 0; i < columns.length; i++) {
			var column = columns[i];
			if (column.show_column) {
				var name = column.report_field;
				var label = queryFieldsDb[util.h(name)].label;
				list[list.length] = {name:name, label:label};
			}
		}
		util.populateSelect('cre_obj:table:sort_by', list, 'name', 'label');
		util.setF('cre_obj:table:sort_by', sortBy);
	},
	buildTableFields: function(columns, queryFieldsDb) {
		var table = util.getE(this.tableFieldsContainerId);
		// Clean up the list
		while (table.firstChild != null) {
			var n = table.firstChild;
			table.removeChild(n);
		}
		var tbody = document.createElement('tbody');
		var i;
		for (i = 0; i < columns.length; i++) {
			var column = columns[i];
			var reportField = column.report_field;
			var reportFieldLabel = queryFieldsDb[util.h(reportField)].label;
			var isAggregatingField = (column.show_percent_column != null);
			var tr = document.createElement('tr');
			if (!isAggregatingField) {
				this.addCheckboxCell(tr, i, 'text', '');
				// if report element type table
				if (this.isTable) {
					this.addEmptyCell(tr);
					this.addEmptyCell(tr);
				}
			}
			else {
				this.addCheckboxCell(tr, i, 'number', '');
				// if report element type table
				if (this.isTable) {
					this.addCheckboxCell(tr, i, 'percent', '%');
					this.addCheckboxCell(tr, i, 'bar', langVar('lang_stats.customize_report_element.bar'));
				}
			}
			this.addLabelCell(tr, i, reportFieldLabel);
			tbody.appendChild(tr);
		}
		table.appendChild(tbody);
		// Upadate the checkbox state
		for (i = 0; i < columns.length; i++) {
			this.updateCheckboxState(i, columns[i]);
		}
	},
	addLabelCell: function(tr, index, label) {
		var td = document.createElement('td');
		td.id = this.idPrefix + ':' + index + ':table_label';
		td.className = 'label';
		if (this.isTable) {
			td.style.paddingLeft = '14px';
		}
		var text = document.createTextNode(label);
		util.chainE(tr, td, text);
	},
	addCheckboxCell: function(tr, index, type, label) {
		var td = document.createElement('td');
		var id = this.idPrefix + ':' + index + ':' + type;
		var input = document.createElement('input');
		input.id = id;
		input.type = 'checkbox';
		if (!util.userAgent.isIE) {
			// Give checkbox default margin
			input.style.margin = '3px';
		}
		td.appendChild(input);
		if (label != '') {
			var labelElement = document.createElement('label');
			labelElement.htmlFor = id;
			var text = document.createTextNode(' ' + label);
			labelElement.appendChild(text);
			td.appendChild(labelElement);
		}
		tr.appendChild(td);
	},
	addEmptyCell: function(tr) {
		var td = document.createElement('td');
		tr.appendChild(td);
	}
};
//
//
// creTableOptions.js (Customize Report Element TableOptions Class, used in Reports and Reports Editor)
//
//
CreTableOptions = function(queryFieldsDb, isCustomizeInReports) {
	this.isCustomizeInReports = isCustomizeInReports; // Used to handle differences between CRE in Reports GUI and CRE in Config Reports Editor GUI
	this.queryFieldsDb = queryFieldsDb; // A reference to all report fields from where we get the Field labels
	this.reportElementDb = {}; // A reference to the active report element data.
							   // reportElementDb keeps the state of any action taken in the FieldList
							   // The variable is set upon this.init()
	this.isLogDetail = false;
	this.isSessionPaths = false;
	this.isSessionPagePaths = false;
};
CreTableOptions.prototype = {
	init: function(reportElementDb, totalRows) {
		// util.showObject(reportElementDb);
		var reportElementType = reportElementDb.type;
		var isOverview = (reportElementType == 'overview');
		var isTable = (reportElementType == 'table');
		var isLogDetail = (reportElementType == 'log_detail');
		var isSessionPaths = (reportElementType == 'session_paths');
		var isSessionPagePaths = (reportElementType == 'session_page_paths');
		this.reportElementDb = reportElementDb;
		this.isOverview = isOverview;
		this.isTable = isTable;
		this.isLogDetail = isLogDetail;
		this.isSessionPaths = isSessionPaths;
		this.isSessionPagePaths = isSessionPagePaths;
		if (!isOverview) {
			util.setF('cre_obj:table_options:number_of_rows', reportElementDb.number_of_rows);
			if (this.isCustomizeInReports && !isSessionPaths && !isSessionPagePaths) {
				util.setF('cre_obj:table_options:starting_row', reportElementDb.starting_row);
				util.setF('cre_obj:table_options:ending_row', reportElementDb.ending_row);
				// Set totalRows
				util.updateT('cre_obj:table_options:total_rows', customizeRE.totalRows);
			}
			if (isTable)  {
				util.setF('cre_obj:table_options:show_remainder_row', reportElementDb.show_remainder_row);
				util.setF('cre_obj:table_options:show_averages_row', reportElementDb.show_averages_row);
				util.setF('cre_obj:table_options:show_min_row', reportElementDb.show_min_row);
				util.setF('cre_obj:table_options:show_max_row', reportElementDb.show_max_row);
				util.setF('cre_obj:table_options:show_totals_row', reportElementDb.show_totals_row);
				util.setF('cre_obj:table_options:maximum_table_bar_graph_length', reportElementDb.maximum_table_bar_graph_length);
//				util.setF('cre_obj:table_options:display_graphs_table_side_by_side', reportElementDb.display_graphs_table_side_by_side);
			}
			else if (isSessionPaths) {
				util.setF('cre_obj:table_options:expand_paths_greater_than', reportElementDb.expand_paths_greater_than);
				util.setF('cre_obj:table_options:number_of_rows_expanded', reportElementDb.number_of_rows_expanded);
			}
		}
		else {
			// Overview report element
			var compactView = reportElementDb.compact_view;
			util.setF('cre_obj:table_options:classic_table', !compactView);
			util.setF('cre_obj:table_options:compact_view', compactView);
		}
		util.showE('cre_obj:table_options:rows', !isOverview);
		util.showE('cre_obj:table_options:misc_box', isTable);
		util.showE('cre_obj:table_options:session_paths', isSessionPaths);
		util.showE('cre_obj:table_options:overview', isOverview);
		util.showE('cre_obj:table_options:maximum_table_bar_graph_length:section', isTable);
//		util.showE('cre_obj:table_options:display_graphs_table_side_by_side:section', isTable);
	},
	saveChanges: function() {
		// Saves the active form data to reportElementDb
		// Note, in case of invalid values we keep existing values (auto fix)
		var reportElementDb = this.reportElementDb;
		if (!this.isOverview) {
			if (this.isTable) {
				reportElementDb.show_remainder_row = util.getF('cre_obj:table_options:show_remainder_row');
				reportElementDb.show_averages_row = util.getF('cre_obj:table_options:show_averages_row');
				reportElementDb.show_min_row = util.getF('cre_obj:table_options:show_min_row');
				reportElementDb.show_max_row = util.getF('cre_obj:table_options:show_max_row');
				reportElementDb.show_totals_row = util.getF('cre_obj:table_options:show_totals_row');
//				reportElementDb.display_graphs_table_side_by_side = util.getF('cre_obj:table_options:display_graphs_table_side_by_side');
				var maximumTableBarGraphLength = util.getF('cre_obj:table_options:maximum_table_bar_graph_length');
				if (maximumTableBarGraphLength != '' && util.isInteger(maximumTableBarGraphLength, 1)) {
					reportElementDb.maximum_table_bar_graph_length = maximumTableBarGraphLength;
				}
			}
			if (this.isCustomizeInReports && (this.isTable || !this.isLogDetail)) {
				var startingRow = util.getF('cre_obj:table_options:starting_row');
				var endingRow = util.getF('cre_obj:table_options:ending_row');
				if (util.isInteger(startingRow, 1) && util.isInteger(endingRow, 1)) {
					startingRow = parseInt(startingRow, 10);
					endingRow = parseInt(endingRow, 10);
					if (endingRow >= startingRow) {
						// alert('ROW NUMBERS IN creTableOptions 1' + '\nstartingRow: ' + startingRow + '\nendingRow: ' + endingRow);
						reportElementDb.starting_row = startingRow;
						reportElementDb.ending_row = endingRow;
					}
				}
			}
			var numberOfRows = util.getF('cre_obj:table_options:number_of_rows');
			if (util.isInteger(numberOfRows, 1)) {
				reportElementDb.number_of_rows = numberOfRows;
			}
			if (this.isSessionPaths) {
				var expandPathsGreaterThan = util.getF('cre_obj:table_options:expand_paths_greater_than');
				var numberOfRowsExpanded = util.getF('cre_obj:table_options:number_of_rows_expanded');
				if (util.isInteger(expandPathsGreaterThan, 0)) {
					reportElementDb.expand_paths_greater_than = expandPathsGreaterThan;
				}
				if (util.isInteger(numberOfRowsExpanded, 1)) {
					reportElementDb.number_of_rows_expanded = numberOfRowsExpanded;
				}
			}
		}
		else {
			reportElementDb.compact_view = util.getF('cre_obj:table_options:compact_view');
		}
	}
};
//
//
// crePivotTable.js (Customize Report Element PivotTable Class, used in Reports and Reports Editor)
//
//
function CrePivotTable(queryFieldsDb) {
	'use strict';
	var YE = YAHOO.util.Event;
	this.queryFieldsDb = queryFieldsDb; // A reference to all report fields from where we get the Field labels
	this.reportElementDb = {}; // A reference to the active report element data.
	// Init the GUI
	YE.addListener('cre_obj:pivot_table:show_pivot_table', 'click', this.toggleShowPivotTable, this);
	YE.addListener('cre_obj:pivot_table:sort_different', 'click', this.toggleSortDifferent, this);
	// populate rows list
	var rows = [5,10,20,50,100,200,500];
	var rowsList = [];
	for (var i = 0; i < rows.length; i++) {
		rowsList[i] = {name:rows[i], label:rows[i]};
	}
	util.populateSelect('cre_obj:pivot_table:number_of_rows', rowsList, 'name', 'label');
	// populate sort direction
	creUtil.buildSortDirectionList('cre_obj:pivot_table:sort_direction');
}
CrePivotTable.prototype = {
	init: function(reportElementDb) {
		this.reportElementDb = reportElementDb;
		// util.showObject(reportElementDb.columns);
		var i, len, reportField;
		//
		// Handle report fields list
		//
		// KHP 28/Feb/2013 - mainReportFieldName does not anymore exist,
		// use all fields from the columns for lookup.
		// var mainReportFieldName = reportElementDb.report_field;
		var reportElementColumns = reportElementDb.columns;
		var reportFieldsInCols = {};
		for (i = 0, len = reportElementColumns.length; i < len; i++) {
			reportFieldsInCols['_' + reportElementColumns[i].report_field] = true;
		}
		// util.showObject(reportFieldsInCols);
		var fieldList = [{name:'', label:langVar('lang_stats.customize_report_element.select_field')}];
		var queryFieldsDb = this.queryFieldsDb;
		var pivotTable = reportElementDb.pivot_table;
		var pivotReportFieldName = pivotTable.report_field;
		// util.showObject(pivotTable);
		for (i = 0, len = queryFieldsDb.length; i < len; i++) {
			var reportField = queryFieldsDb[i];
			if (!reportField.isAggregatingField) {
				var reportFieldName = reportField.name;
				// KHP 28/Feb/2013 - session categories aren't relevant anymore
				// var category = reportField.category;
				// var isNonSessionField = (category.indexOf('session_') == -1);
				if (!reportFieldsInCols.hasOwnProperty('_' + reportFieldName)) {
					fieldList[fieldList.length] = {name:reportFieldName, label:reportField.label};
				}
			}
		}
		util.populateSelect('cre_obj:pivot_table:report_field', fieldList, 'name', 'label');
		util.setF('cre_obj:pivot_table:report_field', pivotReportFieldName);
		// Handle number of rows
		util.setF('cre_obj:pivot_table:number_of_rows', pivotTable.number_of_rows);
		// Handle omit_parenthesized_items
		util.setF('cre_obj:pivot_table:omit_parenthesized_items', pivotTable.omit_parenthesized_items);
		//
		// Handle sort by
		//
		var sortBy = pivotTable.sort_by;
		var sortDirection = pivotTable.sort_direction;
		var isSortDifferent = (sortBy != '');
		var sortByList = this.getSortByList(this.queryFieldsDb, reportElementColumns);
		var sortBySelected = '';
		if (sortBy != '') {
			if (sortBy != pivotReportFieldName) {
				sortBySelected = sortBy;
			}
			else {
				sortBySelected = '_SELECTED__DRILL_DOWN_FIELD_';
			}
		}
		util.populateSelect('cre_obj:pivot_table:sort_by', sortByList, 'name', 'label');
		util.setF('cre_obj:pivot_table:sort_different', isSortDifferent);
		util.setF('cre_obj:pivot_table:sort_by', sortBySelected);
		util.setF('cre_obj:pivot_table:sort_direction', sortDirection);
		this.sortDifferent(isSortDifferent);
		//
		// Set aggregation rows
		//
		util.setF('cre_obj:pivot_table:show_averages_row', pivotTable.show_averages_row);
		util.setF('cre_obj:pivot_table:show_min_row', pivotTable.show_min_row);
		util.setF('cre_obj:pivot_table:show_max_row', pivotTable.show_max_row);
		util.setF('cre_obj:pivot_table:show_totals_row', pivotTable.show_totals_row);
		//
		// Handle show pivot table
		//
		var isShowPivotTable = pivotTable.show_pivot_table;
		util.setF('cre_obj:pivot_table:show_pivot_table', isShowPivotTable);
		this.showPivotTable(isShowPivotTable);
	},
	toggleShowPivotTable: function(evt, self) {
		var isShowPivotTable = this.checked;
		self.showPivotTable(isShowPivotTable);
	},
	toggleSortDifferent: function(evt, self) {
		var isSortDifferent = this.checked;
		self.sortDifferent(isSortDifferent);
	},
	showPivotTable: function(isShowPivotTable) {
		var a = [
			'cre_obj:pivot_table:report_field',
			'cre_obj:pivot_table:number_of_rows',
			'cre_obj:pivot_table:show_averages_row',
			'cre_obj:pivot_table:show_min_row',
			'cre_obj:pivot_table:show_max_row',
			'cre_obj:pivot_table:show_totals_row',
			'cre_obj:pivot_table:sort_different',
			'cre_obj:pivot_table:omit_parenthesized_items'
		];
		util.enableE(a, isShowPivotTable);
		// Update Sort By section
		var isSortDifferent = isShowPivotTable ? util.getF('cre_obj:pivot_table:sort_different') : false;
		// alert('isSortDifferent: ' + isSortDifferent);
		this.sortDifferent(isSortDifferent);
	},
	sortDifferent: function(isSortDifferent) {
		util.enableE(['cre_obj:pivot_table:sort_by', 'cre_obj:pivot_table:sort_direction'], isSortDifferent);
	},
	getSortByList: function(queryFieldsDb, columns) {
		// Note, the second list item in sort by sorts the 'selected drill down field'
		var list = [{name:'', label:langVar('lang_stats.customize_report_element.select_field')}, {name:'_SELECTED__DRILL_DOWN_FIELD_', label:langVar('lang_stats.customize_report_element.selected_drill_down_field')}];
		// Add any enabled aggregating column
		for (var i = 0; i < columns.length; i++) {
			var column = columns[i];
			if (column.show_percent_column != null) {
				if (column.show_column ||
					column.show_percent_column ||
					column.show_bar_column) {
					var fieldName = column.report_field;
					var fieldLabel = queryFieldsDb[util.h(fieldName)].label;
					list[list.length] = {name:fieldName, label:fieldLabel};
				}
			}
		}
		return list;
	},
	saveChanges: function() {
		// Saves active pivot table data to pivot table object in reportElementDb
		// We always save the "show_pivot_table" value.
		// All other properties are only saved if
		// show_pivot_table is true and if a report field is selected.
		var pivotTable = this.reportElementDb.pivot_table;
		var reportFieldName = util.getF('cre_obj:pivot_table:report_field');
		var isShowPivotTable = (util.getF('cre_obj:pivot_table:show_pivot_table') && (reportFieldName != ''));
		// alert('reportFieldName: ' + reportFieldName);
		pivotTable.show_pivot_table = isShowPivotTable;
		if (isShowPivotTable) {
			// Save all other data to pivot table object
			pivotTable.report_field = reportFieldName;
			pivotTable.number_of_rows = util.getF('cre_obj:pivot_table:number_of_rows');
			pivotTable.omit_parenthesized_items = util.getF('cre_obj:pivot_table:omit_parenthesized_items');
			pivotTable.show_averages_row = util.getF('cre_obj:pivot_table:show_averages_row');
			pivotTable.show_min_row = util.getF('cre_obj:pivot_table:show_min_row');
			pivotTable.show_max_row = util.getF('cre_obj:pivot_table:show_max_row');
			pivotTable.show_totals_row = util.getF('cre_obj:pivot_table:show_totals_row');
			var sortBy = util.getF('cre_obj:pivot_table:sort_by');
			var isSortDifferent = (util.getF('cre_obj:pivot_table:sort_different') && (sortBy != ''));
			var sortDirection = '';
			if (isSortDifferent) {
				if (sortBy == '_SELECTED__DRILL_DOWN_FIELD_') {
					sortBy = reportFieldName;
				}
				sortDirection = util.getF('cre_obj:pivot_table:sort_direction');
			}
			else {
				sortBy = '';
				sortDirection = 'descending';
			}
			pivotTable.sort_by = sortBy;
			pivotTable.sort_direction = sortDirection;
		}
		// util.showObject(pivotTable);
	}
};
//
//
// creGraphOptions.js (Customize Report Element GraphOptions Class, used in Reports and Reports Editor)
//
//
CreGraphOptions = function(queryFieldsDb, defaultGraphsDb) {
	// this.defaultGraphs = defaultGraphs; // A reference to defaultGraphs
	var YE = YAHOO.util.Event;
	this.queryFieldsDb = queryFieldsDb; // A reference to all report fields from where we get the labels and category
	this.defaultGraphsDb = defaultGraphsDb;
	this.reportElementDb = {};  // A reference to the active report element data.
								// Note, if no table is shown we may set sort_by and sort_direction
								// of the report element via Graph Options.
	this.activeGraphsDb = {}; // The active graphsDb object which is created upon init(). It is
							// equal the defaultGraphsDb but overriden with active reportElementDb
							// graphs data.
	this.showTable = false;  // Set upon init(), We need to know if the report element shows a table as well
							// because if no table is shown we need a full Sort By list in Graph Options
	this.isChronoGraphSupport = false; // Set upon init(), it is true if the report element supports a chrono graph
	// this.activeMetaGraphType = ''; NOT REQUIRED because the active metaGraphType is defined in activeGraphsDb!
	//
	// Init the GUI
	//
	creUtil.buildSortDirectionList('cre_obj:graph_options:sort_direction');
	YE.addListener('cre_obj:graph_options:type', 'change', this.graphTypeActor, this);
	YE.addListener('cre_obj:graph_options:sort_by', 'change', this.sortByActor, this);
	YE.addListener('cre_obj:graph_options:sort_direction', 'change', this.sortDirectionActor, this);
	// YE.addListener('cre_obj:graph_options:show_legend', 'click', this.showLegendActor, this);
};
CreGraphOptions.prototype = {
	init: function(reportElementDb) {
		// alert('creUtil.GraphOptions.prototype.init');
		this.reportElementDb = reportElementDb;
		var activeGraphsDb = this.createActiveGraphsDbObject(reportElementDb);
		this.activeGraphsDb = activeGraphsDb;
		this.showTable = reportElementDb.show_table;
		this.updateGraphTypeList(activeGraphsDb.isChronoGraphSupport);
		// util.showObject(activeGraphsDb);
		var metaGraphType = activeGraphsDb.metaGraphType;
		util.setF('cre_obj:graph_options:type', metaGraphType);
		this.updateForm(metaGraphType);
	},
	updateForm: function(metaGraphType) {
		// alert('updateForm() - metaGraphType: ' + metaGraphType);
		// var activeGraphsDb = this.activeGraphsDb;
		// util.showObject(activeGraphsDb);
		// Get a reference to the active graph object from which we read the data
		var graphObj = this.getGraphObjectReference(metaGraphType);
		// util.showObject(graphObj);
		var isChronoGraph = (metaGraphType.indexOf('chrono_') != -1);
		var isPieChart = (metaGraphType == 'pie');
		var isSortAllDescending = graphObj.sort_all_descending;
		this.updateSortByForm(isChronoGraph, isSortAllDescending);
		util.setF('cre_obj:graph_options:y_axis_height', graphObj.y_axis_height);
		util.setF('cre_obj:graph_options:x_axis_length', graphObj.x_axis_length);
		util.setF('cre_obj:graph_options:display_graphs_side_by_side', this.reportElementDb.display_graphs_side_by_side);
		util.showE('cre_obj:graphs:variables_and_legend_box', !isChronoGraph);
		var showLegend = !isChronoGraph ? graphObj.show_legend : false;
		if (!isChronoGraph) {
			util.setF('cre_obj:graph_options:max_variables', graphObj.max_variables);
			util.setF('cre_obj:graph_options:show_remainder', graphObj.show_remainder);
			// util.disableE('cre_obj:graph_options:show_remainder', isPieChart);
			util.showE('cre_obj:graph_options:show_remainder:section', !isPieChart);
			util.setF('cre_obj:graph_options:show_legend', showLegend);
			util.setF('cre_obj:graph_options:show_values_in_legend', graphObj.show_values_in_legend);
			util.setF('cre_obj:graph_options:show_percent_in_legend', graphObj.show_percent_in_legend);
			util.setF('cre_obj:graph_options:max_legend_rows', graphObj.max_legend_rows);
			if (isPieChart) {
				util.setF('cre_obj:graph_options:show_3d', graphObj.show_3d);
			}
		}
		if (!isPieChart) {
			util.setF('cre_obj:graph_options:show_percent_on_y_axis', graphObj.show_percent_on_y_axis);
		}
		util.showE('cre_obj:graph_options:show_3d_section', isPieChart);
		util.showE('cre_obj:graph_options:show_percent_on_y_axis:section', !isPieChart);
		// util.disableE('cre_obj:graph_options:show_legend', isChronoGraph);
	},
	updateSortByForm: function(isChronoGraph, isSortAllDescending) {
		if (isChronoGraph || this.showTable) {
			this.updateSortByList(isChronoGraph, isSortAllDescending);
		}
		else {
			// There is no table and no chrono graph, so we allow to select a report field
			// and the sort direction (sortAllDescending is still possible)
			this.updateSortByListWithReportFields(isSortAllDescending);
		}
	},
	graphTypeActor: function(evt, self) {
		// alert('graphTypeActor()');
		var newMetaGraphType = util.getF('cre_obj:graph_options:type');
		// Before we update the form save current data to activeGraphs
		self.saveChangesToGraphObject(self.activeGraphsDb.metaGraphType);
		// Update the form
		self.updateForm(newMetaGraphType);
		self.activeGraphsDb.metaGraphType = newMetaGraphType;
	},
	sortByActor: function(evt, self) {
		var sortBy = util.getF('cre_obj:graph_options:sort_by');
		// var graphsDb = self.graphsDb;
		var metaGraphType = self.activeGraphsDb.metaGraphType;
		var isChronoGraph = (metaGraphType.indexOf('chrono_') != -1);
		var graphObj = self.getGraphObjectReference(metaGraphType);
		var isSortAllDescending = (sortBy == '__ALL__DESC__TRUE__') ? true : false;
		if (!isChronoGraph && !self.showTable && !isSortAllDescending) {
			//
			// Handle sort by with report fields
			//
			var reportElementDb = self.reportElementDb;
			reportElementDb.sort_by = sortBy;
			// Set sort direction in case that it has not yet been set upon init
			util.setF('cre_obj:graph_options:sort_direction', reportElementDb.sort_direction);
			util.showEV('cre_obj:graph_options:sort_direction', !isSortAllDescending);
			util.enableE('cre_obj:graph_options:sort_direction', !isSortAllDescending);
		}
		graphObj.sort_all_descending = isSortAllDescending;
	},
	sortDirectionActor: function(evt, self) {
		// We update sort_direction of reportElementDb, this case is only possible
		// if no table is displayed and a report field is selected in sort_by list.
		self.reportElementDb.sort_direction = util.getF('cre_obj:graph_options:sort_direction');
	},
//	showLegendActor: function(evt, self) {
//
//		var graphObj = self.getGraphObjectReference(self.activeGraphsDb.metaGraphType);
//		// util.showObject(graphObj);
//		graphObj.show_legend = this.checked;
//	},
	//
	//
	// Check sort by integrity
	//
	//
	//checkSortByIntegrity: function() {
		// This function is called from creGraphs.js and checks the sort_by integrity when a graph field in "graphs" becomes deselected.
		// We only need to check the sort_by integrity if no table is active (this.showTable = false) and if we have a non-chrono graph,
		// in this case we need to update the sort_by list according the active graph fields.
		// alert('creGraphOptions.js - checkSortByIntegrity()');
	//},
	// 
	//
	// Utilities
	//
	//
	getGraphObjectReference: function(metaGraphType) {
		var activeGraphsDb = this.activeGraphsDb;
		var graphObj;
		if (metaGraphType == 'chrono_bar' || metaGraphType == 'chrono_line') {
			graphObj = activeGraphsDb.chrono_bar_line_graph;
		}
		else if (metaGraphType != 'pie') {
			graphObj = activeGraphsDb.bar_line_graph;
		}
		else {
			graphObj = activeGraphsDb.pie_chart;
		}
		return graphObj;
	},
	updateGraphTypeList: function(isChronoGraphSupport) {
		var list = [];
		if (isChronoGraphSupport) {
			list[0] = {name:'chrono_bar', label:langVar('lang_stats.customize_report_element.chrono_bar_graph')};
			list[1] = {name:'chrono_line', label:langVar('lang_stats.customize_report_element.chrono_line_graph')};
		}
		list[list.length] = {name:'bar', label:langVar('lang_stats.customize_report_element.bar_graph')};
		list[list.length] = {name:'line', label:langVar('lang_stats.customize_report_element.line_graph')};
		// KHP 06/Feb/2013 - Don't allow pie for chronological fields
		// KHP 28/Feb/2013 - Looks like that there are profiles out which already use a pie chart for chrono fields!
		// 					 So we need to support pie charts for chronological fields, this makes the most sense anyway.
		list[list.length] = {name:'pie', label:langVar('lang_stats.customize_report_element.pie_chart')};
		util.populateSelect('cre_obj:graph_options:type', list, 'name', 'label');
	},
	updateSortByList: function(isChronoGraph, isSortAllDescending) {
		var list = [];
		var activeSortItem = isSortAllDescending ? '__ALL__DESC__TRUE__' : '__ALL__DESC__FALSE__';
		if (isChronoGraph) {
			list[0] = {name:'__ALL__DESC__FALSE__', label:langVar('lang_stats.customize_report_element.chronological')};
			list[1] = {name:'__ALL__DESC__TRUE__', label:langVar('lang_stats.customize_report_element.reverse_chronological')};
		}
		else {
			list[0] = {name:'__ALL__DESC__TRUE__', label:langVar('lang_stats.customize_report_element.all_descending')};
			list[1] = {name:'__ALL__DESC__FALSE__', label:langVar('lang_stats.customize_report_element.as_defined_for_table')};
		}
		util.populateSelect('cre_obj:graph_options:sort_by', list, 'name', 'label');
		util.setF('cre_obj:graph_options:sort_by', activeSortItem);
		// Hide sort_direction
		util.hideEV('cre_obj:graph_options:sort_direction');
		util.disableE('cre_obj:graph_options:sort_direction');
	},
	updateSortByListWithReportFields: function(isSortAllDescending) {
		// No Table tab is shown and no chrono graph is selected,
		// so the sort_by list shows 'sort_all_descending = true'
		//  which applies to the graphs object and in addition it shows
		// all active graphs report fields of reportElementDb which
		// applies to sort_by and sort_direction.
		var list = [];
		list[0] = {name:'__ALL__DESC__TRUE__', label:langVar('lang_stats.customize_report_element.all_descending')};
		// Add all active fields
		var queryFieldsDb = this.queryFieldsDb;
		var reportElementDb = this.reportElementDb;
		var columns = reportElementDb.columns;
		// Note, for now we add all graph fields, we don't care if a field is checked or not!
		for (var i = 0; i < columns.length; i++) {
			var column = columns[i];
			// Add all text and aggreagting fields because sort_by could just be any field@
			var reportFieldName = column.report_field;
			var label = queryFieldsDb[util.h(reportFieldName)].label;
			list[list.length] = {name:reportFieldName, label:label};
		}
		//
		// Set active sort item and sort direction list
		//
		util.populateSelect('cre_obj:graph_options:sort_by', list, 'name', 'label');
		var activeSortItem;
		var showSortDirection;
		if (isSortAllDescending) {
			activeSortItem = '__ALL__DESC__TRUE__';
			showSortDirection = false;
		}
		else {
			activeSortItem = reportElementDb.sort_by;
			sort_direction = reportElementDb.sort_direction;
			util.setF('cre_obj:graph_options:sort_direction', sort_direction);
			showSortDirection = true;
		}
		util.setF('cre_obj:graph_options:sort_by', activeSortItem);
		util.showEV('cre_obj:graph_options:sort_direction', showSortDirection);
		util.enableE('cre_obj:graph_options:sort_direction', showSortDirection);
	},
	saveChangesToGraphObject: function(metaGraphType) {
		// This saves the current graphs state to activeGraphsDb but not to the reportElementDb object!
		// We save data to the graph object to keep state when switching between types
		// and to get the final graph object upon exit.
		// Note, we do form validation but auto-fix invalid form values by keeping default values
		var isChronoGraph = (metaGraphType.indexOf('chrono_') != -1);
		var graphObj = this.getGraphObjectReference(metaGraphType);
		var y = util.getF('cre_obj:graph_options:y_axis_height');
		var x = util.getF('cre_obj:graph_options:x_axis_length');
		if (util.isInteger(y, 1)) {graphObj.y_axis_height = y;}
		if (util.isInteger(x, 1)) {graphObj.x_axis_length = x;}
		if (!isChronoGraph) {
			graphObj.show_legend = util.getF('cre_obj:graph_options:show_legend');
			graphObj.show_values_in_legend = util.getF('cre_obj:graph_options:show_values_in_legend');
			graphObj.show_percent_in_legend = util.getF('cre_obj:graph_options:show_percent_in_legend');
			var maxVariables = util.getF('cre_obj:graph_options:max_variables');
			if (util.isInteger(maxVariables, 1)) {graphObj.max_variables = maxVariables;}
			graphObj.show_remainder = util.getF('cre_obj:graph_options:show_remainder');
			maxLegendRows = util.getF('cre_obj:graph_options:max_legend_rows');
			if (util.isInteger(maxLegendRows, 1)) {graphObj.max_legend_rows = maxLegendRows;}
			if (metaGraphType == 'pie') {
				graphObj.show_3d = util.getF('cre_obj:graph_options:show_3d');
			}
		}
		graphObj.show_percent_on_y_axis = util.getF('cre_obj:graph_options:show_percent_on_y_axis');
	},
	saveChanges: function() {
		// This saves the current graphs state to the reportElementDb object!
		var metaGraphType = this.activeGraphsDb.metaGraphType;
		// Save graph object
		this.saveChangesToGraphObject(metaGraphType);
		// Get graphType as saved in reportElementDb
		var isChrono = (metaGraphType.indexOf('chrono_') != -1);
		var graphType = '';
		if (isChrono) {
			graphType = (metaGraphType == 'chrono_bar') ? 'bar' : 'line';
		}
		else {
			graphType = metaGraphType;
		}
		// Get the graph object
		var graphObject = this.getGraphObjectReference(metaGraphType);
		// Clean up reportElementDb from existing graphs object.
		var reportElementDb = this.reportElementDb;
		var prop;
		// Copy graphsObj to reportElementDb.graphs
		reportElementDb.graphs = util.cloneObject(graphObject);
		// Set graphType which is not part of the graphsObj
		reportElementDb.graphs.graph_type = graphType;
		// Handle sort_by in case of show_graphs=true and show_table=false
		// In this case we need to re-check sort_by and sort_direction.
        if (!isChrono && !graphObject.sort_all_descending && !this.showTable) {
            // Get sort_by and sort_direction
            reportElementDb.sort_by = util.getF('cre_obj:graph_options:sort_by');
            reportElementDb.sort_direction = util.getF('cre_obj:graph_options:sort_direction');
        }
		reportElementDb.display_graphs_side_by_side = util.getF('cre_obj:graph_options:display_graphs_side_by_side');
        // util.showObject(graphObject, "graphObject");
        // util.showObject(reportElementDb, "reportElementDb");
	},
	createActiveGraphsDbObject: function(reportElementDb) {
		// Creates an active graphsDb object with any active report element graphs data.
		// graphsDb keeps the graph data state while customizing report element graphs data
		// util.showObject(reportElementDb);
		var activeGraphsDb = util.cloneObject(this.defaultGraphsDb);
		var isChronoGraphSupport = creUtil.getIsChronoGraphSupport(this.queryFieldsDb, reportElementDb.columns);
		var graphType = '';
		var isChronoGraph = false;
		if (reportElementDb['graphs'] && reportElementDb.graphs['graph_type']) {
			var reportElementGraphs = reportElementDb.graphs;
			// util.showObject(reportElementGraphs);
			graphType = reportElementGraphs.graph_type;
			isChronoGraph = (isChronoGraphSupport && (graphType != 'pie')  && (reportElementGraphs['show_chrono_graph'] != null) && reportElementGraphs.show_chrono_graph);
			var overrideTarget;
			if (isChronoGraph) {
				overrideTarget = activeGraphsDb.chrono_bar_line_graph;
			}
			else if (graphType != 'pie') {
				overrideTarget = activeGraphsDb.bar_line_graph;
			}
			else {
				overrideTarget = activeGraphsDb.pie_chart;
			}
			// util.showObject(overrideTarget);
			for (prop in reportElementGraphs) {
				// alert('prop: ' + prop);
				if (overrideTarget[prop] != null) {
					// Override default
					// alert('Override prop "' + prop + '" with value: ' + reportElementGraphs[prop]);
					overrideTarget[prop] = reportElementGraphs[prop];
				}
			}
		}
		else {
			// There is no report element graphs, so we use default settings as defined
			// in activeGraphsDb
			graphType = isChronoGraphSupport ? activeGraphsDb.chrono_graph_type : activeGraphsDb.graph_type;
			isChronoGraph = (isChronoGraphSupport && graphType != 'pie');
		}
		// Set meta graph type
		var metaGraphType = !isChronoGraph ? graphType : 'chrono_' + graphType;
		// alert('graphType: ' + graphType + '\nmetaGraphType: ' + metaGraphType);
		activeGraphsDb.isChronoGraphSupport = isChronoGraphSupport;
		activeGraphsDb.metaGraphType = metaGraphType;
		// util.showObject(activeGraphsDb);
		return activeGraphsDb;
	}
};
//
//
// creControl.js 
//
// Main object to handle Customize Report Element HTML object.        
// This object requires
// creGraphs.js
// creTable.js
// creTableOptions.js
// crePivotTable.js
// creGraphOptions.js
// creUtil.js
//
var creControl = {
	tabs: null,
	tabIds: [],
	queryFieldsDb: [], // Object reference to queryFieldsDb
	isCustomizeInReports: false,
	isPivotTablePermission: true,
	isGraphOptionsPermission: true,
	reportElementDb: {}, // Object reference to the active reportElementDb, it is set by initReportElementDb
	// graphsDb contains the active graphs object (default graphs overwritten by any report element graphs data)
	// graphsDb is used by creGraphs and creGraphOptions
	// graphsDb: {}, // Object reference to the active graphs object
	// Main Customize Report Element objects
	// general: null --> This tab panel object is currently handled in reportElement.js!
	general: null,
	graphs: null,
	table: null,
	tableOptions: null,
	pivotTable: null,
	graphOptions: null,
	//
	//
	// Initializes creControl object
	//
	//
	initCreObject: function(
			queryFieldsDb,
			defaultGraphsDb,
			isCustomizeInReports,
			isPivotTablePermission,
			isGraphOptionsPermission,
			hideLogDetailSortingMessage) {
		creControl.queryFieldsDb = queryFieldsDb;
		creControl.defaultGraphsDb = defaultGraphsDb;
		creControl.isCustomizeInReports = isCustomizeInReports;
		creControl.isPivotTablePermission = isPivotTablePermission;
		creControl.isGraphOptionsPermission = isGraphOptionsPermission;
		var YE = YAHOO.util.Event;
		// util.showObject(defaultGraphsDb);
		//
		// Init tabs
		//
		if (isCustomizeInReports) {
			creControl.tabIds = ['graphs', 'table', 'table_options', 'pivot_table', 'graph_options'];
		}
		else {
			creControl.tabIds = ['general', 'filters', 'graphs', 'table', 'table_options', 'pivot_table', 'graph_options', 'session_fields'];
		}
		creControl.tabs = new util.Tabs3('cre_obj:tabs', creControl.tabIds, creControl.tabActivated);
		//
		// Init Customize Report Element objects
		//
		creControl.graphs = new CreGraphs(queryFieldsDb);
		creControl.table = new CreTable(queryFieldsDb, isCustomizeInReports, hideLogDetailSortingMessage);
		creControl.tableOptions = new CreTableOptions(queryFieldsDb, isCustomizeInReports);
		creControl.pivotTable = new CrePivotTable(queryFieldsDb);
		creControl.graphOptions = new CreGraphOptions(queryFieldsDb, defaultGraphsDb);
		// Set graphOptions reference in graphs object!
		// creControl.graphs.setGraphOptionsReference(creControl.graphOptions);
		//
		// Init General panel, Filters panel and Manage Fields Editor
		//
		if (!isCustomizeInReports) {
			creGeneral.init();
			creFilters.init();
			creSessionFields.init();
			reportElementMF.init();
			YE.addListener('cre_obj:graphs:manage_fields_btn', 'click', creControl.manageFields);
			YE.addListener('cre_obj:table:manage_fields_btn', 'click', creControl.manageFields);
		}
	},
	//
	//
	// Init a reportElementDb object (Set all tab objects according the reportElementDb object)
	// init is called upon every report element meta type change!
	//
	//
	init: function(reportElementDb, obj) {
		// obj.defaultTabId and obj.totalRows are optional, respectively they are only specified
		// if the CRE object is used in dynamic reports or in Config when init() is called
		// from Manage Fields panel.
		// alert('creControl.init() - obj.defaultTabId: ' + obj.defaultTabId);
		// util.showObject(reportElementDb);
		var isCustomizeInReports = creControl.isCustomizeInReports;
		var totalRows = obj.hasOwnProperty('totalRows') ? obj.totalRows : 0;
		var defaultTabId = obj.hasOwnProperty('defaultTabId') ? obj.defaultTabId : '';
		creControl.reportElementDb = reportElementDb;
		// util.showObject(reportElementDb);
		var reportElementType = reportElementDb.type;
		// Handle the general and filters tab dependencies
		if (!isCustomizeInReports) {
			// Note, creGeneral and creFilters form update is not required here, it is only
			// accomplished upon openeing the CRE element in callee!
			// We only handle some display issues depending on the report element type at this point
			creGeneral.setReportElementTypeDependencies(reportElementType);
			creFilters.setReportElementTypeDependencies(reportElementType);
		}
//		if (reportElementType == 'overview') {
//
//			creControl.table.init(reportElementDb);
//		}
		if (reportElementType == 'table') {
			// We update all panels regardless if all panels
			// are displayed or not because the tab panels
			// could be changed any time via show_graphs and show_table
			creControl.table.init(reportElementDb, totalRows);
			creControl.tableOptions.init(reportElementDb, totalRows);
			creControl.graphs.init(reportElementDb);
			creControl.graphOptions.init(reportElementDb);
			creControl.pivotTable.init(reportElementDb);
		}
		else if (reportElementType == 'overview' ||
				reportElementType == 'log_detail') {
			creControl.table.init(reportElementDb);
			creControl.tableOptions.init(reportElementDb, totalRows);
		}
		else if (reportElementType == 'session_paths' || reportElementType == 'session_page_paths') {
			creControl.tableOptions.init(reportElementDb, totalRows);
			if (!isCustomizeInReports) {
				creSessionFields.updateForm(reportElementDb);
			}
		}
		else if (reportElementType == 'sessions_overview' && !isCustomizeInReports) {
			creSessionFields.updateForm(reportElementDb);
		}
		//
		// Set the tab sequence
		//
		creControl.updateTabSequence(defaultTabId);
	},
	saveAndReInitGraphOptions: function() {
		// This saves and re-inits the graphs due a change in
		// reportElementDb.show_graphs and  reportElementDb.show_table property.
		// A change in this two properties (which are conrolled outside creControl)
		// most likely changes the graphs sorting parameters.
		creControl.graphOptions.saveChanges();
		creControl.graphOptions.init(creControl.reportElementDb);
	},
	//
	//
	// Save changes to reportElementDb
	//
	//
	saveChanges: function() {
		// Note, some CRE interactions are already saved in ReportElementDb,
		// so we only save the remaining data to the ReportElementDb
		var isCustomizeInReports = creControl.isCustomizeInReports;
		var reportElementDb = creControl.reportElementDb;
		var reportElementType = reportElementDb.type;
		// util.showObject(reportElementDb);
		if (!isCustomizeInReports) {
			// Save creGeneral and creFilters data
			creGeneral.saveChanges(reportElementDb);
			creFilters.saveChanges(reportElementDb);
		}
		if (reportElementType == 'table') {
			// Note, we save graphs and table, also if only
			// one of the two is actually active. This shouldn't
			// matter because default data alwyas exist for graphs
			// and table. The only exception is the log_detail report
			// element which only has table and tableOptions data.
			creControl.tableOptions.saveChanges();
			creControl.pivotTable.saveChanges();
			creControl.graphOptions.saveChanges();
		}
		else if (reportElementType == 'overview' ||
				reportElementType == 'log_detail') {
			creControl.tableOptions.saveChanges();
		}
		else if (reportElementType == 'session_paths' || reportElementType == 'session_page_paths') {
			creControl.tableOptions.saveChanges();
			if (!isCustomizeInReports) {
				creSessionFields.saveChanges(reportElementDb);
			}
		}
		else if (reportElementType == 'sessions_overview' && !isCustomizeInReports) {
			creSessionFields.saveChanges(reportElementDb);
		}
	},
	//
	//
	// Manage Fields
	//
	//
	manageFields: function() {
		// Track the tabId so that we show the right tab upon saving the fields in reportElementMF.js
		var defaultTabId = (this.id == 'cre_obj:graphs:manage_fields_btn') ? 'graphs' : 'table';
		reportElementMF.openPanel(defaultTabId);
	},
	//
	//
	// Tabs handling
	//
	//
	tabActivated: function(tabId) {
		// alert('customizeRE.tabActivated() - tabActivated: ' + tabId);
		// KHP-RC, IE6 invokes tabActivated() twice, the argument tabId is
		// first an object and the second time the actual tabId string.
		// The reason is not yet known, it could be something wrong with
		// the event function or with the self reference object in the tab3 class.
		// This has to be fixed. In the meantime we work around this 
		// problem by checking the argument to be not an object, via !isObject()
		if (!util.isObject(tabId)) { // isObject has be addded due the above described IE problem
			creControl.setTabPanel(tabId);
			// if (tabId == 'graphs') {
				// KHP-RC - resolve this function!
				// customizeRE.graphs.checkGraphsFormIntegrity();
			// }
		}
	},
	setTabPanel: function(tabId) {
		var tabIds = creControl.tabIds;
		for (var i = 0; i < tabIds.length; i++) {
			util.hideE('cre_obj:' + tabIds[i] + ':panel');
		}
		util.showE('cre_obj:' + tabId + ':panel');
		creControl.tabs.setActiveTab(tabId);
	},
	updateTabSequence: function(optionalDefaultTabId) {
		// Note, defaultTabId is optional!
		var defaultTabId = optionalDefaultTabId ? optionalDefaultTabId : '';
		// setTabSequence is called upon init() but also from outside creControl
		// upon show_table or show_graphs changes. In this case we don't need
		// to update any tab panel data but only change the tab sequence
		// and set a defaultTabId if not yet given.
		var reportElementDb = creControl.reportElementDb;
		var reportElementType = reportElementDb.type;
		var isCustomizeInReports = creControl.isCustomizeInReports;
		// var showCreObjectPanel;
		var tabSequence = [];
		if (!isCustomizeInReports) {
			// We always show the general and filters tab in Config!
			tabSequence[0] = 'general';
			tabSequence[1] = 'filters';
		}
		if (reportElementType == 'table') {
			var showGrahps = reportElementDb.show_graphs;
			var showTable = reportElementDb.show_table;
			if (showGrahps) {
				tabSequence[tabSequence.length] = 'graphs';
			}
			if (showTable) {
				tabSequence[tabSequence.length] = 'table';
				tabSequence[tabSequence.length] = 'table_options';
				if (creControl.isPivotTablePermission) {
					tabSequence[tabSequence.length] = 'pivot_table';
				}
			}
			if (showGrahps && creControl.isGraphOptionsPermission) {
				tabSequence[tabSequence.length] = 'graph_options';
			}
		}
//		else if (reportElementType == 'overview') {
//
//			tabSequence[tabSequence.length] = 'table';
//		}
		else if (reportElementType == 'overview' ||
				reportElementType == 'log_detail') {
			// overview and log_detail are limited to table and table_options
			tabSequence[tabSequence.length] = 'table';
			tabSequence[tabSequence.length] = 'table_options';
		}
		else if (reportElementType == 'session_paths'  || reportElementType == 'session_page_paths') {
			tabSequence[tabSequence.length] = 'table_options';
			if (!isCustomizeInReports) {
				tabSequence[tabSequence.length] = 'session_fields';
			}
		}
		else if (reportElementType == 'sessions_overview' && !isCustomizeInReports) {
			tabSequence[tabSequence.length] = 'session_fields';
		}
		if (defaultTabId == '') {
			// Use first tab of tabSequence
			defaultTabId = tabSequence[0];
		}
		// Set tab sequence and tab panel
		creControl.tabs.setSequence(tabSequence, defaultTabId);
		creControl.setTabPanel(defaultTabId);
	}
};
// 
// logDetailSortingMsg
//
var logDetailSortingMsg = function() {
	var GD = { // General global data
		panel: null,
		isReportsGUI: false,
		isColumnsSort: false,
		hideMessage: false,
		// Variables required for the 
		// the callee response
		reportElementName: '',
		sortBy: '',
		sortDirection: ''
	};
	function init() {
		var panelObj = {
			panelId: 'log_detail_sorting_msg:panel',
			panelClassName: 'panel-50',
			panelHeaderLabel: langVar('lang_stats.log_detail_sorting.label'),
			zIndex: 60,
			isCover: true,
			closeEvent: logDetailSortingMsg.closeSimple
		};
		GD.panel = new util.Panel3(panelObj);
		YAHOO.util.Event.addListener('log_detail_sorting_msg:continue_btn', 'click', continueSorting);
		YAHOO.util.Event.addListener('log_detail_sorting_msg:cancel_btn', 'click', closeAdvanced);
		YAHOO.util.Event.addListener('log_detail_sorting_msg:ok_btn', 'click', closeAdvanced);
	}
	function setDisplay() {
		util.showE('log_detail_sorting_msg:msg_in_reports', GD.isReportsGUI);
		util.showE('log_detail_sorting_msg:msg_in_config', !GD.isReportsGUI);
		util.showE('log_detail_sorting_msg:click_continue_to_sort', GD.isColumnsSort);
		util.showE('log_detail_sorting_msg:continue_btn_section', GD.isColumnsSort);
		util.showE('log_detail_sorting_msg:ok_btn_section', !GD.isColumnsSort);
	}
	function openViaColumnsSort(isReportsGUI, reportElementName, sortBy, sortDirection) {
		// Opened in Reports upon sort column click
		GD.isReportsGUI = isReportsGUI;
		GD.isColumnsSort = true;
		GD.reportElementName = reportElementName;
		GD.sortBy = sortBy;
		GD.sortDirection = sortDirection;
		open();
	}
	function openViaCustomizeReportElement(isReportsGUI) {
		// Opened in reports or Config via sort by change in Customize Report Element
		GD.isReportsGUI = isReportsGUI;
		GD.isColumnsSort = false;
		open();
	}
	function open() {
		// If "Don't show this message again ..." hasn't been checked yet
		if (!GD.hideMessage) {
			if (GD.panel == null) {
				init();
			}
			setDisplay();
			GD.panel.prePositionAtCenter();
			GD.panel.open();
		}
	}
	function closeSimple() {
		// Closes the window via close icon only.
		// The "Don't show message again" state is ignored.
		// Close the panel
		GD.panel.close();
	}
	function closeAdvanced() {
		// Closes the window via button but not via close icon.
		// This considers the checked state of "Don't show message again"
		// Don't show message again if checked.
		if (util.getF('log_detail_sorting_msg:hide_msg_btn')) {
			setHideLogDetailSortingMessage();
		}
		// Close the panel
		GD.panel.close();
	}
	function continueSorting() {
		// Only possible when called via openViaColumnsSort(), continue
		// the actual sort operation in reports.
		// Don't show message again if checked.
		if (util.getF('log_detail_sorting_msg:hide_msg_btn')) {
			setHideLogDetailSortingMessage();
		}
		// Continue sort operation in newReport.js
		newReport.sortColumnContinued(GD.reportElementName, GD.sortBy, GD.sortDirection);
		// Close the panel
		GD.panel.close();
	}
	function setHideLogDetailSortingMessage() {
		// This sets hide_log_detail_sorting_message_in_reports on the server side.
		// users_cache.[user node name].peferences.hide_log_detail_sorting_message_in_reports = true
		var info = GD.isReportsGUI ? reportInfo : pageInfo;
		var profileName = info.profileName;
		var pageToken = info.pageToken;
		GD.hideMessage = true;
		var url = '?dp=util.log_detail_sorting.hide_log_detail_sorting_msg';
		url += '&p=' + profileName;
		var dat = 'v.fp.page_token=' + pageToken + '&';
		dat += 'v.fp.is_reports_gui=' + GD.isReportsGUI;
		util.serverPost(url, dat);
	}
	function setHideLogDetailSortingMessageResponse() {
		// Server response, no action required
	} 
	//
	//
	// Return global properties and methods (accessible from outside the logDetailSortingMsg namespace)
	//
	//
	return {
		openViaColumnsSort: openViaColumnsSort,
		openViaCustomizeReportElement: openViaCustomizeReportElement,
		setHideLogDetailSortingMessageResponse: setHideLogDetailSortingMessageResponse
	}
}();
//
// repFiltersUtil - used in reports and in scheduler
//
//
/* global
	globalFilter: false */
var repFiltersUtil = (function() {
	'use strict';
	function getIsValidFilterFields(queryFieldsDb, theFilterItem) {
		// This checks if the report field used in the filter item
		// actually exists in the queryFieldsDb.
		// Expressions are ignored, respectively assumed to be valid.
		// util.showObject(theFilterItem);
		var filterType = theFilterItem.filterType;
		var isValid = true;
//		console.log('getIsValidFilterFields() - filterType: ' + filterType);
		if (filterType === 'field') {
			var fieldName = theFilterItem.fieldName;
			isValid = typeof queryFieldsDb[util.h(fieldName)] !== 'undefined';
		}
//		console.log('getIsValidFilterFields() - isValid: ' + isValid);
		return isValid;
	}
	function getFilterItemAsString(theFilterItem) {
		// Returns a filterItem as string without isActive state.
		// This is used to check for existing filter items.
		var filterType = theFilterItem.filterType;
		var s = filterType;
		if (filterType == 'field') {
			s += theFilterItem.fieldName;
			s += theFilterItem.expressionType;
		}
		if (filterType == 'expression') {
			s += theFilterItem.label;
		}
		else {
			s += theFilterItem.isNegated;
		}
		s += theFilterItem.itemValue;
		return s;
	}
	function getFilterGroupId(theFilterGroup) {
		// Returns a filterGroup as string for comparison
//		util.showObject(theFilterGroup);
		var filterItems = theFilterGroup.items;
		var s = 'group_' + theFilterGroup.label;
		for (var i = 0, len = filterItems.length; i < len; i++) {
			s += getFilterItemAsString(filterItems[i]);
		}
		return s;
	}
	function getFilterItemDat(pathName, item, isItemInGroup) {
		var dat = '';
		var filterType = item.filterType;
		if (!isItemInGroup) {
			dat += pathName + '.is_active=' + item.isActive + '&';
		}
		dat += pathName + '.filter_type=' + filterType + '&';
		if (filterType != 'expression') {
			dat += pathName + '.is_negated=' + item.isNegated + '&';
            if (filterType == 'field') {
                dat += pathName + '.field_name=' + item.fieldName + '&';
                dat += pathName + '.expression_type=' + item.expressionType + '&';
            }
            else if (filterType == 'within_matches') {
                dat += pathName + '.within_field_name=' + encodeURIComponent(item.withinFieldName) + '&';
                dat += pathName + '.matches_field_name=' + encodeURIComponent(item.matchesFieldName) + '&';
            }
		}
		else {
			dat += pathName + '.label=' + encodeURIComponent(item.label) + '&';
		}
		dat += pathName + '.item_value=' + encodeURIComponent(item.itemValue) + '&';
		return dat;
	}
	function getGroupValuesByKey(filterItems, key, activeItemId) {
		// Creates an array of group labels or group names with all labels/names, except for activeItemId.
		// activeItemId is empty '' for new groups
		var a = [];
		for (var i = 0, len = filterItems.length; i < len; i++) {
			var item = filterItems[i];
			if (item.isGroup && item.id !== activeItemId) {
				a.push(item[key]);
			}
		}
		return a;
	}
	// Return global properties and methods
	return {
		getIsValidFilterFields: getIsValidFilterFields,
		getFilterItemAsString: getFilterItemAsString,
		getFilterGroupId: getFilterGroupId,
		getFilterItemDat: getFilterItemDat,
		getGroupValuesByKey: getGroupValuesByKey
	};
}());
//
// reportFiltersPanel.js
// This class handles report filter items and groups
// in reports and scheduler.
//
/* global
	globalFilter: false,
	filterItemEditor: false,
	filterGroupEditor: false,
	repFiltersUtil: false */
var ReportFiltersPanel = (function() {
	'use strict';
	var YE = YAHOO.util.Event,
//		YD = YAHOO.util.Dom,
		YL = YAHOO.lang;
	var Filters = function(conf) {
//		util.showObject(conf);
		this.containerId = conf.containerId;
		this.headerClassName = conf.headerClassName || 'filter-items-panel-header';
		this.bodyClassName = conf.bodyClassName || 'filter-items-panel-body';
		// The filters list container
		this.container = null;
		// Buttons definition in panel header.
		this.addItems = conf.addItems || false;
		this.moveItems = conf.moveItems || false;
		this.importItems = conf.importItems || false;
		this.newItemBtn = null;
		this.newGroupBtn = null;
		this.saveCheckedAsGroupBtn = null;
		this.importBtn = null;
//		this.sortBtn = null;
		this.selectAllBtn = null;
		this.deselectAllBtn = null;
		// Callback if isMoveToSaved
		this.moveToSavedCallback = this.moveItems ? conf.moveToSavedCallback : null;
		// Call back to open the Import window
		this.openImportPanelCallback = this.importItems ? conf.openImportPanelCallback : null;
		// Callback when filter items become selected/deselected,
		// this is i.e. used in the import panel to enable/disable
		// the import button.
		this.filterItemsSelectCallback = conf.filterItemsSelectCallback || null;
		this.idPrefix = '';
		this.idCount = 0;
		// filterItems is a new array which includes filterGroups.
		// filterItems and filterGroups are only separate nodes
		// on the server side.
		this.filterItems = [];
		this.isModified = false;
		// The active profileName, this is required in scheduler
		// actions when importing filters.
		this.profileName = '';
		// A reference to the active queryFieldsDb
		this.queryFieldsDb = [];
	}
	Filters.prototype = {
		initPanel: function() {
			// This creates filter buttons and adds event listeners.
			var idPrefix = util.getUniqueElementId();
			this.idPrefix = idPrefix;
			// Create the buttons
			var btns = '';
			var newFilterItemBtnId = idPrefix + ':new_filter_item';
			var newFilterGroupBtnId = idPrefix + ':new_filter_group';
			var saveCheckedAsGroupBtnId = idPrefix + ':save_checked_as_group';
			var importBtnId = idPrefix + ':import_items';
//			var sortBtnId = idPrefix + ':sort_items';
			var selectAllBtnId = idPrefix + ':select_all';
			var deselectAllBtnId = idPrefix + ':deselect_all';
			if (this.addItems) {
				btns = '<a id="' + newFilterItemBtnId + '" href="javascript:;" class="command-link-50">' +
					langVar('lang_stats.global_filter.new_item') + '</a> ' +
					'<a id="' + newFilterGroupBtnId + '" href="javascript:;" class="command-link-50">' +
					langVar('lang_stats.global_filter.new_group') + '</a> ' +
					'<a id="' + saveCheckedAsGroupBtnId + '" href="javascript:;" class="command-link-50">' +
					langVar('lang_stats.global_filter.save_checked_as_group') + '</a> ';
			}
			if (this.importItems) {
				btns += '<a id="' + importBtnId + '" href="javascript:;" class="command-link-50">' +
					langVar('lang_stats.btn.import') + '</a> ';
			}
			// Disabled sort because list appears always sorted anyway.
//			if (this.addItems) {
//
//				btns += '<a id="' + sortBtnId + '" href="javascript:;" class="command-link-50">' +
//					langVar('lang_stats.btn.sort') + '</a> ';
//			}
			// Select All, Deselect All
			btns += '<a id="' + selectAllBtnId + '" href="javascript:;" class="command-link-50">' +
				langVar('lang_stats.btn.select_all') + '</a> ' +
				'<a id="' + deselectAllBtnId + '" href="javascript:;" class="command-link-50">' +
				langVar('lang_stats.btn.deselect_all') + '</a>';
			// Create HTML
			var outerContainer = util.getE(this.containerId);
			var innerContainerId = idPrefix + ':' + this.containerId;
			var html = '<div class="' + this.headerClassName + '">' + btns + '</div>' +
				'<div class="' + this.bodyClassName + '">' +
				'<div id="' + innerContainerId + '"></div>';
				'</div>';
			outerContainer.innerHTML = html;
			// Get the container for the filters list
			this.container = util.getE(innerContainerId);
			// Create button objects
			var cmlOpt = {
				classNameEnabled: 'command-link-50',
				classNameDisabled: 'command-link-50-disabled'
			};
			if (this.addItems) {
				this.newItemBtn = new util.CommandLink(newFilterItemBtnId, this._handleMainEvents, true, cmlOpt, this);
				this.newGroupBtn = new util.CommandLink(newFilterGroupBtnId, this._handleMainEvents, true, cmlOpt, this);
				this.saveCheckedAsGroupBtn = new util.CommandLink(saveCheckedAsGroupBtnId, this._handleMainEvents, true, cmlOpt, this);
//				this.sortBtn = new util.CommandLink(sortBtnId, this._handleMainEvents, true, cmlOpt, this);
				// Init editor panels
				filterItemEditor.init();
				filterGroupEditor.init();
			}
			if (this.importItems) {
				this.importBtn = new util.CommandLink(importBtnId, this._handleMainEvents, true, cmlOpt, this);
			}
			this.selectAllBtn = new util.CommandLink(selectAllBtnId, this._handleMainEvents, true, cmlOpt, this);
			this.deselectAllBtn = new util.CommandLink(deselectAllBtnId, this._handleMainEvents, true, cmlOpt, this);
			// Handle filter list events
			YE.addListener(this.container, 'click', this._handleFilterListEvents, this);
		},
		initFilters: function(profileName, queryFieldsDb, filterItems, filterGroups) {
//			console.log('reportFiltersPanel.initFilters() - profileName: ' + profileName);
			// initFilters starts over with new filters.
			// This is required when initializing filters
			// in scheduler actions where profiles can be changed without
			// a page reload.
			if (this.idPrefix === '') {
				// Initialize the panel
				this.initPanel();
			}
			this.profileName = profileName;
			this.queryFieldsDb = queryFieldsDb;
			// Combine filterItems and filterGroups and add helper properties
			this.filterItems = this._getModifiedAndCombinedFilterItems(filterItems, filterGroups);
//			util.showObject(this.filterItems);
			// Update queryFieldsDb
			filterItemEditor.setProfileSpecificData(queryFieldsDb);
			// Build the filterItem list
			this._buildFiltersList();
			this.setButtonState();
		},
		resetIsModified: function() {
			this.isModified = false;
		},
		getIsModified: function() {
			return this.isModified;
		},
		_handleMainEvents: function(evt, self) {
			var element = evt.target || evt.srcElement;
			var elementId = element.id;
			var dat = elementId.split(':');
			var key = dat[1];
//			console.log('key: ' + key);
			switch (key) {
				case 'new_filter_item':
					self._createNewFilterItem(false, '');
					break;
				case 'new_filter_group':
					filterGroupEditor.open('', '', true, false, self);
					break;
				case 'save_checked_as_group':
					filterGroupEditor.open('', '', true, true, self);
					break;
				case 'import_items':
					// Callback import window
					self.openImportPanelCallback(
						self.profileName,
						self.queryFieldsDb,
						self.filterItems
					);
					break;
//				case 'sort_items':
//
//					self._buildFiltersList();
//					break;
				case 'select_all':
					self._selectAll(true);
					break;
				case 'deselect_all':
					self._selectAll(false);
					break;
			}
		},
		_handleFilterListEvents: function(evt, self) {
			var element = evt.target || evt.srcElement;
			var elementId = element.id;
//			console.log('element.nodeName: ' + element.nodeName);
//			console.log('element.id: ' + element.id);
			if (elementId !== '') {
				var dat = elementId.split(':');
				var key = dat[1];
				var itemId = dat[2];
				switch (key) {
					case 'cb':
						// Toggle filter state
						self._toggleFilterActiveState(element, itemId);
						break;
					case 'edit':
						// Edit filter item
						self._editFilterItem(itemId);
						break;
					case 'edit_subitem':
						self._editFilterSubItem(itemId);
						break;
					case 'delete':
						// Delete saved filter item
						self._deleteFilterItem(itemId);
						break;
					case 'delete_subitem':
						// Delete saved filter item
						self._deleteFilterSubItem(itemId);
						break;
					case 'add':
						// Add filter item in filter group
						self._createNewFilterItem(true, itemId);
						break;
					case 'img':
						// Expand collapse group
						self._expandCollapseGroup(itemId);
						break;
					case 'move':
						// Move to saved
						self._moveToSaved(itemId);
						break;
				}
			}
		},
		setButtonState: function() {
			// Updates the state of number of items and enables disables control buttons
			var isItems = this.filterItems.length > 0;
			var numActiveItems = this.getNumOfActiveItems();
			if (this.addItems) {
				this.newItemBtn.enable();
				this.newGroupBtn.enable();
				// Allow to save single items as new group because the item could already be a group
				// or a single item to which other items are added manually.
				this.saveCheckedAsGroupBtn.enable((numActiveItems > 0));
//				this.sortBtn.enable(isItems);
			}
			if (this.importItems) {
				// Only exists in scheduler actions.
				// Is disabled when no profile is selected.
				this.importBtn.enable();
			}
			this.deselectAllBtn.enable(isItems);
			this.selectAllBtn.enable(isItems);
			// Fire filterItemsSelectCallback,
			// this is the best place to call the listener.
			if (this.filterItemsSelectCallback) {
				this.filterItemsSelectCallback((numActiveItems > 0));
			}
		},
		disableAll: function() {
			// Disables all buttons
			// This is called from scheduler actions when no profile is selected.
			// In this case no filter items can be added.
			// Note, the panel may not yet exist when calling disableAll, create it now.
			if (this.idPrefix === '') {
				// Initialize the panel
				this.initPanel();
			}
			if (this.addItems) {
				this.newItemBtn.disable();
				this.newGroupBtn.disable();
				this.saveCheckedAsGroupBtn.disable();
//				this.sortBtn.disable();
			}
			if (this.importItems) {
				this.importBtn.disable();
			}
			this.deselectAllBtn.disable();
			this.selectAllBtn.disable();
		},
		_toggleFilterActiveState: function(element, itemId) {
			var item = this.filterItems[util.h(itemId)];
			item.isActive = element.checked;
			this.isModified = true;
			this.setButtonState();
		},
		_selectAll: function(checkItems) {
			// Set checkbox state in array, then apply setCheckboxes
			var filterItems = this.filterItems;
			for (var i = 0, len = filterItems.length; i < len; i++) {
				var item = filterItems[i];
				item.isActive = checkItems;
				util.setF(this.idPrefix + ':cb:' + item.id , checkItems);
			}
			this.isModified = true;
			this.setButtonState();
		},
		_createNewFilterItem: function(isItemInGroup, groupItemId) {
			var isActive = isItemInGroup ? false : true;
			var isNew = true;
			var id = this._getNewItemId();
			var item = {
				id: id,
				isNegated: false,
				filterType: 'field',
				fieldName: '',
				expressionType: '',
				itemValue: ''
			};
			filterItemEditor.open(item, isActive, isNew, isItemInGroup, groupItemId, this);
		},
		addNewItemViaMoveToSaved: function(newFilterItem) {
			// This inserts a new filter item which is called from another panel
			// via Move To Saved.
			// Filter groups can be ignored.
			// The newFilterItem is only inserted if it doesn't yet exist.
			// If the item already exists set only its isActive value to the
			// value of the newFilterItem.
			var filterItems = this.filterItems;
			var isExistingItem = false;
			var existingFilterItem;
			var newFilterItemString = repFiltersUtil.getFilterItemAsString(newFilterItem);
			for (var i = 0, len = filterItems.length; i < len; i++) {
				var existingFilterItem = filterItems[i];
				if (existingFilterItem.isRootItem) {
					var existingFilterItemString = repFiltersUtil.getFilterItemAsString(existingFilterItem);
					if (existingFilterItemString === newFilterItemString) {
						isExistingItem = true;
						break;
					}
				}
			}
			if (!isExistingItem) {
				// give the new item a new id
				newFilterItem.id = this._getNewItemId();
				// Insert newFilterItem
				filterItems.push(newFilterItem);
				// Update hash
				util.createHash(filterItems, 'id');
				this._buildFiltersList();
			}
			else {
				// The item already exists. Override isActive state only
				// if inserted item isActive.
				if (newFilterItem.isActive) {
					existingFilterItem.isActive = true;
					this._updateCheckboxState();
				}
			}
			this.isModified = true;
			this.setButtonState();
		},
		addNewItemsViaImport: function(newFilterItemsAndGroups) {
			// This adds/imports new filterItems and filterGroups
			// from another reportFiltersPanel object.
			var filterItems = this.filterItems;
			var clonedItem;
			for (var i = 0, len = newFilterItemsAndGroups.length; i < len; i++) {
				clonedItem = util.cloneObject(newFilterItemsAndGroups[i]);
				// Assign new item id.
				clonedItem.id = this._getNewItemId();
				// Reset isActive or not?
//				clonedItem.isActive = true;
				// Set isExpanded of groups to false;
				if (clonedItem.isGroup) {
					clonedItem.isExpanded = false;
					// Get new node name for this group
					var groupNameItems = repFiltersUtil.getGroupValuesByKey(filterItems, 'name', clonedItem.id);
					clonedItem.name = util.labelToUniqueNodeName(clonedItem.label, groupNameItems, 'filter_group');
					// Assign new id to subitems
					var subitems = clonedItem.items;
					for (var j = 0, numSubitems = subitems.length; j < numSubitems; j++) {
						subitems[j].id = this._getNewItemId();
					}
				}
				// Add new item to filterItems
				filterItems.push(clonedItem);
			}
			// Create hash to access filters by id
			util.createHash(filterItems, 'id');
			// Build the filterItem list
			this._buildFiltersList();
			this.setButtonState();
		},
		_editFilterItem: function(itemId) {
			// Edit root item or group
			var item = this.filterItems[util.h(itemId)];
//			util.showObject(item);
			if (item.isRootItem) {
				var isActive = item.isActive;
				var isNew = false;
				var groupItemId = '';
				var isItemInGroup = false;
				filterItemEditor.open(item, isActive, isNew, isItemInGroup, groupItemId, this);
			}
			else {
				// This is a group item
				filterGroupEditor.open(itemId, item.label, false, false, this);
			}
		},
		_editFilterSubItem: function(itemId) {
			// This is an item in a group.
			// Get the itemId of the group and subitem
//			util.showObject(parentItem);
			var isActive = false;
			var isNew = false;
			var isItemInGroup = true;
			var parentItem = this._getParentFilterItem(itemId);
			var groupItemId = parentItem.id;
			var subitems = parentItem.items;
			for (var i = 0; i < subitems.length; i++) {
				if (subitems[i].id == itemId) {
					var item = subitems[i];
				}
			}
			filterItemEditor.open(item, isActive, isNew, isItemInGroup, groupItemId, this);
		},
		_deleteFilterItem: function(itemId) {
			// Deletes a filter root item or group
			util.deleteArrayObject(this.filterItems, 'id', itemId);
			this.isModified = true;
			this._buildFiltersList();
			this.setButtonState();
		},
		_deleteFilterSubItem: function(itemId) {
			// Delete a filter item of a filter group
			var parentItem = this._getParentFilterItem(itemId);
			var subitems = parentItem.items;
			util.deleteArrayObject(subitems, 'id', itemId);
			this.isModified = true;
			this._buildFiltersList();
			this.setButtonState();
		},
		_moveToSaved: function(itemId) {
			// Clone item which becomes moved.
			var filterItems = this.filterItems;
			var filterItem = filterItems[util.h(itemId)];
			var clonedFilterItem = util.cloneObject(filterItem);
			// Delete item from this panel
			util.deleteArrayObject(filterItems, 'id', itemId);
			// Move the clonedFilterItem
			this.moveToSavedCallback(clonedFilterItem);
			this.isModified = true;
			this._buildFiltersList();
			this.setButtonState();
		},
		//
		// Handle Save Checked as New Group
		//
		saveCheckedAs: function() {
			var filterLabel = util.getF('save_checked_filters_as_name');
			// alert('Filter name');
			if (filterLabel != '') {
				// Check for duplicate filter name
				var isDuplicateLabel = false;
				var filterNameItems = [];
				for (var i = 0; i < savedFilterGroups.length; i++) {
					var existingFilterLabel = savedFilterGroups[i].label;
					if (existingFilterLabel.toLowerCase() == filterLabel.toLowerCase()) {
						isDuplicateLabel = true;
					}
					filterNameItems[i] = savedFilterGroups[i].name;
				}
				if (!isDuplicateLabel) {
					var filterName = util.labelToUniqueNodeName(filterLabel, filterNameItems, 'filter');
					saveCheckedFilters(filterName, filterLabel);
				}
				else {
					if (confirm(langVar('lang_stats.global_filter.confirm_existing_filter_replacement_message'))) {
						// TODO, Delete existing filter?
						alert('Replace existing filter');
						return false;
					}
				}
			}
			else {
				alert(langVar('lang_stats.global_filter.missing_filter_name_message'));
			}
		},
		saveCheckedAsNewGroupProcessing: function(groupName, groupLabel) {
			// Create new group from checked saved filter items and filter groups.
			var filterItems = this.filterItems;
			var lookup = {};
			var newItems = [];
			for (var i = 0, len = filterItems.length; i < len; i++) {
				var item = filterItems[i];
				if (item.isActive) {
					if (item.isRootItem) {
						this._addCheckedFilterItem(lookup, newItems, item);
					}
					else {
						// Add subitems of filter group
						var subitems = item.items;
						for (var j = 0, numSubitems = subitems.length; j < numSubitems; j++) {
							this._addCheckedFilterItem(lookup, newItems, subitems[j]);
						}
					}
				}
			}
			// Setup new filter group
			var newGroupId = this._getNewItemId();
			var newGroup = {
				id: newGroupId,
				isRootItem: false,
				isGroup: true,
				isExpanded: false,
				name: groupName,
				label: groupLabel,
				isActive: false,
				items: newItems
			};
			// Add newGroup to savedFilterGroups
			filterItems.push(newGroup);
			// Sort the new Items
			filterItems.sort(this._compareLabels);
			// update hash
			util.createHash(filterItems, 'id');
			this.isModified = true;
			this._buildFiltersList();
			this.setButtonState();
		},
		_addCheckedFilterItem: function(lookup, newItems, filterItem) {
			// Adds filterItem to newItems if it doesn't yet exist.
			var filterId = repFiltersUtil.getFilterItemAsString(filterItem);
			if (!lookup.hasOwnProperty(filterId)) {
				var clonedFilterItem = util.cloneObject(filterItem);
				// Give the item a new id
				clonedFilterItem.id = this._getNewItemId();
				newItems.push(clonedFilterItem);
				lookup[filterId] = true;
			}
		},
		//
		// Create filter item rows
		//
		_buildFiltersList: function() {
			// Build the filter and filter group rows.
			// This is also used upon sorting the filter
			// rows.
			var item;
			var filterItems = this.filterItems;
//			util.showObject(filterItems, '_buildFiltersList()');
			var filtersHtml = '<table><tbody>';
			// Sort the items
			filterItems.sort(this._compareLabels);
			// Create the rows
			for (var i = 0, len = filterItems.length; i < len; i++) {
				item = filterItems[i];
				if (item.isRootItem) {
					filtersHtml += this._getFilterRow(item.id, item.label);
				}
				else {
					// This is a group item
					var subitems = item.items;
					var numSubitems = subitems.length;
					var groupHasItems = (numSubitems > 0);
					var isExpanded = item.isExpanded;
					filtersHtml += this._getFilterGroupRow(item.id, item.label, groupHasItems, isExpanded);
					// Sort subitems
					subitems.sort(this._compareLabels);
					for (var j = 0; j < numSubitems; j++) {
						var subItem = subitems[j];
						filtersHtml += this._getSubFilterRow(subItem.id, subItem.label, isExpanded);
					}
				}
			}
			filtersHtml += '</tbody></table>';
			this.container.innerHTML = filtersHtml;
			// Update checkbox state
			this._updateCheckboxState();
		},
		_getFilterRow: function(itemId, itemLabel) {
			var idPrefix = this.idPrefix;
			var row = '<tr id="' + idPrefix + ':row:' + itemId + '">';
			// Add empty cell for filter group icons column
			row += '<td style="width:14px"></td>';
			// Add checkbox cell
			var checkboxId = idPrefix + ':cb:' + itemId;
			var labelId = idPrefix + ':label:' + itemId;
			row += '<td style="width:14px">';
			row += '<input id="' + checkboxId + '" type="checkbox" />';
			row += '</td>';
			// Add label cell
			row += '<td>';
			row += '<label id="' + labelId + '" for="' + checkboxId + '">' +
					YL.escapeHTML(itemLabel)  + '</label>';
			row += '</td>';
			// Add buttons
			row += '<td class="filter-item-controls">';
			if (this.addItems || this.moveItems) {
				if (this.addItems) {
					// Edit
					row += this._getButton(idPrefix + ':edit:' + itemId, langVar('lang_stats.btn.edit'));
				}
				else {
					// Move to saved
					row += this._getButton(idPrefix + ':move:' + itemId, langVar('lang_stats.global_filter.move_to_saved'));
				}
				// Delete
				row += this._getButton(idPrefix + ':delete:' + itemId, langVar('lang_stats.btn.delete'));
			}
			row += '</td>';
			row += '</tr>';
			return row;
		},
		_getSubFilterRow: function(itemId, itemLabel, isExpanded) {
			// This returns a filter row of a group
			var idPrefix = this.idPrefix;
			var row = '<tr id="' + idPrefix + ':row:' + itemId + '"';
			if (!isExpanded) {row += ' style="display:none"';}
			row += '>';
			// Add empty cell for filter group icons column
			row += '<td style="width:14px"></td>';
			// Add empty cell for checkbox
			row += '<td style="width:14px"></td>';
			// Add label cell
			row += '<td>';
			row += '<span id="' + idPrefix + ':label:' + itemId + '">' + YL.escapeHTML(itemLabel)  + '</span>';
			row += '</td>';
			// Add buttons
			row += '<td class="filter-item-controls">';
			if (this.addItems) {
				// Edit
				row += this._getButton(idPrefix + ':edit_subitem:' + itemId, langVar('lang_stats.btn.edit'));
				// Delete
				row += this._getButton(idPrefix + ':delete_subitem:' + itemId, langVar('lang_stats.btn.delete'));
			}
			row += '</td>';
			row += '</tr>';
			return row;
		},
		_getFilterGroupRow: function(itemId, itemLabel, groupHasItems, isExpanded) {
			var imgSrc = '';
			if (!groupHasItems) {
				imgSrc = imgDb.gfEmptyGroup.src;
			}
			else if (!isExpanded) {
				imgSrc = imgDb.gfCollapsed.src;
			}
			else {
				// Show expanded icon
				imgSrc = imgDb.gfExpanded.src;
			}
	//		console.log('imgSrc: ' + imgSrc);
			var idPrefix =  this.idPrefix;
			var row = '<tr id="' + idPrefix + ':row:' + itemId + '">';
			// Add group icon
			row += '<td style="width:14px">';
			row += '<img id="' + idPrefix + ':img:' + itemId + '" src="' + imgSrc + '" width="31" height="15" alt="" />';
			row += '</td>';
			// Add checkbox cell
			var checkboxId = idPrefix + ':cb:' + itemId;
			var labelId = idPrefix + ':label:' + itemId;
			row += '<td style="width:14px">';
			row += '<input id="' + checkboxId + '" type="checkbox" />';
			row += '</td>';
			// Add label cell
			row += '<td>';
			row += '<label id="' + labelId + '" for="' + checkboxId + '">' +
					YL.escapeHTML(itemLabel)  + '</label>';
			row += '</td>';
			// Add buttons
			row += '<td class="filter-item-controls">';
			if (this.addItems) {
				// Add
				row += this._getButton(idPrefix + ':add:' + itemId, langVar('lang_stats.global_filter.add_new_item'));
				// Edit
				row += this._getButton(idPrefix + ':edit:' + itemId, langVar('lang_stats.btn.edit'));
				// Delete
				row += this._getButton(idPrefix + ':delete:' + itemId, langVar('lang_stats.btn.delete'));
			}
			row += '</td>';
			row += '</tr>';
			return row;
		},
		_getButton: function(id, btnLabel) {
			return ' <a id="' + id + '" href="javascript:;">' + btnLabel  + '</a>';
		},
		saveFilterItem: function(item, isNew, isItemInGroup, groupItemId) {
			// Invoked from filterItem.js!
			// If not isNew then item replaces the existing item (in this case item contains the original itemId!)
			var rebuildFiltersList = false;
			// Get itemId. All default properties already exist in item
			var itemId = item.id;
			// Get the label
			item.label = this._getFilterItemLabel(item);
			// Get the array where we insert or update the item.
			var filterItems = this.filterItems;
			var refItems;
			var parentItem;
			if (!isItemInGroup) {
				refItems = filterItems;
			}
			else {
				parentItem = filterItems[util.h(groupItemId)];
				refItems = parentItem.items;
			}
			// If not a new item then replace existing item
			if (!isNew) {
				// Get the index of the item to be replaced
				var itemIndex = util.getArrayObjectIndex(refItems, 'id', itemId);
				refItems.splice(itemIndex, 1, item);
				var labelId = this.idPrefix + ':label:' + itemId;
				util.updateT(labelId, item.label);
			}
			else {
				// This is a new item. Insert the new item as first item in array
				refItems.splice(0, 0, item);
				if (!isItemInGroup) {
					// Update hash
					util.createHash(filterItems, 'id');
				}
				else {
					// Set isExpanded of groupItem in case that this is the first item added.
					parentItem.isExpanded = true;
				}
				rebuildFiltersList = true;
			}
			this.isModified = true;
			if (rebuildFiltersList) {
				this._buildFiltersList();
				this.setButtonState();
			}
		},
		saveFilterGroup: function(itemId, groupName, groupLabel, isNew) {
			var filterItem;
			var filterItems = this.filterItems;
			if (!isNew) {
				filterItem = filterItems[util.h(itemId)];
				filterItem.name = groupName;
				filterItem.label = groupLabel;
				// Update label
				util.updateT(this.idPrefix + ':label:' + itemId, groupLabel);
			}
			else {
				var newGroupId = this._getNewItemId();
				filterItem = {
					id: newGroupId,
					name: groupName,
					label: groupLabel,
					isRootItem: false,
					isGroup: true,
					isActive: false,
					isExpanded: false,
					items: []
				};
				filterItems.push(filterItem);
				// update hash
				util.createHash(filterItems, 'id');
				this._buildFiltersList();
				this.setButtonState();
			}
			this.isModified = true;
		},
		_expandCollapseGroup: function(itemId) {
			var item = this.filterItems[util.h(itemId)];
			var isExpanded = item.isExpanded;
			var subitems = item.items;
			var numSubitems = subitems.length;
			// Expand/collapse group only if there are items
			if (numSubitems > 0) {
				var img = util.getE(this.idPrefix + ':img:' + itemId);
				img.src = isExpanded ? imgDb.gfCollapsed.src : imgDb.gfExpanded.src;
				for (var i = 0; i < numSubitems; i++) {
					// util.showObject(items[i]);
					var rowId = this.idPrefix + ':row:' + subitems[i].id;
					util.showE(rowId, !isExpanded);
				}
				item.isExpanded = !isExpanded;
			}
		},
		getFilterItems: function() {
			// Returns a new array with filterItems
			return this.getFilterOrGroupItems('isRootItem');
		},
		getFilterGroups: function() {
			// Returns a new array with filterGroups
			return this.getFilterOrGroupItems('isGroup');
		},
		getFilterOrGroupItems: function(key) {
			// Returns cloned items of the given key
			var filterItems = this.filterItems;
			var item;
			var clonedItem;
			var clonedItems = [];
			for (var i = 0, len = filterItems.length; i < len; i++) {
				var item = filterItems[i];
				if (item[key]) {
					clonedItem = util.cloneObject(item);
					clonedItems.push(clonedItem);
				}
			}
			return clonedItems;
		},
		getActiveItems: function() {
			// Returns cloned filterItems and filterGroups if isActive.
			var filterItems = this.filterItems;
			var item;
			var clonedItem;
			var clonedItems = [];
			for (var i = 0, len = filterItems.length; i < len; i++) {
				var item = filterItems[i];
				if (item.isActive) {
					clonedItem = util.cloneObject(item);
					clonedItems.push(clonedItem);
				}
			}
			return clonedItems;
		},
		//
		// Utilities
		//
		_getModifiedAndCombinedFilterItems: function(filterItems, filterGroups) {
			// This merges filterItems and filterGroups in a new array and adds
			// additional properties for list handling.
			var newItems = [];
			var newItem = {};
			// Add modified filterItems to newItems
			for (var i = 0, filterItemsLen = filterItems.length; i < filterItemsLen; i++) {
				// Create new item
				newItem = util.cloneObject(filterItems[i]);
				newItem.id = this._getNewItemId();
				newItem.label = this._getFilterItemLabel(newItem);
				newItem.isRootItem = true;
				newItem.isGroup = false;
				newItems.push(newItem);
			}
			// Add modified filterGroups to newItems
			for (var j = 0, filterGroupsLen = filterGroups.length; j < filterGroupsLen; j++) {
				// Create new item
				// Groups already have a label. Add id and isExpanded to keep expanded state.
				newItem = util.cloneObject(filterGroups[j]);
				newItem.id =  this._getNewItemId();
				newItem.isExpanded = false;
				newItem.isRootItem = false;
				newItem.isGroup = true;
				// Handle subitems
				var subitems = newItem.items;
				var subitem;
				for (var k = 0, subitemsLen = subitems.length; k < subitemsLen; k++) {
					subitem = subitems[k];
					subitem.id = this._getNewItemId();
					subitem.label = this._getFilterItemLabel(subitem);
					subitem.isRootItem = false;
					subitem.isGroup = false;
				}
				newItems.push(newItem);
			}
//			util.showObject(newItems, '_getModifiedAndCombinedFilterItems()');
			// Create hash to access filters by id
			util.createHash(newItems, 'id');
			return newItems;
		},
		_getNewItemId: function() {
			this.idCount += 1;
			return 'i' + this.idCount;
		},
		_getFieldLabel: function(fieldName) {
			var queryFieldItem = this.queryFieldsDb[util.h(fieldName)];
			return queryFieldItem.label;
		},
		_getFilterItemLabel: function(theFilterItem) {
			var filterType = theFilterItem.filterType;
			// We ignore the label if filterType is expression!
			var label = '';
			if (filterType !== 'expression') {
				var isNegated = theFilterItem.isNegated;
				var itemValue = theFilterItem.itemValue;
				switch (filterType) {
					case 'field':
						var fieldName = theFilterItem.fieldName;
						var expressionType = theFilterItem.expressionType;
						var queryFieldItem = this.queryFieldsDb[util.h(fieldName)];
						var fieldLabel = queryFieldItem.label;
						var isAggregatingField = queryFieldItem.isAggregatingField;
						var operator = '';
						// alert('expressionType: ' + expressionType);
						if (!isAggregatingField) {
							if (expressionType == 'regexp') {
								operator = !isNegated ? langVar('lang_stats.global_filter.field_matches_regular_expression') : langVar('lang_stats.global_filter.field_not_matches_regular_expression');
							}
							else if (expressionType == 'wildcard') {
								operator = !isNegated ? langVar('lang_stats.global_filter.field_matches_wildcard') : langVar('lang_stats.global_filter.field_not_matches_wildcard');
							}
							else {
								operator = !isNegated ? langVar('lang_stats.global_filter.field_is') : langVar('lang_stats.global_filter.field_is_not');
								var fieldCategory = queryFieldItem.category;
								if (fieldCategory == 'day_of_week' || fieldCategory == 'hour_of_day') {
									// item_value is integer
									var i = itemValue;
									itemValue = (fieldCategory == 'day_of_week') ? lang.weekdays[i - 1] : lang.hours[i];
								}
							}
						}
						else {
							// Aggregating field with numerical value
							operator = (expressionType == 'lt') ? langVar('lang_stats.global_filter.field_is_less_than') : langVar('lang_stats.global_filter.field_is_greater_than');
						}
						label = fieldLabel + " " + operator + " '" + itemValue + "'";
						break;
					case 'within_matches':
						label = !isNegated ? langVar('lang_stats.global_filter.field_within_field_matches_value') : langVar('lang_stats.global_filter.not_field_within_field_matches_value');
						// Compose Within/matches label
						var withinFieldLabel = this._getFieldLabel(theFilterItem.withinFieldName);
						var matchesFieldLabel = this._getFieldLabel(theFilterItem.matchesFieldName);
						// label += withinFieldLabel + " within " + matchesFieldLabel + " matches '" + itemValue + "'";
						label = label.replace(/__PARAM__1/, withinFieldLabel);
						label = label.replace(/__PARAM__2/, matchesFieldLabel);
						label = label.replace(/__PARAM__3/, "'" + itemValue + "'");
						break;
				}
			}
			else {
				// Nothing to modify in expressions
				label = theFilterItem.label;
			}
			return label;
		},
		_compareLabels: function(a, b) {
			// used by array sort()
			var labelA = a.label.toLowerCase();
			var labelB = b.label.toLowerCase();
			// Modify root items so that groups appear after items.
			if (a.isRootItem || a.isGroup) {
				labelA = a.isRootItem ? 'a' : 'b' + labelA;
				labelB = b.isRootItem ? 'a' : 'b' + labelB;
			}
			if (labelA < labelB) {
				return -1;
			}
			else if (labelA > labelB) {
				return 1;
			}
			else {
				return 0;
			}
		},
		_updateCheckboxState: function() {
			// Sets the isActive state of each checkbox (IE does not set the state upon checkbox creation)
			var filterItems = this.filterItems;
			// We don't need to cover filterItems in filterGroups because they don't have a checkbox!
			for (var i = 0, len = filterItems.length; i < len; i++) {
				var item = filterItems[i];
				var itemId = item.id;
				var isActive = item.isActive;
				var elementId = this.idPrefix + ':cb:' + itemId;
				util.setF(elementId, isActive);
				// Fix IE image display problem if filter group
				if (item.isGroup) {
					var imgId = this.idPrefix + ':img:' + itemId;
					var groupHasItems = (item.items.length > 0);
					setTimeout(function() {
						var img = util.getE(imgId);
						img.src = groupHasItems ? imgDb.gfCollapsed.src : imgDb.gfEmptyGroup.src;
					}, 10);
				}
			}
		},
		getNumOfActiveItems: function() {
			// Returns the number of active filter items
			var filterItems = this.filterItems;
			var numActiveItems = 0;
			for (var i = 0, len = filterItems.length; i < len; i++) {
				if (filterItems[i].isActive) {
					numActiveItems++;
				}
			}
			return numActiveItems;
		},
		_getParentFilterItem: function(subItemId) {
//			console.log('subItemId: ' + subItemId);
			// Returns the parent item of the given subItemId
			var filterItems = this.filterItems;
//			util.showObject(filterItems);
			var parentItem;
			for (var i = 0, len = filterItems.length; i < len; i++) {
				var item = filterItems[i];
				if (item.isGroup) {
					var items = item.items;
					for (var j = 0; j < items.length; j++) {
						if (items[j].id === subItemId) {
							// Return the parent item
							parentItem = item;
							break;
						}
					}
				}
			}
//			console.log('parentItem.id: ' + parentItem.id);
//			console.log('parentItem.isGroup: ' + parentItem.isGroup);
			return parentItem;
		}
	}
	// Return constructor
	return Filters;
}());
//
// filterItem - global filter items editor
// used in reports and in scheduler.
//
var filterItemEditor = (function() {
	'use strict';
  	var YE = YAHOO.util.Event,
		YD = YAHOO.util.Dom,
		panel = null,
		validator = null,
		queryFieldsDb = null,
		// active filter item properties
		id = '',
		isActive = false,
		isNew = false,
		isItemInGroup = false,
		groupItemId = '',
		// The callee object
		calleeObj = null,
		// activeOperatorListType is text or numerical
		activeOperatorListType = '',
		textFieldItemOperators = [
			{
			name:'item_name',
			label:langVar('lang_stats.global_filter.is_item_name')
			},
			{
			name:'wildcard',
			label:langVar('lang_stats.global_filter.is_wildcard_expression')
			},
			{
			name:'regexp',
			label:langVar('lang_stats.global_filter.is_regular_expression')
			},
			{
			name:'not_item_name',
			label:langVar('lang_stats.global_filter.not_item_name')
			},
			{
			name:'not_wildcard',
			label:langVar('lang_stats.global_filter.not_wildcard_expression')
			},
			{
			name:'not_regexp',
			label:langVar('lang_stats.global_filter.not_regular_expression')
			}
		],
		numericalFieldItemOperators = [
			{
			name:'lt',
			label:langVar('lang_stats.global_filter.is_less_than')
			},
			{
			name:'gt',
			label:langVar('lang_stats.global_filter.is_greater_than')
			}
		];
	function init() {
		var panelObj = {
			panelId:"filter_item:panel",
			panelClassName: 'panel-50',
			panelHeaderLabel: '-',
			left: 70,
			top: 80,
			zIndex: 40,
			isCover: true,
			isSticky: true,
			closeEvent: close
		};
		panel = new util.Panel3(panelObj);
		validator = new util.Validator();
		// Populate default operator list for text field items
		updateFieldItemOperatorList('text');
		var label = '';
		// Populate day of week list
		var weekdays = [{
			name:'',
			label:langVar('lang_stats.global_filter.select_day_of_week')
			}];
		for (var i = 1; i < 8; i++) {
			label = lang.weekdays[i - 1];
			weekdays[weekdays.length] = {
				name: i,
				label: label
			};
		}
		util.populateSelect('filter_item:day_of_week_list', weekdays, 'name', 'label');
		// Populate hour of day list
		var hours = [{
			name:'',
			label:langVar('lang_stats.global_filter.select_hour')
			}];
		for (var j = 0; j < 24; j++) {
			label = lang.hours[j];
			hours[hours.length] = {
				name: j,
				label: label
			};
		}
		util.populateSelect('filter_item:hour_of_day_list', hours, 'name', 'label');
		YE.addListener('filter_item:read_about_within_matches_btn', 'click', toggleInfoPanel);
		YE.addListener('filter_item:filter_item_type_list', 'change', typeActor);
		YE.addListener('filter_item:field_list', 'change', fieldActor);
		YE.addListener('filter_item:field_item_operator_list', 'change', operatorActor);
		YE.addListener('filter_item:ok_btn', 'click', saveItem);
		YE.addListener('filter_item:cancel_btn', 'click', close);
	}
	function setProfileSpecificData(_queryFieldsDb) {
		// This sets profile related data. This is required in scheduler
		// actions where profiles can be changed at any time.
		queryFieldsDb = _queryFieldsDb;
		// Create hash
//		util.createHash(queryFieldsDb);
//		util.showObject(queryFieldsDb);
		// Populate field item list
		// Note, we don't allow date_time fields in global filter! Date time is set via df only!
		var filterFieldsDb = [{
			name:'',
			label:langVar('lang_stats.global_filter.select_field')
		}];
		var nonAggregatingFilterFieldsDb = [{
			name: '',
			label:langVar('lang_stats.global_filter.select_field')
		}];
		for (var i = 0; i < queryFieldsDb.length; i++) {
			var queryField = queryFieldsDb[i];
			var isValidField = false;
			if (queryField.category !== 'date_time' && queryField.hasDbField) {
				var isAggregatingField = queryField.isAggregatingField;
				isValidField = (!isAggregatingField || (isAggregatingField && (queryField.aggregationMethod !== 'unique')));
			}
			if (isValidField) {
				filterFieldsDb[filterFieldsDb.length] = {
					name:queryField.name,
					label:queryField.label
				};
				if (!isAggregatingField) {
					nonAggregatingFilterFieldsDb[nonAggregatingFilterFieldsDb.length] = {
						name: queryField.name,
						label:queryField.label
					};
				}
			}
		}
		util.populateSelect('filter_item:field_list', filterFieldsDb, 'name', 'label');
		util.populateSelect('filter_item:within_matches:within_field', nonAggregatingFilterFieldsDb, 'name', 'label');
		util.populateSelect('filter_item:within_matches:matches_field', nonAggregatingFilterFieldsDb, 'name', 'label');
	}
	function open(item, _isActive, _isNew, _isItemInGroup, _groupItemId, _calleeObj) {
//		util.showObject(item);
		id = item.id;
		isActive = _isActive;
		isNew = _isNew;
		isItemInGroup = _isItemInGroup;
		groupItemId = _groupItemId;
		calleeObj = _calleeObj;
		updateForm(item);
		var panelHeaderLabel = isNew ? langVar('lang_stats.global_filter.new_item') : langVar('lang_stats.global_filter.edit_item');
		var viewportWidth = YD.getViewportWidth();
		// If large display
		if (viewportWidth > 1000) {
			// Get position for filterItemEditor
			var region = YD.getRegion(calleeObj.container);
			var left = region.left < 120 ? region.left : region.left - 20;
			var top = region.top - 45;
			panel.open({
				label: panelHeaderLabel,
				left: left,
				top: top
			});
		}
		else {
			// If small display
			panel.prePositionAtCenter();
			panel.open({label: panelHeaderLabel});
		}
	}
	function close() {
		util.hideE('filter_item:info_panel');
		validator.reset();
		panel.close();
//		globalFilter.enableForm();
	}
	function updateFieldItemOperatorList(operatorListType) {
		// operatorListType is text | numerical
		if (activeOperatorListType !== operatorListType) {
			// Update operator list
			var theListItems = (operatorListType === 'text') ? textFieldItemOperators : numericalFieldItemOperators;
			util.populateSelect('filter_item:field_item_operator_list', theListItems, 'name', 'label');
			activeOperatorListType = operatorListType;
		}
	}
	function getFieldItemOperator() {
		// returns an object
		// o.isExpression = true | false
		// o.isNegated = true | false
		// o.expressionType = '' | 'wildcard' | 'regexp' | lt | gt
		// lt (less than) and gt (greater than) have been added for numerical fields
		var o = {};
		var operatorValue = util.getF('filter_item:field_item_operator_list');
		var isExpression = false;
		var isNegated = false;
		var expressionType = '';
		if (operatorValue.indexOf('wildcard') !== -1 || operatorValue.indexOf('regexp') !== -1) {
			isExpression = true;
			expressionType = (operatorValue.indexOf('wildcard') !== -1) ? 'wildcard' : 'regexp';
		}
		else if (operatorValue === 'lt' || operatorValue === 'gt') {
			expressionType = operatorValue;
		}
		if (operatorValue.indexOf('not_') !== -1) {
			isNegated = true;
		}
		o.isExpression = isExpression;
		o.isNegated = isNegated;
		o.expressionType = expressionType;
		return o;
	}
	//
	// filterItemType
	//
	function typeActor() {
		var filterType = util.getF('filter_item:filter_item_type_list');
		setType(filterType);
	}
	function setType(filterType) {
		util.hideE(['filter_item:form:field',
			// 'filter_item:form:session_start',
			'filter_item:form:within_matches',
			'filter_item:form:expression',
			'filter_item:read_about_within_matches_btn'
		]);
		util.showE('filter_item:form:' + filterType);
		if (filterType === 'within_matches') {
			util.showE('filter_item:read_about_within_matches_btn');
		}
	}
	//
	// filterItem - field, operator and item value handling
	//
	function fieldActor() {
		// Invoked upon field change
		var fieldName = util.getF('filter_item:field_list');
		if (fieldName !== '') {
			// Update the operator list (text or numerical)
			var queryField = queryFieldsDb[util.h(fieldName)];
			var isAggregatingField = queryField.isAggregatingField;
			var operatorListType = isAggregatingField ? 'numerical' : 'text';
			updateFieldItemOperatorList(operatorListType);
			var defaultOperator = isAggregatingField ? 'lt' : 'item_name';
			util.setF('filter_item:field_item_operator_list', defaultOperator);
		}
		// Check/update the item value section
		setFieldItemValueSection();
	}
	function operatorActor() {
		// Check/update the item value section
		setFieldItemValueSection();
	}
	function setFieldItemValueSection() {
		// This sets the item value section depending on the
		// selected field and the selected operator.
		util.hideE(['filter_item:field_item_value_row', 'filter_item:field_item_day_of_week_row', 'filter_item:field_item_hour_of_day_row']);
		var fieldName = util.getF('filter_item:field_list');
		if (fieldName !== '') {
			var queryField = queryFieldsDb[util.h(fieldName)];
			var fieldCategory = queryField.category;
			var isAggregatingField = queryField.isAggregatingField;
			var o = getFieldItemOperator();
			var isExpression = o.isExpression; // wildcard or regular expression
			if ( !isAggregatingField && !isExpression && (fieldCategory === 'day_of_week' || fieldCategory === 'hour_of_day')) {
				if (fieldCategory === 'day_of_week') {
					util.showE('filter_item:field_item_day_of_week_row');
				}
				else {
					util.showE('filter_item:field_item_hour_of_day_row');
				}
			}
			else {
				util.showE('filter_item:field_item_value_row');
			}
		}
		else {
			// No field selected, show field_item_value_row
			util.showE('filter_item:field_item_value_row');
		}
	}
	function toggleInfoPanel(evt) {
		var anchorElement = evt.target || evt.srcElement;
		var infoPanel = util.getE('filter_item:info_panel');
		if (infoPanel.style.display !== 'block') {
			// Handle top position
			var YD = YAHOO.util.Dom;
			var anchorRegion = YD.getRegion(anchorElement);
			// util.showObject(elementRegion);
			infoPanel.style.top = anchorRegion.bottom + 8 + 'px';
			// Handle left position and width
			var parentRegion = YD.getRegion('filter_item:panel');
			var parentWidth = parentRegion.width;
			var parentLeft = parentRegion.left;
			var offset = 10;
			// alert('parentWidth: ' + parentWidth);
			infoPanel.style.left = parentLeft + offset + 'px';
			infoPanel.style.width = parentWidth - (2 * offset) + 'px';
			infoPanel.style.zIndex = 50;
			// Display the panel
			infoPanel.style.display = 'block';
		}
		else {
		   infoPanel.style.display = 'none';
		}
		anchorElement.blur();
	}
	//
	// updateForm
	//
	function updateForm(item) {
//		util.showObject(queryFieldsDb);
		// Reset form
		util.resetF('filter_item:form');
		// The itemType is '' for unsaved filters and 'filter_item' for saved filters!
		var filterType = item.filterType;
		util.setF('filter_item:filter_item_type_list', filterType);
		switch (filterType) {
			case 'field':
				var fieldName = item.fieldName;
				util.setF('filter_item:field_list', fieldName);
				//
				// update operator list if we edit an existing field
				//
				if (fieldName !== '') {
					var queryField = queryFieldsDb[util.h(fieldName)];
					var isAggregatingField = queryField.isAggregatingField;
					var operatorListType = isAggregatingField ? 'numerical' : 'text';
					updateFieldItemOperatorList(operatorListType);
				}
				//
				// set operator value
				//
				var operatorValue;
				var expressionType = item.expressionType;
				if (expressionType === '') {
					operatorValue = 'item_name';
				}
				else {
					operatorValue = expressionType;
				}
				if (item.isNegated) {
					operatorValue = 'not_' + operatorValue;
				}
				util.setF('filter_item:field_item_operator_list', operatorValue);
				//
				// set item value
				//
				var valueElementId = 'filter_item:field_item_value';
				if (item.expressionType === '') {
					var fieldCategory = (fieldName !== '') ? queryFieldsDb[util.h(fieldName)].category : '';
					if (fieldCategory === 'day_of_week') {
						valueElementId = 'filter_item:day_of_week_list';
					}
					else if (fieldCategory === 'hour_of_day') {
						valueElementId = 'filter_item:hour_of_day_list';
					}
				}
				util.setF(valueElementId, item.itemValue);
				break;
			case 'within_matches':
				if (item.isNegated) {
					util.setF('filter_item:within_matches:use_not_operator', true);
				}
				util.setF('filter_item:within_matches:within_field', item.withinFieldName);
				util.setF('filter_item:within_matches:matches_field', item.matchesFieldName);
				util.setF('filter_item:within_matches:item_value', item.itemValue);
				break;
			case 'expression':
				util.setF('filter_item:expression_item_label', item.label);
				util.setF('filter_item:expression_item_value', item.itemValue);
				break;
		}
		setType(filterType);
		setFieldItemValueSection();
	}
	function saveItem() {
		var obj = {};
		var filterType = util.getF('filter_item:filter_item_type_list');
		obj.id = id;
		obj.isRootItem = !isItemInGroup;
		obj.isGroup = false;
		obj.filterType = filterType;
		if (!isItemInGroup) {
			obj.isActive = isActive;
		}
		switch (filterType) {
			case 'field':
				var fieldName = validator.isValue('filter_item:field_list');
				if (fieldName !== '') {
					obj.fieldName = fieldName;
					var queryField = queryFieldsDb[util.h(fieldName)];
					var isAggregatingField = queryField.isAggregatingField;
//					var operatorListType = isAggregatingField ? 'numerical' : 'text';
					var operatorObj = getFieldItemOperator();
					// util.showObject(operatorObj);
					obj.isNegated = operatorObj.isNegated;
					var expressionType = operatorObj.expressionType;
					if (!isAggregatingField) {
						var isWildcardExpression = (expressionType === 'wildcard');
						var isRegularExpression = (expressionType === 'regexp');
						if (!isWildcardExpression && !isRegularExpression) {
							// We need to get the fieldCategory to check if
							// we have a day_of_week or hour_of_day list active
							var fieldCategory = queryField.category;
							var valueElementId = 'filter_item:field_item_value';
							if (fieldCategory === 'day_of_week') {
								valueElementId = 'filter_item:day_of_week_list';
							}
							else if (fieldCategory === 'hour_of_day') {
								valueElementId = 'filter_item:hour_of_day_list';
							}
							obj.itemValue = validator.isValue(valueElementId);
						}
						else {
							obj.itemValue = validator.isValue('filter_item:field_item_value');
							if (isWildcardExpression) {
								expressionType = 'wildcard';
							}
							else {
								// isRegularExpression
								expressionType = 'regexp';
								obj.itemValue = validator.isRegularExpression('filter_item:field_item_value');
							}
						}
					}
					else {
						// Numerical field,
						// we allow int and float, so we just check for number
						obj.itemValue = validator.isNumber('filter_item:field_item_value');
					}
					obj.expressionType = expressionType;
				}
				break;
			case 'within_matches':
				obj.isNegated = util.getF('filter_item:within_matches:use_not_operator');
				obj.withinFieldName = validator.isValue('filter_item:within_matches:within_field');
				obj.matchesFieldName = validator.isValue('filter_item:within_matches:matches_field');
				obj.itemValue = validator.isValue('filter_item:within_matches:item_value');
				// Make sure the within field is different from the matches field
				if (obj.withinFieldName !== '' && (obj.withinFieldName === obj.matchesFieldName)) {
					validator.isCustom('filter_item:within_matches:matches_field', langVar('lang_stats.global_filter.equal_within_and_matches_field_message'));
				}
				/*
				  util.setF('filter_item:within_matches:use_not_operator', true);
				}
				util.setF('filter_item:within_matches:within_field', item.withinFieldName);
				util.setF('filter_item:within_matches:matches_field', item.matchesFieldName);
				util.setF('filter_item:within_matches:item_value', item.itemValue);
				*/
				break;
			case 'expression':
				obj.label = validator.isValue('filter_item:expression_item_label');
				// Check for duplicate names - We have a problem here because
				// the label only exists for expressions but not for any other FilterType,
				// so we simply allow duplicate expression labels!
				obj.itemValue = validator.isValue('filter_item:expression_item_value');
				break;
		}
		if (validator.allValid()) {
			// util.showObject(obj);
			close();
			calleeObj.saveFilterItem(obj, isNew, isItemInGroup, groupItemId);
		}
	}
	// Return global properties and methods
	return {
		init: init,
		setProfileSpecificData: setProfileSpecificData,
		open: open
	};
}());
//
// filterGropup - global filter group handling and editor
// used in reports and in scheduler.
//
/* global
	globalFilter: false */
var filterGroupEditor = (function() {
	var YE = YAHOO.util.Event,
		YD = YAHOO.util.Dom,
		panel = null,
		validator = null,
		// The callee object
		calleeObj = null,
		// active filter group properties
		id = '',
		isNew = false,
		isSaveCheckedAsNewGroup = false;
	function init() {
		var panelObj = {
			panelId:'filter_group:panel',
			panelClassName: 'panel-50',
			panelHeaderLabel: '-',
//			left: 70,
//			top: 120,
			zIndex: 40,
			isCover: true,
			isSticky: true,
			closeEvent: _close
		};
		panel = new util.Panel3(panelObj);
		validator = new util.Validator();
		YE.addListener('filter_group:label', 'keypress', _saveGroupViaEnter);
		YE.addListener('filter_group:ok_btn', 'click', _saveGroup);
		YE.addListener('filter_group:cancel_btn', 'click', _close);
	}
	function open(itemId, groupLabel, _isNew, _isSaveCheckedAsNewGroup, _calleeObj) {
		id = itemId;
		isNew = _isNew;
		isSaveCheckedAsNewGroup = _isSaveCheckedAsNewGroup;
		calleeObj = _calleeObj;
		var panelHeaderLabel;
		if (!isNew && !isSaveCheckedAsNewGroup) {
			panelHeaderLabel = langVar('lang_stats.global_filter.edit_group');
		}
		else if (isSaveCheckedAsNewGroup) {
			panelHeaderLabel = langVar('lang_stats.global_filter.save_checked_as_group');
		}
		else {
			panelHeaderLabel = langVar('lang_stats.global_filter.new_group');
		}
//		globalFilter.disableForm();
		// set the form
		util.setF('filter_group:label', groupLabel);
		var viewportWidth = YD.getViewportWidth();
		// If large display
		if (viewportWidth > 1000) {
			// Get panel position (reports : scheduler)
			var region = YD.getRegion(calleeObj.container);
			var left = region.left + 60;
			var top = region.top - 45;
			panel.open({
				label: panelHeaderLabel,
				left: left,
				top: top
			});
		}
		else {
			// If small display
			panel.prePositionAtCenter();
			panel.open({label: panelHeaderLabel});
		}
		var element = util.getE('filter_group:label');
		element.focus();
	}
	function _close() {
		validator.reset();
		panel.close();
//		globalFilter.enableForm();
	}
	function _saveGroupViaEnter(event) {
		var keyCode = (event.which) ? event.which : event.keyCode;
		if (keyCode == 13 || keyCode == 3) {
			_saveGroup();
		}
	}
	function _saveGroup() {
		// alert('save group');
		// Validate group name
		var groupLabelItems = repFiltersUtil.getGroupValuesByKey(calleeObj.filterItems, 'label', id);
		var groupLabel = validator.isValue('filter_group:label');
		groupLabel = validator.isUnique('filter_group:label', groupLabelItems);
		if (validator.allValid()) {
			// get unique node name
			var groupNameItems = repFiltersUtil.getGroupValuesByKey(calleeObj.filterItems, 'name', id);
			var groupName = util.labelToUniqueNodeName(groupLabel, groupNameItems, 'filter_group');
			if (isSaveCheckedAsNewGroup) {
				calleeObj.saveCheckedAsNewGroupProcessing(groupName, groupLabel);
			}
			else {
				calleeObj.saveFilterGroup(id, groupName, groupLabel, isNew);
			}
			_close();
		}
	}
	// Return global properties and methods
	return {
		init: init,
		open: open
	};
}());
//
// newReport.js
//
var newReport = {
	// initial values are set upon newReport.init()
	// and are overriden by specific data upon a new request
	webBrowserSessionId: '',
	reportName: '',
	isCalendar: false,
	dateFilter: '',
	commandLineFilter: '',
	commandLineFilterComment: '',
	filterId: '',
	reportInfoId: '',
	isUpdateReportInfo: false,
	directives: { // use Salang variable naming style for directives so that the property name becames a node name when assembling the URL
		source_report_info_id: '',
		action: '', // reset_row_numbers | set_row_number | sort | pivot_table | breakdown | clear_breakdown | customize_report_element
		report_element_name: '',
		starting_row: 0,
		ending_row: 0,
		number_of_rows: 0,
		sort_by: '',
		sort_direction: '',
		pivot_table: {
			report_field: '',
			number_of_rows: '',
			sort_by: '',
			sort_direction: '',
			show_averages_row: false
		},
		breakdown: { // we look up the breakdown item and any additional filter value in the raw report element
			raw_report_element_id: '',
			raw_row_number: 0
		},
		session_page_paths: {
			is_page_path: false,
			page_path: '', // page name of session_page_paths
			raw_report_element_id: '', // session_path_paths option if activated via link (get page_path on server side from raw report element 
			row: '',
			predecessor_successor_name: ''
		}
		// drill_down_report_field: '',
		// drill_down_number_of_rows: ''
	},
	init: function() {
		// alert('newReport.js - init()');
		// set/update data for new report requests
		newReport.webBrowserSessionId = reportInfo.webBrowserSessionId;
		newReport.reportName = reportInfo.reportName;
		newReport.dateFilter = reportInfo.dateFilter;
		newReport.filterId = reportInfo.filterId;
		newReport.commandLineFilter = reportInfo.commandLineFilter;
		newReport.commandLineFilterComment = reportInfo.commandLineFilterComment;
	},
	setDateFilter: function(df) {
		// alert('setDateFilter:' + df);
		newReport.dateFilter = df;
		newReport.isUpdateReportInfo = true;
		newReport.directives.source_report_info_id = reportInfo.reportInfoId;
		newReport.directives.action = 'reset_row_numbers';
		newReport.request();
	},
	clearDateFilter: function() {
		newReport.clearDateFilterOrGlobalFilter(true, false);
	},
	clearGlobalFilter: function() {
		newReport.clearDateFilterOrGlobalFilter(false, true);
	},
	clearAllFilters: function() {
		newReport.clearDateFilterOrGlobalFilter(true, true);
	},
	clearDateFilterOrGlobalFilter: function(isClearDateFilter, isClearGlobalFilter) {
		if (isClearDateFilter) {newReport.dateFilter = '';}
		if (isClearGlobalFilter) {newReport.filterId = '';}
		newReport.isUpdateReportInfo = true;
		newReport.directives.source_report_info_id = reportInfo.reportInfoId;
		newReport.directives.action = 'reset_row_numbers';
		newReport.request();
	},
	setMacro: function(evt) {
		YAHOO.util.Event.preventDefault(evt);
		// alert('setMacro() - id:' + this.id);
		var elementId = this.id;
		var dat = elementId.split(':');
		var macroItemIndex = parseInt(dat[1], 10);
		var marcosDb = reportInfo.macros;
		var macroItem = marcosDb[macroItemIndex];
		// util.showObject(macroItem);
		if (macroItem['rn'] != null) {
			newReport.reportName = macroItem.rn;
		}
		if (macroItem['df'] != null) {
			newReport.dateFilter = macroItem.df;
		}
		if (macroItem['fi'] != null) {
			// Override filterId and command line filter
			newReport.filterId = macroItem.fi;
			newReport.commandLineFilter = macroItem.f;
			newReport.commandLineFilterComment = macroItem.fc;
		}
		newReport.request();
	},
	sortColumn: function(shortReportElementId, columnId) {
		var h = util.h;
		var reportElements = reportInfo.reportElements;
		var reportElement = reportInfo.reportElements[h(shortReportElementId)];
		var reColumns = reportInfo.reportElementColumns;
		var queryFieldsDb = reportInfo.queryFieldsDb;
		// alert('shortReportElementId: ' + shortReportElementId);
//		util.showObject(reportElement);
		var activeSortBy = reportElement.sortBy;
		var activeSortDirection = reportElement.sortDirection;
		// get activated sortBy data
		var sortBy = reColumns[shortReportElementId][columnId];
		var sortDirection;
//		console.log('activeSortBy: ' + activeSortBy);
//		console.log('activeSortDirection: ' + activeSortDirection);
//		console.log('sortBy: ' + sortBy);
		if (sortBy != activeSortBy) {
			// Sort text ascending and numerical columns descending			
			sortDirection = queryFieldsDb[h(sortBy)].isAggregatingField ? 'descending' : 'ascending';
		}
		else {
			sortDirection = (activeSortDirection == 'descending') ? 'ascending' : 'descending';
		}
//		console.log('sortDirection: ' + sortDirection);
		// Show a warning for log_detail repport if it is not yet sorted 
		// and if the number of total rows is greater than 1,000,000.
		if (reportElement.reportElementType == 'log_detail' &&
			activeSortBy == '' &&
			reportElement.totalRows > 1000000 &&
			!reportInfo.hideLogDetailSortingMessage) {
			logDetailSortingMsg.openViaColumnsSort(true, reportElement.name, sortBy, sortDirection);
		}
		else {
			// Sort right away
			newReport.sortColumnContinued(reportElement.name, sortBy, sortDirection);
		}
	},
	sortColumnContinued: function(reportElementName, sortBy, sortDirection) {
		// Called from sortColumn or via loDetailSortingMsg.js
		newReport.isUpdateReportInfo = true;
		var d = newReport.directives;
		d.source_report_info_id = reportInfo.reportInfoId;
		d.action = 'sort';
		d.report_element_name = reportElementName;
		d.sort_by = sortBy;
		d.sort_direction = sortDirection;
		// util.showObject(d);
		newReport.request();
	},
	setRowNumber: function(shortReportElementId, startingRow, endingRow, number_of_rows) {
		newReport.isUpdateReportInfo = true;
		var d = newReport.directives;
		d.source_report_info_id = reportInfo.reportInfoId;
		d.action = 'set_row_number';
		d.report_element_name = reportInfo.reportElements[util.h(shortReportElementId)].name;
		d.drill_down_number_of_rows = 1;
		d.starting_row = startingRow;
		d.ending_row = endingRow;
		d.number_of_rows = number_of_rows;
		// util.showObject(d);
		newReport.request();
	},
	setBreakdown: function(rowId) {
		// Get the rowID
		// var td = this.parentNode;
		// var tr = td.parentNode;
		// var rowId = tr.id;
		var h = util.h;
		var dat = rowId.split(':');
		var sid = dat[0];
		var rowNumber = dat[2];
		// alert('breakdownControl itemActivated(), rowID: ' + rowId);
		var reportElements = reportInfo.reportElements;
		newReport.isUpdateReportInfo = true;
		var directives = newReport.directives;
		directives.source_report_info_id = reportInfo.reportInfoId;
		directives.action = 'breakdown';
		directives.report_element_name = reportElements[h(sid)].name;
		directives.breakdown.raw_report_element_id = reportElements[h(sid)].id;
		directives.breakdown.raw_row_number = rowNumber;
		newReport.request();
	},
	clearBreakdown: function(element) {
		var elementId = element.id;
		var dat = elementId.split(':');
		var sid = dat[0];
		var reportElements = reportInfo.reportElements;
		newReport.isUpdateReportInfo = true;
		var directives = newReport.directives;
		directives.source_report_info_id = reportInfo.reportInfoId;
		directives.action = 'clear_breakdown';
		directives.report_element_name = reportElements[util.h(sid)].name;
		newReport.request();
	},
	setPagePathViaKey: function(evt) {
		var element = evt.target || evt.srcElement;
		var theKeyCode = (evt.which) ? evt.which : evt.keyCode;
		if (theKeyCode == 13 || theKeyCode == 3) {
			newReport.setPagePath(element.id);
		}
	},
	setPagePathViaButton: function() {
		newReport.setPagePath(this.id);
	},
	setPagePath: function(elementId) {
		var dat = elementId.split(':');
		var sid = dat[0];
		// Check if a page name is given
		var pagePath = util.getF(sid + ':page_path_field');
		// alert('pagePath: ' + pagePath);
		if (pagePath != '') {
			var reportElements = reportInfo.reportElements;
			newReport.isUpdateReportInfo = true;
			var directives = newReport.directives;
			directives.source_report_info_id = reportInfo.reportInfoId;
			directives.action = 'session_page_paths';
			directives.report_element_name = reportElements[util.h(sid)].name;
			directives.session_page_paths.is_page_path = true;
			directives.session_page_paths.page_path = pagePath;
			newReport.request();
		}
		else {
			alert('Please define a page.');
		}
	},
	setPagePathViaLink: function(evt) {
		var element = evt.target || evt.srcElement;
		var elementId = element.id;
		if (elementId.indexOf(':row:') != -1) {
			var h = util.h;
			// Get the actual page path from the raw report element
			var dat = elementId.split(':');
			var sid = dat[0];
			var row = dat[2];
			var predecessorSuccessorName = dat[3];
			var reportElements = reportInfo.reportElements;
			newReport.isUpdateReportInfo = true;
			var directives = newReport.directives;
			directives.source_report_info_id = reportInfo.reportInfoId;
			directives.action = 'session_page_paths';
			directives.report_element_name = reportElements[h(sid)].name;
			directives.session_page_paths.is_page_path = false;
			directives.session_page_paths.raw_report_element_id = reportElements[h(sid)].id;
			directives.session_page_paths.row = row;
			directives.session_page_paths.predecessor_successor_name = predecessorSuccessorName;
			newReport.request();
		}
	},
	getReportByMenuItem: function(e) {
		// alert('getReportByMenuItem() - id: ' + this.id);
		YAHOO.util.Event.preventDefault(e);
		var elementId = this.id;
		var dat = elementId.split(':');
		var menuItemId = dat[2];
		var menuItem = reportsMenuDb[menuItemId];
		var reportName;
		var isCalendar;
		if (menuItem.type == 'report') {
			reportName = menuItem.name;
			isCalendar = false;
		}
		else {
			// menuItem.type is calendar
			reportName = '';
			isCalendar = true;
		}
		newReport.reportName = reportName;
		newReport.isCalendar = isCalendar;
		// util.showObject(newReport);
		//
		// Check zoom control for dateFilter and/or filterId
		//
		if (!zoomControl.isZoomItems || isCalendar) {
			// alert('newReport.dateFilter: ' + newReport.dateFilter);
			if (isCalendar && zoomControl.dateFilter != '') { // if is calendar
				// add the new dateFilter
				newReport.dateFilter = zoomControl.dateFilter;
			}
			/*
			if (zoomControl.filterId != '') {
				// add the new filter
				newReport.filterId = zoomControl.filterId;
			}
			*/
			// util.showObject(newReport);
			newReport.request();
		}
		else {
			// There are active zoom items, so we first generate the filter in the background
			// to get a date_filter and/or filterId and then request the report via
			// getReportByMenuItemAfterZoomControlResponse()
			newReport.setLoadingState();
			// zoomControl.createZoomFilter(0);
			zoomControl.zoomRegular();
		}
	},
	getReportByReportLink: function(e) {
		YAHOO.util.Event.preventDefault(e);
		var elementId = this.id;
		var dat = elementId.split(':');
		var shortReportElementId = dat[0];
		var reportElement = reportInfo.reportElements[util.h(shortReportElementId)];
		newReport.reportName = reportElement.reportLink;
		if (!zoomControl.isZoomItems) {
			newReport.request();
		}
		else {
			// There are active zoom items, so we first generate the filter in the background
			// to get a date_filter and/or filterId and then request the report via
			// getReportByMenuItemAfterZoomControlResponse()
			newReport.setLoadingState();
			// zoomControl.createZoomFilter(0);
			zoomControl.zoomRegular();
		}
	},
	getReportByMenuItemViaZoomRegular: function(dateFilter, filterId) {
		if (dateFilter != '') {
			// add the new dateFilter
			newReport.dateFilter = dateFilter;
		}
		if (filterId != '') {
			// add the new filter
			newReport.filterId = filterId;
		}
		// util.showObject(newReport);
		newReport.request();
	},
	getReportByCustomizeReportElement: function() {
		// A report element has been customized, we get a new report
		// where the changes are already applied in the web browser session report
		var skipResetRowNumbers = true;
		newReport.request(skipResetRowNumbers);
	},
	request: function(skipResetRowNumbers) {
		// skipResetRowNumbers is optional, it is only required
		// when a report is requested via getReportByCustomizeReportElement()
		// because we must not reset the row numbers with CRE.
		// So in all other cases skipResetRowNumbers is false
		if (arguments.length == 0) {
			var skipResetRowNumbers = false;
		}
		// alert('request() - skipResetRowNumbers: ' + skipResetRowNumbers);
		// alert('request() - newReport.dateFilter: ' + newReport.dateFilter);
		newReport.setLoadingState();
		// alert('report.js request() calls request_report.cfv');
		var url = '?dp=statistics.dynamic_reports.request_report';
		url += '&p=' + reportInfo.profileName;
		var isUpdateReportInfo = newReport.isUpdateReportInfo;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken;
		dat += '&v.fp.report_info_id=';
		dat += '&v.fp.report_name=' + newReport.reportName;
		dat += '&v.fp.is_calendar=' + newReport.isCalendar;
		dat += '&v.fp.date_filter=' + newReport.dateFilter;
		dat += '&v.fp.command_line_filter=' + newReport.commandLineFilter;
		dat += '&v.fp.command_line_filter_comment=' + newReport.commandLineFilterComment;
		dat += '&v.fp.filter_id=' + newReport.filterId;
		dat += '&v.fp.is_update_report_info=' + isUpdateReportInfo;
		dat += '&v.fp.caller_is_report_page=true';
		dat += '&v.fp.web_browser_session_id=' + newReport.webBrowserSessionId;
		dat += '&v.fp.skip_reset_row_numbers=' + skipResetRowNumbers;
		//
		// add any directives (for update_report_info())
		//
		if (isUpdateReportInfo) {
			var directives = newReport.directives;
			for (var prop in directives) {
				switch (prop) {
					case 'pivot_table':
						var pivotDirectives = directives.pivot_table;
						for (var pivotProp in pivotDirectives) {
							dat += '&v.fp.directives.pivot_table.' + pivotProp + '=' + pivotDirectives[pivotProp];
						}
						break;
					case 'breakdown':
						var breakdownDirectives = directives.breakdown;
						for (var breakdownProp in breakdownDirectives) {
							dat += '&v.fp.directives.breakdown.' + breakdownProp + '=' + breakdownDirectives[breakdownProp];
						}
						break;
					case 'session_page_paths':
						var sessionPagePathsDirectives = directives.session_page_paths;
						for (var sessionPagePathsProp in sessionPagePathsDirectives) {
							dat += '&v.fp.directives.session_page_paths.' + sessionPagePathsProp + '=' + sessionPagePathsDirectives[sessionPagePathsProp];
						}
						break;
					default:
						dat += '&v.fp.directives.' + prop + '=' + directives[prop];
					break;
				}
				/*
				if (prop != 'pivot_table') {
					dat += '&v.fp.directives.' + prop + '=' + directives[prop];
				}
				else {
					var pivotDirectives = directives.pivot_table;
					for (var pivotProp in pivotDirectives) {
						dat += '&v.fp.directives.pivot_table.' + pivotProp + '=' + pivotDirectives[pivotProp];
					}
				}
				*/
			}
		}
		// alert(dat);
		//
		// add expanded menu groups
		//
		for (var i = 0; i < reportsMenuDb.length; i++) {
			var item = reportsMenuDb[i];
			if (item.type == 'group' && item.isExpanded) {
				dat += '&v.fp.expanded_menu_groups.' + i + '=' + item.name;
			}
		}
		/*
		var menuGroups = reportInfo.expandedMenuGroups;
		var count = 0;
		for (var prop in menuGroups) {
			if (menuGroups[prop] == true) {
				dat += '&v.fp.expanded_menu_groups.' + count + '=' + prop;
				count++;
			}
		}
		*/
		util.serverPost(url, dat);
	},
	requestResponse: function(dat) {
		// alert('requestResponse: ' + dat + '\ndat.isReadyReport: ' + dat.isReadyReport);
		// TEMP DISABLED
		// alert('requestResponse() - DISABLED');
		// return false;
		// util.showObject(dat);
		// add new report data reportInfo!
		newReport.reportInfoId = dat.reportInfoId;
		newReport.reportJobId = dat.reportJobId;
		if (newReport.webBrowserSessionId == '') {
			// No webBrowserSessionId exists yet, so it has been set in request_report.cfv
			newReport.webBrowserSessionId = dat.webBrowserSessionId;
		}
		// preset URL
		newReport.presetUrl(dat.pid, dat.isReadyReport);
	},
	presetUrl: function(reportTaskId, isReadyReport) {
		// util.showObject(newReport.info);
		var url = '?dp=statistics.dynamic_reports.preset_url';
		url += '&p=' + reportInfo.profileName;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken;
		dat += '&v.fp.report_name=' + newReport.reportName;
		dat += '&v.fp.is_calendar=' + newReport.isCalendar;
		dat += '&v.fp.date_filter=' + encodeURIComponent(newReport.dateFilter);
		dat += '&v.fp.command_line_filter=' + encodeURIComponent(newReport.commandLineFilter);
		dat += '&v.fp.command_line_filter_comment=' + encodeURIComponent(newReport.commandLineFilterComment);
		dat += '&v.fp.filter_id=' + newReport.filterId;
		dat += '&v.fp.report_info_id=' + newReport.reportInfoId;
		dat += '&v.fp.report_job_id=' + newReport.reportJobId;
		dat += '&v.fp.report_task_id=' + reportTaskId;
		dat += '&v.fp.is_ready_report=' + isReadyReport;
		dat += '&v.fp.caller_is_report_page=true';
		dat += '&v.fp.web_browser_session_id=' + newReport.webBrowserSessionId;
		util.serverPost(url, dat);
	},
	presetUrlResponse: function() {
		// alert('report.js presetUrlResponse()');
		var url = location.protocol + '//' + location.host + location.pathname + '?dp=reports';		
		url += '&p=' + reportInfo.profileName;
		if (!newReport.isCalendar) {
			url += '&rn=' + newReport.reportName;
		}
		else {
			url += '&calendar=true';
		}
		if (newReport.dateFilter != '') {
			url += '&df=' + encodeURIComponent(newReport.dateFilter);
		}
		if (newReport.filterId != '') {
			url += '&fi=' + newReport.filterId;
		}
		if (newReport.commandLineFilter != '') {
			url += '&f=' + encodeURIComponent(newReport.commandLineFilter);
		}
		if (newReport.commandLineFilterComment != '') {
			url += '&fc=' + encodeURIComponent(newReport.commandLineFilterComment);
		}
		if (newReport.reportInfoId != '') {
			url += '&rii=' + newReport.reportInfoId;
		}
		// if (newReport.webBrowserSessionId != '') {
		// There must be always a clientUrl.webBrowserSessionId,
		// so we don't need to check if it is empty
		url += '&wbsi=' + newReport.webBrowserSessionId;
		location.href = url;
	},
	setLoadingState: function() {
		// hide zoomInfo
		zoomInfo.close();
		// hide reports toolbar anchor elements but
		util.hideEV('reports_toolbar');
		util.hideE('reports_menu_and_report_section');
		// hide reports menu background
		var body = util.getE('html:body');
		body.style.backgroundRepeat = 'no-repeat';
	}
}
//
// zoomInfo.js
//
var zoomInfo = {
	// zoomInfo is used by zoomControl & calendarControl
	isOpenPanel: false,
	isBuild: false,
	// top: 140, // top position of zoomInfo box
	// initialLoadDone: false, // initial load is displayed after opening the zoom panel (if initated by zoomControl only)
	update: function(isDateFilter, isFiltersItems, showAddBuildInReportFilters) {
		if (!zoomInfo.isOpenPanel) {
			zoomInfo.open();
		}
		var showDate = (isDateFilter && !isFiltersItems);
		util.showE('zoom_info:date_items:box', showDate);
		util.showE('zoom_info:filter_items:box', isFiltersItems);
		util.showE('zoom_info:build_in_filters:box', showAddBuildInReportFilters);
	},
	open: function() {
		if (!zoomInfo.isBuild) {
			// build the html
			zoomInfo.build();
		}
		util.showE('zoom_info:panel');
		zoomInfo.setPosition();
		YAHOO.util.Event.addListener(window, 'scroll', zoomInfo.setPositionByEvent);
		zoomInfo.isOpenPanel = true;
	},
	close: function() {
		if (zoomInfo.isOpenPanel) {
			YAHOO.util.Event.removeListener(window, 'scroll', zoomInfo.setPositionByEvent);
			util.hideE('zoom_info:panel');
			// Uncheck the Add build-in report filters checkbox
			// util.setF('zoom_info:add_build_in_report_filter:btn', false);
			zoomInfo.isOpenPanel = false;
		}
	},
	build: function() {
		// builds the html zoom filter panel
		var container = util.getE('reports_menu_and_report_section');
		// Create content of round box
		var table = util.createE('table', {className:'zoom-info'});
		var tbody = util.createE('tbody');
		var tr = util.createE('tr');
		var tdLeft = util.createE('td');
		var tdMiddle = util.createE('td');
		var tdRight = util.createE('td');
		zoomInfo.buildLeftColumn(tdLeft);
		zoomInfo.buildMiddleColumn(tdMiddle);
		zoomInfo.buildRightColumn(tdRight);
		util.chainE(table, tbody, [tr, tdLeft, tdMiddle, tdRight]);
		// Create the round box
		// var div = util.getRoundBox('zoom_info:panel', 20, table);
		var div = util.createE('div', {id:'zoom_info:panel', className:'panel-20', display:'none'});
		util.chainE(container, div, table);
		// IE requires to add any event after the new DOM is part of the document!
		var cancelZoomEvent = !reportInfo.isCalendar ? zoomControl.cancelZoom : calendarControl.cancelZoom;
		YAHOO.util.Event.addListener('zoom_info:cancel_btn', 'click', cancelZoomEvent);
		zoomInfo.isBuild = true;
	},
	buildLeftColumn: function(td) {
		var src = imgDb.zoomLarge.src;
		var img = util.createE('img', {src:src, width:23, height:23, alt:''});
		util.chainE(td, img);
	},
	buildMiddleColumn: function(td) {
		var div = util.createE('div', {paddingRight:'200px', paddingBottom:'6px', fontWeight:'bold'});
		var text = util.createT(langVar('lang_stats.zoom.zoom_active'));
		var dateDiv = util.createE('div', {id:'zoom_info:date_items:box'});
		var dateMessage = reportInfo.isCalendar ? langVar('lang_stats.zoom.zoom_to_date_in_calendar_info') : langVar('lang_stats.zoom.zoom_to_date_items_info');
		var dateText = util.createT(dateMessage);
		var itemsDiv = util.createE('div', {id:'zoom_info:filter_items:box'});
		var itemsText = util.createT(langVar('lang_stats.zoom.zoom_selected_items_info'));
		var buildInFiltersDiv = util.createE('div', {id:'zoom_info:build_in_filters:box', paddingTop:'11px'});
		var input = util.createE('input', {id:'zoom_info:add_build_in_filters', type:'checkbox'});
		var label = util.createE('label', {htmlFor:'zoom_info:add_build_in_filters'});
		var labelText = util.createT(' ' + langVar('lang_stats.zoom.add_build_in_report_filters'));
		util.chainE(label, labelText);
		util.chainE([td, [div, text], [dateDiv, dateText], [itemsDiv, itemsText], [buildInFiltersDiv, input, label]]);
	},
	buildRightColumn: function(td) {
		var button = util.createE('button', {id:'zoom_info:cancel_btn', marginBottom:'24px'}); // margin keeps some default height
		var text = util.createT(langVar('lang_stats.btn.cancel_zoom'));
		util.chainE(td, button, text);
	},
	setPositionByEvent: function() {
		setTimeout('zoomInfo.setPosition()', 400);
	},
	setPosition: function() {
		var YD = YAHOO.util.Dom;
		var reg = YD.getRegion('report_section');
		// util.showObject(reg);
		var left = reg.left + 10;
		var top = reportInfo.isCalendar ? reg.top - 40 : reg.top + 10;
		var yOffset = YD.getDocumentScrollTop();
		var element = util.getE('zoom_info:panel');
		element.style.left = left + 'px';
		element.style.top = (yOffset + top) + 'px';
	}
}
//
// zoomControl.js
//
var zoomControl = {
	// add date or filter items by selecting rows in multiple report elements
	zoomItems: {}, // contains any date item or filter item (the row id) which has to be added to the filter
	isZoomItems: false, // New, indicates if any zoom items are active
	// Following three properties are used for the zoomInfo box,
	// they indicate what items are selected (date and/or non-date items)
	// and if the report or report element has an in-build filter.
	isDateFilter: false,
	isFilterItems: false,
	showAddBuildInReportFilters: false,
	silentZoomItemsIds: {},  // keeps track of zoomItemsId's which have already been send to the server in silent mode
	currentSilentZoomItemsId: '', // contains any active zoomItemId in silent mode
	dateFilter: '', // Don't remove, dateFilter is used by Calendar!
	// currentTimeoutId: '',
	// dateFilter: '',
	// dateFilterDisplay: '',
	// filterId: '',
	// itemStack: {},
	// itemStackId: '',  // i.e.: 're0:row:0-re0:row:3'
	// isAddBuildInReportFilters: false,
	// justAddedFilterItems: [], // Contains added filter items. Array is used in report_tools.js!
	// isAddBuildInReportFilters is set to true if a build in report filter or
	// report element filter exists and if "Add build in report filter(s) is checked.
	// The itemStack contains any filterId and justAddedFilterItems array we received from the server.
	// property name (itemStackId) is a combination of the itemId in alphabetical order,
	//	re0:row:0 = {
	//		filterId: 'abc123...',
	//		filterItems: [{...}, {...}, ...]
	//	}
	//	re0:row:0-re0:row:1 = {
	//		filterId: 'abc123...',
	//	 	filterItems: [{...}, {...}, ...]
	//	}
	addRemoveZoomItem: function(rowId, isAddItem) {
		var zoomItems = zoomControl.zoomItems;
		var isZoomItems = false;
		if (isAddItem) {
			// Add item to zoomItems
			zoomItems[rowId] = true;
			isZoomItems = true;
		}
		else {
			// Remove item from zoomItems
			delete zoomItems[rowId];
			// Check if there are any zoomItems yet
			for (var prop in zoomItems) {
				isZoomItems = true;
				break;
			}
		}
		if (isZoomItems) {
			zoomControl.updateSelectedZoomItemState();
			zoomInfo.update(zoomControl.isDateFilter, zoomControl.isFilterItems, zoomControl.showAddBuildInReportFilters);
			zoomControl.isZoomItems = true;
		}
		else {
			zoomControl.cancelZoom();
		}
	},
	cancelZoom: function() {
		// deselects all selected rows
		// and resets filterItems objects
		// Reset zoom object
		zoomControl.isZoomItems = false;
		zoomControl.zoomItems = {};
		zoomControl.isDateFilter = false;
		zoomControl.isFilterItems = false;
		zoomControl.showAddBuildInReportFilters = false;
		// Note, we don't reset zoomControl.silentZoomItemsIds!
		zoomControl.currentSilentZoomItemsId = '';
		/*
		zoomControl.itemStackId = '';
		zoomControl.dateFilter = '';
		zoomControl.dateFilterDisplay = '';
		zoomControl.filterId = '';
		zoomControl.justAddedFilterItems = [];
		zoomControl.isAddBuildInReportFilters = false;
		*/
		reportsMenu.updateMenuItemLinks(
			reportsMenuDb,
			reportInfo.dateFilter,
			reportInfo.commandLineFilter,
			reportInfo.commandLineFilterComment,
			reportInfo.filterId,
			''
		);
		// Reset the rows
		report.rowSelection.resetZoomItems();
		// Close zoom info	
		zoomInfo.close();
		// util.hideE('add_filter_items_info');
	},	
	zoomRegular: function() {
		// Invoked via click on report by left mouse click
		var zoomInfoId = zoomControl.getZoomInfoId();
		var url = '?dp=statistics.filters.zoom.zoom_regular';
		url += '&p=' + reportInfo.profileName;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken + '&';
		dat += zoomControl.getZoomItemsDat(zoomInfoId);
		util.serverPost(url, dat);
	},
	zoomRegularResponse: function(dat) {
		// util.showObject(dat);
		// return false;
		newReport.getReportByMenuItemViaZoomRegular(dat.dateFilter, dat.filterId);
	},
	zoomSilent: function(evt) {
		// Invoked via click on report menu item by right mouse click
		// We save current zoom data in sessions so that a date_filter and/or filter
		// can be created when the report is opened in a new tab or window
		// Check if any zoom item is active
		var isZoomItems = true; // test
		if (zoomControl.isZoomItems) {
			// Check if the user clicked the left mouse button (we need the right one but the left one is easier to check)
			var isLeftMouseBtnClick = (evt.which == 1 || evt.button == 1);
			if (!isLeftMouseBtnClick) {
				// This must be a right mouse button click
				// alert('prepareFilterUponMenuRightClick() - prepare the filter in the background');
				// In order to send the zoom info multiple times we check if it has already been send.
				var activeZoomItemsId = zoomControl.getActiveZoomItemsId();
				//
				// silentZoomItemsIds: {},  // keeps track of zoomItemId's which have already been send to the server in silent mode
				// currentSilentZoomItemsId: ''
				//
				if (zoomControl.currentSilentZoomItemsId != activeZoomItemsId) {
					// Verify if activeZoomItemsId has not been handled
					var silentZoomItemsIds = zoomControl.silentZoomItemsIds;
					var zoomInfoId;
					if (silentZoomItemsIds[activeZoomItemsId] == null) {
						var zoomInfoId = zoomControl.getZoomInfoId();
						silentZoomItemsIds[activeZoomItemsId] = zoomInfoId;
						// Send zoomInfo to server
						var url = '?dp=statistics.filters.zoom.zoom_silent';
						url += '&p=' + reportInfo.profileName;
						var dat = 'v.fp.page_token=' + reportInfo.pageToken + '&';
						dat += zoomControl.getZoomItemsDat(zoomInfoId);
						util.serverPost(url, dat);
					}
					else {
						// ZoomItemsDat has already been send
						zoomInfoId = silentZoomItemsIds[activeZoomItemsId];
					}
					// alert('activeZoomItemsId: ' + activeZoomItemsId + '\nzoomInfoId :' + zoomInfoId);
					zoomControl.currentSilentZoomItemsId = activeZoomItemsId;
					reportsMenu.updateMenuItemLinks(
						reportsMenuDb,
						reportInfo.dateFilter,
						reportInfo.commandLineFilter,
						reportInfo.commandLineFilterComment,
						reportInfo.filterId,
						zoomInfoId
					);
				}
			}
		}
	},
	zoomSilentResponse: function() {
		// No action required, return false
		return false;
	},
	getZoomItemsDat: function(zoomInfoId) {
		//
		// Collect zoom items
		//
		// Create an object like
		// o = {'1256732371':{'0':[],'1':['3', '2']}, '1256732371':{'2':[], '10':[]}}
		var reportElements = reportInfo.reportElements;
		var zoomItems = zoomControl.zoomItems;
		var items = {};
		for (var prop in zoomItems) {
			var dat = prop.split(':');
			var shortReportElementId = dat[0];
			var row = dat[2];
			var subRow = (dat.length == 4) ? dat[3] : '';
			// alert('prop: ' + prop + '\nsubRow: ' + subRow);
			var reportElementId = reportElements[util.h(shortReportElementId)].id;
			if (items[reportElementId] == null) {
				items[reportElementId] = {};
			}
			var reportElement = items[reportElementId];
			if (reportElement[row] == null) {
				reportElement[row] = [];
			}
			// Add any subrows
			if (subRow != '') {
				var reportElementRowArray = reportElement[row];
				reportElementRowArray[reportElementRowArray.length] = subRow;
			}
		}
		var isAddBuildInReportFilters = zoomControl.showAddBuildInReportFilters ? util.getF('zoom_info:add_build_in_filters') : false;
		// util.showObject(items);
		var dat = 'v.fp.is_zoom_items=true'; // Used when assembling the dat string in globalFilter.js, don't remove!
		dat += '&v.fp.zoom_info_id=' + zoomInfoId;
		dat += '&v.fp.active_filter_id=' + reportInfo.filterId; // Also used when assembling zoom items in globalFilter.js, don't rename or remove!
		// dat += '&v.fp.item_stack_id=' + itemStackId;
		// dat += '&v.fp.client_processing_type=' + cientProcessingType;
		dat += '&v.fp.is_add_build_in_report_filters=' + isAddBuildInReportFilters;
		dat += '&v.fp.is_report_filter=' + reportInfo.isReportFilter;
		dat += '&v.fp.is_report_element_filters=' + reportInfo.isReportElementFilters;
		dat += '&v.fp.report_job_id=' + reportInfo.reportJobId;
		var reportElementCount = 0;
		for (var reportElementProp in items) {
			var reportElementRows = items[reportElementProp];
			dat += '&v.fp.report_elements.' + reportElementCount + '.report_element_id=' + reportElementProp;
			for (var rowProp in reportElementRows) {
				var subRowsDat = reportElementRows[rowProp];
				if (subRowsDat.length == 0) {
					dat += '&v.fp.report_elements.' + reportElementCount + '.rows.' + rowProp + '=true';
				}
				else {
					for (var i = 0; i < subRowsDat.length; i++) {
						dat += '&v.fp.report_elements.' + reportElementCount + '.rows.' + rowProp + '.' + subRowsDat[i] + '=true';
					}
				}
			}
			reportElementCount++;
		}
		return dat;
	},
	//
	//
	// Utilities
	//
	//
	getZoomInfoId: function() {
		// Returns a unique ID
		var date = new Date();
		return date.getTime();
	},
	getActiveZoomItemsId: function() {
		// Creates an ID of the active zoom items
		var zoomItems = zoomControl.zoomItems;
		var zoomItemsList = [];
		var i = 0;
		for (var prop in zoomItems) {
			zoomItemsList[i] = prop;
			i++;
		}
		// Sort the zoomItemsList so that we get unique zoomItemId's regardless of the zoom items order
		zoomItemsList.sort();
		var zoomItemsId = '';
		for (var i = 0; i < zoomItemsList.length; i++) {
			zoomItemsId += (i + 1 != zoomItemsList.length) ? zoomItemsList[i] + '_' : zoomItemsList[i];
		}
		zoomItemsId = zoomItemsId.replace(/:/g, '_');
		// Get checkbox value of AddBuildInReportFilters if it is active
		if (zoomControl.showAddBuildInReportFilters && util.getF('zoom_info:add_build_in_filters')) {
			zoomItemsId += '_add_build_in_filters_true';
		}
		return zoomItemsId;
	},
	/*
	toggleAddBuildInReportFilters: function() {
		var isAddBuildInReportFilters = this.checked;
		zoomControl.isAddBuildInReportFilters = isAddBuildInReportFilters;
		// Update filter
		// zoomControl.checkForFilter();
	},
	*/
	updateSelectedZoomItemState: function() {
		// Checks all selected zoom items to set state for
		// isDateFilter
		// isFilterItems
		// showAddBuildInReportFilters
		// We need to check of rows in zoomItems if the row contains date-items and/or non-date items.
		var alreadyCheckedOuterRows = {}; // Contains report element id if it has been already checked
		var alreadyCheckedInnerRows = {}; // Contains report element id of an inner row if it has been already checked
		var isDateFilter = false;
		var isFilterItems = false;
		var zoomItems = zoomControl.zoomItems;
		var queryFieldsDb = reportInfo.queryFieldsDb;
		for (var prop in zoomItems) {
			// prop is the rowId
			var dat = prop.split(':');
			var shortReportElementId = dat[0];
			var isInnerRow = (dat.length == 4);
			var checkRow = false;
			var reportFieldName;
			var reportField;
			if (!isInnerRow) {
				checkRow = (alreadyCheckedOuterRows[shortReportElementId] == null);
			}
			else {
				checkRow = (alreadyCheckedInnerRows[shortReportElementId] == null);
			}
			if (checkRow) {
				var columns = reportInfo.reportElementColumns[shortReportElementId];
				for (var columnPro in columns) {
					reportFieldName = columns[columnPro];
					reportField = queryFieldsDb[util.h(reportFieldName)];
					if (!reportField.isAggregatingField) {
						if (reportField.category != 'date_time') {
							isFilterItems = true;
						}
						else {
							isDateFilter = true;
						}
					}
				}
				// Above case also covered the outer row of a pivot table, so we can mark it as done.
				alreadyCheckedOuterRows[shortReportElementId] = true;
				if (isInnerRow) {
					// We need yet to check the category of the pivot report field
					var reportElement = reportInfo.reportElements[util.h(shortReportElementId)];
					var reportFieldName = reportElement.pivotTable.reportField;
					var reportField = queryFieldsDb[util.h(reportFieldName)];
					if (reportField.category != 'date_time') {
						isFilterItems = true;
					}
					else {
						isDateFilter = true;
					}
				}
			}
		}
		zoomControl.isDateFilter = isDateFilter;
		zoomControl.isFilterItems = isFilterItems;
		zoomControl.showAddBuildInReportFilters = zoomControl.getShowAddBuildInReportFilters();
		// alert('updateSelectedZoomItemState()\nisDateFilter: ' + isDateFilter + '\nisFilterItems: ' + isFilterItems + '\nshowAddBuildInReportFilters: ' + zoomControl.showAddBuildInReportFilters);
	},
	getShowAddBuildInReportFilters: function() {
		// Returns true if the "Add build in report filters" checkbox should be shown in zoom info
		// We show the "Add build in report filters" checkbox if:
		// a.) The report contains a filter
		// b.) The report element of selected zoom items contains a filter
		// Note, in case of multiple build in report filters we add them as separate
		// filter expressions.
		// We only need to update this feature in case that one report filter or one report element filter exists
		var reportElements = reportInfo.reportElements;
		var isReportFilter = reportInfo.isReportFilter;
		var isReportElementFilters = reportInfo.isReportElementFilters;
		var showAddBuildInReportFilters = false;
		if (isReportFilter || isReportElementFilters) {
			var zoomItems = zoomControl.zoomItems;
			var isZoomItems = false;
			for (var prop in zoomItems) {
				isZoomItems = true;
				break;
			}
			if (isZoomItems) {
				if (isReportFilter) {
					showAddBuildInReportFilters = true;
				}
				else {
					// This report has one or more report element filters
					if (reportElements.length == 1) {
						// There is only one report element, so all
						// selected items must be from this report element.
						showAddBuildInReportFilters = true;
					}
					else {
						// Multiple report elements
						// We need to check if any checked item belongs
						// to a report element which has a report element filter.
						var activeReportElementIds = {};
						for (var prop in zoomItems) {
							var dat = prop.split(':');
							var shortReportElementId = dat[0];
							activeReportElementIds[shortReportElementId] = true;
						}
						for (var shortReportElementId in activeReportElementIds) {
							var isReportElementFilter = reportElements[util.h(shortReportElementId)].isReportElementFilter;
							if (isReportElementFilter) {
								showAddBuildInReportFilters = true;
								break;
							}
						}
					}
				}
			}
		}
		// alert('isShowBuildInReportFilters(): ' + showAddBuildInReportFilters);
		return showAddBuildInReportFilters;
	}
}
//
// calendarControl.js
//
var calendarControl = {
	dfMonths: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
	selectedElementId: '',
	selectedElementClassName: '',
	init: function() {
		// attach events
		var isIE6 = util.userAgent.isIE6;
		// alert('isIE6: ' + isIE6);
		// isIE6 = true;
		var calendar = util.getE('calendar');
		var calendarLinks = calendar.getElementsByTagName('a');
		for (var i = 0; i < calendarLinks.length; i++) {
			var anchor = calendarLinks[i];
			YAHOO.util.Event.addListener(anchor, 'click', calendarControl.setDate);
			// Fix Internet Explorer text-hover problem by adding a height to the anchor element
			if (isIE6) {
				anchor.style.height = '0.1em';
			}
		}
		// Fix Internet Explorer text-hover problem by adding a height to all span elements
		// We do this to keep the height constant bewteen anchor and span elements. Span elements
		// are used for days or weeks which have no log data.
		if (isIE6) {
			var calendarSpans = document.getElementsByTagName('span');
			for (var i = 0; i < calendarSpans.length; i++) {
				var span = calendarSpans[i];
				span.style.height = '0.1em';
			}
		}
		util.showE('calendar');
	},
	setDate: function() {
		// Create a dateFilter and dateFilter display value from the given elementId where dateId is in the format:
		// y:2006
		// m:2006:1
		// d:2006:1:20
		// w0:2006:1:20:2006:1:26 (week)
		// w1:2006:1:20:2006:1:26 (week)
		// Note that the first letter in week ID's is followed by a number. The number avoids duplicate id's
		// because the last week id in i.e. Jan could be the same id as the first week in Feb!
		// alert('setDate(): ' + this.id);
		var anchor = this;
		var elementId = anchor.id;
		var isEntireDateRange = (elementId == 'calendar:set_entire_date_range') ? true : false;
		if (elementId == calendarControl.selectedElementId) {
			calendarControl.cancelZoom();
			return false;
		}
		// Recover state of any selected element
		if (calendarControl.selectedElementId != '') {
			calendarControl.deselectActiveElement();
		}
		// Get existing className
		var className = (anchor.className != null) ? anchor.className : '';
		//alert('elementId: ' + elementId + '\nanchor className: ' + className);
		// Selecet calendar element
		anchor.className = (className == '') ? 'active' : className + ' active';
		calendarControl.selectedElementId = elementId;
		calendarControl.selectedElementClassName = className;
		//
		// Set df & dfDisplay
		// 
		var df; // The date filter in URL
		var dfDisplay = '' // The date filter displayed in zoomInfo
		var year;
		var monthInt;
		var month;
		var monthDisplay;
		var day;
		var dayDisplay;
		var year2;
		var month2Int;
		var month2;
		var month2Display;
		var day2;
		var day2Display;
		if (!isEntireDateRange) {
			var dat = elementId.split(':');
			var id = dat[0];
			year = dat[1];
			if (id == 'y') {
				// date is year
				df = year;
				dfDisplay = year;
			}
			else {
				monthInt = parseInt(dat[2], 10);
				month = calendarControl.dfMonths[monthInt];
				monthDisplay = lang.monthsShort[monthInt];
				if (id == 'm') {
					// date is month
					df = month + year;
					dfDisplay = monthDisplay + '/' + year;
				}
				else {
					// date is day or week
					day = parseInt(dat[3], 10);
					dayDisplay = (day > 9) ? day : '0' + day;
					df = day + month + year;
					dfDisplay = dayDisplay + '/' + monthDisplay + '/' + year;
					if (id != 'd') {
						// date is week
						year2 = dat[4];
						month2Int = parseInt(dat[5], 10);
						month2 = calendarControl.dfMonths[month2Int];
						month2Display = lang.monthsShort[month2Int];
						day2 = parseInt(dat[6], 10);
						day2Display = (day2 > 9) ? day2 : '0' + day2;
						df += '-' + day2 + month2 + year2;
						dfDisplay += ' - ' + day2Display + '/' + month2Display + '/' + year2;
					}
				}
			}
		}
		else {
			// ID is 'calendar:set_entire_date_range'
			var earliestDate = reportInfo.earliestDate;
			var earliestDateJs = util.salangDateToSimpleDateObject(earliestDate);
			df = '';
			dfDisplay = calendarControl.simpleDateObjectToDisplay(earliestDateJs);
			if (earliestDate != reportInfo.latestDate) {
				var latestDateJs = util.salangDateToSimpleDateObject(reportInfo.latestDate);
				dfDisplay += ' - ' + calendarControl.simpleDateObjectToDisplay(latestDateJs);
			}
		}
		// alert('isEntireDateRange: ' + isEntireDateRange + '\ndfDisplay: ' + dfDisplay);
		zoomInfo.update(true, false, false);
		reportsMenu.updateMenuItemLinks(
			reportsMenuDb,
			df,
			reportInfo.commandLineFilter,
			reportInfo.commandLineFilterComment,
			reportInfo.filterId,
			''
		);
		newReport.dateFilter = df;
	},
	cancelZoom: function() {
		// alert('calendarControl.cancelZoom()');
		calendarControl.deselectActiveElement();
		calendarControl.selectedElementId = '';
		calendarControl.selectedElementClassName = '';
		zoomInfo.close();
		var dateFilterOri = reportInfo.dateFilter;
		reportsMenu.updateMenuItemLinks(
			reportsMenuDb,
			dateFilterOri,
			reportInfo.commandLineFilter,
			reportInfo.commandLineFilterComment,
			reportInfo.filterId,
			''
		);
		newReport.dateFilter = dateFilterOri;
	},
	deselectActiveElement: function() {
		var selectedElement = util.getE(calendarControl.selectedElementId);
		// alert('calendarControl.selectedElementId: ' + calendarControl.selectedElementId + '\nselectedElement: ' + selectedElement + '\ncalendarControl.selectedElementClassName: ' + calendarControl.selectedElementClassName);
		selectedElement.className = calendarControl.selectedElementClassName;
	},
	simpleDateObjectToDisplay: function(simpleDateObj) {
		var day = (simpleDateObj.day < 10) ? '0' + simpleDateObj.day : simpleDateObj.day;
		var month = lang.monthsShort[simpleDateObj.month];
		var year = simpleDateObj.year;
		var dateDisplay = day + '/' + month + '/' + year;	
		return dateDisplay;
	}
}
//
// exportTable.js
//
var exportTable = {
	panel: null,
	validator: null,
	reportElementName: '',
	isLogDetail: false,
	totalRows: 0,
	isUnknownTotalRows: false,
	isMoreOptions: false,
	csvFile: '', // Active exported csv directory path with file name (received from server)
	csvFilerefArgument: '', // The exported file string required by the C++ filref to get the actual href once the exported file exists on disk.
	taskId: '', // Active taskId (pid) of exporting process on server side
	init: function() {
		var YE = YAHOO.util.Event;
		YE.addListener(['export_table:more_options_btn', 'export_table:less_options_btn'], 'click', exportTable.toggleMoreOptions);
		YE.addListener('export_table:rows:range_field', 'click', exportTable.setToRange);
		YE.addListener('export_table:ok_btn', 'click', exportTable.startExport);
		YE.addListener('export_table:cancel_btn', 'click', exportTable.close);
		YE.addListener('export_table:close_btn', 'click', exportTable.close);
		var panelObj = {
			panelId:"export_table:panel",
			panelClassName: 'panel-50',
			panelHeaderLabel: langVar('lang_stats.export.export_table'),
			width: 500,
			zIndex: 20,
			isCover: true,
			closeEvent: exportTable.close
		};
		exportTable.panel = new util.Panel3(panelObj);
		exportTable.validator = new util.Validator();
	},
	open: function(evt) {
		var reportElements = reportInfo.reportElements;
		if (exportTable.panel == null) {exportTable.init();}
		//
		// Get report element reference
		//
		// currentTarget is not supported in IE!
//		var elementId = e.currentTarget.id;
		var element = evt.target || evt.srcElement;
		var elementId = element.id;
		var dat = elementId.split(':');
		var shortReportElementId = dat[0];
		var reportElement = reportElements[util.h(shortReportElementId)];
		var reportElementType = reportElement.reportElementType;
		var isLogDetail = reportElementType == 'log_detail';
		var isUnknownTotalRows = isLogDetail ? reportElement.isUnknownTotalRows : false;
		var isPivotTable = reportElement.isPivotTable;
		var startingRow = 0;
		var endingRow = 0;
		var totalRows = 0;
		if (!isPivotTable) {
			startingRow = reportElement.startingRow;
			endingRow = reportElement.endingRow;
			totalRows = reportElement.totalRows;
		}
		else {
			// Pivot table, used row numbers of flat table!
			startingRow = 1;
			endingRow = reportElement.totalRowsOfFlatTable;
			totalRows = reportElement.totalRowsOfFlatTable;
		}
		// Set global variables which are used upon export
		exportTable.reportElementName = reportElement.name;
		exportTable.isLogDetail = isLogDetail;
		exportTable.totalRows = totalRows;
		exportTable.isUnknownTotalRows = isUnknownTotalRows;
		//
		// Update form
		//
		exportTable.validator.reset();
		util.hideE(['export_table:progress', 'export_table:complete']);
		util.showE('export_table:options');
		util.setF('export_table:rows:all_btn', true);
		var totalRowsText = '';
		if (!isUnknownTotalRows) {
			totalRowsText = '(' + totalRows + ')';
		}
		else {
			totalRowsText = '(' + langVar('lang_stats.export.unknown_total_items') + ')';
		}
		util.updateT('export_table:rows:total_info', totalRowsText);
		util.setF('export_table:rows:range_field', startingRow + '-' + endingRow);
		util.setF('export_table:export_aggregation_rows_btn', false);
		// Reset file name
		exportTable.setMoreOptionsDisplay(false);
		util.setF('export_table:file_name', '');
		util.disableE('export_table:file_name');
		// ToDo - we should get the file name only when the user clicks the More Options link!
		exportTable.getFileName();
		// Get panel display position
		exportTable.panel.prePositionAtCenter();
		exportTable.panel.open();
	},
	toggleMoreOptions: function(evt) {
		var showMoreOptions = this.id === 'export_table:more_options_btn';
		exportTable.setMoreOptionsDisplay(showMoreOptions);
	},
	setMoreOptionsDisplay: function(showMoreOptions) {
		exportTable.isMoreOptions = showMoreOptions;
		util.showE(['export_table:more_options_section', 'export_table:less_options_btn'], showMoreOptions);
		util.showE('export_table:more_options_btn', !showMoreOptions);
	},
	getFileName: function() {
		var url = '?dp=statistics.export.get_file_name';
		url += '&p=' + reportInfo.profileName;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken;
		dat += '&v.fp.report_name=' + reportInfo.reportName;
		dat += '&v.fp.report_element_name=' + exportTable.reportElementName;
		util.serverPost(url, dat);
	},
	getFileNameResponse: function(dat) {
		util.enableE('export_table:file_name');
		util.setF('export_table:file_name', dat.fileName);
	},
	startExport: function() {
		// validate rows
		var validator = exportTable.validator;
		validator.reset();
		var totalRows = exportTable.totalRows;
		var isUnknownTotalRows = exportTable.isUnknownTotalRows;
		var startingRow;
		var endingRow;
		var export_all_rows = util.getF('export_table:rows:all_btn');
		if (export_all_rows) {
			startingRow = 1;
			// If log_detail with isUnknownTotalRows=true then set endingRow to -1 so that all rows become exported.
			endingRow = !isUnknownTotalRows ? totalRows : -1;
		}
		else {
			var isValidRowNumbers = false;
			// Get startingRow and endingRow
			var rangeValue = util.getF('export_table:rows:range_field');
			// remove white space
			rangeValue = rangeValue.replace(/\s/g, '');
			if (rangeValue.indexOf('-') != -1) {
				var rangeValueSplit = rangeValue.split('-');
				startingRow = rangeValueSplit[0];
				endingRow = rangeValueSplit[1];
			}
			else {
				// No range, treat single number as endingRow
				startingRow = 1;
				endingRow = rangeValue;
			}
			// Validate startingRow and endingRow
			// Ignore totalRows validation if isUnknownTotalRows=true
			if ((!isUnknownTotalRows &&
				util.isInteger(startingRow, 1, totalRows) &&
				util.isInteger(endingRow, 1, totalRows)) ||
				(isUnknownTotalRows &&
				util.isInteger(startingRow, 1) &&
				util.isInteger(endingRow, 1))) {
				if (parseInt(startingRow, 10) <= parseInt(endingRow, 10)) {
					isValidRowNumbers = true;
				}
			}
			if (!isValidRowNumbers) {
				var msg = langVar('lang_stats.export.invalid_range');
				validator.isCustom('export_table:rows:range_field', msg);
			}
		}
		// Validate file name if more options is active
		var fileName = '';
		if (exportTable.isMoreOptions) {
			fileName = validator.isValue('export_table:file_name');
		}
		// alert('Export rows: ' + startingRow + '-' + endingRow);
		//
		// Check if the table with specified options has already been exported
		//
		if (validator.allValid()) {
			var exportActiveAggregationRows = util.getF('export_table:export_aggregation_rows_btn');
			util.hideE('export_table:options');
			util.showE('export_table:progress');
			var url = '?dp=statistics.export.export_from_gui_init';
			url += '&p=' + reportInfo.profileName;
			var dat = 'v.fp.page_token=' + reportInfo.pageToken;
			dat += '&v.fp.report_job_id=' + reportInfo.reportJobId;
			dat += '&v.fp.report_name=' + reportInfo.reportName;
			dat += '&v.fp.report_element_name=' + exportTable.reportElementName;
			dat += '&v.fp.starting_row=' + startingRow;
			dat += '&v.fp.ending_row=' + endingRow;
			dat += '&v.fp.export_active_aggregation_rows=' + exportActiveAggregationRows;
			dat += '&v.fp.file_name=' + encodeURIComponent(fileName);
			util.serverPost(url, dat);
		}
	},
	startExportResponse: function(dat) {
		// alert('export done, csvFileHref: ' + dat.csvFileHref);
		exportTable.csvFile = dat.csvFile;
		exportTable.csvFilerefArgument = dat.csvFilerefArgument;
		exportTable.taskId = dat.taskId;
		exportTable.checkExportComplete();
	},
	checkExportComplete: function() {
		var url = '?dp=statistics.export.check_export_complete';
		url += '&p=' + reportInfo.profileName;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken + '&';
		dat += 'v.fp.csv_file=' + exportTable.csvFile + '&';
		dat += 'v.fp.csv_fileref_argument=' + exportTable.csvFilerefArgument + '&';
		dat += 'v.fp.task_id=' + exportTable.taskId;
		// alert('checkExportComplete()\n' + dat);
		util.serverPost(url, dat);
	},
	checkExportCompleteResponse: function(dat) {
		if (dat.isComplete) {
			var csvFileHref = dat.csvFileHref;
			// alert('Export is complete, file exists!');
			var downloadLink = util.getE('export_table:download_link');
			downloadLink.href = dat.csvFileHref;
			util.hideE('export_table:progress');
			util.showE('export_table:complete');
		}
		else {
			// Repeat check 
			setTimeout("exportTable.checkExportComplete()", 500);
		}
	},
	close: function() {
//		exportTable.validator.reset();
		exportTable.panel.close();
	},
	setToRange: function() {
		// Auto-selects Range when clicking in Range field.
		util.setF('export_table:rows:range_btn', true);
	}
}
//
// datePicker.js (date picker)
//
//
//
// KHP-RC, revise if we add support for hours, minutes and seconds in the calendar picker,
// repectively for date filters such as 18/Jan/2006 13:20:10, 18jan2006_132010
//
var datePicker = {
	dfMonths: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
	relativeDateUnits: ['year', 'quarter', 'month', 'week', 'day'], // hour, minute and second is not supported in v8
	dateUnitLabelsPlural: {
		year: langVar('lang_stats.date_picker.years'),
		quarter: langVar('lang_stats.date_picker.quarters'),
		month: langVar('lang_stats.date_picker.months'),
		week: langVar('lang_stats.date_picker.weeks'),
		day: langVar('lang_stats.date_picker.days')
	},
	panel: null,
	// tabs: null,
	// tabSpaceFixed: false,
	// isDateRange: false,
	activePicker: '', // dp1 | dp2 | dp3
	calendar: null, // calendar date picker object
	relative: null, // relative date picker object
	earliest: {
		year: 0,
		month: 0,
		day: 0
	},
	latest: {
		year: 0,
		month: 0,
		day: 0
	},
	dp1: { // date picker 1, start date
		picker: 'dp1',
		dayOffset: 0, // the dayOffset of the active month
		dateUnit: '', // the active dateUnit: year | quarter | month | day | ''
		year: -1, // We use -1 as default and for inactive values to check whether a year, quarter, month or day is selected
		quarter: -1,
		month: -1,
		day: -1
	},
	dp2: { // date picker 2, end date
		picker: 'dp2',
		dayOffset: 0,
		dateUnit: '',
		year: -1,
		quarter: -1,
		month: -1,
		day: -1
	},
	dp3: { // date picker 3, relative date
		// We set default values so that we don't need separate initialization for dp3
		picker: 'dp3',
		isActive: false, 	// deteremines if we have an active selection. If true
							// all items are selected in full color. If false we use the entire date range,
							// though the specified items are semi selected.
		type: 'recent', // recent | last
		dateUnitCount: 1, // must be always an integer >= 1
		dateUnit: 'year' // the active dateUnit: year | quarter | month | week | day | hour | minute | second
	},
	clearEndDateBtn: null,
	init: function() {
		var YE = YAHOO.util.Event;
		var panelObj = {
			panelId: 'dp:panel',
			panelClassName: 'panel-50',
			panelHeaderLabel: langVar('lang_stats.date_picker.date_picker'),
			left: 20,
			top: 50,
			zIndex: 20,
			isCover: true,
			closeEvent: datePicker.close
		};
		datePicker.panel = new util.Panel3(panelObj);
		// Init tabs
		// datePicker.tabs = new util.Tabs2(['date_picker:start_date_tab', 'date_picker:end_date_tab'], datePicker.tabActivated);
		//
		// Get earliest and latest date info
		// 
		var obj = util.salangDateToSimpleDateObject(reportInfo.earliestDate);
		var earliest = datePicker.earliest;
		earliest.year = obj.year;
		earliest.month = obj.month;
		earliest.day = obj.day;
		obj = util.salangDateToSimpleDateObject(reportInfo.latestDate);
		var latest = datePicker.latest;
		latest.year = obj.year;
		latest.month = obj.month;
		latest.day = obj.day;
		// util.showObject(earliest);
		// util.showObject(latest);
		//
		// Create the date picker main form
		//
		datePicker.build();
		// Create the calendar picker object (builds HTML too)
		datePicker.calendar = new datePickerUtil.Calendar(earliest, latest, 'dp:inner_pickers_container');
		// Create the relative picker object (builds HTML too)
		datePicker.relative = new datePickerUtil.Relative('dp:inner_pickers_container', datePicker.dp3);
		//
		// Assign a single event per calendar picker and relative date picker
		//
		YE.addListener('dp:calendar_picker', 'click', datePicker.calendarPickerItemActivated);
		YE.addListener('dp:relative_date_display:date_unit_count', 'keyup', datePicker.relativePickerDateUnitCountInput);
		YE.addListener('dp:relative_picker', 'click', datePicker.relativePickerItemActivated);
		// Init buttons
		YE.addListener(['dp:dp1:btn', 'dp:dp2:btn', 'dp:dp3:btn', 'dp:dp4:btn'], 'click', datePicker.setPickerByEvent);
		YE.addListener('dp:clear_picker_date:btn', 'click', datePicker.clearPickerDate);
		YE.addListener('dp:apply_btn', 'click', datePicker.applyDateFilter);
		YE.addListener('dp:cancel_btn', 'click', datePicker.close);
	},
	initCalendarDpObject: function(dpName, decomposition) {
		// Initializes dp1 and dp2 values according the active date filter via 
		// the decomposition object.
		var dp = datePicker[dpName];
		// We reset the dp object because it could be already set
		dp.dayOffset = 0;
		dp.dateUnit = '';
		dp.year = -1;
		dp.quarter = -1;
		dp.month = -1;
		dp.day = -1;
		if (decomposition) {
			dp.year = decomposition.year;
			dp.quarter = decomposition.quarter;
			dp.month = decomposition.month;
			dp.day = decomposition.day;
			// Set date unit
			var dateUnit = '';
			if (dp.day != -1) {
				dateUnit = 'day';
			}
			else if (dp.month != -1) {
				dateUnit = 'month';
			}
			else if (dp.quarter != -1) {
				dateUnit = 'quarter';
			}
			else {
				dateUnit = 'year';
			}
			dp.dateUnit = dateUnit;
		}
		else {
			// No date filter is active, so we set a default date for semi selection
			dp.year = datePicker.earliest.year;
			dp.month = datePicker.earliest.month;
		}
		// If there is no active quarter or month we need to set a default value for it
		if (dp.quarter == -1 || dp.month == -1) {
			var firstMonthInYear = (dp.year == datePicker.earliest.year) ? datePicker.earliest.month : 0;
			var firstQuarterInYear = datePickerUtil.getQuarterFromMonth(firstMonthInYear);
			if (dp.quarter == -1) {
				dp.quarter = firstQuarterInYear;
			}
			if (dp.month == -1) {
				dp.month = firstMonthInYear;
			}
		}
		// util.showObject(datePicker.dp1);
	},
	initRelativeDpObject: function(df) {
		var dp = datePicker.dp3;
		if (df != '') {
			// var pattern = /^(recent|last)([0-9]+)(year|quarter|month|day)(s)?$/;
			var pattern = /^(recent|last)([0-9]+)(year|quarter|month|week|day)(s)?$/;
			var result = df.match(pattern);
			// alert(result);
			dp.isActive = true;
			dp.type = result[1];
			dp.dateUnitCount = parseInt(result[2], 10);
			dp.dateUnit = result[3];
		}
		else {
			dp.isActive = false;
			dp.type = 'recent';
			dp.dateUnitCount = 1;
			dp.dateUnit = 'year';
		}
	},
	open: function() {
		if (datePicker.panel == null) {
			// Initialize the date picker
			datePicker.init();
		}
		// Get date filter info
		var dfInfo = reportInfo.dateFilterInfo;
		// util.showObject(dfInfo, "dfInfo");
		// Check active dateFilter state in report, the date filter could be:
		// a.) A single absolute date filter --> 14jan2007
		// b.) An absolute date range --> 14jan2007-25jul2007
		// c.) A relative date filter --> 3days
		// d.) Multiple absolute date filters (i.e. upon zoom on date items) --> 14jan2007,16jan2007,1feb2007
		// e.) A custom date filter
		var df = reportInfo.dateFilter;
		var decomposition1 = null;
		var decomposition2 = null;
		var relativeDf = '';
		var defaultDpName = 'dp1';
		if (dfInfo.isGlobalDateFilter) {
			if (dfInfo.isValidDateFilterSyntax) {
				if (!dfInfo.isOutOfRange) {
					if (datePickerUtil.getIsDateRangePattern(df)) {
						decomposition1 = dfInfo.decomposition1;
						decomposition2 = dfInfo.decomposition2;
						defaultDpName = 'dp2';
					}
					else if (datePickerUtil.getIsSingleDatePattern(df)) {
						decomposition1 = dfInfo.decomposition1;
						defaultDpName = 'dp1';
					}
					else if (datePickerUtil.getIsRelativeDatePattern(df)) {
						relativeDf = df;
						defaultDpName = 'dp3';
					}
					else {
					   // This must be a custom date filter or multiple dates from a zoom action
					   defaultDpName = 'dp4';
					}
				}
				else if (datePickerUtil.getIsRelativeDatePattern(df)) {
					relativeDf = df;
					defaultDpName = 'dp3';
				}
				else {
					// Set custom date filter
					defaultDpName = 'dp4';
				}
			}
			else {
				// Invalid date filter, most likely a custom date filter
				defaultDpName = 'dp4';
			}
		}
		// Init dp1 and dp2 object
		datePicker.initCalendarDpObject('dp1', decomposition1);
		datePicker.initCalendarDpObject('dp2', decomposition2);
		datePicker.initRelativeDpObject(relativeDf);
		// Init relative picker display
		// util.showObject(datePicker.relative);
		datePicker.relative.applyDateSelection();
		if (defaultDpName == 'dp4') {
			// Set custom date filter
			util.setF('dp:custom_date_filter', reportInfo.dateFilter);
		}
		datePicker.setPicker(defaultDpName);
		// Show fixed date info
		util.showE('dp:fixed_date_info', dfInfo.isFixedDate);
		datePicker.panel.open();
	},
	close: function() {
		datePicker.panel.close();
	},
	setPickerByEvent: function() {
		var id = this.id;
		var dat = id.split(':');
		var dpName = dat[1];
		datePicker.setPicker(dpName);
	},
	setPicker: function(dpName) {
		datePicker.setPickerButtons(dpName);
		datePicker.activePicker = dpName;
		util.hideE([
			'dp:outer_pickers_container',
			'dp:calendar_picker',
			'dp:relative_picker',
			'dp:custom_df_container']);
		var innerPickerContainer = util.getE('dp:inner_pickers_container');
		if (dpName != 'dp4') {
			if (dpName != 'dp3') {
				// Init calendar date picker
				// Reset inner picker container width to auto
				// (fixed width is only used for relative picker and custom date filter)
				innerPickerContainer.style.width = 'auto';
				datePicker.calendar.init(datePicker[dpName]);
				util.showE('dp:calendar_picker');
			}
			else {
				// Init relative date picker
				// Get size of calendar picker, then set relative picker width
				// so that the GUI does not shrink for the smaller relative picker.
				// Note, the height is already set by a vertical spacer column in both pickers.
				innerPickerContainer.style.width = datePicker.getDatePickerWidth() + 'px';
				util.showE('dp:relative_picker');
			}
			util.showE('dp:outer_pickers_container');
			datePicker.updatePickedDateDisplay();
		}
		else {
			// Custom date filter
			var customDfContainer = util.getE('dp:custom_df_container');
			// Add 2px since there is no border on custom date filter
			customDfContainer.style.width = datePicker.getDatePickerWidth() + 2 + 'px';
			customDfContainer.style.display = 'block';
			util.focusE('dp:custom_date_filter');
		}
	},
	setPickerButtons: function(activeDpType) {
		// alert('activeDpType: ' + activeDpType);
		var dps = ['dp1', 'dp2', 'dp3', 'dp4'];
		for (var i = 0; i < dps.length; i++) {
			var dpName = dps[i];
			var isActive = (activeDpType == dpName);
			var a = util.getE('dp:' + dpName + ':btn');
			a.className = !isActive ? 'btn-30' : 'btn-30-pressed';
			if (isActive) {
				a.blur();
			}
			// alert('a.className: ' + a.className);
		}
	},
	getDatePickerWidth: function () {
		util.showE(['dp:outer_pickers_container', 'dp:calendar_picker']);
		var containerRegion = YAHOO.util.Dom.getRegion('dp:inner_pickers_container');
		// var containerRegion = YAHOO.util.Dom.getRegion('dp:outer_pickers_container');
		util.hideE(['dp:outer_pickers_container', 'dp:calendar_picker']);
		return containerRegion.width;
	},
	//
	//
	//
	// Calendar date picker
	//
	//
	//
	calendarPickerItemActivated: function(evt) {
		// alert('calendarPickerItemActivated()');
		var element = evt.target || evt.srcElement;
		var elementId = element.id;
		// alert('calendarPickerItemActivated() - elementId: ' + elementId);
		// A valid event must contain the ':cal:' string within the callee ID
		if (elementId != '') {
			element.blur();
			var dat = elementId.split(':');
			if (dat[1] == 'cal') {
				var dateUnit = dat[2];
				var dateNum = parseInt(dat[3], 10);
				var elementClassName = element.className;
				if (element.className != 'no-log-data') {
					datePicker.calendar.itemActivated(dateUnit, dateNum);
					datePicker.updatePickedDateDisplay();
				}
			}
		}
	},
	//
	//
	//
	// Relative date picker
	//
	//
	//
	relativePickerItemActivated: function(evt) {
		var element = evt.target || evt.srcElement;
		var elementId = element.id;
		if (elementId != '') {
			var dat = elementId.split(':');
			if (dat.length == 4) {
				element.blur();
				var idPropertyName = dat[2];
				// alert('idPropertyName: ' + idPropertyName);
				var propertyName = '';
				if (idPropertyName == 'type') {
					propertyName = 'type';
				}
				else if (idPropertyName == 'date_unit_count') {
					propertyName = 'dateUnitCount';
				}
				else {
					propertyName = 'dateUnit';
				}
				var propertyValue = (propertyName == 'dateUnitCount') ? parseInt(dat[3], 10) : dat[3];
				datePicker.dp3.isActive = true;
				datePicker.dp3[propertyName] = propertyValue;
				datePicker.relative.applyDateSelection();
			}
		}
		datePicker.updatePickedDateDisplay();
	},
	relativePickerDateUnitCountInput: function() {
		// User typed a number into relative date picker date display input field
		// alert('relativePickerNumberItemActivated() - this.value: ' + this.value);
		var value = util.trim(this.value);
		if (util.isInteger(value, 1)) {
			datePicker.dp3.dateUnitCount = value;
			datePicker.relative.applyDateSelection();
		}
	},
	//
	//
	//
	// Clear picker date (valid for calendar and relative picker)
	//
	//
	//
	clearPickerDate: function() {
		var dpName = datePicker.activePicker;
		// alert('clearPickerDate() - activeDpName: ' + dpName);
		if (dpName != 'dp3') {
			var dp = datePicker[dpName];
			dp.dateUnit = '';
			dp.day = -1;
			datePicker.calendar.init(dp);
		}
		else {
			datePicker.dp3.isActive = false;
			datePicker.relative.applyDateSelection();
		}
		datePicker.updatePickedDateDisplay();
	},
	//
	//
	// Picked date display
	//
	//
	updatePickedDateDisplay: function() {
		// Update the finally picked date display
		var dpName = datePicker.activePicker;
		// util.showObject(dp);
		var text = '';
		var entireDateRangeMsg = langVar('lang_stats.date_picker.entire_date_range');
		var showCalendarDateDisplay = true;
		util.hideE(['dp:calendar_date_display', 'dp:relative_date_display']);
		switch (dpName) {
			case 'dp1':
				text = (datePicker.dp1.dateUnit != '') ? datePicker.assembleCalendarDateLabel('dp1') : entireDateRangeMsg;
				break;
			case 'dp2':
				if (datePicker.dp2.dateUnit != '') {
					var startText = (datePicker.dp1.dateUnit != '') ? datePicker.assembleCalendarDateLabel('dp1') : langVar('lang_stats.date_picker.earliest_date');
					text = startText + ' - ' + datePicker.assembleCalendarDateLabel('dp2');
				}
				else {
					text = entireDateRangeMsg;
				}
				break;
			case 'dp3':
				if (datePicker.dp3.isActive) {
					showCalendarDateDisplay = false;
					var dp = datePicker.dp3; 
					var typeLabel = (dp.type == 'recent') ? langVar('lang_stats.date_picker.recent') : langVar('lang_stats.date_picker.last');
					var dateUnitLabelsPlural = datePicker.dateUnitLabelsPlural;
					var dateUnitLabel = dateUnitLabelsPlural[dp.dateUnit];
					util.updateT('dp:relative_date_display:type', typeLabel);
					util.setF('dp:relative_date_display:date_unit_count', dp.dateUnitCount);
					util.updateT('dp:relative_date_display:date_unit', dateUnitLabel);
				}
				else {
					// Shows the calendar display!
					text = entireDateRangeMsg;
				}
				break;
		}
		if (showCalendarDateDisplay) {
			util.updateT('dp:calendar_date_display', text);
			util.showE('dp:calendar_date_display');
		}
		else {
			util.showE('dp:relative_date_display');
		}
	},
	assembleCalendarDateLabel: function(dpName) {
		var dp = datePicker[dpName];
		var dateUnit = dp.dateUnit;
		// alert('dpName: ' + dpName);
		// util.showObject(dp);
		var dpDisplay;
		if (dateUnit == 'year') {
			dpDisplay = dp.year;
		}
		else if (dateUnit == 'quarter') {
			dpDisplay = lang.quarterShort + dp.quarter + '/' + dp.year;
		}
		else {
			var month = lang.monthsShort[dp.month];
			dpDisplay = month + '/' + dp.year;
			// alert('dateUnit: ' + dateUnit + '\ndpDisplay: ' + dpDisplay);
			if (dateUnit == 'day') {
				var day = (dp.day < 10) ? '0' + dp.day : dp.day;
				dpDisplay = day + '/' + dpDisplay;
			}
		}
		return dpDisplay;
	},
	//
	//
	//
	// Apply date filter
	//
	//
	//
	applyDateFilter: function() {
		var dpName = datePicker.activePicker;
		var df = '';
		switch (dpName) {
			case 'dp1':
				if (datePicker.dp1.dateUnit != '') {
					df = datePickerUtil.convertDpObjectToDf('dp1');
				}
				break;
			case 'dp2':
				if (datePicker.dp2.dateUnit != '') {
					var dp1 = datePicker.dp1;
					var dp2 = datePicker.dp2;
					// Verify if dp1 is set or not. If it is not set then set it now.
					if (dp1.dateUnit == '') {
						// No start date is set, so we have to set one
						var earliest = datePicker.earliest;
						dp1.dateUnit = 'day';
						dp1.year = earliest.year;
						dp1.month = earliest.month;
						dp1.day = earliest.day;
					}
					var df1 = datePickerUtil.convertDpObjectToDf('dp1');
					var df2 = datePickerUtil.convertDpObjectToDf('dp2');
					var startTime;
					var endTime;
					if (dp1.dateUnit == dp2.dateUnit) {
						// dp1 and dp2 have the same dateUnit
						if (df1 != df2) {
							// Check if start date is smaller than end date, else invert the two
							startTime = datePickerUtil.convertDpObjectToTime('dp1');
							endTime = datePickerUtil.convertDpObjectToTime('dp2');
							if (startTime <= endTime) {
								df = df1 + '-' + df2;
							}
							else {
								// invert start/end date
								df = df2 + '-' + df1;
							}
						}
						else {
							// We have the same date in dp1 and dp2, use only dp1
							df = df1;
						}
					}
					else {
						// dp1 and dp2 have a different dateUnit
						// We need to check for a valid date, the startTime must be smaller or equal the endTime.
						startTime = datePickerUtil.convertDpObjectToTime('dp1');
						endTime = datePickerUtil.convertDpObjectToTime('dp2');
						if (startTime <= endTime) {
							df = df1 + '-' + df2;
						}
						else {
							alert(langVar('lang_stats.date_picker.invalid_date_range_msg'));
							return false;
						}
					}
				}
				break;
			case 'dp3':
				var dp3 = datePicker.dp3;
				if (dp3.isActive) {
					var relativeType = dp3.type;
					var dateUnitCount = dp3.dateUnitCount;
					df = relativeType + dateUnitCount + dp3.dateUnit;
					if (dateUnitCount > 1) {
						// Use plural for date unit
						df += 's';
					}
				}
				break;
			case 'dp4':
				df = util.getF('dp:custom_date_filter');
				break;
		}
		// Temp
//		util.showObject({df: df});
//        util.showObject({"df typeof": (typeof df)});
//
//        // Test the pattern
//        var isCustomDf = true;
//        if (datePickerUtil.getIsDateRangePattern(df) ||
//            datePickerUtil.getIsSingleDatePattern(df) ||
//            datePickerUtil.getIsRelativeDatePattern(df)) {
//            isCustomDf = false;
//        }
//        util.showObject({isCustomDf: isCustomDf});
//		return false;
		datePicker.close();
		newReport.setDateFilter(df);
	},	
	//
	//
	//
	// Date picker builder utilities
	//
	//
	//
	build: function() {
		var formContainer = util.getE('dp:form_container');
		var buttonsContainer = util.createE('div', {paddingTop:'9px',paddingLeft:'9px'});
		var outerPickersContainer = util.createE('div', {id:'dp:outer_pickers_container', className:'dp-outer-container'}); // Includes the header bar which indicates the date
		var innerPickersContainer = util.createE('div', {id:'dp:inner_pickers_container', className:'dp-inner-container'});
		var customDateFilterContainer = util.createE('div', {id:'dp:custom_df_container', className:'date-picker-custom'});
		datePicker.buildCustomDateFilter(customDateFilterContainer);
		datePicker.buildMainButton(buttonsContainer, 'dp:dp1:btn', langVar('lang_stats.date_picker.date_or_start_date'));
		datePicker.buildMainButton(buttonsContainer, 'dp:dp2:btn', langVar('lang_stats.date_picker.end_date'));
		datePicker.buildMainButton(buttonsContainer, 'dp:dp3:btn', langVar('lang_stats.date_picker.relative_date'));
		datePicker.buildMainButton(buttonsContainer, 'dp:dp4:btn', langVar('lang_stats.btn.custom'));
		// Clear buttonsContainer
		var buttonsClearanceDiv = util.createE('div', {className:'clearance'});
		var spaceText = util.createT('&nbsp;');
		datePicker.buildHeaderBar(outerPickersContainer);
		util.chainE(outerPickersContainer, innerPickersContainer);
		util.chainE([formContainer, [buttonsContainer, [buttonsClearanceDiv, spaceText]], outerPickersContainer, customDateFilterContainer]);
	},
	buildMainButton: function(container, id, label) {
		var a = util.createE('a', {id:id, href:'javascript:;', className:'btn-30'});
		var text = util.createT(label); 
		util.chainE(container, a, text);
	},
	buildHeaderBar: function(container) {
		var table = util.createE('table', {className:'dp-header-bar', cellSpacing:'0'});
		var tbody = util.createE('tbody');
		var tr = util.createE('tr');
		var th = util.createE('th', {id:'dp:date_display'});
		var calendarDateDiv = util.createE('div', {id:'dp:calendar_date_display', display:'none'});
		var relativeDateDiv = util.createE('div', {id:'dp:relative_date_display', display:'none'});
		var relativeDateTypeSpan = util.createE('span', {id:'dp:relative_date_display:type'});
		var relativeDateNumberInput = util.createE('input', {id:'dp:relative_date_display:date_unit_count', className:'dp-relative-date-unit-count', type:'text', value:''})
		var relativeDateUnitSpan = util.createE('span', {id:'dp:relative_date_display:date_unit'});
		util.chainE([relativeDateDiv, relativeDateTypeSpan, relativeDateNumberInput, relativeDateUnitSpan]);
		util.chainE([th, calendarDateDiv, relativeDateDiv]);
		var td = util.createE('td');
		var a = util.createE('a', {id:'dp:clear_picker_date:btn', href:'javascript:;'});
		var text = util.createT(langVar('lang_stats.btn.clear'));
		util.chainE(td, a, text);
		util.chainE(container, table, tbody, [tr, th, td]);
	},
	buildCustomDateFilter: function(container) {
		var table = util.createE('table');
		var tbody = util.createE('tbody');
		var row1 = util.createE('tr');
		var row1Left = util.createE('td', {paddingLeft:'7px', paddingRight:'7px'});
		var row1Right = util.createE('td');
		var row2 = util.createE('tr');
		var row2Left = util.createE('td');
		var row2Right = util.createE('td', {paddingTop:'14px'});
		var text = util.createT(langVar('lang_stats.date_picker.date_filter') + ':');
		var input = util.createE('input', {id:'dp:custom_date_filter', type:'text'});
		input.style.width = '280px';
		var a = util.createE('a', {href:'?dp+docs.technical_manual.date_filter'});
		var aText = util.createT(langVar('lang_stats.date_picker.date_filter_help'));
		util.chainE(tbody, [row1, [row1Left, text], [row1Right, input]]);
		util.chainE(tbody, [row2, row2Left, [row2Right, [a, aText]]]);
		util.chainE(container, table, tbody);
		YAHOO.util.Event.addListener(a, 'click', util.helpWindow.openGeneralHelp);
	}
}
//
//
// datePickerCal.js (date picker calendar)
//
//
//
// This object builds and manages the calendar within datePicker
var datePickerUtil = {
	getIsSingleDatePattern: function(df) {
		// This checks if the date filter pattern is a single date
		// which can be set with the date picker GUI (non-custom date filter)
        if (typeof df == 'number') {
           // Regex, etc. requires string value!
           df = df.toString();
        }
		if (/^\d{4}$/.test(df) || // matches year
			/^q(1|2|3|4)\/\d{4}$/.test(df) || // matches quarter/year
			/^\d{0,2}(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\d{4}$/.test(df)) { // matches day/month/year or month/year
			return true;
		}
		return false;
	},
	getIsDateRangePattern: function(df) {
		// This checks if the date filter pattern is a date range
		// which can be set with the date picker GUI (non-custom date filter)
		var isDateRangePattern = false;
        if (typeof df == 'number') {
            // Regex, etc. requires string value!
            df = df.toString();
        }
		if (df.indexOf('-') != -1) {
			var dat = df.split('-');
			if (dat.length == 2 &&
				datePickerUtil.getIsSingleDatePattern(dat[0]) &&
				datePickerUtil.getIsSingleDatePattern(dat[1])) {
                isDateRangePattern = true;
			}
		}
        // util.showObject({"isDateRangePattern": isDateRangePattern});
		return isDateRangePattern;
	},
	getIsRelativeDatePattern: function(df) {
		// This checks if the date filter pattern is a relative date filter
		// which can be set with the relative date picker GUI (non-custom date filter)
        var isDateRangePattern = false;
        if (typeof df == 'number') {
            // Regex, etc. requires string value!
            df = df.toString();
        }
		var relativeDfPattern = /^(recent|last)[0-9]+(year|quarter|month|week|day)(s)?$/;
        var isRelativeDfPattern = relativeDfPattern.test(df);
        // util.showObject({isRelativeDfPattern: isRelativeDfPattern});
		return isRelativeDfPattern;
	},
	getQuarterFromMonth: function(month) {
		// returns the quarter of the given month
		if (month < 3) {
			return 1;
		}
		else if (month < 6) {
			return 2; 
		}
		else if (month < 9) {
			return 3;
		}
		else {
			return 4;
		}
	},
	getNumberOfDaysInMonth: function(year, month) {
		// set required month to day 1, 00:00
		var theMonth = new Date(year, month, 1, 0);
		var nextMonth;
		// set next month to day 1, 06:00, the 6 hours compensate summertime shift
		if (month < 11) { // Jannuary - November
			nextMonth = new Date(year, (month + 1), 1, 6); // first day of next month, 06:00
		}
		else { // December
			nextMonth = new Date((year + 1), 0, 1, 6); // first month and day of next year, 06:00
		}
		var numberOfDaysInMonth = nextMonth.getTime() - theMonth.getTime();
		numberOfDaysInMonth = Math.floor(numberOfDaysInMonth / (1000 * 60 * 60 * 24));
		// alert('getNumberOfDaysInMonth\nyear: ' + year + '\nmonth: ' + month + '\nnumberOfDays: ' + numberOfDaysInMonth);
		return numberOfDaysInMonth;
	},
	convertDpObjectToDf: function(dpName) {
		var dp = datePicker[dpName];
		var dateUnit = dp.dateUnit;
		var df;
		// util.showObject(dp);
		var year = dp.year;
		if (dateUnit == 'year') {
			df = year;
		}
		else if (dateUnit == 'quarter') {
			df = 'q' + dp.quarter + '/' + year;
		}
		else {
			var month = datePicker.dfMonths[dp.month];
			df = month + year;
			if (dateUnit == 'day') {
				df = dp.day + df;
			}
		}
		return df;
	},
	convertDpObjectToTime: function(dpName) {
		var dp = datePicker[dpName];
		var isStartDate = (dpName == 'dp1') ? true : false;
		var dateUnit = dp.dateUnit;
		var year = dp.year;
		var month = 0;
		var day = 1;
		switch (dateUnit) {
			case 'y':
				month = isStartDate ? 0 : 11;
				day = isStartDate ? 1 : 31;
				break;
			case 'q':
				var quarter = dp.quarter;
				if (quarter == 1) {
					month = isStartDate ? 0 : 2;
					day = isStartDate ? 1 : 31;
				}
				else if (quarter == 2) {
					month = isStartDate ? 3 : 5;
					day = isStartDate ? 1 : 30;
				}
				else if (quarter == 3) {
					month = isStartDate ? 6 : 8;
					day = isStartDate ? 1 : 30;
				}
				else {
					month = isStartDate ? 9 : 11;
					day = isStartDate ? 1 : 31;
				}
				break;
			case 'm':
				month = dp.month;
				day = isStartDate ? 1 : datePickerUtil.getNumberOfDaysInMonth(year, month);
				break;
			case 'd':
				month = dp.month;
				day = dp.day;
				break;
		}
		var theDate = new Date(year, month, day);
		var theTime = theDate.getTime();
		return theTime;
	},
	convertMonthTextToInt: function(monthText) {
		var dfMonths = datePicker.dfMonths;
		for (var i = 0; i < dfMonths.length; i++) {
			if (monthText == dfMonths[i]) {
				break;
			}
		}
		return i;
	},
	fixInternetExplorerAnchors: function(elementId) {
		// Fix Internet Explorer 6 text-hover problem by adding a height to all anchor elements
		// Don't use this for IE7 and above because it would actually apply the height and shrink the date picker.
		var table = util.getE(elementId);
		if (util.userAgent.isIE6) {
			var anchors = table.getElementsByTagName('a');
			for (var i = 0; i < anchors.length; i++) {
				var a = anchors[i];
				a.style.height = '0.1em';
			}
		}
	},
	clearDateSelection: function(elementId) {
		// Deselect all date items of the given picker table element id,
		// though don't change the elements className where the current
		// className is "no-log-data"
		var table = util.getE(elementId);
		var anchors = table.getElementsByTagName('a');
		for (var i = 0; i < anchors.length; i++) {
			var a = anchors[i];
			if (a.className != 'no-log-data') {
				a.className = '';
			}
		}
	},
	createSpacerColumn: function() {
		// Creates a column which keeps a constant vertical space,
		// it is required due the variable number of months in the months column
		// and due the different height in the relative picker. It is used
		// in calendar and relative picker.
		var td = util.createE('td', {className:'vertical-spacer'});
		var div = util.createE('div', {visibility:'hidden'});
		for (var i = 0; i < 13; i++) {
			var a = util.createE('a', {href:'javascript:;', paddingLeft:'0px', paddingRight:'0px'});
			var text = util.createT('.');
			util.chainE(div, a, text);
		}
		util.chainE(td, div);
		/*
		var td = document.createElement('td');
		td.className = 'vertical-spacer';
		var div = document.createElement('div');
		div.style.visibility = 'hidden';
		for (var i = 0; i < 13; i++) {
			var a = document.createElement('a');
			a.href = 'javascript:;';
			a.style.paddingLeft = '0px';
			a.style.paddingRight = '0px';
			var txt = document.createTextNode('-');
			a.appendChild(txt);
			div.appendChild(a);
		}
		td.appendChild(div);
		*/
		return td;
	}
};
//
//
//
// datePicker Calendar
//
//
//
datePickerUtil.Calendar = function(earliest, latest, containerElementId) {
	this.earliest = earliest; // A reference to datePicker.earliest
	this.latest = latest; // A reference to datePicker.latest
	this.dp = null; // A reference to the active dp object (dp1 or dp2)
	// Active dp data (dp1 or dp2), they are provided upon picker init
	/*
	this.picker = ''; // dp1 || dp2
	this.dayOffset = 0; // the dayOffset of the active month
	this.dateUnit = ''; // // the active dateUnit: y | q | m | d | ''; empty is equal entire date range
	this.year = -1;
	this.quarter = -1;
	this.month = -1;
	this.day = -1;
	*/
	this.build(containerElementId);
}
datePickerUtil.Calendar.prototype = {
	init: function(dp) {
		// Init is invoked when switching between start and end date or upon first time initialization.
		this.dp = dp // dp is an active reference to dp1 or dp2
		// Override the active picker data of this with the provided dp
		// for (var prop in dp) {
		//	this[prop] = dp[prop];
		// }
		// Initializes the picker (dp1 or dp2) according the dp1 or dp2 object
		// Update the quarter, months and days column for the given dp object
		// util.showObject(dp);
		datePickerUtil.clearDateSelection('dp:calendar_picker');
		this.updateQuartersDisplay(dp.year);
		this.updateMonthsDisplay(dp.year);
		this.updateDaysDisplay(dp.year, dp.month);
		this.applyDateSelection();
	},
	itemActivated: function(dateUnit, dateNum) {
		// Invoked via datePicker.calendarPickerItemActivated()
		var dp = this.dp;
		// util.showObject(arguments);
		// Deselect all date items
		datePickerUtil.clearDateSelection('dp:calendar_picker');
		switch (dateUnit) {
			case 'year':
				this.setYear(dateNum, true);
				break;
			case 'quarter':
				this.setQuarter(dateNum, true);
				break;
			case 'month':
				this.setMonth(dateNum, true);
				break;
			case 'day':
				// Note, we ignore days where the className is 'no-log-data'!
				// alert('elementClassName: ' + elementClassName);
				// if (elementClassName != 'no-log-data') {
				// }
				var day = dateNum - dp.dayOffset + 1;
				// alert('selected day: ' + day);
				this.setDay(day);
				break;
		}
		this.applyDateSelection();
	},
	//
	// setYear, setQuarter, setMonth, setDay
	// 
	setYear: function(year, isActiveDateUnit) {
		// alert('setYear()');
		var dp = this.dp;
		//
		// Update global dp object (dp1 or dp2)
		//
		if (isActiveDateUnit) {
			dp.dateUnit = 'year';
			// Reset date items below year
			dp.quarter = -1;
			dp.month = -1;
			dp.day = -1;
		}
		dp.year = year;
		// util.showObject(dp);
		//
		//
		// If we set a year we must update the quarters and months display
		//
		//
		// We need to check how many months and quarters we display depending on earliest and latest date.
		// var lastMonthInYear = (year == dp.latest.year) ? dp.latest.month : 11;
		// var lastQuarterInYear = dp.getQuarterFromMonth(lastMonthInYear);
		//
		// Update the quartes display
		//
		this.updateQuartersDisplay(year);
		//
		// Set the quarter
		//
		var firstMonthInYear = (year == this.earliest.year) ? this.earliest.month : 0;
		var firstQuarterInYear = datePickerUtil.getQuarterFromMonth(firstMonthInYear);
		this.setQuarter(firstQuarterInYear, false);
		//
		// Update the months display
		//
		this.updateMonthsDisplay(year);
	},
	setQuarter: function(quarter, isActiveDateUnit) {
		// alert('setQuarter()');
		var dp = this.dp;
		//
		// Update global dp object (dp1 or dp2)
		//
		if (isActiveDateUnit) {
			dp.dateUnit = 'quarter';
			// Reset date items below quarter
			dp.month = -1;
			dp.day = -1;
		}
		dp.quarter = quarter;
		// As we set a quarter we need to select the first available month in this quarter.
		var firstMonthInYear = (dp.year == this.earliest.year) ? this.earliest.month : 0;
		var firstMonthInQuarter;
		if (quarter == 1) {
			firstMonthInQuarter = 0;
		}
		else if (quarter == 2) {
			firstMonthInQuarter = 3;
		}
		else if (quarter == 3) {
			firstMonthInQuarter = 6;
		}
		else {
			firstMonthInQuarter = 9;
		}
		// In case that the year does not cover all months we must increase the month number for maximum two increments
		if (firstMonthInQuarter < firstMonthInYear) {
			firstMonthInQuarter++;
			if (firstMonthInQuarter < firstMonthInYear) {
				firstMonthInQuarter++;
			}
		}
		this.setMonth(firstMonthInQuarter, false);
	},
	setMonth: function(month, isActiveDateUnit) {
		// alert('setMonth()');
		var dp = this.dp;
		//
		// Update global dp object (dp1 or dp2)
		//
		if (isActiveDateUnit) {
			dp.dateUnit = 'month';
			// Reset date items below month
			dp.day = -1;
			// We need to update the quarter
			dp.quarter = datePickerUtil.getQuarterFromMonth(month);
		}
		dp.month = month;
		// util.showObject(dp);
		// update the days column for the given month
		this.updateDaysDisplay(dp.year, month);
	},
	setDay: function(day) {
		this.dp.dateUnit = 'day';
		this.dp.day = day;
	},
	updateQuartersDisplay: function(year) {
		var firstMonthInYear = (year == this.earliest.year) ? this.earliest.month : 0;
		var lastMonthInYear = (year == this.latest.year) ? this.latest.month : 11;
		var firstQuarterInYear = datePickerUtil.getQuarterFromMonth(firstMonthInYear);
		var lastQuarterInYear = datePickerUtil.getQuarterFromMonth(lastMonthInYear);
		//
		// Update the quartes display
		//
		for (var i = 1; i < 5; i++) {
			anchorId = 'dp:cal:quarter:' + i;
			var showQuarter = (i >= firstQuarterInYear && i <= lastQuarterInYear) ? true : false;
			util.showE(anchorId, showQuarter);
		}
	},
	updateMonthsDisplay: function(year) {
		var firstMonthInYear = (year == this.earliest.year) ? this.earliest.month : 0;
		var lastMonthInYear = (year == this.latest.year) ? this.latest.month : 11;
		for (var i = 0; i < 12; i++) {
			anchorId = 'dp:cal:month:' + i;
			var showMonth = (i >= firstMonthInYear && i <= lastMonthInYear) ? true : false;
			util.showE(anchorId, showMonth);
		}
	},
	applyDateSelection: function() {
		// Selects each date item (year, quarter, month, day) according the active dp data
		// Note, a year, quarter and month is always and minimum semi-active!
		var dp = this.dp;
		var dateUnit = dp.dateUnit;
		// util.showObject(dp);
		var anchor;
		var className;
		// year
		anchor = util.getE('dp:cal:year:' + dp.year);
		className = (dateUnit == 'year') ? 'active' : 'semi-active';
		anchor.className = className;
		// quarter
		anchor = util.getE('dp:cal:quarter:' + dp.quarter);
		className = (dateUnit == 'quarter') ? 'active' : 'semi-active';
		anchor.className = className;
		// anchor.className = 'active';
		// month
		anchor = util.getE('dp:cal:month:' + dp.month);
		className = (dateUnit == 'month') ? 'active' : 'semi-active';
		anchor.className = className;
		// day
		if (dateUnit == 'day') {
			var dayCellNumber = dp.day + dp.dayOffset - 1;
			anchor = util.getE('dp:cal:day:' + dayCellNumber);
			anchor.className = 'active';
		}
	},
	//
	//
	// Date picker - days update utilities (updates the month label and days)
	//
	//
	updateDaysDisplay: function(year, month) {
		// alert('updateDaysDisplay()');
		// Update month label
		var dateLabel = lang.monthsShort[month] + ' ' + year;
		util.updateT('dp:month_year_display', dateLabel);
		// Update days
		var firstWeekdayInPicker = reportInfo.firstWeekday;
		// Create a date for the first of the month
		var theDate = new Date(year, month, 1);
		var firstWeekdayInMonth = theDate.getDay();
		// firstWeekdayZeroOffset is the position of the 0 weekday in the picker grid
		var firstWeekdayZeroOffset = (firstWeekdayInPicker > 0) ? 7 - firstWeekdayInPicker : 0;
		var dayOffset = firstWeekdayInMonth + firstWeekdayZeroOffset;
		if (dayOffset > 6) {dayOffset = dayOffset - 7;}
		var numberOfDays = datePickerUtil.getNumberOfDaysInMonth(year, month);
		// alert('numberOfDays: ' + numberOfDays);
		var dayCount = 1 - dayOffset;
		// Note, if a day is not within the earliest and latest date
		// then we apply the className 'no-log-data'.
		// We check this by earliestActiveDay and latestActiveDay
		var earliestActiveDay = 1;
		var latestActiveDay = numberOfDays;
		if (month == this.earliest.month && year == this.earliest.year) {
			earliestActiveDay = this.earliest.day;
		}
		if (month == this.latest.month && year == this.latest.year) {
			latestActiveDay = this.latest.day;
		}
		for (var i = 0; i < 37; i++) {
			var anchorId = 'dp:cal:day:' + i;
			var anchor;
			var className;
			if (dayCount > 0 && dayCount <= numberOfDays) {
				util.updateT(anchorId, dayCount);
				util.showE(anchorId);
				anchor = util.getE(anchorId);
				className = (dayCount >= earliestActiveDay && dayCount <= latestActiveDay) ? '' : 'no-log-data';
				anchor.className = className;
			}
			else {
				util.hideE(anchorId);
			}
			dayCount++;
		}
		// Set dayOffset
		this.dp.dayOffset = dayOffset;
	},
	//
	//
	//
	// build calendar HTML
	//
	//
	//
	// Note, for date selection we apply a single event. In order to check which items should actually proceed with
	// an event we use ':cal:' within the id
	build: function(containerElementId) {
		var container = util.getE(containerElementId);
		var table = util.createE('table', {id:'dp:calendar_picker', className:'date-picker', cellSpacing:'0'});
		var tbody = util.createE('tbody');
		var tr = document.createElement('tr');
		// table.cellSpacing = '0';
		var tdYear = this.createYearColumn();
		var tdQuarter = this.createQuarterColumn();
		var tdMonth = this.createMonthColumn();
		var tdDays= this.createDaysColumn();
		var tdSpacer = datePickerUtil.createSpacerColumn();
		var tdMonthYearDisplay = this.createMonthYearDisplayColumn();
		util.chainE(container, table, tbody, [tr, tdYear, tdQuarter, tdMonth, tdDays, tdSpacer, tdMonthYearDisplay]);
		datePickerUtil.fixInternetExplorerAnchors('dp:calendar_picker');
	},
	addColumnSpacerItem: function(td, regularCharLength) {
		var span = util.createE('span', {padding:'0px', display:'block', visibility:'hidden'});
		var spacerText = '';
		for (var i = -5; i < regularCharLength; i++) {
			spacerText += '_';
		}
		var text = util.createT(spacerText);
		util.chainE(td, span, text);
	},
	createYearColumn: function() {
		var td = document.createElement('td');
		td.className = 'year';
		td.id = 'dp:year:column';
		var theYear = this.earliest.year;
		var columnDone = false;
		while (!columnDone) {
			var a = document.createElement('a');
			a.id = 'dp:cal:year:' + theYear;
			a.href = 'javascript:;';
			var txt = document.createTextNode(theYear);
			a.appendChild(txt);
			td.appendChild(a);
			// YAHOO.util.Event.addListener(a, 'click', datePicker.setDateByEvent);
			if (theYear != this.latest.year) {
				theYear++;
			}
			else {
				columnDone = true;
			}
		}
		this.addColumnSpacerItem(td, 3);
		return td;
	},
	createQuarterColumn: function() {
		var td = document.createElement('td');
		td.id = 'dp:quarter:column';
		var q = lang.quarterShort;
		for (var i = 1; i < 5; i++) {
			var a = document.createElement('a');
			a.id = 'dp:cal:quarter:' + i;
			a.href = 'javascript:;';
			var txt = document.createTextNode(q + i);
			a.appendChild(txt);
			td.appendChild(a);
			// YAHOO.util.Event.addListener(a, 'click', datePicker.setDateByEvent);
		}
		this.addColumnSpacerItem(td, 2);
		return td;
	},
	createMonthColumn: function() {
		var td = document.createElement('td');
		td.id = 'dp:month:column';
		var monthLabels = lang.monthsShort;
		for (var i = 0; i < 12; i++) {
			var a = document.createElement('a');
			a.id = 'dp:cal:month:' + i;
			a.href = 'javascript:;';
			var txt = document.createTextNode(monthLabels[i]);
			a.appendChild(txt);
			td.appendChild(a);
			// YAHOO.util.Event.addListener(a, 'click', datePicker.setDateByEvent);
		}
		this.addColumnSpacerItem(td, 3);
		return td;
	},
	createDaysColumn: function() {
		// Note, the day column Ids do not refer to the day but to a
		// day anchor / cell, there are 37 day cells (dp1:d:0 - dp1:d:36).
		// Upon setting/selecting a day we calculate the actual day by (cellNumber - dayOffset + 1)		
		var td = document.createElement('td');
		td.id = 'dp:day:column';
		td.className = 'days';
		//
		// Create the days table
		//
		var table = document.createElement('table');
		table.cellSpacing = 0;
		table.className = 'date-picker-days';
		var tbody = document.createElement('tbody');
		table.appendChild(tbody);
		td.appendChild(table);
		// Create the weekdays row
		// var firstWeekday = reportInfo.firstWeekday;
		var markedWeekday = reportInfo.markedWeekday
		var theWeekdayNum = reportInfo.firstWeekday
		var trWeekday = document.createElement('tr');
		for (var i = 0; i < 7; i++) {
			var thWeekday = document.createElement('th');
			if (theWeekdayNum == markedWeekday) {thWeekday.className = 'marked';}
			var weekdayLabel = lang.weekdaysShort[theWeekdayNum];
			var txtWeekday = document.createTextNode(weekdayLabel);
			thWeekday.appendChild(txtWeekday);
			trWeekday.appendChild(thWeekday);
			theWeekdayNum++;
			if (theWeekdayNum > 6) {
				// reset weekday to 0
				theWeekdayNum = 0;
			}
		}
		tbody.appendChild(trWeekday);
		// Create the day cells
		var cellCount = 0;
		for (var i = 0; i < 6; i++) {
			var trDays = document.createElement('tr');
			for (var j = 0; j < 7; j++) {
				if (cellCount < 37) {
					var tdDay = document.createElement('td');
					var aDay = document.createElement('a');
					aDay.id = 'dp:cal:day:' + cellCount;
					aDay.href = 'javascript:;';
					var txtDay = document.createTextNode('-');
					aDay.appendChild(txtDay);
					tdDay.appendChild(aDay);
					trDays.appendChild(tdDay);
					// YAHOO.util.Event.addListener(aDay, 'click', datePicker.setDateByEvent);
					cellCount++;
				}
				else {
					break;
				}
			}
			tbody.appendChild(trDays);
		}
		return td;
	},
	createMonthYearDisplayColumn: function() {
		//
		// Create the month label column
		//
		var td = util.createE('td', {className:'month-year-display'});
		var div = util.createE('div', {id:'dp:month_year_display', className:'month-year-display'});
		var text = util.createT('--- ----');
		var spacerDiv = util.createE('div', {className:'month-year-display', visibility:'hidden'});
		var spacerText = util.createT('AAA 0000');
		util.chainE([td, [div, text], [spacerDiv, spacerText]]);
		return td;
	}
}
//
//
//
// datePicker Relative
//
//
//
datePickerUtil.Relative = function(containerElementId, dp) {
	this.dp = dp; // A reference to the active dp object (dp3)
	this.build(containerElementId);
}
datePickerUtil.Relative.prototype = {
	applyDateSelection: function() {
		// Selects each relative date item according the active dp3 data
		datePickerUtil.clearDateSelection('dp:relative_picker');
		var dp = this.dp;
		// util.showObject(dp);
		// dp.isActive
		// if true we select each item (1 per column) in full color (we apply the relative date filter, i.e. df="last3M".
		// if false we select each item (1 per column) in semi-active color (we use the entire date range, respectively df="").
		// That means the dp object is always set to a valid relative date filter
		// and the isActive property determines if it is used or not.
		var isActive = dp.isActive;
		var className = isActive ? 'active' : 'semi-active';
		//
		// Select type
		//
		var typeElement = util.getE('dp:relative:type:' + dp.type);
		typeElement.className = className;
		//
		// Select dateUnitCount
		//
		var dateUnitCount = dp.dateUnitCount;
		if (dateUnitCount < 11) {
			var dateUnitCountElement = util.getE('dp:relative:date_unit_count:' + dateUnitCount);
			dateUnitCountElement.className = className;
		}		
		//
		// Select date unit
		//
		var dateUnitElement = util.getE('dp:relative:date_unit:' + dp.dateUnit);
		dateUnitElement.className = className;
	},
	//
	//
	//
	// build relative HTML
	//
	//
	//
	// Note, for date selection we apply a single event. In order to check which items should actually proceed with
	// an event we use ':cal:' within the id
	// Element ID schema
	// Anchor elements in dp:relative_picker which should fire a select event
	// should consist of 4 ID part items, i.e.:
	// dp:relative:type:last
	build: function(containerElementId) {
		var container = util.getE(containerElementId);
		var table = util.createE('table', {id:'dp:relative_picker', className:'date-picker', cellSpacing:'0'});
		var tbody = util.createE('tbody');
		var tr = document.createElement('tr');
		var tdType = this.createTypeColumn();
		var tdDateUnitCount = this.createDateUnitCountColumn();
		var tdDateUnit = this.createDateUnitColumn();
		var tdSpacer = datePickerUtil.createSpacerColumn();
		util.chainE(container, table, tbody, [tr, tdType, tdDateUnitCount, tdDateUnit, tdSpacer]);
		datePickerUtil.fixInternetExplorerAnchors('dp:relative_picker');
	},
	createTypeColumn: function() {
		var td = util.createE('td');
		var aRecent = util.createE('a', {id:'dp:relative:type:recent', href:'javascript:;', paddingRight:'18px'});
		var aLast = util.createE('a', {id:'dp:relative:type:last', className:'year', href:'javascript:;', paddingRight:'18px'});
		var txtRecent = util.createT(langVar('lang_stats.date_picker.recent'));
		var txtLast = util.createT(langVar('lang_stats.date_picker.last'));
		util.chainE([td, [aRecent, txtRecent], [aLast, txtLast]]);
		return td;
	},
	createDateUnitCountColumn: function() {
		// Number sequence (KHP-RC, check if date unit count sequence should be customizable per user)
		// n = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
		var td = util.createE('td');
		for (var i = 1; i < 11; i++) {
			var id = 'dp:relative:date_unit_count:' + i;
			var a = util.createE('a', {id:id, href:'javascript:;', paddingRight:'18px'});
			var text = util.createT(i);
			util.chainE(td, a, text);
		}
		return td;
	},
	createDateUnitColumn: function() {
		var td = util.createE('td');
		var dateUnits = datePicker.relativeDateUnits;
		var dateUnitLabelsPlural = datePicker.dateUnitLabelsPlural;
		for (var i = 0; i < dateUnits.length; i++) {
			var name = dateUnits[i];
			var id = 'dp:relative:date_unit:' + name;
			var a = util.createE('a', {id:id, href:'javascript:;', paddingRight:'18px'});
			var label = dateUnitLabelsPlural[name];
			var text = util.createT(label);
			util.chainE(td, a, text);
		}
		return td;
	}
}
//
// globalFilter
//
/* global
	ReportFiltersPanel: false */
var globalFilter = (function() {
	'use strict';
	// Note, each time the window is opened we load a fresh filter set
	// because we don't know if the filter set has been changed in another
	// tab or window between two openings.
	var YE = YAHOO.util.Event,
		panel = null,
		tabs = null,
		activeTabId = '',
		isJustAddedFilterItems = false,
		justAddedFiltersPanel = null,
		savedFiltersPanel = null,
		recentlyAddedFiltersPanel = null,
		// isModified indicates that we have to send and re-assemble
		// the corresponding filters, else we only send the isActive state
		// to the server.
		isModifiedRecentlyAddedFilterItems = false;
	function init() {
		var panelObj = {
			panelId:'global_filter:panel',
			panelClassName: 'panel-50',
			panelHeaderLabel: langVar('lang_stats.global_filter.filters'),
			left: 20,
			top: 50,
			zIndex: 20,
			isCover: true,
			closeEvent: close
		};
		panel = new util.Panel3(panelObj);
		// Init tabs
		tabs = new util.Tabs2(['gf:just_added_filter_items:tab', 'gf:saved_filters:tab', 'gf:recently_added_filter_items:tab'], tabActivated);
		// Init filter panels
//		reportFiltersAndGroups.init();
		justAddedFiltersPanel = new ReportFiltersPanel({
			containerId: 'gf:just_added_filter_items:panel',
			moveItems: true,
			moveToSavedCallback: globalFilter.moveToSaved,
			filterItemsSelectCallback: globalFilter.setNumberOfActiveItems
		});
		savedFiltersPanel = new ReportFiltersPanel({
			containerId: 'gf:saved_filters:panel',
			addItems: true,
			filterItemsSelectCallback: globalFilter.setNumberOfActiveItems
		});
		recentlyAddedFiltersPanel = new ReportFiltersPanel({
			containerId: 'gf:recently_added_filter_items:panel',
			moveItems: true,
			moveToSavedCallback: globalFilter.moveToSaved,
			filterItemsSelectCallback: globalFilter.setNumberOfActiveItems
		});
		YE.addListener('global_filter:save_btn', 'click', saveFiltersDb);
		YE.addListener('global_filter:cancel_btn', 'click', close);
	}
	function open() {
		getFiltersDb();
		if (panel == null) {
			// Initialize the global filter panel
			init();
		}
		// hide the tab bar until all data are loaded
		util.hideE('gf:tab_bar');
		util.hideE(['gf:just_added_filter_items:panel', 'gf:saved_filters:panel', 'gf:recently_added_filter_items:panel']);
		util.showE('gf:loading_info');
		panel.open();
	}
	function close() {
		panel.close();
	}
	function setNumberOfActiveItems() {
		// This updates the state of number of items
		if (isJustAddedFilterItems) {
			var activeJustAddedItemsNum = justAddedFiltersPanel.getNumOfActiveItems();
			util.updateT('gf:just_added_filter_items:active_item_count', activeJustAddedItemsNum);
		}
		var activeSavedFiltersNum = savedFiltersPanel.getNumOfActiveItems();
		util.updateT('gf:saved_filters:active_item_count', activeSavedFiltersNum);
		var activeRecentlyAddedItemsNum = recentlyAddedFiltersPanel.getNumOfActiveItems();
		util.updateT('gf:recently_added_filter_items:active_item_count', activeRecentlyAddedItemsNum);
	}
	function tabActivated() {
		var tabId = this.id;
		util.hideE(['gf:just_added_filter_items:panel', 'gf:saved_filters:panel', 'gf:recently_added_filter_items:panel']);
		tabs.setActiveTab(tabId);
		if (tabId == 'gf:just_added_filter_items:tab') {
			util.showE('gf:just_added_filter_items:panel');
		}
		else if (tabId == 'gf:saved_filters:tab') {
			util.showE('gf:saved_filters:panel');			
		}
		else {
			util.showE('gf:recently_added_filter_items:panel');
		}
		activeTabId = tabId;
	}
	function getFiltersDb() {
		var url = '?dp=statistics.filters.global_filter.get_filters_db';
		url += '&p=' + reportInfo.profileName;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken + '&';
		if (!zoomControl.isZoomItems) {
			dat += 'v.fp.is_zoom_items=false&';
			dat += 'v.fp.active_filter_id=' + reportInfo.filterId;
		}
		else {
			var zoomInfoId = zoomControl.getZoomInfoId();
			dat += zoomControl.getZoomItemsDat();
		}
		util.serverPost(url, dat);
	}
	function getFiltersDbResponse(dat) {
//        util.showObject(dat, 'getFiltersDbResponse()');
		util.hideE('gf:loading_info');
		var justAddedFilterItems = dat.justAddedFilterItems;
		var savedFilterItems = dat.savedFilterItems;
		var savedFilterGroups = dat.savedFilterGroups;
		var recentlyAddedFilterItems = dat.recentlyAddedFilterItems;
		isJustAddedFilterItems = (justAddedFilterItems.length > 0);
		var profileName = reportInfo.profileName;
		var queryFieldsDb = reportInfo.queryFieldsDb;
		justAddedFiltersPanel.initFilters(profileName, queryFieldsDb, justAddedFilterItems, []);
		savedFiltersPanel.initFilters(profileName, queryFieldsDb, savedFilterItems, savedFilterGroups);
		recentlyAddedFiltersPanel.initFilters(profileName, queryFieldsDb, recentlyAddedFilterItems, []);
		// Before we build the lists we have to add a unique object id
		// to each filter item and add labels to all filter items
		// which are not groups and not expression items.
		//
		// Set initial tab state and set the item list width
		//
		util.hideE(['gf:just_added_filter_items:panel', 'gf:saved_filters:panel', 'gf:recently_added_filter_items:panel']);
		var activePanelId;
//		var containerRegion;
		if (justAddedFilterItems.length > 0) {
			activeTabId = 'gf:just_added_filter_items:tab';
			tabs.show('gf:just_added_filter_items:tab');
			activePanelId = 'gf:just_added_filter_items:panel';
		}
		else {
			activeTabId = 'gf:saved_filters:tab';
			tabs.hide('gf:just_added_filter_items:tab');
			activePanelId = 'gf:saved_filters:panel';
		}
		tabs.setActiveTab(activeTabId);
		// Show the tabs bar and panel
		util.showE('gf:tab_bar');
		util.showE(activePanelId);
		// The item list table width must be set due IE quirks.
		// We set the table to the div container width minus scrollbar width.
//		containerRegion = YAHOO.util.Dom.getRegion(activePanelId);
//		var tableWidth = (containerRegion.right - containerRegion.left - 24) + 'px';
//		setTableWidth('gf:just_added_filter_items:container', tableWidth);
		// Disabled setTableWidth for saved_filters due different HTML markup
//		setTableWidth('gf:saved_filters:container', tableWidth);
//		setTableWidth('gf:recently_added_filter_items:container', tableWidth);
		// Set controls state
		setNumberOfActiveItems();
	}
//	function buildUnsavedFilterRows(idPrefix, containerId, filterItems) {
//
//		// Build the unsaved filter rows. We clean up the container from any
//		// existing rows, sort the filterItems Array and build the rows
//
//		removeFilterRows(containerId);
//
//		if (filterItems.length > 0) {
//
//			// Sort the filterItems
//			filterItems.sort(repFiltersUtil.compareLabels);
//
//			// Create the rows
//			var tbody = util.getE(containerId);
//
//			for (var i = 0; i < filterItems.length; i++) {
//
//				var item = filterItems[i];
//				var tr = getFilterRow(idPrefix, item.id, item.label);
//				tbody.appendChild(tr);
//			}
//
//			repFiltersUtil.updateCheckboxState(filterItems, idPrefix);
//		}
//	}
//	function getFilterRow(idPrefix, itemId, itemLabel) {
//
//		// alert('itemId: ' + itemId + '\nlabel: ' + itemLabel);
//
//		// Builds an item row and returns a tr element reference
//
//		// idPrefix is: just_added_fi | recently_added_fi
//
//		// The idPrefix will be used for item ids which will have the format:
//		// just_added_fi:row:i0
//		// just_added_fi:cb:i0
//		// just_added_fi:move:i0
//		// just_added_fi:delete:i0
//
//		// var tbody = util.getE(tbodyId);
//
//		// Note, items are checked in a separate function due IE bug
//
//		var tr = document.createElement('tr');
//		tr.id = idPrefix + ':row:' + itemId;
//
//		//
//		// Add the checkbox cell
//		//
//
//		var td2 = document.createElement('td');
//		td2.style.width = '14px';
//
//		var input = document.createElement('input');
//		var inputId = idPrefix + ':cb:' + itemId;
//		input.id = inputId;
//		input.type = 'checkbox';
//		input.value = '';
//
//		td2.appendChild(input);
//
//		YE.addListener(input, 'click', toggleFilterActiveState);
//
//
//		tr.appendChild(td2);
//
//
//		//
//		// Add the label cell
//		//
//
//		var td3 = document.createElement('td');
//		td3.style.whiteSpace = 'normal';
//		var labelTxt = document.createTextNode(itemLabel);
//
//
//		// Add the label
//
//		var label = document.createElement('label');
//		label.id = idPrefix + ':label:' + itemId;
//		label.htmlFor = inputId;
//
//		label.appendChild(labelTxt);
//		td3.appendChild(label);
//
//		tr.appendChild(td3);
//
//		//
//		// Add the controls cell
//		//
//
//		var td4 = document.createElement('td');
//		td4.className = 'filter-item-controls';
//		var a1;
//		var a1Txt;
//		var separatorLine1 = document.createTextNode(' | ');
//
//
//		// just added item or recently added item, add Move to Saved
//		a1 = document.createElement('a');
//		a1.href = 'javascript:;';
//		a1.id = idPrefix + ':move:' + itemId;
//		a1Txt = document.createTextNode(langVar('lang_stats.global_filter.move_to_saved'));
//		a1.appendChild(a1Txt);
//		td4.appendChild(a1);
//		td4.appendChild(separatorLine1);
//
//		YE.addListener(a1, 'click', moveFilterItem);
//
//
//		// Add Delete control
//
//		var a3 = document.createElement('a');
//		a3.href = 'javascript:;';
//		a3.id = idPrefix + ':delete:' + itemId;
//		var a3Txt = document.createTextNode(langVar('lang_stats.btn.delete'));
//
//		a3.appendChild(a3Txt);
//		td4.appendChild(a3);
//
//		YE.addListener(a3, 'click', deleteFilter);
//
//		tr.appendChild(td4);
//
//		// tbody.appendChild(
//
//		return tr;
//	}
//	function removeFilterRows(containerId) {
//
//		// removes any existing filter row
//
//		var tbody = util.getE(containerId);
//
//		if (tbody.lastChild != null) {
//
//			// remove all rows
//			while (tbody.lastChild != null) {
//				var row = tbody.lastChild;
//				tbody.removeChild(row);
//			}
//		}
//	}
//	function moveFilterItem() {
//
//		// Moves an unsaved filter item to saved filter items
//
//		// alert('moveFilterItem: ' + this.id);
//
//		var elementId = this.id;
//		var dat = elementId.split(':');
//		var idPrefix = dat[0];
//		var itemId = dat[2];
//		var containerId;
//		var rowId = idPrefix + ':row:' + itemId;
//		var newItem = {};
//
//		if (idPrefix == 'just_added_fi') {
//			containerId = 'gf:just_added_filter_items:container';
//			newItem = util.cloneObject(justAddedFilterItems[util.h(itemId)]);
//			util.deleteArrayObject(justAddedFilterItems, 'id', itemId);
//		}
//		else {
//			// move recently_added_fi
//			containerId = 'gf:recently_added_filter_items:container';
//			newItem = util.cloneObject(recentlyAddedFilterItems[util.h(itemId)]);
//			util.deleteArrayObject(recentlyAddedFilterItems, 'id', itemId);
//		}
//
//		// delete justAddedItem row
//		var tbody = util.getE(containerId);
//		var row = util.getE(rowId);
//		tbody.removeChild(row);
//
//		reportFiltersAndGroups.insertFilterItem(newItem);
//
//		// Set controls state
//		setNumberOfActiveItems();
//	}
//	function deleteFilter() {
//
//		// Delete just added or recently added filter item
//		// alert('deleteFilter: ' + this.id);
//		var elementId = this.id;
//		var dat = elementId.split(':');
//		var idPrefix = dat[0];
//		var itemId = dat[2];
//		var rowElementId = idPrefix + ':row:' + itemId;
//		var containerId = '';
//
//		var filtersArray;
//
//		switch (idPrefix) {
//
//			case 'just_added_fi':
//				containerId = 'gf:just_added_filter_items:container';
//				filtersArray = justAddedFilterItems;
//				break;
//
//			case 'recently_added_fi':
//				containerId = 'gf:recently_added_filter_items:container';
//				filtersArray = recentlyAddedFilterItems;
//				isModifiedRecentlyAddedFilterItems = true;
//				break;
//		}
//
//		// Delete the row
//		var tbody = util.getE(containerId);
//		var row = util.getE(rowElementId);
//		tbody.removeChild(row);
//
//		// Delete the object in corresponding filters array
//		util.deleteArrayObject(filtersArray, 'id', itemId);
//
//		// Update controls
//
//		setNumberOfActiveItems();
//	}
//	function toggleFilterActiveState() {
//
//		// alert(this.id);
//
//		var elementId = this.id;
//		var dat = elementId.split(':');
//		var idPrefix = dat[0];
//		var itemId = dat[2];
//
//		var isChecked = this.checked;
//
//		var filtersArray;
//
//		switch (idPrefix) {
//
//			case 'just_added_fi':
//				filtersArray = justAddedFilterItems;
//				break;
//
//			case 'recently_added_fi':
//				filtersArray = recentlyAddedFilterItems;
//				break;
//		}
//
//		var item = filtersArray[util.h(itemId)];
//		item.isActive = isChecked;
//
//		setNumberOfActiveItems();
//	}
	function moveToSaved(filterItem) {
		// This inserts/adds filterItem to savedFiltersPanel
		savedFiltersPanel.addNewItemViaMoveToSaved(filterItem);
	}
	function saveFiltersDb() {
		var justAddedFilterItems = justAddedFiltersPanel.getFilterItems();
		var savedFilterItems = savedFiltersPanel.getFilterItems();
		var savedFilterGroups = savedFiltersPanel.getFilterGroups();
		var recentlyAddedFilterItems = recentlyAddedFiltersPanel.getFilterItems();
		var item;
//		var isModifiedSavedFilterItems = reportFiltersAndGroups.getIsModifiedSavedFilterItems();
//		var isModifiedSavedFilterGroups = reportFiltersAndGroups.getIsModifiedSavedFilterGroups();
		// ToDo, should we add separate isModifiedFilterItems and isModifiedFilterGroups?
		// Set it temporary to true;
		var isModifiedSavedFilterItems = true;
		var isModifiedSavedFilterGroups = true;
		var url = '?dp=statistics.filters.global_filter.save_filters_db';
		url += '&p=' + reportInfo.profileName;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken + '&';
		dat += 'v.fp.is_modified_saved_filter_items=' + isModifiedSavedFilterItems + '&';
		dat += 'v.fp.is_modified_saved_filter_groups=' + isModifiedSavedFilterGroups + '&';
		dat += 'v.fp.is_modified_recently_added_filter_items=' + isModifiedRecentlyAddedFilterItems + '&';
		// 
		// 
		// Handle justAddedFilterItems
		//
		// 
		if (isJustAddedFilterItems && justAddedFilterItems.length > 0) {
			for (var i = 0; i < justAddedFilterItems.length; i++) {
				item = justAddedFilterItems[i];
				dat += repFiltersUtil.getFilterItemDat('v.fp.just_added_filter_items.' + i, item, false);
			}
		}
		else {
			dat += 'v.fp.just_added_filter_items=&';
		}
		// 
		// 
		// Handle savedFilterItems
		//
		// 
		// If not modified we only send the active items, else we send all items.
//		util.showObject(savedFilterItems);
		var savedFilterItemsDat = '';
		for (var j = 0; j < savedFilterItems.length; j++) {
			item = savedFilterItems[j];
			if (isModifiedSavedFilterItems || item.isActive) {
				savedFilterItemsDat += repFiltersUtil.getFilterItemDat('v.fp.saved_filter_items.' + j, item, false);
			}
		}
		dat += (savedFilterItemsDat != '') ? savedFilterItemsDat : 'v.fp.saved_filter_items=&';
		// alert('savedFilterItemsDat length: ' + savedFilterItemsDat.length + '\nstring: ' + savedFilterItemsDat);
		// 
		// 
		// Handle savedFilterGroups
		//
		// 
		// If not modified we only send the group name and is_active node, else we send all details
//		util.showObject(savedFilterGroups);
		var savedFilterGroupsDat = '';
		for (var k = 0; k < savedFilterGroups.length; k++) {
			var filterGroup = savedFilterGroups[k];
			var isActive = filterGroup.isActive;
			if (isModifiedSavedFilterGroups || isActive) {
				var group_path = 'v.fp.saved_filter_groups.' + k;
				savedFilterGroupsDat += group_path + '.name=' + encodeURIComponent(filterGroup.name) + '&';
				savedFilterGroupsDat += group_path + '.is_active=' + isActive + '&';
				if (isModifiedSavedFilterGroups) {
					// We send all details
					savedFilterGroupsDat += group_path + '.label=' + filterGroup.label + '&';
					var items = filterGroup.items;
					// Note, we allow to save empty filterGroups!
					if (items.length > 0) {
						for (var m = 0; m < items.length; m++) {
							item = items[m];
							var itemPath = group_path + '.filter_items.' + m;
							savedFilterGroupsDat += repFiltersUtil.getFilterItemDat(itemPath, item, true);
						}
					}
					else {
						savedFilterGroupsDat += group_path + '.filter_items=&';
					}
				}
			}
			// alert('savedFilterGroupsDat per iteration length: ' + savedFilterGroupsDat.length + '\nstring: ' + savedFilterGroupsDat);
		}
		dat += (savedFilterGroupsDat != '') ? savedFilterGroupsDat : 'v.fp.saved_filter_groups=&';
		// 
		// Handle recentlyAddedFilterItems
		//
		// If not modified we only send the active items, else we send all items.
		var recentlyAddedFilterItemsDat = '';
		for (var n = 0; n < recentlyAddedFilterItems.length; n++) {
			item = recentlyAddedFilterItems[n];
			if (isModifiedRecentlyAddedFilterItems || item.isActive) {
				recentlyAddedFilterItemsDat += repFiltersUtil.getFilterItemDat('v.fp.recently_added_filter_items.' + n, item, false);
			}
		}
		dat += (recentlyAddedFilterItemsDat != '') ? recentlyAddedFilterItemsDat : 'v.fp.recently_added_filter_items=&';
		dat = dat.replace(/&$/, '');
		util.serverPost(url, dat);
	}
	function saveFiltersDbResponse(filterId) {
		// alert('saveFiltersDbResponse, filterId: ' + filterId);
		panel.close();
		if (newReport.filterId != filterId) {
			// Apply the filter
			newReport.filterId = filterId;
			newReport.request();
		}
	}
	// Return global properties and methods
	return {
		open: open,
		getFiltersDbResponse: getFiltersDbResponse,
		saveFiltersDbResponse: saveFiltersDbResponse,
		moveToSaved: moveToSaved,
		setNumberOfActiveItems: setNumberOfActiveItems
	};
}());
//
// emailReport
//
var emailReport = {
	panel: null,
	addressControl: null,
	validator: null,
	defaultDat: null, // keeps default data from server response
	// active smtp_server values
	isSMTPServerEdit: false, // Set to true if SMPT server has been edited
	smtpServer: '',
	smtpUsername: '',
	smtpPassword: '',
	// Properties used in validate(), respectively read from here when sending
	returnAddress: '',
	subject: '',
	isCommentDisplay: false,
	init: function() {
		var YE = YAHOO.util.Event;
		var panelObj = {
			panelId: 'email_report:panel',
			panelClassName: 'panel-50',
			panelHeaderLabel: langVar('lang_stats.email_report.email_report'),
			left: 100,
			top: 50,
			zIndex: 20,
			isCover: true,
			closeEvent: emailReport.close
		};
		emailReport.panel = new util.Panel3(panelObj);
		emailReport.validator = new util.Validator();
		// Build email form elements
		emailReport.buildForm();
		emailReport.addressControl = new emailUtil.AddressControl('email_report:address_control:container', 440);
		YE.addListener('email_report:send_btn', 'click', emailReport.send);
		YE.addListener('email_report:cancel_btn', 'click', emailReport.close);
		YE.addListener('email_report:comment:btn', 'click', emailReport.toggleComment);
		// Handle Edit SMTP
		var isRootAdmin = reportInfo.isRootAdmin;
		util.showE('email_report:edit_smtp_btn', isRootAdmin);
		if (isRootAdmin) {
			YE.addListener('email_report:edit_smtp_btn', 'click', smtp.open);
		}
	},
	open: function() {
		if (emailReport.panel == null) {
			emailReport.init();
		}
		else {
			// Form was already open, re-enable visibility
			util.showEV('email_report:form');
		}
		emailReport.resetForm();
		if (emailReport.defaultDat == null) {
			emailReport.getEmailDb();
			emailReport.disableForm();
		}
		else {
			emailReport.updateForm();
		}
		emailReport.panel.open();
	},
	getEmailDb: function() {
		var url = '?dp=statistics.email.get_email_db';
		url += '&p=' + reportInfo.profileName;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken;
		dat += '&v.fp.report_name=' + reportInfo.reportName;
		util.serverPost(url, dat);
	},
	getEmailDbResponse: function(dat) {
		// alert('getEmailDbResponse()');
		emailReport.defaultDat = dat;
		emailReport.updateForm();
	},
	resetForm: function() {
		util.setF('email_report:return_address', '');
		util.setF('email_report:subject', '');
		util.setF('email_report:comment', '');
		if (emailReport.isCommentDisplay) {
			emailReport.toggleComment();
		}
		emailReport.addressControl.reset();
	},
	updateForm: function() {
		emailReport.disableForm(false);
		var dat = emailReport.defaultDat;
		util.setF('email_report:return_address', dat.returnAddress);
		util.setF('email_report:subject', dat.subject);
		util.setF('email_report:save_recipient_addresses_as_default', dat.saveRecipientAddressesAsDefault);
		util.setF('email_report:comment', '');
		emailReport.smtpServer = dat.smtpServer;
		emailReport.smtpUsername = dat.smtpUsername;
		emailReport.addressControl.init(dat.defaultAddresses);
	},
	disableForm: function(isDisable) {
		// Not is use because IE6 has a layout problem!
		// isDisable is optional
		var makeDisabled = (isDisable != null) ? isDisable : true;
		var a = [
			'email_report:return_address',
			'email_report:subject',
			'email_report:comment',
			'email_report:save_recipient_addresses_as_default',
			'email_report:send_btn',
			'email_report:edit_smtp_btn'
		];
		util.disableE(a, makeDisabled);
		emailReport.addressControl.disable(makeDisabled);
	},
	close: function() {
		util.hideE('delivering_mail_info');
		emailReport.panel.close();
	},
	send: function() {
		if (emailReport.validate()) {
			emailReport.setDisplayToDelivery();
			var url = '?dp=statistics.email.email_report_setup';
			url += '&p=' + reportInfo.profileName;
			var dat = 'v.fp.page_token=' + reportInfo.pageToken;
			dat += '&v.fp.report_job_id=' + reportInfo.reportJobId;
			dat += '&v.fp.report_name=' + reportInfo.reportName;
			// Check smtp_server
			var isSMTPServerEdit = emailReport.isSMTPServerEdit
			dat += '&v.fp.is_smtp_server_edit=' + isSMTPServerEdit;
			if (isSMTPServerEdit) {
				dat += '&v.fp.smtp_server=' + emailReport.smtpServer;
				dat += '&v.fp.smtp_username=' + emailReport.smtpUsername;
				dat += '&v.fp.smtp_password=' + emailReport.smtpPassword;
			}
			dat += '&v.fp.save_recipient_addresses_as_default=' + util.getF('email_report:save_recipient_addresses_as_default');
			dat += '&v.fp.return_address=' + encodeURIComponent(emailReport.returnAddress);
			dat += '&v.fp.report_email_subject=' + encodeURIComponent(emailReport.subject);
			var comment = (emailReport.isCommentDisplay) ? util.getF('email_report:comment') : '';
			dat += '&v.fp.comment=' + encodeURIComponent(comment);
			var addresses = emailReport.addressControl.getAddresses();
			for (var i = 0; i < addresses.length; i++) {
				var item = addresses[i];
				var path = '&v.fp.addresses.' + i;
				dat += path + '.type=' + item.type;
				dat += path + '.address=' + encodeURIComponent(item.address);
			}
			util.serverPost(url, dat);
		}
	},
	setDisplayToDelivery: function() {
		util.hideEV('email_report:form');
		// Set delivering mail element
		var region = YAHOO.util.Dom.getRegion('email_report:form');
		// util.showObject(region);
		var element = util.getE('delivering_mail_info');
		element.style.position = 'absolute';
		element.style.top = region.top + 'px';
		element.style.left = region.left + 'px';
		element.style.zIndex = '200';
		element.style.display = 'block';
	},
	sendResponse: function() {
		// alert('sendResponse()');
		// Clear default data so that we get the latest dataset upon re-sending
		emailReport.defaultDat = null;
		emailReport.isSMTPServerEdit = false;
		emailReport.close();
	},
	validate: function() {
		var validator = emailReport.validator;
		validator.reset();
		emailReport.returnAddress = validator.isValue('email_report:return_address');
		emailReport.returnAddress = validator.isEmailAddress('email_report:return_address');
		emailReport.subject = validator.isValue('email_report:subject');
		isValidRecipientAddress = emailReport.addressControl.validate();
		if (validator.allValid() && isValidRecipientAddress) {
			// Check SMTP server
			if (emailReport.smtpServer != '') {
				return true;
			}
			else {
				alert(langVar('lang_stats.email_report.no_smtp_server_defined_msg'));
			}
		}
		return false;
	},
	toggleComment: function() {
		var showComment = !emailReport.isCommentDisplay;
		util.showE('email_report:comment:row', showComment);
		emailReport.isCommentDisplay = showComment;
		var text = showComment ? langVar('lang_stats.email_report.remove_comment') : langVar('lang_stats.email_report.add_comment');
		util.updateT('email_report:comment:btn', text);
	},
	//
	// Build form utilities
	//
	buildForm: function() {
		var container = util.getE('email_report:container');
		var table = util.createE('table');
		var tbody = util.createE('tbody');
		emailReport.buildEmailSamplePart(tbody);
		emailReport.buildReturnAddressPart(tbody);
		emailReport.buildRecipientAddressPart(tbody);
		emailReport.buildSubjectPart(tbody);
		emailReport.buildCommentPart(tbody);
		emailReport.buildMiscControls(tbody);
		util.chainE(container, table, tbody);
	},
	buildEmailSamplePart: function(tbody) {
		var tr = util.createE('tr');
		var th = util.createE('th', {className:'field-sample'});
		var td = util.createE('td', {className:'field-sample'});
		var thText = util.createT('&nbsp;');
		var tdText = util.createT(langVar('lang_stats.email_report.address_format_example'));
		util.chainE(tbody, [tr, [th, thText], [td, tdText]]);
	},
	buildReturnAddressPart: function(tbody) {
		var tr = util.createE('tr');
		var th = util.createE('th');
		var td = util.createE('td');
		var text = util.createT(langVar('lang_stats.email_report.from') + ':');
		var input = util.createE('input', {id:'email_report:return_address', type:'text', value:'', width:'400px'});
		var div = util.createE('div', {id:'email_report:return_address:error', className:'form-error'});
		util.chainE(tbody, [tr, [th, text], [td, input, div]]);
	},
	buildRecipientAddressPart: function(tbody) {
		var tr = util.createE('tr');
		var th = util.createE('th', {paddingTop:'5px', verticalAlign:'top'});
		var td = util.createE('td', {id:'email_report:address_control:container', paddingTop:'5px'});
		var text = util.createT(langVar('lang_stats.email_report.recipients') + ':');
		util.chainE(tbody, [tr, [th, text], td]);
	},
	buildSubjectPart: function(tbody) {
		// Subject row
		var tr = util.createE('tr');
		var th = util.createE('th', {paddingTop:'18px'});
		var td =  util.createE('td', {paddingTop:'18px'});
		var text = util.createT(langVar('lang_stats.email_report.subject') + ':');
		var input = util.createE('input', {id:'email_report:subject', type:'text', value:'', width:'440px'});
		var div = util.createE('div', {id:'email_report:subject:error', className:'form-error'});
		util.chainE(tbody, [tr, [th, text], [td, input, div]]);
	},
	buildCommentPart: function(tbody) {
		var tr = util.createE('tr', {id:'email_report:comment:row', display:'none'});
		var th = util.createE('th', {paddingTop:'5px', verticalAlign:'top'});
		var td = util.createE('td', {paddingTop:'5px'});
		var text = util.createT(langVar('lang_stats.email_report.comment') + ':');
		var textArea = util.createE('textarea', {id:'email_report:comment', width:'440px', height:'90px'});
		util.chainE(tbody, [tr, [th, text], [td, textArea]]);
	},
	buildMiscControls: function(tbody) {
		// We use a nested table for Add/Remove comment and Remember recipients for this profile
		var tr = util.createE('tr');
		var th = util.createE('th');
		var td = util.createE('td', {paddingTop:'21px'});
		emailReport.buildMiscNestedControls(td);
		util.chainE(tbody, [tr, th, td]);
	},
	buildMiscNestedControls: function(tdContainer) {
		var table = util.createE('table', {cellSpacing:0});
		var tbody = util.createE('tbody');
		var tr = util.createE('tr');
		var td = util.createE('td', {verticalAlign:'baseline'});
		var a = util.createE('a', {id:'email_report:comment:btn', href:'javascript:;'});
		var aText = util.createT(langVar('lang_stats.email_report.add_comment'));
		var id = 'email_report:save_recipient_addresses_as_default';
		var td2 = util.createE('td', {paddingLeft:'18px', verticalAlign:'baseline'});
		var input = util.createE('input', {id:id, type:'checkbox'});
		var label = util.createE('label', {htmlFor:id});
		var labelText = util.createT(' ' + langVar('lang_stats.email_report.remember_recipients'));
		util.chainE(label, labelText);
		util.chainE(tdContainer, table, tbody, [tr, [td, [a, aText]], [td2, input, label]]);
	}
}
//
// smtp.js (Used in emailReport.js, handles SMTP server editing)
//
var smtp = {
	panel: null,
	validator: null
};
smtp.init = function() {
	var YE = YAHOO.util.Event;
	var panelObj = {
		panelId:'smtp:panel',
		panelClassName: 'panel-50',
		panelHeaderLabel: langVar('lang_stats.email_report.edit_smtp_server'),
		left: 160,
		top: 70,
		zIndex: 40,
		isCover: true,
		closeEvent: smtp.close
	};
	smtp.panel = new util.Panel3(panelObj);
	smtp.validator = new util.Validator();
	smtp.buildForm();
	YE.addListener('smtp:ok_btn', 'click', smtp.save);
	YE.addListener('smtp:cancel_btn', 'click', smtp.close);
}
smtp.open = function() {
	if (smtp.panel == null) {
		smtp.init();
	}
	else {
		// panel has already been opened
		smtp.validator.reset();
	}
	// Fix Fireforx overflow bug
	emailReport.addressControl.freezeOverflow();
	// Set default values
	util.setF('smtp_server', emailReport.smtpServer);
	util.setF('smtp_username', emailReport.smtpUsername);
	util.setF('smtp_password', emailReport.smtpPassword);
	smtp.panel.open();
}
smtp.save = function() {
	var validator = smtp.validator;
	validator.reset();
	var smtpServer = validator.isValue('smtp_server');
	if (validator.allValid()) {
		emailReport.isSMTPServerEdit = true;
		emailReport.smtpServer = smtpServer;
		emailReport.smtpUsername = util.getF('smtp_username');
		emailReport.smtpPassword = util.getF('smtp_password');
		smtp.close();
	}
}
smtp.close = function() {
	smtp.panel.close();
	emailReport.addressControl.freezeOverflow(false);
}
smtp.buildForm = function() {
	var container = util.getE('smtp:container');
	var table = util.createE('table', {cellspacing:0});
	var tbody = util.createE('tbody');
	smtp.buildFormRow(tbody, langVar('lang_stats.email_report.smtp_server'), 'smtp_server', 'text', 260, true);
	smtp.buildFormRow(tbody, langVar('lang_stats.email_report.username'), 'smtp_username', 'text', 260, false);
	smtp.buildFormRow(tbody, langVar('lang_stats.email_report.password'), 'smtp_password', 'password', 260, false);
	util.chainE(container, table, tbody);
}
smtp.buildFormRow = function(tbody, label, id, inputType, inputWidth, isSmtpServerField) {
	var tr = util.createE('tr');
	var th = util.createE('th');
	var td = util.createE('td');
	var text = util.createT(label + ':');
	var input =  util.createE('input', {id:id, value:'', type:inputType, width:inputWidth + 'px'});
	var lastElement;
	if (isSmtpServerField) {
		lastElement = util.createE('div', {id:id + ':error', className:'form-error'});
	}
	else {
		// lastElement = util.createT(' (optional)');
		// TEMP due optional text after input where type is password!
		// KHP-RC, revise above Temp solution
		lastElement = util.createE('span');
	}
	util.chainE(tbody, [tr, [th, text], [td, input, lastElement]]);
}
//
// reports/databaseUtil.js
//
var databaseUtil = function() {
	var YE = YAHOO.util.Event;
	var GD = { // General global data
		panel: null,
		isUpdateDatabase: false
		// isActiveSnaponOperation: false,
		// isRealTimeProcessing: false,
		// databaseIsBuilding: false
	};
	function init() {
		var panelObj = {
			panelId: 'update_build_database:panel',
			panelClassName: 'panel-50',
			panelHeaderLabel: '-',
			left: 300,
			top: 80,
			zIndex: 20,
			isCover: true,
			closeEvent: databaseUtil.closePanel
		};
		GD.panel = new util.Panel3(panelObj);
		YE.addListener('update_build_database:yes_btn', 'click', databaseUtil.startDatabaseOperation);
		YE.addListener('update_build_database:no_btn', 'click', databaseUtil.closePanel);
		YE.addListener('update_build_database:close_btn', 'click', databaseUtil.closePanel);
		YE.addListener('update_build_database:refresh_report_btn', 'click', databaseUtil.refreshReport);
	}
	function updateDatabase() {
		// alert('updateDatabase');
		GD.isUpdateDatabase = true;
		getDatabaseInfoData();
	}
	function buildDatabase() {
		// alert('buildDatabase');
		GD.isUpdateDatabase = false;
		getDatabaseInfoData()
	}
	function getDatabaseInfoData() {
		report.busyPanel.showLoading();
		var url = '?dp=statistics.database_info.get_db_info_data';
		url += '&p=' + reportInfo.profileName;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken;
		util.serverPost(url, dat);
	}
	function getDatabaseInfoDataResponse(dat) {
		// util.showObject(dat);
		report.busyPanel.stop();
		var isActiveSnaponOperation = dat.isActiveSnaponOperation;
		var isRealTimeProcessing = dat.isRealTimeProcessing;
		var databaseIsBuilding = dat.databaseIsBuilding;
		var lastModificationTime = dat.lastModificationTime;
		if (GD.panel == null) {
			init();
		}
		// Hide all form sections
		var a = ['update_build_database:last_modified_section',
			'update_build_database:update_section',
			'update_build_database:build_section',
			'update_build_database:refresh_report_section',
			'update_build_database:snapon_active_section',
			'update_build_database:yes_no_btn_section',
			'update_build_database:close_btn_section'
		];
		util.hideE(a);
		var panelLabel = GD.isUpdateDatabase ? langVar('lang_stats.btn.update_database') : langVar('lang_stats.btn.build_rebuild_database');
		if (isActiveSnaponOperation) {
			util.showE('update_build_database:snapon_active_section');
			util.showE('update_build_database:close_btn_section');
		}
		else {
			if (lastModificationTime != '') {
				util.updateT('update_build_database:last_modified', lastModificationTime);
				util.showE('update_build_database:last_modified_section');
			}
			if ((!isRealTimeProcessing && databaseIsBuilding) ||
				(isRealTimeProcessing && GD.isUpdateDatabase)) {
				// Show 'Refresh report info'
				util.showE('update_build_database:refresh_report_section');
				util.showE('update_build_database:close_btn_section');
			}
			else {
				if (GD.isUpdateDatabase) {
					util.showE('update_build_database:update_section');
				}
				else {
					util.showE('update_build_database:build_section');
				}
				util.showE('update_build_database:yes_no_btn_section');
			}
		}
		GD.panel.open({label:panelLabel});
	}
	function closePanel() {
		GD.panel.close();
	}
	function refreshReport() {
		newReport.request();
		closePanel();
	}
	function startDatabaseOperation() {
		closePanel();
		var mainLabel;
		var mainInfo;
		var url;
		if (GD.isUpdateDatabase) {
			url = '?dp=update_database.start_update_database';
			operationLabel = langVar('lang_stats.database.updating_database_initiated_please_wait');
		}
		else {
			url = '?dp=build_database.start_build_database';
			operationLabel = langVar('lang_stats.database.building_database_initiated_please_wait');
		}
		report.busyPanel.showCustom(operationLabel);
		url += '&p=' + reportInfo.profileName;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken;
		dat += '&v.fp.client_response_function=' + 'databaseUtil.startDatabaseOperationResponse';
		util.serverPost(url, dat);
	}
	function startDatabaseOperationResponse(dat) {
		// util.showObject(dat);
		var errorMessage = dat.errorMessage;
		report.busyPanel.stop();
		if (errorMessage == '') {
			// We assume there is database update or build progress and request a new report
			newReport.request();
		}
		else {
			// show error message
			alert(errorMessage);
		}
	}
	//
	//
	// Return global properties and methods
	//
	//
	return {
		updateDatabase: updateDatabase,
		buildDatabase: buildDatabase,
		getDatabaseInfoDataResponse: getDatabaseInfoDataResponse,
		closePanel: closePanel,
		refreshReport: refreshReport,
		startDatabaseOperation: startDatabaseOperation,
		startDatabaseOperationResponse: startDatabaseOperationResponse
	}
}();
//
// reports/activeFiltersInfo.js
//
var activeFiltersInfo = function() {
	var YE = YAHOO.util.Event;
	var GD = { // General global data
		panel: null
	};
	function init() {
		var panelObj = {
			panelId: 'active_filters_info:panel',
			panelClassName: 'panel-50',
			panelHeaderLabel: langVar('lang_stats.active_filters_info.label'),
			left: 300,
			top: 80,
			zIndex: 20,
			isCover: true,
			isSticky: true,
			closeEvent: activeFiltersInfo.closePanel
		};
		GD.panel = new util.Panel3(panelObj);
		YE.addListener('active_filters_info:close_btn', 'click', activeFiltersInfo.closePanel);
	}
	function open() {
		if (GD.panel == null) {
			// Init panel
			init();
			// Get active filters data
			getActiveFiltersDat();
			report.busyPanel.showLoading();
		}
		else {
			// Already loaded
			// updateForm();
			GD.panel.open();
		}
	}
	function closePanel() {
		GD.panel.close();
	}
	function getActiveFiltersDat() {
		var url = '?dp=statistics.filters.active_filters_info.get_active_filters_info';
		url += '&p=' + reportInfo.profileName;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken;
		dat += '&v.fp.report_job_id=' + reportInfo.reportJobId;
		util.serverPost(url, dat);
	}
	function getActiveFiltersDatResponse(dat) {
		// util.showObject(dat);
		var dateFilter = dat.dateFilter;
		var filterExpression = dat.filterExpression;
		var isDateFilter = dateFilter != '';
		var isFilterExpression = filterExpression != '';
		if (isDateFilter) {
			util.updateT('active_filters_info:date_filter:df1', dateFilter);
			util.updateT('active_filters_info:date_filter:df2', dateFilter);
		}
		if (isFilterExpression) {
			util.updateT('active_filters_info:general_filter:f1', filterExpression);
			util.updateT('active_filters_info:general_filter:f2', filterExpression);
		}
		util.showE('active_filters_info:date_filter', isDateFilter);
		util.showE('active_filters_info:general_filter', isFilterExpression);
		util.showE('active_filters_info:no_filters', !isDateFilter && !isFilterExpression);
		report.busyPanel.stop();
		GD.panel.open();
	}
	//
	//
	// Return global properties and methods
	//
	//
	return {
		open: open,
		closePanel: closePanel,
		getActiveFiltersDatResponse: getActiveFiltersDatResponse
	}
}();
//
// macroItem.js (Create New Macro panel)
//
//
var macroItem = {
	panel: null,
	validator: null,
	activeMacro: {},
	/*
		name: '', 	// macro node name, is set after saving the macro
		label: '',
		rn: '', 	// report_name
		df: '', 	// date_filter
		fi: '', 	// filter_id
		f: '', 		// url/command_line filter
		fc: '' 		// filters_comment
	},
	*/
	init: function() {
		var panelObj = {
			panelId: 'macro_item:panel',
			panelClassName: 'panel-50',
			panelHeaderLabel: langVar('lang_stats.macros.create_new_macro'),
			left: 100,
			top: 50,
			zIndex: 20,
			isCover: true,
			closeEvent: macroItem.close
		};
		macroItem.panel = new util.Panel3(panelObj);
		macroItem.validator = new util.Validator();
		var YE = YAHOO.util.Event;
		YE.addListener(['macro_item:open_report_btn', 'macro_item:apply_date_btn', 'macro_item:apply_filters_btn'], 'click', macroItem.updateSaveButtonState);
		YE.addListener('macro_item:ok_btn', 'click', macroItem.saveMacroItem);
		YE.addListener('macro_item:cancel_btn', 'click', macroItem.close);
	},
	open: function() {
		if (!macroItem.panel) {
			macroItem.init();
		}
		macroItem.validator.reset();
		macroItem.updateForm();
		macroItem.updateSaveButtonState();
		macroItem.panel.open();
	},
	close: function() {
		macroItem.panel.close();
	},
	updateSaveButtonState: function() {
		// We allow to save a Macro only if one of the actions is checked.
		var makeEnabled = util.getF('macro_item:open_report_btn') || util.getF('macro_item:apply_date_btn') || util.getF( 'macro_item:apply_filters_btn'); 
		util.enableE('macro_item:ok_btn', makeEnabled);
	},
	updateForm: function() {
		// Reset/set form data
		var isDateTimeSupport = reportInfo.isDateTimeSupport;
		util.setF('macro_item:label', '');
		util.setF('macro_item:open_report_btn', true);
		util.setF('macro_item:apply_date_btn', isDateTimeSupport);
		util.setF('macro_item:apply_filters_btn', true);
		var isDateFilter = (isDateTimeSupport && reportInfo.dateFilter != '');
		var isFilters = (reportInfo.filterId != '' || reportInfo.commandLineFilter != '');
		util.showE('macro_item:apply_date_section', isDateTimeSupport);
		util.showEV('macro_item:entire_date_range_label', !isDateFilter);
		util.showEV('macro_item:no_filters_label', !isFilters);
	},
	saveMacroItem: function() {
		var validator = macroItem.validator;
		validator.reset();
		//
		// Reset activeMacro object
		//
		var activeMacro = {};
		var label = validator.isValue('macro_item:label');
		activeMacro.name = '';
		activeMacro.label = label;
		//
		// Check if the report name is part of the macro
		//
		if (util.getF('macro_item:open_report_btn')) {
			activeMacro.rn = reportInfo.reportName;
		}
		//
		// Check if the date filter is part of the macro
		//
		if (util.getF('macro_item:apply_date_btn')) {
			// KHP-RC, we need to distinguish between relative and absolute dates
			activeMacro.df = reportInfo.dateFilter;
		}
		//
		// Check if the filters are part of the macro
		//
		if (util.getF('macro_item:apply_filters_btn')) {
			activeMacro.fi = reportInfo.filterId;
			activeMacro.f = reportInfo.commandLineFilter;
			activeMacro.fc = reportInfo.commandLineFilterComment;
		}
		if (validator.allValid()) {
			macroItem.activeMacro = activeMacro;
			// Check for duplicate label
			var macrosDb = reportInfo.macros;
			var isDuplicateLabel = false;
			var isReplaceExistingMacro = false;
			var existingMacroName = '';
			for (var i = 0; i < macrosDb.length; i++) {
				if (macrosDb[i].label == label) {
					existingMacroName = macrosDb[i].name;
					isDuplicateLabel = true;
					isReplaceExistingMacro = confirm(langVar('lang_stats.macros.confirm_macro_replacement_message'));
					break;
				}
			}
			if (!isDuplicateLabel || isReplaceExistingMacro) {
				//
				// Save the macro
				//
				var url = '?dp=statistics.macros.save_macro_item';
				url += '&p=' + reportInfo.profileName;
				var dat = 'v.fp.page_token=' + reportInfo.pageToken;
				dat += '&v.fp.is_replace_existing_macro=' + isReplaceExistingMacro;
				dat += '&v.fp.existing_macro_name=' + existingMacroName;
				// Add the new macro item object
				for (prop in activeMacro) {
					dat += '&v.fp.new_macro_item.' + prop + '=' + encodeURIComponent(activeMacro[prop]);
				}
				util.serverPost(url, dat);
			}
		}
	},
	saveMacroItemResponse: function(dat) {
		var isReplaceExistingMacro = dat.isReplaceExistingMacro;
		var replacementFailed = false; // In case that the item has not been replaced
		var newMacroName = dat.newMacroName;
		var activeMacro = macroItem.activeMacro;
		var macrosDb = reportInfo.macros;
		var newMacroItem = util.cloneObject(activeMacro);
		newMacroItem.name = newMacroName;
		if (isReplaceExistingMacro) {
			// Find replaceIndex
			var replaceIndex = -1;
			for (var i = 0; i < macrosDb.length; i++) {
				if (macrosDb[i].name == newMacroName) {
					replaceIndex = i;
					break;
				}
			}
			if (replaceIndex != -1) {
				macrosDb.splice(replaceIndex, 1, newMacroItem);
			}
			else {
				replacementFailed = true;
			}
		}
		if (!isReplaceExistingMacro || replacementFailed) {
			// Add new macro as last item
			macrosDb[macrosDb.length] = newMacroItem;
		}
		// Update Macros list
		report.macros.updateList();
		macroItem.panel.close();
	}
}
//
// manageMacros.js
//
//
var manageMacros = {
	panel: null,
	moveControl: null,
	macrosDb: [],
	selectedItemIndex: -1,
	isDisabledOkBtn: true,
	init: function() {
		var panelObj = {
			panelId: 'manage_macros:panel',
			panelClassName: 'panel-50',
			panelHeaderLabel: langVar('lang_stats.macros.manage_macros'),
			left: 100,
			top: 50,
			zIndex: 20,
			isCover: true,
			closeEvent: manageMacros.close
		};
		manageMacros.panel = new util.Panel3(panelObj);
		manageMacros.moveControl = new util.MoveControl('macros_move_control', manageMacros.moveItem);
		var YE = YAHOO.util.Event;
		YE.addListener('manage_macros:table', 'click', manageMacros.itemActivated);
		YE.addListener('manage_macros:ok_btn', 'click', manageMacros.saveMacros);
		YE.addListener('manage_macros:cancel_btn', 'click', manageMacros.close);
	},
	open: function() {
		if (!manageMacros.panel) {
			manageMacros.init();
		}
		manageMacros.updateForm();
		// manageMacros.updateSaveButtonState();
		manageMacros.panel.open();
	},
	close: function() {
		manageMacros.panel.close();
	},
	updateForm: function() {
		// Get a clone of reportInfo.macros
		var macrosDbOri = reportInfo.macros;
		var isMacroItems = (macrosDbOri.length > 0);
		var macrosDb = isMacroItems ? util.cloneObject(macrosDbOri) : [];
		manageMacros.macrosDb = macrosDb;
		manageMacros.selectedItemIndex = -1;
		util.showE('manage_macros:table', isMacroItems);
		util.showE('manage_macros:no_macros_info', !isMacroItems);
		// Disable the ok button until something becomes edited
		util.disableE('manage_macros:ok_btn');
		manageMacros.isDisabledOkBtn = true;
		if (isMacroItems) {
			manageMacros.buildList();
		}
	},
	setIsModifiedState: function() {
		// Enable the OK button if it is not yet enabled
		if (manageMacros.isDisabledOkBtn) {
			util.enableE('manage_macros:ok_btn');
			manageMacros.isDisabledOkBtn = false;
		}
	},
	itemActivated: function(evt) {
		var element = evt.target || evt.srcElement;
		// var elementId = element.id;
		// alert('listcontrollerB.List.prototype.itemListActivated - elementId: ' + elementId);
		// alert('element.nodeName: ' + element.nodeName);
		var tagName = element.nodeName;
		if (tagName == 'TH' || tagName == 'A') {
			// alert('tagName: ' + tagName);
			var tbody;
			// Get the row/item index of the clicked item
			var trElement;
			if (tagName == 'TH') {
				trElement = element.parentNode;
			}
			else {
				tdElement = element.parentNode;
				trElement = tdElement.parentNode;
			}
			var itemIndex = 0;
			var previousTrElement = trElement.previousSibling;
			while (previousTrElement) {
				itemIndex += 1;
				previousTrElement = previousTrElement.previousSibling;
			}
			// alert('itemIndex: ' + itemIndex);
			var selectedItemIndex = manageMacros.selectedItemIndex;
			if (tagName == 'TH') {
				// Select/Deselect the item
				if (selectedItemIndex == itemIndex) {
					// Deselect current row
					trElement.className = '';
					manageMacros.selectedItemIndex = -1;
				}
				else {
					if (selectedItemIndex != -1) {
						// Deselect previous selected row
						tbody = util.getE('manage_macros:tbody');
						var allRows = tbody.getElementsByTagName('tr');
						var selectedRow = allRows[selectedItemIndex];
						selectedRow.className = '';
					}
					// Select activated row
					trElement.className = 'manage-macros-select';
					manageMacros.selectedItemIndex = itemIndex;
				}
			}
			else {
				// Delete the item
				// Delete row
				tbody = util.getE('manage_macros:tbody');
				tbody.removeChild(trElement);
				// Delete object
				manageMacros.macrosDb.splice(itemIndex, 1);
				// Reset selectedItemIndex if the deleted row was selected
				if (selectedItemIndex == itemIndex) {
					manageMacros.selectedItemIndex = -1;
				}
				manageMacros.setIsModifiedState();
			}
			//
			// Update moveControl state
			//
			manageMacros.moveControl.setState(manageMacros.selectedItemIndex, manageMacros.macrosDb.length);
		}
	},
	moveItem: function(direction) {
		// Invoked from moveControl
		// var direction = manageMacros.moveControl.getMoveDirection(this.id);
		var selectedItemIndex = manageMacros.selectedItemIndex;
		var macrosDb = manageMacros.macrosDb;
		// alert('moveItem() - direction: ' + direction);
		var movedItemIndex = 0;
		var isUpDirection = false;
		switch (direction) {
			case 'top': 
				movedItemIndex = 0;
				isUpDirection = true;
				break;
			case 'up':
				movedItemIndex = selectedItemIndex - 1;
				isUpDirection = true;
				break;
			case 'down':
				movedItemIndex = selectedItemIndex + 1;
				break;
			case 'bottom':
				movedItemIndex = macrosDb.length - 1;
				break;
		}
		// Move the object in macrosDb
		var movedObjArray = macrosDb.splice(selectedItemIndex, 1);
		var movedObj = movedObjArray[0];
		macrosDb.splice(movedItemIndex, 0, movedObj);
		//
		// Update the row labels
		//
		var updateRowIndexStart = isUpDirection ? movedItemIndex : selectedItemIndex;
		var updateRowIndexEnd = isUpDirection ? selectedItemIndex : movedItemIndex;
		var tbody = util.getE('manage_macros:tbody');
		var thElements = tbody.getElementsByTagName('th');
		for (var i = updateRowIndexStart; i <= updateRowIndexEnd; i++) {
			var th = thElements[i];
			var thText = th.firstChild;			
			thText.nodeValue = macrosDb[i].label;
		}
		//
		// Update row selection
		//
		var trElements = tbody.getElementsByTagName('tr');
		var tr = trElements[selectedItemIndex];
		tr.className = '';
		var trMoved = trElements[movedItemIndex];
		trMoved.className = 'manage-macros-select';
		manageMacros.selectedItemIndex = movedItemIndex;
		//
		// Update move button state
		//
		manageMacros.moveControl.setState(movedItemIndex, macrosDb.length);
		manageMacros.setIsModifiedState();
	},
	saveMacros: function() {
		// alert('saveMacros()');
		var macrosDb = manageMacros.macrosDb;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken + '&';
		if (macrosDb.length > 0) {
			for (var i = 0; i < macrosDb.length; i++) {
				var macroItem = macrosDb[i];
				// Update macro item name
				macroItem.name = i;
				var path = 'v.fp.modified_macros.' + i;
				// Add position node for sorting --> position is covered by name property!
				// dat += path + '.position=' + i + '&';
				for (var prop in macroItem) {
					dat += path + '.' + prop + '=' + encodeURIComponent(macroItem[prop]) + '&';
				}
			}
			dat = dat.replace(/&$/, '');
		}
		else {
			dat += 'v.fp.modified_macros=';
		}
		var url = '?dp=statistics.macros.save_macros';
		url += '&p=' + reportInfo.profileName;
		util.serverPost(url, dat);
	},
	saveMacrosResponse: function() {
		// Update reportInfo.macros and the macros list with the latest macros object
		var macrosDb = util.cloneObject(manageMacros.macrosDb);
		reportInfo.macros = macrosDb;
		report.macros.updateList();
		manageMacros.close();
	},
	//
	//
	// List utilities
	//
	//
	buildList: function() {
		var macrosDb = manageMacros.macrosDb;
		var table = util.getE('manage_macros:table');
		// Clean up items list
		util.removeChildElements(table);
		var tbodyId = 'manage_macros:tbody';
		var tbody = util.createE('tbody', {id:tbodyId});
		for (var i = 0; i < macrosDb.length; i++) {
			var itemLabel = macrosDb[i].label;
			var tr = util.createE('tr');
			var th = util.createE('th');
			var thText = util.createT(itemLabel);
			var td = util.createE('td');
			var a = util.createE('a', {href:'javascript:;'});
			var aText = util.createT(langVar('lang_stats.btn.delete'));
			util.chainE(tbody, [tr, [th, thText], [td, [a, aText]]])
		}
		util.chainE(table, tbody);
	}
}
//
//
// saveReportControl.js
//
//
//
var saveReportControl = {
	panelA: null, // Save Report Changes Panel
	panelB: null, // Row Number Paging Warning Panel
	busyPanel: null,
	setSkipSaveReportChangesDialogInFuture: false, // Is used on server side to determine if the variable will be set in user_info
	init: function() {
		var panelAObj = {
			panelId: 'save_report_changes_a:panel',
			panelClassName: 'panel-50',
			panelHeaderLabel: langVar('lang_stats.save_report_changes.save_report_changes'),
			left: 320,
			top: 45,
			zIndex: 20,
			isCover: true,
			closeEvent: saveReportControl.closePanelA
		};
		var panelBObj = {
			panelId: 'save_report_changes_b:panel',
			panelClassName: 'panel-50',
			panelHeaderLabel: langVar('lang_stats.save_report_changes.row_number_paging_info'),
			left: 320,
			top: 45,
			zIndex: 40,
			isCover: true,
			closeEvent: saveReportControl.closePanelB
		};
		saveReportControl.panelA = new util.Panel3(panelAObj);
		saveReportControl.panelB = new util.Panel3(panelBObj);
		// Create simple progress panel
		saveReportControl.busyPanel = new util.BusyPanel();
		var YE = YAHOO.util.Event;
		YE.addListener('save_report_changes_a:ok_btn', 'click', saveReportControl.confirmPanelA);
		YE.addListener('save_report_changes_a:cancel_btn', 'click', saveReportControl.closePanelA);
		YE.addListener('save_report_changes_b:ok_btn', 'click', saveReportControl.confirmPanelB);
		YE.addListener('save_report_changes_b:cancel_btn', 'click', saveReportControl.closePanelB);
	},
	//
	//
	// panelA (Save Report Changes Panel)
	//
	//
	openPanelA: function() {
		saveReportControl.panelA.open();
	},
	confirmPanelA: function() {
		// Check if row number paging is active
		var isActiveRowNumberPaging = saveReportControl.getIsActiveRowNumberPaging();
		// Check if the user want to skip this dialog in future
		saveReportControl.setSkipSaveReportChangesDialogInFuture = util.getF('save_report_changes_a:skip_dialog_in_future_btn');
		if (!isActiveRowNumberPaging) {
			// Confirmed, proceed with saving the changes
			saveReportControl.panelA.close();
			saveReportControl.saveChanges();
		}
		else {
			// Show row number paging info
			saveReportControl.openPanelB();
		}
	},
	closePanelA: function() {
		saveReportControl.panelA.close();
	},
	//
	//
	// rowNumberPagingWarningPanel
	//
	//
	openPanelB: function() {
		saveReportControl.panelB.open();
	},
	confirmPanelB: function() {
		var isSkipSaveReportChangesDialog = reportInfo.skipSaveReportChangesDialog;
		saveReportControl.closePanelB();
		if (!isSkipSaveReportChangesDialog) {
			// In this case panelA is open, so we have to close this panel too.
			saveReportControl.closePanelA();
		}
		saveReportControl.saveChanges();
	},
	closePanelB: function() {
		saveReportControl.panelB.close();
	},
	//
	//
	// main saveReportControl handling
	//
	//
	//
	saveChangesActor: function() {
		// Invoked via 'Save Report Changes' button
		var isSkipSaveReportChangesDialog = reportInfo.skipSaveReportChangesDialog;
		// Init all panels by checking panelA
		if (!saveReportControl.panelA) {
			saveReportControl.init();
		}
		if (!isSkipSaveReportChangesDialog) {
			// Open the dialog
			saveReportControl.openPanelA();
		}
		else {
			// Check if row number paging is active
			var isActiveRowNumberPaging = saveReportControl.getIsActiveRowNumberPaging();
			if (!isActiveRowNumberPaging) {
				// Proceed with saving the report changes
				saveReportControl.saveChanges();
			}
			else {
				// Show row number paging info dialog (Row numbers of paging are not saved, respectively starting row will be always 1!)
				saveReportControl.openPanelB();
 			}
		}
	},
	saveChanges: function() {
		saveReportControl.busyPanel.showSaving();
		var setSkipSaveReportChangesDialogInFuture = saveReportControl.setSkipSaveReportChangesDialogInFuture;
		if (setSkipSaveReportChangesDialogInFuture) {
			// Don't show dialog again, also not on current page, so we have to set the variable in reportInfo as well
			reportInfo.skipSaveReportChangesDialog = true;
		}
		var url = '?dp=statistics.save_report_changes.save_report_changes';
		url += '&p=' + reportInfo.profileName;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken;
		dat += '&v.fp.web_browser_session_id=' + reportInfo.webBrowserSessionId;
		dat += '&v.fp.is_save_report_changes_to_profile_permission=' + reportInfo.permissions.saveReportChangesToProfile;
		dat += '&v.fp.report_name=' + reportInfo.reportName;
		dat += '&v.fp.report_info_id=' + reportInfo.reportInfoId;
		dat += '&v.fp.set_skip_save_report_changes_dialog_in_future=' + setSkipSaveReportChangesDialogInFuture;
		util.serverPost(url, dat);
	},
	saveChangesResponse: function() {
		// alert('saveChangesResponse()');
		saveReportControl.busyPanel.stop();
	},
	//
	//
	// main util
	//
	//
	getIsActiveRowNumberPaging: function() {
		var reportElements = reportInfo.reportElements;
		var isActiveRowNumberPaging = false;
		for (var i = 0; i < reportElements.length; i++) {
			var reportElement = reportElements[i];
			var type = reportElement.reportElementType;
			if ((type == 'table' || type == 'log_detail') && reportElement.startingRow > 1) {
				isActiveRowNumberPaging = true;
				break;
			}
		}
		return isActiveRowNumberPaging;
	}
};
//
// saveAsNewReport.js 
//
//
var saveAsNewReport = {
	panel: null,
	validator: null,
	dat: null,
	/*
	dat contains fresh data such as report label, report description, etc.
	dat object
	dat: {
		reportLabel: '',
		reportDescription: '',
		reportLabelsDb: ['Report 1', 'Report 2', ...],
		reportGroupsDb: [{name:group1, label:Group 1}, {name:group2, label:Group 2}, ...]
	}
	*/
	init: function() {
		saveAsNewReport.validator = new util.Validator();
		var panelObj = {
			panelId: 'sanr:panel',
			panelClassName: 'panel-50',
			panelHeaderLabel: langVar('lang_stats.save_as_new_report.save_as_new_report'),
			left: 250,
			top: 45,
			zIndex: 20,
			isCover: true,
			closeEvent: saveAsNewReport.close
		};
		saveAsNewReport.panel = new util.Panel3(panelObj);
		saveAsNewReport.validator = new util.Validator();
		var YE = YAHOO.util.Event;
		YE.addListener('sanr:report_groups_list', 'change', saveAsNewReport.reportGroupListActor);
		if (reportInfo.dateFilterInfo.isRelativeDateFilter) {
			YE.addListener('sanr:save_date_btn', 'click', saveAsNewReport.toggleSaveDate);
		}
		YE.addListener('sanr:save_filters_btn', 'click', saveAsNewReport.toggleSaveFilters);
		YE.addListener('sanr:add_edit_report_description_btn', 'click', saveAsNewReport.toggleReportDescription);
		YE.addListener('sanr:save_btn', 'click', saveAsNewReport.saveReport);
		YE.addListener('sanr:cancel_btn', 'click', saveAsNewReport.close);
	},
	open: function() {
		if (!saveAsNewReport.panel) {
			// Init panel
			saveAsNewReport.init();
			// Get fresh report data
			saveAsNewReport.getReportDat();
			report.busyPanel.showLoading();
		}
		else {
			// Data already exists
			saveAsNewReport.updateForm();
			saveAsNewReport.validator.reset();
			saveAsNewReport.panel.open();
		}
	},
	close: function() {
		saveAsNewReport.panel.close();
	},
	getReportDat: function() {
		var url = '?dp=statistics.save_as_new_report.get_report_dat';
		url += '&p=' + reportInfo.profileName;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken + '&';
		dat += 'v.fp.report_name=' + newReport.reportName;
		util.serverPost(url, dat);
	},
	getReportDatResponse: function(dat) {
		// alert('getReportDatResponse()');
		saveAsNewReport.dat = dat;
		// Populate report groups list
		var reportGroupsDb = dat.reportGroupsDb;
		util.populateSelect('sanr:report_groups_list', reportGroupsDb, 'name', 'label');
		saveAsNewReport.updateForm();
		report.busyPanel.stop();
		saveAsNewReport.panel.open();
	},
	updateDateSection: function() {
		var dateFilterInfo = reportInfo.dateFilterInfo;
//		util.showObject(dateFilterInfo);
		var isGlobalDateFilter = dateFilterInfo.isGlobalDateFilter;
		var isFixedDate = dateFilterInfo.isFixedDate;
		var isValidDateFilterSyntax = dateFilterInfo.isValidDateFilterSyntax;
		var isOutOfRange = dateFilterInfo.isOutOfRange;
		var isRelativeDateFilter = dateFilterInfo.isRelativeDateFilter;
		// Set checked state, regardless if a date filter is active or not
		util.setF('sanr:save_date_btn', false);
		if (isRelativeDateFilter) {
			util.setF('sanr:save_relative_date_btn', true);
		}
		else {
			util.setF('sanr:save_absolute_date_btn', true);
		}
		var isEnabledDate = isGlobalDateFilter && !isFixedDate && isValidDateFilterSyntax && !isOutOfRange;
		var isEnabledDateOptions = isEnabledDate && isRelativeDateFilter;
		util.enableE('sanr:save_date_btn', isEnabledDate);
		util.enableE(['sanr:save_relative_date_btn', 'sanr:save_absolute_date_btn'], isEnabledDateOptions);
	},
	updateForm: function() {
		// Reset/set form data
		// saveAsNewReport.setTabPanel('general');
		// saveAsNewReport.setLoadingInfo(false);
		var dat = saveAsNewReport.dat;
		var newReportLabel = dat.reportLabel + ' ' + langVar('lang_stats.save_as_new_report.new');
		util.setF('sanr:report_label', newReportLabel);
		//
		// Handle reports menu
		//
		util.setF('sanr:show_in_dynamic_reports_btn', true);
		util.setF('sanr:show_in_static_reports_btn', false);
		util.setF('sanr:report_groups_list', '');
		util.setF('sanr:new_report_group_label', '');
		util.hideE('sanr:new_report_group_label_section');
		//
		// Handle Date
		//
		var isDateTimeSupport = reportInfo.isDateTimeSupport;
		if (isDateTimeSupport) {
			saveAsNewReport.updateDateSection();
		}
		util.showE('sanr:save_date_section', isDateTimeSupport);
		//
		// Handle filters
		//
		var isActiveFilters = (reportInfo.filterId != '' || reportInfo.commandLineFilter != '');
		util.setF('sanr:save_filters_btn', isActiveFilters);
		util.setF('sanr:save_structured_filters_btn', true);
		util.enableE(['sanr:save_filters_btn', 'sanr:save_structured_filters_btn', 'sanr:save_hidden_filters_btn'], isActiveFilters);
		//
		// Handle report description
		//
		var reportDescription = dat.reportDescription;
		var showDescriptionBtnLabel = (reportDescription == '') ? langVar('lang_stats.save_as_new_report.add_report_description') : langVar('lang_stats.save_as_new_report.edit_report_description');
		util.updateT('sanr:add_edit_report_description_btn', showDescriptionBtnLabel);
		util.setF('sanr:report_description', reportDescription);
		util.showE('sanr:add_edit_report_description_btn');
		util.hideE('sanr:report_description_section');
	},
	reportGroupListActor: function() {
		var groupName = util.getF('sanr:report_groups_list');
		var isCreateNewGroup = (groupName == '__CREATE__NEW_GROUP__');
		util.showE('sanr:new_report_group_label_section', isCreateNewGroup);
	},
	toggleSaveDate: function() {
		util.enableE(['sanr:save_absolute_date_btn', 'sanr:save_relative_date_btn'], this.checked);
	},
	toggleSaveFilters: function() {
		util.enableE(['sanr:save_structured_filters_btn', 'sanr:save_hidden_filters_btn'], this.checked);
	},
	toggleReportDescription: function() {
		util.hideE('sanr:add_edit_report_description_btn');
		util.showE('sanr:report_description_section');
	},
	saveReport: function() {
		var validator = saveAsNewReport.validator;
		validator.reset();
		var reportLabel = validator.isValue('sanr:report_label');
		var reportGroupListValue = util.getF('sanr:report_groups_list');
		var saveInReportGroup = (reportGroupListValue != '');
		var isNewReportGroup = (reportGroupListValue == '__CREATE__NEW_GROUP__');
		var reportGroupName = (saveInReportGroup && !isNewReportGroup) ? reportGroupListValue : '';
		var reportGroupLabel = '';
		if (isNewReportGroup) {
			reportGroupLabel = validator.isValue('sanr:new_report_group_label');
		}
		if (validator.allValid()) {
			var saveDateFilter = false;
			var dateFilter = '';
			var saveFilters = util.getF('sanr:save_filters_btn');
			var saveStructuredFilters = util.getF('sanr:save_structured_filters_btn');
			if (reportInfo.isDateTimeSupport && util.getF('sanr:save_date_btn')) {
				// KHP-RC, check if we save the absolute date or relative date
				saveDateFilter = true;
				dateFilter = reportInfo.dateFilter;
			}
			var reportDescription = util.getF('sanr:report_description');
			var url = '?dp=statistics.save_as_new_report.save_new_report';
			url += '&p=' + reportInfo.profileName;
			var dat = 'v.fp.page_token=' + reportInfo.pageToken;
			dat += '&v.fp.report_job_id=' + reportInfo.reportJobId;
			dat += '&v.fp.report_info_id=' + reportInfo.reportInfoId;
			dat += '&v.fp.ori_report_name=' + reportInfo.reportName;
			dat += '&v.fp.new_report_label=' + reportLabel;
			dat += '&v.fp.show_in_dynamic_reports=' + util.getF('sanr:show_in_dynamic_reports_btn');
			dat += '&v.fp.show_in_static_reports=' + util.getF('sanr:show_in_static_reports_btn');
			dat += '&v.fp.save_in_report_group=' + saveInReportGroup;
			dat += '&v.fp.is_new_report_group=' + isNewReportGroup;
			dat += '&v.fp.report_group_name=' + encodeURIComponent(reportGroupName);
			dat += '&v.fp.report_group_label=' + encodeURIComponent(reportGroupLabel);
			dat += '&v.fp.save_date_filter=' + saveDateFilter;
			dat += '&v.fp.date_filter=' + encodeURIComponent(dateFilter);
			dat += '&v.fp.save_filters=' + saveFilters;
			dat += '&v.fp.save_structured_filters=' + saveStructuredFilters;
			dat += '&v.fp.filter_id=' + reportInfo.filterId;
			dat += '&v.fp.command_line_filter=' + reportInfo.commandLineFilter;
			dat += '&v.fp.command_line_filter_comment=' + reportInfo.commandLineFilterComment;
			dat += '&v.fp.report_description=' + encodeURIComponent(reportDescription);
			util.serverPost(url, dat);
		}
	},
	saveReportResponse: function(dat) {
		// alert('saveReportResponse()');
		saveAsNewReport.close();
		if (dat.showInDynamicReports) {
			// Reload the report so that the new report is shown in the reports menu
			location.reload(true);
		}
	}
}
//
// customizeRE.js - customize report element
//
var customizeRE = {
	panel: null,
	defaultTabId: '', // graphs | table
	// Active report element data
	shortReportElementId: '',
	reportElementName: '',
	reportElementType: '',
	totalRows: 0,
	reportElementDb: {}, // contains the active report element data
	initCreObjectDone: false
	// Quick access to check which panels are available
	// showGraphs: false,
	// isGraphOptions: false,
	// showTable: false,
	// isPivotTable: false
}
customizeRE.init = function() {
	var YE = YAHOO.util.Event;
	var panelObj = {
		panelId:"cre:panel",
		panelClassName: 'panel-50',
		panelHeaderLabel: langVar('lang_stats.customize_report_element.customize_report_element'),
		zIndex: 20,
		isCover: true,
		closeEvent: customizeRE.close
	};
	customizeRE.panel = new util.Panel3(panelObj);
	YE.addListener('cre:save_btn', 'click', customizeRE.save);
	YE.addListener('cre:cancel_btn', 'click', customizeRE.close);
}
customizeRE.open = function(evt) {
	var element = evt.target || evt.srcElement;
	var id = element.id;
	var dat = id.split(':');
	var shortReportElementId = dat[0];
	var reportElement = reportInfo.reportElements[util.h(shortReportElementId)];
	var reportElementName = reportElement.name;
	var reportElementType = reportElement.reportElementType;
	// util.showObject(reportElement);
	// var defaultTabId = (dat[2] == 'table') ? 'table' : 'graphs'; // This parameter depends if the CRE panel has been opened within the graphs or table section
	var defaultTabId = (reportElementType == 'table' && reportElement.showGraphs) ? 'graphs' : 'table';
//	if (reportElementType == 'table' && !reportElement.showTable) {
//		// This must be a graph without table
//		defaultTabId = 'graphs';
//	}
	customizeRE.defaultTabId = defaultTabId;
	customizeRE.shortReportElementId = shortReportElementId;
	customizeRE.reportElementName = reportElementName;
	customizeRE.reportElementType = reportElementType;
	customizeRE.totalRows = reportElement.totalRows;
	// alert('shortReportElementId: ' + shortReportElementId + '\nreportElementName: ' + reportElementName);
	// Initialize panel
	if (customizeRE.panel == null) {
		customizeRE.init();
	}
	// util.hideE(['cre:tab_bar', 'cre:sub_panels']);
	util.hideE('cre:cre_forms_object');
	util.showE('cre:loading_info');
	customizeRE.getReportElementData(reportElementName);
	// Get position
	customizeRE.panel.prePositionAtCenter();
	customizeRE.panel.open();
}
customizeRE.close = function() {
	customizeRE.panel.close();
}
customizeRE.getReportElementData = function(reportElementName) {
	var url = '?dp=statistics.customize_report_element.get_report_element_data';
	url += '&p=' + reportInfo.profileName;
	var loadDefaultGraphsDb = !customizeRE.initCreObjectDone; // We load defaultGraphsDb only once!
	// KHP 10/Aug/2010 - Get session_id on server side!	
	// var dat = 'v.fp.session_id=' + reportInfo.sessionId;
	var dat = 'v.fp.page_token=' + reportInfo.pageToken;
	dat += '&v.fp.report_info_id=' + reportInfo.reportInfoId;
	dat += '&v.fp.report_name=' + reportInfo.reportName;
	dat += '&v.fp.report_element_name=' + reportElementName;
	dat += '&v.fp.load_default_graphs=' + loadDefaultGraphsDb;
	util.serverPost(url, dat);
}
customizeRE.getReportElementDataResponse = function(dat) {
	// alert('customizeRE.getReportElementDataResponse');
	// util.showObject(dat);
	// Verify if we got the right report element
	if (dat.reportInfoId == reportInfo.reportInfoId && dat.reportElementName == customizeRE.reportElementName) {
		var reportElementDb = dat.reportElementDb;
		customizeRE.reportElementDb = reportElementDb;
		if (!customizeRE.initCreObjectDone) {
			//
			//
			// Init Customize Report Element Object
			//
			//
			var defaultGraphsDb = dat.defaultGraphsDb;
			var queryFieldsDb = reportInfo.queryFieldsDb;
			var isCustomizeInReports = true;
			var isPivotTablePermission = reportInfo.permissions.isCREPivotTable;
			var isGraphOptionsPermission = reportInfo.permissions.isCREGraphOptions;
			var hideLogDetailSortingMessage = reportInfo.hideLogDetailSortingMessage;
			creControl.initCreObject(
				queryFieldsDb,
				defaultGraphsDb,
				isCustomizeInReports,
				isPivotTablePermission,
				isGraphOptionsPermission,
				hideLogDetailSortingMessage
			);
			customizeRE.initCreObjectDone = true;
		}
		//
		//
		// Init Report Element Db 
		//
		//
		var obj = {
			defaultTabId: customizeRE.defaultTabId,
			totalRows: customizeRE.totalRows
		};
		creControl.init(reportElementDb, obj);
		util.hideE('cre:loading_info');
		util.showE('cre:cre_forms_object');
	}
}
customizeRE.getTableReportElementDat = function(reportElementDb, rePath) {
	var permissions = reportInfo.permissions;
	var isGraphOptions = (reportElementDb.show_graphs && permissions.isCREGraphOptions);
	var showTable = reportElementDb.show_table;
	var reportElementType = reportElementDb.type;
	var isPivotTable = (showTable && permissions.isCREPivotTable && (reportElementType == 'table'));
	var dat = '';
	if (showTable) {
		var tableOptionsProp = [
			'show_remainder_row',
			'show_averages_row',
			'show_min_row',
			'show_max_row',
			'show_totals_row',
			'number_of_rows',
//			'display_graphs_table_side_by_side',
			'maximum_table_bar_graph_length'
		];
		for (var i = 0; i <  tableOptionsProp.length; i++) {
			prop = tableOptionsProp[i];
			dat += rePath + '.' + prop + '=' + reportElementDb[prop];
		}
	}
	// Always send sort_by and sort_direction because it can also be set if there are only graphs
	dat += rePath + '.sort_by=' + reportElementDb.sort_by;
	dat += rePath + '.sort_direction=' + reportElementDb.sort_direction;
	if (reportElementType == 'table') {
		dat += rePath + '.maximum_table_bar_graph_length=' + reportElementDb.maximum_table_bar_graph_length;
//		dat += rePath + '.display_graphs_table_side_by_side=' + reportElementDb.display_graphs_table_side_by_side;
		dat += rePath + '.display_graphs_side_by_side=' + reportElementDb.display_graphs_side_by_side;
	}
	if (isPivotTable) {
		var pivotTableObj = reportElementDb.pivot_table;
		// util.showObject(pivotTableObj);
		for (var prop in pivotTableObj) {
			dat += rePath + '.pivot_table.' + prop + '=' + pivotTableObj[prop];
		}
	}
	// alert('Revise customizeRE.isGraphOptions!');
	// return false;
	if (isGraphOptions) {
		var graphsObj = reportElementDb.graphs;
		// util.showObject(graphsObj);
		for (var graphsProp in graphsObj) {
			dat += rePath + '.graphs.' + graphsProp + '=' + graphsObj[graphsProp];
		}
	}
	return dat;
}
customizeRE.save = function() {
	// Note, save_re_data does not require that all report element data are send,
	// it is sufficient to send only data which have been manipulated.
	// Save changes to reportElementDb
	creControl.saveChanges();
	var url = '?dp=statistics.customize_report_element.save_re_data';
	url += '&p=' + reportInfo.profileName;
	var reportElementDb = customizeRE.reportElementDb;
	// util.showObject(reportElementDb);
	var reportElementType = reportElementDb.type;
	var isOverview = (reportElementType == 'overview');
	var showTable = false;
	var showGraphs = false;
	var dat = 'v.fp.page_token=' + reportInfo.pageToken;
	dat += '&v.fp.session_id=' + reportInfo.sessionId;
	dat += '&v.fp.web_browser_session_id=' + reportInfo.webBrowserSessionId;
	dat += '&v.fp.is_root_admin=' + reportInfo.isRootAdmin;
	dat += '&v.fp.report_info_id=' + reportInfo.reportInfoId;
	dat += '&v.fp.report_name=' + reportInfo.reportName;
	dat += '&v.fp.report_element_name=' + customizeRE.reportElementName;
	// dat += '&v.fp.report_element_type=' + reportElementType;
	// dat += '&v.fp.is_save_changes_persistent=' + util.getF('cre:save_changes_persistent');
	var rePath = '&v.fp.report_element';
	var startingRow = 1;
	var endingRow = 10;
	if (isOverview) {
		dat += '&v.fp.report_element.compact_view=' + reportElementDb.compact_view;
	}
	else {
		showTable = reportElementDb.show_table;
		showGraphs = reportElementDb.show_graphs;
		// Note, don't save starting_row and ending_row within report_element,
		// we save it in 'v.fp' because they are a session setting only!
		if (showTable) {
			startingRow = reportElementDb.starting_row;
			endingRow = reportElementDb.ending_row;
		}
		dat += customizeRE.getTableReportElementDat(reportElementDb, rePath);
	}
	// Use for graphs and table
	dat += '&v.fp.starting_row=' + startingRow;
	dat += '&v.fp.ending_row=' + endingRow;
	//
	//
	// Get column/fields data
	//
	//
	var columnIsChecked = false; // Required for log detail report because it allows to uncheck all text columns
	var graphColumnIsChecked = false; // Required if no table is active, in this case one graph must be checked
	var columns = reportElementDb.columns;
	for (var i = 0; i < columns.length; i++) {
		var columnItem = columns[i];
		var columnsPath = '&v.fp.report_element.columns.' + i;
		var showColumn = columnItem.show_column;
		if (showColumn) {columnIsChecked = true;}
		dat += columnsPath + '.position=' + i;
		dat += columnsPath + '.report_field=' + columnItem.report_field;
		dat += columnsPath + '.show_column=' + showColumn;
		if (!isOverview && columnItem['show_percent_column'] != null) {
			var showGraph = columnItem.show_graph;
			// This must be an aggregating field
			dat += columnsPath + '.show_percent_column=' + columnItem.show_percent_column;
			dat += columnsPath + '.show_bar_column=' + columnItem.show_bar_column;
			dat += columnsPath + '.show_graph=' + showGraph;
			if (showGraph) {graphColumnIsChecked = true;}
		}
	}
	if (((showTable || isOverview) && columnIsChecked) ||
		(showGraphs && graphColumnIsChecked)) {
		util.serverPost(url, dat);
	}
	else {
		alert(langVar('lang_stats.customize_report_element.no_column_checked_msg'));
	}
}
customizeRE.saveResponse = function() {
	customizeRE.close();
	newReport.getReportByCustomizeReportElement();
}
//
// sessionPaths
//
var sessionPaths = {
	pathReferences: {}, // keeps any path reference, i.e. re0_9, re0_9_1_2, the pathReference name is the short report element ID followed by the path
	init: function(shortReportElementId) {
		// alert('sessionPaths.init()');
		// Build the root tree
		// var rootTree = _session_paths_test;
		var rootTree = reportInfo.sessionPaths[shortReportElementId];
		var totalRows = rootTree.totalRows;
		var endingRow = rootTree.endingRow;
		var nextPages = rootTree.nextPages;
		var containerElementId = shortReportElementId + ':session_paths_tree';
		var containerElement = util.getE(containerElementId);
		for (var i = 0; i < endingRow; i++) {
			var pathItemObj = nextPages[i];
			sessionPaths.createRootPageItem(shortReportElementId, containerElement, pathItemObj);
		}
		//
		// Add N more rows button
		//
		if (totalRows > endingRow) {
			sessionPaths.createRootRemainderRowItem(shortReportElementId, containerElement, totalRows - endingRow);
		}
	},
	reset: function() {
		// Collapse all and reset row numbers by
		// a.) removing all items in DOM
		// b.) updating the session paths tree object, set expanded=false and reset row numbers
		// c.) rebuilding the DOM via init
		var elementID = this.id;
		var dat = elementID.split(':');
		var shortReportElementId = dat[0];
		var numberOfRows = reportInfo.reportElements[util.h(shortReportElementId)].numberOfRows; // for root tree only
		sessionPaths.synchronizeReset(shortReportElementId, numberOfRows);
		var rootTree = reportInfo.sessionPaths[shortReportElementId];
		var containerElementId = shortReportElementId + ':session_paths_tree';
		var containerElement = util.getE(containerElementId);
		// Revome all items
		while (containerElement.lastChild != null) {
			var item = containerElement.lastChild;
			containerElement.removeChild(item);
		}
		sessionPaths.resetPathObject(rootTree, numberOfRows);
		sessionPaths.init(shortReportElementId);
	},
	resetPathObject: function(pathObject, numberOfRows) {
		pathObject.expanded = false;
		if (pathObject.nextPages != null) {
			var totalRows = pathObject.totalRows;
			pathObject.endingRow = (totalRows > numberOfRows) ? numberOfRows : totalRows;
			var nextPages = pathObject.nextPages;
			for (var i = 0; i < nextPages.length; i++) {
				sessionPaths.resetPathObject(nextPages[i], 10);
			}
		}
	},
	synchronizeExpanded: function(shortReportElementId, thePath, isExpanded) {
		var url = '?dp=statistics.session_paths.synchronize_session_paths';
		url += '&p=' + reportInfo.profileName;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken + '&'
		dat += 'v.fp.report_element_id=' + reportInfo.reportElements[util.h(shortReportElementId)].id + '&';
		dat += 'v.fp.action=set_expanded&';
		dat += 'v.fp.the_path=' + thePath + '&';
		dat += 'v.fp.is_expanded=' + isExpanded;
		util.serverPost(url, dat);
	},
	synchronizeEndingRow: function(shortReportElementId, thePath, endingRow) {
		var url = '?dp=statistics.session_paths.synchronize_session_paths';
		url += '&p' + reportInfo.profileName;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken + '&'
		dat += 'v.fp.report_element_id=' + reportInfo.reportElements[util.h(shortReportElementId)].id + '&';
		dat += 'v.fp.action=set_ending_row&';
		dat += 'v.fp.the_path=' + thePath + '&';
		dat += 'v.fp.ending_row=' + endingRow;
		util.serverPost(url, dat);
	},
	synchronizeReset: function(shortReportElementId, numberOfRows) {
		var url = '?dp=statistics.session_paths.synchronize_session_paths';
		url += '&p=' + reportInfo.profileName;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken + '&'
		dat += 'v.fp.report_element_id=' + reportInfo.reportElements[util.h(shortReportElementId)].id + '&';
		dat += 'v.fp.action=reset&';
		dat += 'v.fp.number_of_rows=' + numberOfRows;
		util.serverPost(url, dat);
	},
	synchronizeResponse: function() {
		return false;
	},
	itemActivated: function(evt) {
		var element = evt.target || evt.srcElement;
		var elementId = element.id;
		if (elementId != '') {
			// Analyse the id
			var dat = elementId.split(':');
			var theKeyword = (dat.length >= 2) ? dat[2] : '';
			// alert('theKeyword: ' + theKeyword);
			if (theKeyword == 'tree' || theKeyword == 'add_rows') {
				var shortReportElementId = dat[0];
				var thePath = dat[1];
				var isRootItem = (thePath.indexOf('_') == -1) ? true : false;
				var pathInfoSplit = thePath.split('_');
				// alert('pathInfoSplit: ' + pathInfoSplit);
				// alert('elementId: ' + elementId);
				// alert('thePath: ' + thePath);
				// thePath is of format 9_12_14
				//
				// Check if a reference to this path already exists
				//
				var pathReferenceId = shortReportElementId + '_' + thePath;
				if (sessionPaths.pathReferences[pathReferenceId] == null) {
					// Get the path item object reference
					var rootTree = reportInfo.sessionPaths[shortReportElementId];
					if (thePath != 'root') {		
						sessionPaths.setPathReference(pathReferenceId, rootTree.nextPages, pathInfoSplit, 0);
					}
					else {
						// This is the root tree
						sessionPaths.pathReferences[pathReferenceId] = rootTree;
					}
				}
				// util.showObject(sessionPaths.pathReferences[pathReferenceId]);
				var pathItem = sessionPaths.pathReferences[pathReferenceId];
				if (theKeyword == 'tree') {
					// Expand or collapse the item
					if (pathItem.expanded) {
						// Collapse the path item and any expanded subitems
						sessionPaths.collapseItems(shortReportElementId, pathItem, thePath, isRootItem);
					}
					else {
						// Expand the path item
						// alert('Expand item');
						// If subitems already exist
						if (pathItem['nextPages'] != null) {
							// path item is already loaded, though check if it is also build
							// id="re0:9_5:_:ul"
							var ulId = shortReportElementId + ':' + thePath + ':_:ul';
							var ulElement = util.getE(ulId);
							// alert('ulElement: ' + ulElement);
							if (ulElement != null) {
								setTimeout("sessionPaths.expandCollapseSetter('" + shortReportElementId + "', '" + thePath + "', true, " + isRootItem + ")", 10);
								pathItem.expanded = true;
								sessionPaths.synchronizeExpanded(shortReportElementId, thePath, true);
							}
							else {
								sessionPaths.createExpandedSessionPaths(shortReportElementId, thePath, pathItem);
							}
						}
						else {
							//
							// Load new subitems
							//
							// alert('Load new subitems');
							var url = '?dp=statistics.session_paths.expand_session_paths';
							url += '&p=' + reportInfo.profileName;
							var reportElementId = reportInfo.reportElements[util.h(shortReportElementId)].id;
							var sysDat = 'v.fp.page_token=' + reportInfo.pageToken + '&';
							sysDat += 'v.fp.short_report_element_id=' + shortReportElementId + '&';
							sysDat += 'v.fp.report_element_id=' + reportElementId + '&';
							sysDat += 'v.fp.the_path=' + thePath;
							util.serverPost(url, sysDat);
						}
					}
				}
				else {
					// Add rows
					var numberOfRowsToAdd = parseInt(dat[3], 10);
					sessionPaths.addRows(shortReportElementId, thePath, pathItem, numberOfRowsToAdd);
				}
			}
		}
	},
	expandSessionPathsResponse: function(dat) {
		// Expand the specified path item
		// alert('response ok');
		// util.showObject(dat);
		var shortReportElementId = dat.sid;
		var thePath = dat.thePath;
		var totalRows = dat.totalRows;
		var endingRow = dat.endingRow;
		var nextPages = dat.nextPages;
		var pathReferenceId = shortReportElementId + '_' + thePath;
		var pathItem = sessionPaths.pathReferences[pathReferenceId];
		//
		// Update path item object
		//
		pathItem.totalRows = totalRows;
		pathItem.endingRow = endingRow;
		pathItem.nextPages = nextPages;
		// util.showObject(pathItem);
		sessionPaths.createExpandedSessionPaths(shortReportElementId, thePath, pathItem);
	},
	createExpandedSessionPaths: function(shortReportElementId, thePath, pathItem) {
		//
		// Expand/build the nextPages items
		//
		// util.showObject(pathItem);
		pathItem.expanded = true;
		sessionPaths.synchronizeExpanded(shortReportElementId, thePath, true);
		var totalRows = pathItem.totalRows;
		var endingRow = pathItem.endingRow;
		var hasRemainderRows = (totalRows > endingRow) ? true : false;
		var nextPages = pathItem.nextPages;
		var parentIsRootItem = (thePath.indexOf('_') == -1) ? true : false;
		var idPrefix = shortReportElementId + ':' + thePath + ':_';
		var parentId = parentIsRootItem ? idPrefix + ':div' : idPrefix + ':li';
		var parentElement = util.getE(parentId);
		// Set image to collapse state
		sessionPaths.expandCollapseImageSetter(shortReportElementId, thePath, true, parentIsRootItem);
		var ulElement = document.createElement('ul');
		var ulId = idPrefix + ':ul';
		ulElement.id = ulId;
		if (parentIsRootItem) {
			ulElement.className = 'root';
		}
		parentElement.appendChild(ulElement);
		//
		// Add the list item(s)
		//
		for (var i = 0; i < endingRow; i++) {
			var item = nextPages[i];
			var isLastItem = (!hasRemainderRows && (i + 1 == endingRow)) ? true : false;
			sessionPaths.createPageItem(shortReportElementId, ulElement, thePath, item, isLastItem);
		}
		//
		// Add N more rows button
		//
		if (hasRemainderRows) {
			sessionPaths.createRemainderRowItem(shortReportElementId, ulElement, thePath, totalRows - endingRow);
		}
	},
	collapseItems: function(shortReportElementId, pathItem, thePath, isRootItem) {
		// Collpase the given path item
		setTimeout("sessionPaths.expandCollapseSetter('" + shortReportElementId + "', '" + thePath + "', false, " + isRootItem + ")", 10)
		pathItem.expanded = false;
		sessionPaths.synchronizeExpanded(shortReportElementId, thePath, false);
		//
		// Collapse any expanded subitems
		//
		/*
		WE DON'T COLLAPSE ALL
		if (pathItem['nextPages'] != null) {
			var nextPages = pathItem['nextPages'];
			for (var i = 0; i < nextPages.length; i++) {
				var nextPathItem = nextPages[i];
				if (nextPathItem.expanded) {
					var nextThePath = thePath + '_' + nextPathItem.id;
					sessionPaths.collapseItems(shortReportElementId, nextPathItem, nextThePath, false, false);
				}
			}
		}
		*/
	},
	createRootPageItem: function(shortReportElementId, containerElement, pathItemObj) {
		var pathId = pathItemObj.id;
		var pageName = pathItemObj.page;
		var events = pathItemObj.events;
		var idPrefix = shortReportElementId + ':' + pathId;
		var div = document.createElement('div');
		div.id = idPrefix + ':_:div';
		div.className = 'session-paths';
		var img = document.createElement('img');
		img.id = idPrefix + ':tree:img';
		img.src = imgDb.spExpandRoot.src;
		img.width = 29;
		img.height = 24;
		img.alt = '';
		var span = document.createElement('span');
		span.id = idPrefix + ':tree:span';
		var YE = YAHOO.util.Event;
		YE.addListener(span, 'mouseover', sessionPaths.highlightTextOn);
		YE.addListener(span, 'mouseout', sessionPaths.highlightTextOff);
		var em = document.createElement('em');
		em.id = idPrefix + ':tree:em';
		var eventsTxt = document.createTextNode(events);
		var startedAtTxt = document.createTextNode(' ' + langVar('lang_stats.session_paths.started_at') + ' ');
		var pageTxt = document.createTextNode(pageName);
		em.appendChild(startedAtTxt);
		span.appendChild(eventsTxt);
		span.appendChild(em);
		span.appendChild(pageTxt);
		div.appendChild(img);
		div.appendChild(span);
		containerElement.appendChild(div);
	},
	createPageItem: function(shortReportElementId, ulElement, thePath, pathItemObj, isLastItem) {
		var YE = YAHOO.util.Event;
		var pathId = pathItemObj.id;
		var pageName = pathItemObj.page;
		var events = pathItemObj.events;
		var isExpanded = pathItemObj.expanded;
		var isExitPoint = (pageName == '_SESSION_EXIT_') ? true : false;
		var idPrefix = shortReportElementId + ':' + thePath + '_' + pathId;
		//
		// li
		//
		var li = document.createElement('li');
		li.id = idPrefix + ':_:li';
		if (isLastItem) {
			li.className = 'last';
		}
		//
		// img
		//
		var img = document.createElement('img');
		if (!isExitPoint) {
			img.id = idPrefix + ':tree:img';
			img.src = isExpanded ? imgDb.spCollapse.src : imgDb.spExpand.src;
		}
		else {
			img.src = imgDb.spExit.src;
		}
		img.width = 39;
		img.height = 24;
		img.alt = '';
		li.appendChild(img);
		//
		// txt
		//
		var span = document.createElement('span');
		var txt;
		if (!isExitPoint) {
			span.id = idPrefix + ':tree:span';
			var eventsTxt = document.createTextNode(events);
			var em = document.createElement('em');
			em.id = idPrefix + ':tree:em';
			var emTxt = document.createTextNode(' ' + langVar('lang_stats.session_paths.then_went_to') + ' ');
			var pageTxt = document.createTextNode(pageName);
			YE.addListener(span, 'mouseover', sessionPaths.highlightTextOn);
			YE.addListener(span, 'mouseout', sessionPaths.highlightTextOff);
			em.appendChild(emTxt);
			span.appendChild(eventsTxt);
			span.appendChild(em);
			span.appendChild(pageTxt);
			li.appendChild(span);
		}
		else {
			span.className = 'exit';
			txt = document.createTextNode(' ' + events + ' ' + langVar('lang_stats.session_paths.then_ended'));
			span.appendChild(txt);
			li.appendChild(span);
		}
		ulElement.appendChild(li);
	},
	createRootRemainderRowItem: function(shortReportElementId, container, remainderRows) {
		var div = document.createElement('div');
		// div.id = shortReportElementId + ':root:_';
		div.className = 'session-paths';
		div.style.marginLeft = '29px';
		div.style.marginTop = '8px';
		var span = document.createElement('span');
		span.id = shortReportElementId + ':root:_:span';
		// span.className = 'add-rows';
		var spanTxt = document.createTextNode(remainderRows + ' ' + langVar('lang_stats.session_paths.more_rows'));
		// YAHOO.util.EventaddListener(span, 'mouseover', sessionPaths.highlightTextOn);
		// YAHOO.util.Event.addListener(span, 'mouseout', sessionPaths.highlightTextOff);
		span.appendChild(spanTxt);
		div.appendChild(span);
		container.appendChild(div);
		if (remainderRows > 0) {
			var rowSequence = [];
			if (remainderRows <= 10) {
				rowSequence = [remainderRows];
			}
			else if (remainderRows <= 20) {
				rowSequence = [10, remainderRows];
			}
			else if (remainderRows <= 50) {
				rowSequence = [10, 20, remainderRows];
			}
			else if (remainderRows <= 100) {
				rowSequence = [10, 20, 50, remainderRows];
			}
			else if (remainderRows <= 200) {
				rowSequence = [10, 20, 50, 100, remainderRows];
			}
			else {
				rowSequence = [10, 20, 50, 100, 200];
			}
			sessionPaths.createRemainderRowButtons(shortReportElementId, div, 'root', remainderRows, rowSequence);
		}
	},
	createRemainderRowItem: function(shortReportElementId, ulElement, thePath, remainderRows) {
		var idPrefix = shortReportElementId + ':' + thePath;
		var li = document.createElement('li');
		li.id = idPrefix + ':_:li';
		li.className = 'last';
		var img = document.createElement('img');
		img.src = imgDb.spNmoreRows.src;
		img.width = 39;
		img.height = 24;
		var span = document.createElement('span');
		// span.className = 'add-rows';
		span.id = idPrefix + ':_:span';
		var spanTxt = document.createTextNode(remainderRows + ' ' + langVar('lang_stats.session_paths.more_rows'));
		// YAHOO.util.Event.addListener(span, 'mouseover', sessionPaths.highlightTextOn);
		// YAHOO.util.Event.addListener(span, 'mouseout', sessionPaths.highlightTextOff);
		span.appendChild(spanTxt);
		li.appendChild(img);
		li.appendChild(span);
		ulElement.appendChild(li);
		if (remainderRows > 0) {
			var rowSequence = [];
			if (remainderRows <= 10) {
				rowSequence = [remainderRows];
			}
			else if (remainderRows <= 20) {
				rowSequence = [10, remainderRows];
			}
			else if (remainderRows <= 50) {
				rowSequence = [10, 20, remainderRows];
			}
			else {
				rowSequence = [10, 20, 50];
			}
			sessionPaths.createRemainderRowButtons(shortReportElementId, li, thePath, remainderRows, rowSequence);
		}
	},
	createRemainderRowButtons: function(shortReportElementId, containerElement, thePath, remainderRows, rowSequence) {
		// Adds additional row numbers to add in braces next to the N more rows text.
		// I.e.:
		// -- 172 more rows (+50 +100 +172)
		// -- 350 more rows (+50 +100 +200)
		// The max number of rows we allow to add at once are 200!
		var YE = YAHOO.util.Event;
		var idPrefix = shortReportElementId + ':' + thePath;
		var emStart = document.createElement('em');
		emStart.style.marginLeft = '7px';
		var emStartTxt = document.createTextNode('(');
		emStart.appendChild(emStartTxt);
		containerElement.appendChild(emStart);
		var numberOfItems = rowSequence.length;
		for (var i = 0; i < numberOfItems; i++) {
			var numberOfRows = rowSequence[i];
			var span = document.createElement('span');
			span.className = 'add-rows';
			span.id = idPrefix + ':add_rows:' + numberOfRows;
			// Add some right space
			if (numberOfItems > 1 && ((i + 1) != numberOfItems)) {
				// span.style.paddingRight = '9px';
			}
			var spanTxt = document.createTextNode('+' + numberOfRows);
			YE.addListener(span, 'mouseover', sessionPaths.highlightTextOn);
			YE.addListener(span, 'mouseout', sessionPaths.highlightTextOff);
			span.appendChild(spanTxt);
			containerElement.appendChild(span);
		}
		var emEnd = document.createElement('em');
		var emEndTxt = document.createTextNode(')');
		emEnd.appendChild(emEndTxt);
		containerElement.appendChild(emEnd);
	},
	expandCollapseSetter: function(shortReportElementId, thePath, isExpanded, isRootItem) {
		sessionPaths.expandCollapseImageSetter(shortReportElementId, thePath, isExpanded, isRootItem);
		var ul_id = shortReportElementId + ':' + thePath + ':_:ul';
		util.showE(ul_id, isExpanded);
	},
	expandCollapseImageSetter: function(shortReportElementId, thePath, isExpanded, isRootItem) {
		var img_id =  shortReportElementId + ':' + thePath + ':tree:img';
		var img = util.getE(img_id);
		if (isExpanded) {
			img.src = isRootItem ? imgDb.spCollapseRoot.src : imgDb.spCollapse.src;
		}
		else {
			img.src = isRootItem ? imgDb.spExpandRoot.src : imgDb.spExpand.src;
		}
	},
	addRows: function(shortReportElementId, thePath, pathItem, numberOfRowsToAdd) {
		// alert('addRows()');
		// alert('numberOfRowsToAdd: ' + numberOfRowsToAdd);
		var totalRows = pathItem.totalRows;
		var endingRow = pathItem.endingRow;
		var newEndingRow = ((endingRow + numberOfRowsToAdd) <= totalRows) ? endingRow + numberOfRowsToAdd : totalRows;
		// Add newEndingRow property to pathItem object so that we get the value in createRows()
		pathItem.newEndingRow = newEndingRow;
		var nextPages = pathItem.nextPages;
		var numberOfRowsInClient = nextPages.length;
		if (newEndingRow > numberOfRowsInClient) {
			// Not all rows exist, get the missing rows(next_pages items) from the server (raw report element)
			var reportElementId = reportInfo.reportElements[util.h(shortReportElementId)].id;
			var url = '?dp=statistics.session_paths.get_session_paths_rows';
			url += '&p=' + reportInfo.profileName;
			var sysDat = 'v.fp.page_token=' + reportInfo.pageToken + '&';
			sysDat += 'v.fp.short_report_element_id=' + shortReportElementId + '&';
			sysDat += 'v.fp.report_element_id=' + reportElementId + '&';
			sysDat += 'v.fp.the_path=' + thePath + '&';
			sysDat += 'v.fp.starting_row=' + (numberOfRowsInClient + 1) + '&';
			sysDat += 'v.fp.ending_row=' + newEndingRow;
			util.serverPost(url, sysDat);
		}
		else {
			// Rows already exist, build the rows
			// alert('addRows(), rows already exist, build the rows');
			sessionPaths.createRows(shortReportElementId, thePath, pathItem);
		}
	},
	addRowsResponse: function(dat) {
		// alert('addRowsResponse()');
		// util.showObject(dat);
		var shortReportElementId = dat.sid;
		var thePath = dat.thePath;
		var pathReferenceId = shortReportElementId + '_' + thePath;
		var pathItem = sessionPaths.pathReferences[pathReferenceId];
		// Add new path items to nextPages
		var nextPages = pathItem.nextPages;
		var newNextPages = dat.nextPages;
		for (var i = 0; i < newNextPages.length; i++) {
			nextPages.splice(nextPages.length, 0, newNextPages[i]);
		}
		sessionPaths.createRows(shortReportElementId, thePath, pathItem);
	},
	createRows: function(shortReportElementId, thePath, pathItem) {
		// alert('createRows() thePath: ' + thePath);
		var endingRow = pathItem.endingRow;
		var totalRows = pathItem.totalRows;
		var newEndingRow = pathItem.newEndingRow;
		var hasRemainderRows = (totalRows > newEndingRow) ? true : false;
		pathItem.endingRow = newEndingRow;
		sessionPaths.synchronizeEndingRow(shortReportElementId, thePath, newEndingRow);
		var nextPages = pathItem.nextPages;
		var isRoot = (thePath == 'root') ? true : false;
		var containerId = isRoot ? shortReportElementId + ':session_paths_tree' : shortReportElementId + ':' + thePath + ':_:ul';
		var container = util.getE(containerId);
		//
		// Delete the N more rows button
		//
		var lastItem = container.lastChild;
		container.removeChild(lastItem);
		//
		// Add the rows
		//
		for (var i = endingRow; i < newEndingRow; i++) {
			if (!isRoot) {
				var isLastItem = (!hasRemainderRows && (i + 1 == newEndingRow)) ? true : false;
				sessionPaths.createPageItem(shortReportElementId, container, thePath, nextPages[i], isLastItem);
			}
			else {
				sessionPaths.createRootPageItem(shortReportElementId, container, nextPages[i]);
			}
		}
		if (hasRemainderRows) {
			var remainderRows = totalRows - newEndingRow;
			if (!isRoot) {
				sessionPaths.createRemainderRowItem(shortReportElementId, container, thePath, remainderRows);
			}
			else {
				sessionPaths.createRootRemainderRowItem(shortReportElementId, container, remainderRows);
			}
		}
		//
		// Synchronize server side
		//
	},
	setPathReference: function(pathReferenceId, nextPages, pathInfoSplit, activePathInfoIndex) {
		// get the pathId
		var pathId = pathInfoSplit[activePathInfoIndex];
		for (var i = 0; i < nextPages.length; i++) {
			var pathItem = nextPages[i];
			if (pathItem.id == pathId) {
				// Check if we need to get deeper or if we are at the end of the path
				if (pathInfoSplit.length == (activePathInfoIndex + 1)) {
					// alert('We have found the object');
					// util.showObject(pathItem);
					// Set the reference
					sessionPaths.pathReferences[pathReferenceId] = pathItem;
				}
				else {
					// Continue search in next level
					// alert('Continue Search in next level!');
					// util.showObject(pathItem.nextPages);
					sessionPaths.setPathReference(pathReferenceId, pathItem['nextPages'], pathInfoSplit, activePathInfoIndex + 1);
				}
			}
		}
	},
	highlightTextOn: function() {
		// alert('highlightTextOn: ' + this.id);
		// this.style.backgroundColor = '#EFEFEF';
		this.className = (this.className == '') ? 'highlight' : 'add-rows-highlight';
	},
	highlightTextOff: function() {
		// alert('highlightTextOff: ' + this.id);
		// this.style.backgroundColor = 'White';
		// this.style.backgroundColor = 'White';
		this.className = (this.className == 'highlight') ? '' : 'add-rows';
	}
}
//
// sessionPagePaths
//
var sessionPagePathsLookup = {
	// Note, we allow multiple page lookup panes (i.e. multiple session page paths report elements),
	// each is identified by the short report element id (sreId)
	// example of active page lookup panel object
	/*
	re0: {
		isOpen: false,
		startingRow: 1, active starting row in display
		endingRow: 24, active ending row in display
		isSearchMode: false, lookup shows a search result
		...
	}
	*/
	pagesLookupNodeName: '', // Name of the pages lookup node in server side ProfileCache, we get the name when doing the inital pages load
	totalRows: 0, // Number of pages in server side database
	init: function(sreId) {
		var YE = YAHOO.util.Event;
		// Clear the search field (it could show a value when opening the report via the web browser back button)
		util.setF(sreId + ':page_lookup:search_field', '');
		// Add page lookup events
		YE.addListener(sreId + ':page_lookup:close_btn', 'click', sessionPagePathsLookup.closeLookup);
		YE.addListener(sreId + ':page_lookup:paging_container', 'click', sessionPagePathsLookup.setRows);
		YE.addListener(sreId + ':page_lookup:list', 'change', sessionPagePathsLookup.setPagePath);
		YE.addListener(sreId + ':page_lookup:list', 'keypress', newReport.setPagePathViaKey);
		YE.addListener(sreId + ':page_lookup:search_field', 'keypress', sessionPagePathsLookup.searchViaKey);
		YE.addListener(sreId + ':page_lookup:search_btn', 'click', sessionPagePathsLookup.searchViaButton);
		YE.addListener(sreId + ':page_lookup:clear_search_btn', 'click', sessionPagePathsLookup.clearSearch);
		// create object data
		sessionPagePathsLookup[sreId] = {};
		lookupObj = sessionPagePathsLookup[sreId];
		// lookupObj.isOpen = false;
		lookupObj.startingRow = 0;
		lookupObj.endingRow = 0;
		lookupObj.isSearchMode = false;
		lookupObj.searchResult = {};
		lookupObj.searchResult.searchResultNodeName = '';
		lookupObj.searchResult.totalRows = 0;
		lookupObj.searchResult.startingRow = 0;
		lookupObj.searchResult.EndingRow = 0;
		// Set initial display state, Loading
		sessionPagePathsLookup.setLoadingState(sreId);
	},
	openLookup: function() {
		// Open or close the page lookup panel
		// alert(this.id);
		// var panel = this;
		var elementId = this.id;
		var dat = elementId.split(':');
		var sreId = dat[0];
		var panelId = sreId + ':page_lookup:panel';
		var panelIsReady = (sessionPagePathsLookup[sreId] != null) ? true : false;
		if (!panelIsReady) {
			// panel is opened for the first time
			sessionPagePathsLookup.init(sreId);
		}
		var lookupObj = sessionPagePathsLookup[sreId];
		// Hide the page lookup button
		// util.hideE(sreId + ':lookup_pages_btn');
		// Get the region of the page path input element
		var region = YAHOO.util.Dom.getRegion(sreId + ':page_path_field');
		// Set panel position
		var panelElement = util.getE(panelId);
		// 2008-11-30 - GMF - Changed the offsets slightly so it completely hides the link that shows it.
		//                    (tested on Win/IE7, Mac/Firefox3, Mac/Safari2).
//		panelElement.style.left = region.left + 'px';
		panelElement.style.left = (region.left - 1) + 'px';
//		panelElement.style.top = (region.bottom + 7) + 'px';
		panelElement.style.top = (region.bottom + 2) + 'px';
		util.showE(panelId);
		// lookupObj.isOpen = true;
		if (!panelIsReady) {
			// Load the first pages, up to 500
			sessionPagePathsLookup.loadPages(sreId, 1, 500);
		}
		/*
		else {
			// Close the panel
			util.hideE(panelId);
			// util.showE(sreId + ':lookup_pages_btn');
			lookupObj.isOpen = false;
		}
		*/
	},
	closeLookup: function() {
		var elementId = this.id;
		var dat = elementId.split(':');
		var sreId = dat[0];
		util.hideE(sreId + ':page_lookup:panel');
	},
	loadPages: function(sreId, startingRow, endingRow) {
		var url = '?dp=statistics.session_page_paths.get_sess_paths_lookup_pages';
		url += '&p=' + reportInfo.profileName;
		var reportElement = reportInfo.reportElements[util.h(sreId)];
		var reportElementName = reportElement.name;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken + '&';
		dat += 'v.fp.report_name=' + reportInfo.reportName + '&';
		dat += 'v.fp.report_element_name=' + reportElementName + '&';
		dat += 'v.fp.pages_lookup_node_name=' + sessionPagePathsLookup.pagesLookupNodeName + '&';
		dat += 'v.fp.sre_id=' + sreId + '&';
		dat += 'v.fp.starting_row=' + startingRow + '&';
		dat += 'v.fp.ending_row=' + endingRow;
		util.serverPost(url, dat);
	},
	loadPagesResponse: function(dat) {
		var sreId = dat.sreId;
		var pages = dat.pages;
		var lookupObj = sessionPagePathsLookup[sreId];
		if (sessionPagePathsLookup.pagesLookupNodeName == '') {
			// This is the initial load
			sessionPagePathsLookup.pagesLookupNodeName = dat.pagesLookupNodeName;
			sessionPagePathsLookup.totalRows = dat.totalRows;
		}
		// upadte lookup object
		lookupObj.startingRow = dat.startingRow;
		lookupObj.endingRow = dat.endingRow;
		sessionPagePathsLookup.populateList(sreId, pages);
		sessionPagePathsLookup.setOperatingState(sreId);
	},
	populateList: function(sreId, pages) {
		var lookupList = util.getE(sreId + ':page_lookup:list');
		lookupList.options.length = 0;
		for (var i = 0; i < pages.length; i++) {
			var pageName = pages[i];
			lookupList.options[i] = new Option(pageName, pageName, false, false);
		}
		lookupList.disabled = false;
	},
	setLoadingState: function(sreId) {
		util.updateT(sreId + ':page_lookup:header_text', langVar('lang_stats.session_page_paths.pages'));
		// Remove the Prev/Next pages buttons (only required if sessionPagePathsLookup.totalRows > 500)
		if (sessionPagePathsLookup.totalRows > 500) {
			var pagingContainer = util.getE(sreId + ':page_lookup:paging_container');
			while (pagingContainer.lastChild != null) {
				var item = pagingContainer.lastChild;
				pagingContainer.removeChild(item);
			}
		}
		// Disable all buttons and the list
		var a = [
			sreId + ':page_lookup:search_field',
			sreId + ':page_lookup:search_btn',
			sreId + ':page_lookup:clear_search_btn'
		];
		util.disableE(a);
		var lookupList = util.getE(sreId + ':page_lookup:list');
		lookupList.options.length = 0;
		lookupList.options[0] = new Option(langVar('lang_stats.session_page_paths.loading_info'), '', false, false);
		lookupList.disabled = true;
	},
	setOperatingState: function(sreId) {
		var lookupObj = sessionPagePathsLookup[sreId];
		var isSearchMode = lookupObj.isSearchMode;
		var activeTotalRows = !isSearchMode ? sessionPagePathsLookup.totalRows : lookupObj.searchResult.totalRows;
		var activeStartingRow = !isSearchMode ? lookupObj.startingRow : lookupObj.searchResult.startingRow;
		var activeEndingRow = !isSearchMode ? lookupObj.endingRow : lookupObj.searchResult.endingRow;
		// var pagesTxt = 'Pages ' + activeStartingRow + ' - ' + activeEndingRow + ' of ' + activeTotalRows;
		var pagesTxt = langVar('lang_stats.session_page_paths.pages_from_to_of_total_rows');
		pagesTxt = pagesTxt.replace(/__PARAM__1/, activeStartingRow);
		pagesTxt = pagesTxt.replace(/__PARAM__2/, activeEndingRow);
		pagesTxt = pagesTxt.replace(/__PARAM__3/, activeTotalRows);
		util.updateT(sreId + ':page_lookup:header_text', pagesTxt);
		// Set the Prev/Next pages buttons (only required if activeTotalRows > 500)
		if (activeTotalRows > 500) {
			sessionPagePathsLookup.createPagingButtons(sreId, activeTotalRows, activeStartingRow, activeEndingRow);
		}
		// Set the buttons
		// util.enableE(sreId + ':show_path_btn');
		// util.enableE(sreId + ':lookup_pages_btn');
		util.enableE(sreId + ':page_lookup:search_field');
		util.enableE(sreId + ':page_lookup:search_btn');
		util.enableE(sreId + ':page_lookup:clear_search_btn', isSearchMode);
	},
	createPagingButtons: function(sreId, activeTotalRows, activeStartingRow, activeEndingRow) {
		// Creates the paging buttons corresponding to the active rows displayed
		// var pagingContainer = util.getE(sreId + ':page_lookup:paging_container');
		// alert('createPagingButtons()');
		// We create maximum four paging buttons
		if (activeStartingRow > 500) {
			if (activeStartingRow > 1000) {
				// Add the first rows button
				sessionPagePathsLookup.createSinglePagingButton(sreId, 'first', 1, 500);
			}
			// Add the Previus row button
			previousStartingRow = activeStartingRow - 500;
			previousEndingRow = activeStartingRow - 1;
			sessionPagePathsLookup.createSinglePagingButton(sreId, 'digits', previousStartingRow, previousEndingRow);
		}
		if (activeEndingRow < activeTotalRows) {
			var nextStartingRow = activeEndingRow + 1;
			var nextEndingRow = (activeEndingRow + 500) <= activeTotalRows ? activeEndingRow + 500 : activeTotalRows;
			// Add the Next rows button
			sessionPagePathsLookup.createSinglePagingButton(sreId, 'digits', nextStartingRow, nextEndingRow);
			if (nextEndingRow < activeTotalRows) {
				// Add the Last rows button
				var multipleOfRowNumberInterval = 500 * Math.floor(activeTotalRows / 500);
				var lastStartingRow = (multipleOfRowNumberInterval != activeTotalRows) ? multipleOfRowNumberInterval + 1 : activeTotalRows - 499;
				sessionPagePathsLookup.createSinglePagingButton(sreId, 'last', lastStartingRow, activeTotalRows);
			}
		}
	},
	createSinglePagingButton: function (sreId, buttonStyle, startingRow, endingRow) {
		// buttonStyle is: first | digits | last
		var pagingContainer = util.getE(sreId + ':page_lookup:paging_container');
		var button = document.createElement('button');
		button.id = sreId + ':page_lookup_rows_setter_btn:' + startingRow + ':' + endingRow;
		button.className = 'paging';
		// button.type = 'button';
		var buttonLabel;
		if (buttonStyle == 'digits') {
			buttonLabel = startingRow + '-' + endingRow;
		}
		else if (buttonStyle == 'last') {
			buttonLabel = '>>';
		}
		else {
			buttonLabel = '<<';
		}
		var buttonTxt = document.createTextNode(buttonLabel);
		button.appendChild(buttonTxt);
		pagingContainer.appendChild(button);
	},
	setRows: function(evt) {
		// event is initiated from a paging button where the element id
		// contains the starting and ending row
		var element = evt.target || evt.srcElement;
		var elementId = element.id;
		if (elementId.indexOf(':page_lookup_rows_setter_btn:') != -1) {
			var dat = elementId.split(':');
			var sreId = dat[0];
			var startingRow = dat[2];
			var endingRow = dat[3];
			sessionPagePathsLookup.setLoadingState(sreId);
			if (!sessionPagePathsLookup[sreId]['isSearchMode']) {
				sessionPagePathsLookup.loadPages(sreId, startingRow, endingRow);
			}
			else {
				sessionPagePathsLookup.loadPagesFromSearchResult(sreId, startingRow, endingRow);
			}
		}
	},
	setPagePath: function() {
		var elementId = this.id;
		var dat = elementId.split(':');
		var sreId = dat[0];
		var pagePath = util.getF(elementId);
		util.setF(sreId + ':page_path_field', pagePath);
	},
	searchViaKey: function(evt) {
		var element = evt.target || evt.srcElement;
		var theKeyCode = (evt.which) ? evt.which : evt.keyCode;
		if (theKeyCode == 13 || theKeyCode == 3) {
			sessionPagePathsLookup.search(element.id);
		}
	},
	searchViaButton: function() {
		sessionPagePathsLookup.search(this.id);
	},
	search: function(elementId) {
		var dat = elementId.split(':')
		var sreId = dat[0];
		var searchTerm = util.getF(sreId + ':page_lookup:search_field');
		if (searchTerm != '') {
			// alert('Search');
			sessionPagePathsLookup.setLoadingState(sreId);
			var url = '?dp=statistics.session_page_paths.search_session_paths_lookup';
			url += '&p=' + reportInfo.profileName;
			var dat = 'v.fp.page_token=' + reportInfo.pageToken + '&';
			dat += 'v.fp.pages_lookup_node_name=' + sessionPagePathsLookup.pagesLookupNodeName + '&';
			dat += 'v.fp.sre_id=' + sreId + '&';
			dat += 'v.fp.search_term=' + searchTerm;
			util.serverPost(url, dat);
		}
	},
	searchResponse: function(dat) {
		// util.showObject(dat);
		var sreId = dat.sreId;
		var totalRows = dat.totalRows;
		var pages = (totalRows > 0) ? dat.pages : [langVar('lang_stats.session_page_paths.no_pages_found_info')];
		var lookupObj = sessionPagePathsLookup[sreId];
		lookupObj.isSearchMode = true;
		lookupObj.searchResult.searchResultNodeName = dat.searchResultNodeName;
		lookupObj.searchResult.totalRows = totalRows;
		lookupObj.searchResult.startingRow = (totalRows > 0) ? dat.startingRow : 0;
		lookupObj.searchResult.endingRow = dat.endingRow;
		sessionPagePathsLookup.populateList(sreId, pages);
		sessionPagePathsLookup.setOperatingState(sreId);
		if (totalRows == 0) {
			// Disbale the list
			util.disableE(sreId + ':page_lookup:list');
		}
	},
	loadPagesFromSearchResult: function(sreId, startingRow, endingRow) {
		// alert('load pages from search result');
		var url = '?dp=statistics.session_page_paths.load_sess_paths_search_res';
		url += '&p=' + reportInfo.profileName;
		var dat = 'v.fp.page_token=' + reportInfo.pageToken + '&';
		dat += 'v.fp.sre_id=' + sreId + '&';
		dat += 'v.fp.search_result_node_name=' + sessionPagePathsLookup[sreId]['searchResult']['searchResultNodeName'] + '&';
		dat += 'v.fp.starting_row=' + startingRow + '&';
		dat += 'v.fp.ending_row=' + endingRow;
		util.serverPost(url, dat);
	},
	loadPagesFromSearchResultResponse: function(dat) {
		alert('loadPagesFromSearchResultResponse()');
		var sreId = dat.sreId;
		var lookupSearchObj = sessionPagePathsLookup[sreId]['searchResult'];
		lookupSearchObj.startingRow = dat.startingRow;
		lookupSearchObj.endingRow = dat.endingRow;
		sessionPagePathsLookup.populateList(sreId, dat.pages);
		sessionPagePathsLookup.setOperatingState(sreId);
	},
	clearSearch: function() {
		var dat = this.id.split(':');
		var sreId = dat[0];
		util.setF(sreId + ':page_lookup:search_field', '');
		sessionPagePathsLookup[sreId]['isSearchMode'] = false;
		sessionPagePathsLookup.setLoadingState(sreId);
		sessionPagePathsLookup.loadPages(sreId, 1, 500);
	}
}
//
// reportsMenu.js
// reportsMenu.js is used in dynamic and static reports!
//
var reportsMenu = {
	isVisible: true,
	isDynamicReport: false, // set upon init to distinguish between dynamic and static reports
	init: function(isDynamicReport) {
		reportsMenu.isDynamicReport = isDynamicReport;
		reportsMenu.createMenuHash();
		// Position the reports menu
//		var reportsRegion = YAHOO.util.Dom.getRegion('reports_menu_and_report_section');
//		var menuContainer = util.getE('reports_menu_section');
		var menuItemsContainer = util.getE('reports_menu_items');
		// alert('reportsRegion.top: '  + reportsRegion.top);
//		menuContainer.style.top = reportsRegion.top + 'px';
		var ul = document.createElement('ul');
		menuItemsContainer.appendChild(ul);
		// util.showObject(reportsMenuDb);
		reportsMenu.buildMenuItems(reportsMenuDb, '', reportInfo.reportName, reportInfo.isCalendar, false, ul);
		if (isDynamicReport) {
			reportsMenu.updateMenuItemLinks(
				reportsMenuDb,
				reportInfo.dateFilter,
				reportInfo.commandLineFilter,
				reportInfo.commandLineFilterComment,
				reportInfo.filterId,
				''
			);
		}
		else {
			reportsMenu.updateStaticMenuItemLinks(reportsMenuDb);
		}
		// Set initial expanded group state. Note, we keep the final expanded group state in reportsMenuDb
		// and not in reportInfo.expandedMenuGroups. reportInfo.expandedMenuGroups is only used for the initial
		// menu setup!
		var expandedMenuGroups = reportInfo.expandedMenuGroups;
		for (var i = 0; i < reportsMenuDb.length; i++) {
			if (reportsMenuDb[i].type == 'group') {
				var groupName = reportsMenuDb[i].name;
				if (expandedMenuGroups[groupName] != null) {
					reportsMenuDb[i].isExpanded = true;
					reportsMenu.expandCollapseGroup(reportsMenuDb[i]);
				}
				else {
					reportsMenuDb[i].isExpanded = false;
				}
			}
		}
		// Assign toggleMenu event
		// YAHOO.util.Event.addListener('reports_menu_switch', 'click', reportsMenu.toggleSidebar);
	},
	createMenuHash: function() {
		// Create a hash so that we can access the menu items and menu subitems by itemId
		for (var i = 0; i < reportsMenuDb.length; i++) {
			var item = reportsMenuDb[i];
			var itemId = item.id;
			reportsMenuDb[itemId] = item;
			if (item.type == 'group') {
				var subItems = item.items;
				for (var j = 0; j < subItems.length; j++) {
					var subItemId = subItems[j].id;
					reportsMenuDb[subItemId] = subItems[j];
				}
			}
		}
	},
	buildMenuItems: function(menuItems, menuGroupName, activeReportName, isCalendar, isItemInGroup, ul) {
		// If the active report is part of a menu group then add the menu group name
		// to reportInfo.expandedMenuGroups so that the group becomes expanded.
		// reportInfo.expandedMenuGroups may contains any expanded menu group names from
		// the previous reports display if this report has been called via a server
		// background call. By default we hide any report menu item of a group
		// util.showObject(menuItems);
		for (var i = 0; i < menuItems.length; i++) {
			var item = menuItems[i];
			var itemType = item.type;
			if (itemType == 'group') {
				// Create the group item
				reportsMenu.addMenuLiItem(ul, itemType, item.id, item.label, false, false);
				// Create the items in group
				reportsMenu.buildMenuItems(item.items, item.name, activeReportName, isCalendar, true, ul);
			}
			else {
				var isActiveMenuItem = false;
				if (itemType == 'report') {
					if (item.name == activeReportName) {
						isActiveMenuItem = true;
						if (isItemInGroup) {
							// add menu group name to reportInfo.expandedMenuGroups
							reportInfo.expandedMenuGroups[menuGroupName] = true;
						}
					}
				}
				else if (isCalendar) {
					// itemType is calendar and calendar is active
					isActiveMenuItem = true;
				}
				reportsMenu.addMenuLiItem(ul, itemType, item.id, item.label, isActiveMenuItem, isItemInGroup);
			}
		}
	},
	addMenuLiItem: function(ul, itemType, itemId, label, isActiveMenuItem, isItemInGroup) {
		// itemType: calendar | report | group
		var YE = YAHOO.util.Event;
		var li = document.createElement('li');
		li.id = 'reports_menu:li:' + itemId;
		var a = document.createElement('a');
		a.id = 'reports_menu:a:' + itemId;
		var img = document.createElement('img');
		img.width = 10;
		img.height = 12;
		img.alt = '';
		if (itemType == 'report') {
			img.src = imgDb.rmReport.src;
		}
		else if (itemType == 'group') {
			// li.style.fontWeight = 'bold';
			img.id = 'reports_menu:img:' + itemId;
			img.src = imgDb.rmExpand.src;
		}
		else {
			img.src = imgDb.rmCalendar.src;
		}
		// We create the span as IE hack so that hover works across the entire anchor aera.
		// It allows us to set the anchor element to 100% width, respectively we can set
		// the padding on the span element.
		var span = document.createElement('span');
		var txt = document.createTextNode(label);
		span.appendChild(img);
		span.appendChild(txt);
		a.appendChild(span);
		if (isItemInGroup) {
			li.style.display = 'none';
			span.style.paddingLeft = '22px';
		}
		if (isActiveMenuItem) {
			li.className = 'active';
		}
		if (itemType != 'group') {
			if (reportsMenu.isDynamicReport) {
				YE.addListener(a, 'click', newReport.getReportByMenuItem);
				YE.addListener(a, 'mousedown', zoomControl.zoomSilent);
			}
		}
		else {
			// li.style.fontWeight = 'bold';
			a.href = 'javascript:;';
			YE.addListener(a, 'click', reportsMenu.toggleGroup);
		}
		li.appendChild(a);
		ul.appendChild(li);
	},
	toggleGroup: function() {
		// alert('toggle_group: ' + this.id);
		var elementId = this.id;
		var dat = elementId.split(':');
		var itemId = dat[2];
		var groupItem = reportsMenuDb[itemId];
		groupItem.isExpanded = !groupItem.isExpanded;
		reportsMenu.expandCollapseGroup(groupItem);
		this.blur();
	},
	expandCollapseGroup: function(groupItem) {
		var isExpanded = groupItem.isExpanded;
		var groupItemId = groupItem.id;
		// IE hack, delayed group image setup because IE doesn't display the image without delay.
		setTimeout('reportsMenu.setExpandedCollapsedImage("' + groupItemId + '",' + isExpanded + ')', 20);
		// Expand or collapse report group
		var items = groupItem.items;
		// alert('isExpanded: ' + isExpanded);
		for (var i = 0; i < items.length; i++) {
			util.showE('reports_menu:li:' + items[i].id, isExpanded);
		}
	},
	setExpandedCollapsedImage: function(groupItemId, isExpanded) {
		// Set the right group item image
		var img = util.getE('reports_menu:img:' + groupItemId);
		img.src = isExpanded ? imgDb.rmCollapse.src : imgDb.rmExpand.src;
	},
	updateMenuItemLinks: function(menuItems, dateFilter, commandLineFilter, commandLineFilterComment, filterId, zoomInfoId) {
		// Updates all menu items upon init, upon zoom (date_filter change and/or add filter items)
		// alert('updateMenuItemLinks(): - zoomInfoId: ' + zoomInfoId);
		for (var i = 0; i < menuItems.length > 0; i++) {
			var item = menuItems[i];
			// util.showObject('');
			var itemType = item.type;
			if (itemType != 'group') {
				var itemId = item.id;
				var a = util.getE('reports_menu:a:' + itemId);
				var url = location.protocol + '//' + location.host + location.pathname + '?dp=reports';
				url += '&p=' + reportInfo.profileName;
				if (itemType == 'report') {
					url += '&rn=' + item.name;
				}
				else {
					// itemType is calendar
					url += '&calendar=true';
				}
				if (dateFilter != '') {
					url += '&df=' + encodeURIComponent(dateFilter);
				}
				if (commandLineFilter != '') {
					url += '&f=' + encodeURIComponent(commandLineFilter);
				}
				if (commandLineFilterComment != '') {
					url += '&fc=' + encodeURIComponent(commandLineFilterComment);
				}
				if (filterId != '') {
					url += '&fi=' + filterId;
				}
				if (zoomInfoId != '') {
					url += '&zii=' + zoomInfoId;
				}
				a.href = url;
			}
			else {
				reportsMenu.updateMenuItemLinks(
					item.items,
					dateFilter,
					commandLineFilter,
					commandLineFilterComment,
					filterId,
					zoomInfoId
				);
			} 
		}
	},
	updateStaticMenuItemLinks: function(menuItems) {
		for (var i = 0; i < menuItems.length > 0; i++) {
			var item = menuItems[i];
			// util.showObject('');
			var itemType = item.type;
			if (itemType != 'group') {
				var itemId = item.id;
				var a = util.getE('reports_menu:a:' + itemId);
				a.href = item.name + '.html';
			}
			else {
				reportsMenu.updateStaticMenuItemLinks(item.items);
			} 
		}
	}
//	toggleSidebar: function() {
//
//		// var reportsMenuSection = util.getE('reports_menu_items');
//		var reportSection = util.getE('report_section');
//		// var reportsMenuSwitch = util.getE('reports_menu_switch');
//		var reportsMenuSection = util.getE('reports_menu_section');
//		var body = util.getE('html:body');
//
//		var showSidebar = !reportsMenu.isVisible;
//
//		body.className = (showSidebar) ? 'reports' : ''; // Handles the sidebar background image
//		// reportsMenuSwitch.className = (showSidebar) ? 'reports-menu-switch' : 'reports-menu-switch-closed';
//		reportsMenuSection.className = (showSidebar) ? 'reports-menu' : 'reports-menu-closed';
//		util.showE('reports_menu_switch:close_btn', showSidebar);
//		util.showE('reports_menu_switch:open_btn', !showSidebar);
//		reportSection.style.marginLeft = (showSidebar) ? '180px' : '0px';
//
//		util.showE('reports_menu_switch:vertical_space', !showSidebar);
//
//		if (showSidebar) {
//
//			// delay due IE image rendering problem
//			setTimeout("reportsMenu.showSidebar()", 50);
//
//		}
//		else {
//			util.hideE('reports_menu_items');
//            util.hideE('reports_menu_section_bg');
//		}
//
//		reportsMenu.isVisible = showSidebar;
//	},
//	showSidebar: function() {
//
//        util.showE('reports_menu_section_bg');
//		util.showE('reports_menu_items');
//	}
}
//
//
// columnsInfo.js
// 
//
var columnsInfo = {
	// columnsInfo generates a columnsInfo display for all columns
	// for which a columnInfo exists, independent of the actual report element
	// from where the columnInfo panel has been opened.
	panel: null,
	baseId: '',
	// active state
	isOpen: false,
	columnNames: [],
	init: function() {
		columnsInfo.baseId = util.getUniqueElementId();
		var panelObj = {
			panelId:"columns_info:panel",
			panelClassName: 'panel-50',
			panelHeaderLabel: langVar('lang_stats.btn.columns_info'),
			left: 70,
			top: 80,
			zIndex: 40,
			isCover: false,
			closeEvent: columnsInfo.close
		};
		columnsInfo.panel = new util.Panel3(panelObj);
		//
		// Get the columnNames for which a columnInfo exists and create the menu
		//
		var columnNames = columnsInfo.columnNames;
		var queryFieldsDb = reportInfo.queryFieldsDb;
		var menuItemsContainer = util.getE('columns_info:menu');
		for (var i = 0; i < queryFieldsDb.length; i++) {
			var queryFieldItem = queryFieldsDb[i];
			if (queryFieldItem.columnInfo != '') {
				var name = queryFieldItem.name;
				var label = queryFieldItem.label;
				var index = columnNames.length;
				columnNames[index] = name;
				columnsInfo.createMenuItem(menuItemsContainer, index, label);
			}
		}
		// Select first columnn
		columnsInfo.showColumnInfo(columnNames[0]);
		var YE = YAHOO.util.Event;
		YE.addListener('columns_info:menu', 'click', columnsInfo.menuItemActor);
		YE.addListener('columns_info:close_btn', 'click', columnsInfo.close);
	},
	open: function() {
		// alert('shortReportElementId: ' + shortReportElementId);
		if (!columnsInfo.panel) {
			columnsInfo.init();
		}
		if (!columnsInfo.isOpen) {
			columnsInfo.panel.open();
		}
	},
	close: function() {
		columnsInfo.isOpen = false;
		columnsInfo.panel.close();
	},
	menuItemActor: function(evt) {
		// Clicked on menu item
		var element = evt.target || evt.srcElement;
		var elementId = element.id;
		// alert('menuItemActor: ' + elementId);
		if (elementId.indexOf(columnsInfo.baseId + ':') != -1) {
			var dat = elementId.split(':');
			var index = parseInt(dat[1], 10);
			var columnName = columnsInfo.columnNames[index];
			columnsInfo.showColumnInfo(columnName);
		}
	},
	showColumnInfo: function(columnName) {
		// alert('showColumnInfo: ' + columnName);
		var queryFieldItem = reportInfo.queryFieldsDb[util.h(columnName)];
		var label = queryFieldItem.label;
		var columnInfo = queryFieldItem.columnInfo;
		var container = util.getE('columns_info:text');
		container.innerHTML = '<strong>' + label + '</strong><br />' + columnInfo;
	},
	createMenuItem: function(container, index, label) {
		var elementId = columnsInfo.baseId + ':' + index;
		var a = util.createE('a', {id:elementId, href:'javascript:;'});
		var text = util.createT(label);
		util.chainE(container, a, text);
	}
}
//
// report.js
//
// reserved variables which are declared in html page!
// var reportInfo = {};
// var lang = {};
var report = {
	// toggleReportsMenuBtn: null,
	datePickerBtn: null,
	globalFilterBtn: null,
	macrosBtn: null,
	// emailReportBtn: null,
	printerFriendlyBtn: null,
	// databaseInfoBtn: null,
	toolsBtn: null,
	isTableOrLogDetailReportElement: true,
	busyPanel: null,
	init: function() {
		// util.showObject(reportInfo);
//		console.log('report.init()');
		var YE = YAHOO.util.Event;
		// Init admin drop down menu
//		util.initAdminDropDownMenu();
//		util.initBreadCrumbNav();
		reportsConfigNavbar.init(true);
		var reportElements = reportInfo.reportElements;
		var maxReportElements = reportElements.length;
		// create a hash to access the report elements by sid (short_report_element_id)
		util.createHash(reportElements, 'sid');
		// create reportFields hash
		util.createHash(reportInfo.queryFieldsDb, 'name');
//		util.showObject(reportElements);
		// Check and set report elements height
		report.initReportElementsHeight(reportElements, maxReportElements);
		//
		// init report elements
		//
		for (var i = 0; i < maxReportElements; i++) {
			var o = reportElements[i];
			// util.showObject(o);
			var reportElementId = o.id;
			var shortReportElementId = o.sid;
			var reportElementType = o.reportElementType;
			var isLogDetail = reportElementType == 'log_detail';
			//
			// Init reportLink
			//
			var reportLink = o.reportLink;
			if (reportLink != '') {
				YE.addListener(shortReportElementId + ':report_link', 'click', newReport.getReportByReportLink);
				YE.addListener(shortReportElementId + ':report_link', 'mousedown', zoomControl.zoomSilent);
			}
			//
			// Init Customize
			//
			var customizeBtn = util.getE(shortReportElementId + ':customize:table');
			if (customizeBtn != null) {
				YE.addListener(customizeBtn, 'click', customizeRE.open);
			}
			//
			// Init Export
			//
			var exportBtn = util.getE(shortReportElementId + ':export:btn');
			if (exportBtn != null) {
				exportBtn.disabled = false;
				exportBtn.className = 'btn-60';
				YE.addListener(exportBtn, 'click', exportTable.open);
			}
			//
			//
			// Init row number control and rows selection
			//
			//
			// isUnknownTotalRows and numberOfRowsInTable are relevant for log_detail only
			var isUnknownTotalRows = false;
			var numberOfRowsInTable = 0;
			if (reportElementType == 'table' || isLogDetail) {
				report.isTableOrLogDetailReportElement = true;
				if (isLogDetail && o.hasOwnProperty('isUnknownTotalRows')) {
					isUnknownTotalRows = o.isUnknownTotalRows;
					numberOfRowsInTable = o.numberOfRowsInTable;
				}
				// Ignore totalRows value if isUnknownTotalRows is true. In this case we allow to set any row number
				// because the total rows number is not accurate.
				report.rowNumbers.init(
					shortReportElementId,
					reportElementType,
					o.startingRow,
					o.endingRow,
					o.numberOfRows,
					o.totalRows,
					isUnknownTotalRows,
					numberOfRowsInTable);
				if (o.totalRows > 0 || numberOfRowsInTable > 0) {
					//
					// init row selection
					//
					// Assign a single tbody event for row selection, zoom selection and breakdown
					var tBodyId = shortReportElementId + ':tbody';
					YE.addListener(tBodyId, 'click', report.rowSelection.rowActivated);
					//
					// init any breakdown links
					//
					/*
					KHP 05/Aug/2008
					DISABLED because we also handle breakdown via rowSelection.rowActivated()
					var tableElement = util.getE(shortReportElementId + ':table');
					var aElements = tableElement.getElementsByTagName('a');
					for (var j = 0; j < aElements.length; j++) {
						var breakDownAnchor = aElements[j];
						// We don't wont to add any listener to page links,
						// so we only add the listener where href="javascript:;"
						if (breakDownAnchor.href == 'javascript:;') {
							YE.addListener(breakDownAnchor, 'click', newReport.setBreakdown);
						}
					}
					*/
				}
			}
			else if (reportElementType == 'session_paths') {
				// Build the session_paths tree
				sessionPaths.init(shortReportElementId);
				YE.addListener(shortReportElementId + ':session_paths_tree', 'click', sessionPaths.itemActivated);
				YE.addListener(shortReportElementId + ':session_paths_tree:reset', 'click', sessionPaths.reset);
				// 2008-11-29 - GMF - Add mouseover highlighting to the Reset/Collapse All link.
				YE.addListener(shortReportElementId + ':session_paths_tree:reset', 'mouseover', sessionPaths.highlightTextOn);
                YE.addListener(shortReportElementId + ':session_paths_tree:reset', 'mouseout', sessionPaths.highlightTextOff);
			}
			else if (reportElementType == 'session_page_paths') {
//				if (o.totalRows > 10) {}
				report.rowNumbers.init(
					shortReportElementId,
					reportElementType,
					1,
					o.endingRow,
					o.endingRow,
					o.totalRows,
					isUnknownTotalRows,
					numberOfRowsInTable);
				YE.addListener(shortReportElementId + ':page_path_field', 'keypress', newReport.setPagePathViaKey);
				YE.addListener(shortReportElementId + ':show_path_btn', 'click', newReport.setPagePathViaButton);
				YE.addListener(shortReportElementId + ':lookup_pages_btn', 'click', sessionPagePathsLookup.openLookup);
				YE.addListener(shortReportElementId + ':tbody', 'click', newReport.setPagePathViaLink);
			}
			//
			// set reportInfo.isReportElementFilters
			//
			if (o.isReportElementFilter) {
				reportInfo.isReportElementFilters = true;
			}
		}
		//
		// init report element columns
		//
		report.columns.init();
		//
		// init Calendar
		//
		if (reportInfo.isCalendar) {
			calendarControl.init();
		}
		// Set newReport properties
		newReport.init();
		//
		// Misc. events
		//
		// The document contains the report.
		// Handle menu state and update zoom events, etc.
		YE.addListener('add_build_in_report_filters_btn', 'click', zoomControl.toggleAddBuildInReportFilters);
		// Create reports menu
		reportsMenu.init(true/* isDynamicReport */);
		//
		// init clear filter buttons
		//
		var isDateFilter = (reportInfo.dateFilter != '') ? true : false;
		var isGlobalFilter = (reportInfo.filterId != '') ? true : false;
		if (isDateFilter) {
			YE.addListener('report:clear_date_btn', 'click', newReport.clearDateFilter);
		}
		if (isGlobalFilter) {
			YE.addListener('report:clear_filters_btn', 'click', newReport.clearGlobalFilter);
		}
		if (isDateFilter && isGlobalFilter) {
			YE.addListener('report:clear_date_and_filters_btn', 'click', newReport.clearAllFilters);
		}
		// Init toolbar
		report.initToolbar();
		// init simple progress
		report.busyPanel = new util.BusyPanel();
	},
	initReportElementsHeight: function(reportElements, maxReportElements) {
		// This corrects the report element height if the report contains floated report elements,
		// i.e. in a dashboard
		var requiresHeightAdjustment = false,
			reportElementItem,
			shortReportElementId,
			reportElementContainer,
			i;
		// Check if we need to set any height at all.
		// We must set the height for all report elements, though report elements
		// like overview compact or tables shouldn't expand the box with the border,
		// so they will have an invisible box around it.
		for (i = 0; i < maxReportElements; i++) {
			reportElementItem = reportElements[i];
			// util.showObject(reportElementItem);
			// Get report element and save it in
			// reportElements for later use
			shortReportElementId = reportElementItem.sid;
			reportElementContainer = util.getE(shortReportElementId + ':re_container');
			reportElementItem['reContainerRef'] = reportElementContainer;
			if (reportElementItem.displaySideBySide) {
				requiresHeightAdjustment = true;
			}
		}
		if (requiresHeightAdjustment) {
			YAHOO.util.Event.addListener(window, 'resize', report.adjustReportElementsHeightOnResize);
			report.adjustReportElementsHeight();
		}
	},
	adjustReportElementsHeightOnResize: function() {
		setTimeout('report.resetAndAdjustReportElementHeightOnResize()', 400);
	},
	resetAndAdjustReportElementHeightOnResize: function() {
		// Before we re-adjust the height of the report elements we need
		// to display them without any specific height settings because
		// the height could have changed due display properties and constraints.
		var reportElements = reportInfo.reportElements,
			maxReportElements = reportElements.length,
			theReportElement,
			i;
		for (i = 0; i < maxReportElements; i++) {
			// Reset height
			theReportElement = reportElements[i].reContainerRef;
			theReportElement.style.height = '';
		}
		// Re-adjust the height where necessary
		report.adjustReportElementsHeight();
	},
	adjustReportElementsHeight: function() {
		var YD = YAHOO.util.Dom;
		var reportElements = reportInfo.reportElements,
			maxReportElements = reportElements.length,
			requiresHeightAdjustment = false,
			reportElementItem,
			i,
			j,
			shortReportElementId,
			theReportElement,
			reportElementRegion,
			activeRow = {
				top:-1,
				maxHeight: -1,
				rowElements: []
			},
			numActiveRowItems;
		// Adjust the height per row
		for (i = 0; i < maxReportElements; i++) {
			reportElementItem = reportElements[i];
			// shortReportElementId = reportElementItem.sid;
			// theReportElement = util.getE(shortReportElementId + ':re_container');
			// Get container element reference
			theReportElement = reportElementItem.reContainerRef;
			reportElementRegion = YD.getRegion(theReportElement);
			if (reportElementRegion.top == activeRow.top) {
				// This must be a report element in the same row
				// Set maxHeight
				if (reportElementRegion.height > activeRow.maxHeight) {
					activeRow.maxHeight = reportElementRegion.height;
				}
				// Add theReportElement to activeRow
				activeRow.rowElements.push(theReportElement);
			}
			else {
				// This must be the first report element of a new row
				// Resize elements of current row
				numActiveRowItems = activeRow.rowElements.length;
				if (numActiveRowItems > 1) {
					for (j = 0; j < numActiveRowItems; j++) {
						activeRow.rowElements[j].style.height = activeRow.maxHeight + 'px';
					}
				}
				// Set/Reset activeRow
				activeRow.top = reportElementRegion.top;
				activeRow.maxHeight = reportElementRegion.height;
				activeRow.rowElements = [];
				activeRow.rowElements.push(theReportElement);
			}
		}
	},
	initToolbar: function() {
		var YE = YAHOO.util.Event;
		// report.toggleReportsMenuBtn = new util.ToolbarButton('toggle_reports_menu', display.toggleSidebar, toolbarButtonsDb);
		report.datePickerBtn = new util.ToolbarButton('date_picker', datePicker.open, toolbarButtonsDb);
		report.globalFilterBtn = new util.ToolbarButton('global_filter', globalFilter.open, toolbarButtonsDb);
		report.macrosBtn = new util.ToolbarButton('macros', toggleReportsDropDownMenu, toolbarButtonsDb);
		report.toolsBtn = new util.ToolbarButton('miscellaneous_report_tools', toggleReportsDropDownMenu, toolbarButtonsDb);
		// report.emailReportBtn = new util.ToolbarButton('email_report', emailReport.open, toolbarButtonsDb);
		report.printerFriendlyBtn = new util.ToolbarButton('printer_friendly', report.printerFriendlyReport, toolbarButtonsDb);
		// report.databaseInfoBtn = new util.ToolbarButton('database_info', databaseInfo.open, toolbarButtonsDb);
		// report.toggleReportsMenuBtn.enable();
		// Set toolbar permissions
		var permissions = reportInfo.permissions;
		var isCalendar = reportInfo.isCalendar;
		var isDatePickerBtn = !isCalendar && permissions.datePicker && !reportInfo.noDateRange;
		var isGlobalFilterBtn = !isCalendar && permissions.globalFilter;
		var isMacrosBtn = !isCalendar && permissions.macros;
		var isPrinterFriendlyBtn = !isCalendar;
		var isEmailReportBtn = !isCalendar && permissions.sendReportByEmail;
		var isSaveReportChangesBtn = !isCalendar && permissions.saveReportChanges;
		var isSaveAsNewReportBtn = !isCalendar && permissions.saveAsNewReport;
		var isUpdateDatabaseBtn = !isCalendar && permissions.updateDatabase;
		var isBuildDatabaseBtn = !isCalendar && permissions.buildDatabase;
		var isActiveFiltersInfoBtn = !isCalendar && permissions.activeFiltersInfo;
		if (isDatePickerBtn) {report.datePickerBtn.enable();} else {report.datePickerBtn.disableAndIgnore();}
		if (isGlobalFilterBtn) {report.globalFilterBtn.enable();} else {report.globalFilterBtn.disableAndIgnore();}
		// if (isEmailReportBtn) {report.emailReportBtn.enable();} else {report.emailReportBtn.disableAndIgnore();}
		if (isPrinterFriendlyBtn) {report.printerFriendlyBtn.enable();} else {report.printerFriendlyBtn.disableAndIgnore();}
		// if (isDatabaseInfoBtn) {report.databaseInfoBtn.enable();} else {report.databaseInfoBtn.disableAndIgnore();}
		// We show the Miscellaneous drop down menu if one the miscellaneous tools is active
		var isMiscellaneousBtn = !isCalendar &&
			(isEmailReportBtn ||
			isSaveReportChangesBtn ||
			isSaveAsNewReportBtn ||
			isUpdateDatabaseBtn ||
			isBuildDatabaseBtn ||
			isActiveFiltersInfoBtn);
		if (isMacrosBtn) {
			report.macrosBtn.enable();
			// Add drop down functionality
			util.dropDownMenu.add('toolbar:macros', 'reports_toolbar:drop_down:macros');
			// Add events to macro menu
			YE.addListener('reports_toolbar:drop_down:create_new_macro_btn', 'click', macroItem.open);
			YE.addListener('reports_toolbar:drop_down:manage_macros_btn', 'click', manageMacros.open);
			// Update macros list
			report.macros.updateList();
		}
		else {
			report.macrosBtn.disableAndIgnore();
		}
		if (isMiscellaneousBtn) {
			report.toolsBtn.enable();
			// Add drop down functionality
			util.dropDownMenu.add('toolbar:miscellaneous_report_tools', 'reports_toolbar:drop_down:tools');
			if (isEmailReportBtn) {
				YE.addListener('reports_toolbar:drop_down:email_report_btn', 'click', emailReport.open);
			}
			if (isSaveReportChangesBtn) {
				// Enable button if session specific data exist (we don't really know that, so we always enable the button).
				// Though we disable Save Report Changes if the report does not contain any standard report element
				if (report.isTableOrLogDetailReportElement) {
					YE.addListener('reports_toolbar:drop_down:save_report_changes_btn', 'click', saveReportControl.saveChangesActor);
				}
				else {
					// Disable the SaveReportChangesBtn
					var saveReportChangesAElement = util.getE('reports_toolbar:drop_down:save_report_changes_btn');
					saveReportChangesAElement.className = 'disabled';
				}
			}
			if (isSaveAsNewReportBtn) {
				YE.addListener('reports_toolbar:drop_down:save_as_new_report_btn', 'click', saveAsNewReport.open);
			}
			if (isUpdateDatabaseBtn) {
				YE.addListener('reports_toolbar:drop_down:update_database_btn', 'click', databaseUtil.updateDatabase);
			}
			if (isBuildDatabaseBtn) {
				YE.addListener('reports_toolbar:drop_down:build_database_btn', 'click', databaseUtil.buildDatabase);
			}
			if (isActiveFiltersInfoBtn) {
				YE.addListener('reports_toolbar:drop_down:active_filters_info_btn', 'click', activeFiltersInfo.open);
			}
		}
		else {
			report.toolsBtn.disableAndIgnore();
		}
		// Hide reports toolbar in Calendar
		if (isCalendar) {
			util.hideEV('reports_toolbar');
		}
		// Init help button
		util.helpWindow.init('?dp+docs.user_guide.index');
	},
	macros: {
		updateList: function() {
			// Updates the macros drop down menu upon init
			// or when new Macros are created
			var i;
			var macrosDb = reportInfo.macros;
			var ul = util.getE('reports_toolbar:drop_down:macros');
			// Clean up existing list items, except the first 2 items
			var liItems = ul.getElementsByTagName('li');
			var numberOfItemsToDelete = liItems.length - 2;
			for (i = 0; i < numberOfItemsToDelete; i++) {
				var liItemToDelete = ul.lastChild;
				ul.removeChild(liItemToDelete);
			}
			for (i = 0; i < macrosDb.length; i++) {
				var item = macrosDb[i];
				var li = util.createE('li');
				var anchorId = 'report_macros_anchor:' + i;
				var href = report.macros.getMacroHref(item);
				var a = util.createE('a', {id:anchorId, href:href});
				YAHOO.util.Event.addListener(a, 'click', newReport.setMacro);
				var text = util.createT(item.label);
				util.chainE(ul, li, a, text);
			}
		},
		getMacroHref: function(item) {
			var profileName = reportInfo.profileName;
			var reportName = item.rn ? item.rn : reportInfo.reportName;
			// util.showObject(item);
			// alert('item.df: ' + item['df']);
			var dateFilter = (item['df'] != null) ? item.df : reportInfo.dateFilter;
			// alert('dateFilter: ' + dateFilter);
			var filterId = '';
			var commandLineFilter = '';
			var commandLineFilterComment = '';
			if (item['fi'] != null) {
				filterId = item.fi;
				commandLineFilter = item.f;
				commandLineFilterComment = item.fc;
			}
			else {
				filterId = reportInfo.filterId;
				commandLineFilter = reportInfo.commandLineFilter;
				commandLineFilterComment = reportInfo.commandLineFilterComment;
			}
			var href = '?dp=reports&p=' + profileName;
			href += '&rn=' + reportName;
			if (dateFilter != '') {
				href += '&df=' + dateFilter;
			}
			if (filterId != '') {
				href += '&fi=' + filterId;
			}
			if (commandLineFilter != '') {
				href += '&f=' + commandLineFilter;
				if (commandLineFilterComment != '') {
					href += '&fc=' + commandLineFilterComment;
				}
			}
			return href;
		}
	},
	printerFriendlyReport: function() {
		var url = '?dp=printer_friendly_report';
		url += '&p=' + reportInfo.profileName;
		url += '&rn=' + reportInfo.reportName;
		url += '&rji=' + reportInfo.reportJobId;
		var YD = YAHOO.util.Dom;
		var width = YD.getViewportWidth() - 40;
		var height = YD.getViewportHeight() - 40;
		var features = 'width=' + width + ',height=' + height + ',menubar=yes,toolbar=yes,status=yes,scrollbars=yes,resizable=yes';
		var theWindow = window.open(url, 'printer_friendly_report', features);
		theWindow.focus();
	},
	columns: {
		init: function() {
			var YE = YAHOO.util.Event;
			var reportElements = reportInfo.reportElements;
			var reColumns = reportInfo.reportElementColumns;
			for (var shortReportElementId in reColumns) {
				var reportElement = reportElements[util.h(shortReportElementId)];
				var totalRows = reportElement.totalRows;
				var reportElementType = reportElement.reportElementType;
				// var isLogDetail = (reportElementType != 'log_detail') ? false : true;
				// Add sort event if report element has more than 0 rows
				// var addSortEvent = (!isLogDetail && totalRows > 0);
				var addSortEvent = (totalRows > 0);
				var isColumnInfo = false;
				var theColumns = reColumns[shortReportElementId];
				var queryFieldsDb = reportInfo.queryFieldsDb;
				for (var columnId in theColumns) {
					// alert('columnId: ' + columnId);
					var reportFieldName = theColumns[columnId];
					var queryField = queryFieldsDb[util.h(reportFieldName)];
					// alert('reportFieldName: ' + reportFieldName);
					if (queryField.columnInfo != '') {
						// alert('columnInfo of field ' + reportFieldName + ': ' + queryField.columnInfo);
						isColumnInfo = true;
					}
					if (addSortEvent) {
						var elementId = shortReportElementId + ':' + columnId;
						YE.addListener(elementId, 'click', report.columns.columnActor);
					}
				}
//				if (isColumnInfo) {
					// The row contains at least one column with a columnInfo.
					// Show columnInfo icon and add columnInfo event
//					util.hideE(shortReportElementId + ':index_col:space');
//					util.showE(shortReportElementId + ':index_col:show_column_info_img');
//					var indexThElementId = shortReportElementId + ':index_col:show_column_info_btn';
//					YE.addListener(indexThElementId, 'click', report.columns.columnActor);
//				}
			}
		},
		columnActor: function() {
			// A column has been clicked
			// alert('Clicked column ' + this.id);
			var id = this.id;
			var dat = id.split(':');
			var shortReportElementId = dat[0];
			var columnId = dat[1];
			if (columnId != 'index_col') {
				newReport.sortColumn(shortReportElementId, columnId);
			}
			else {
				columnsInfo.open();
			}
		}
	},
	rowNumbers: {
		validator: null,
		sequence: [10,20,50,100,200,500],
		setRows: function(evt) {
			var id = this.id;
			var dat = id.split(':');
			var shortReportElementId = dat[0];
			var endingRow = parseInt(dat[2]);
			if (endingRow != -1) {
				var startingRow = 1;
				var numberOfRows = endingRow;
				newReport.setRowNumber(shortReportElementId, startingRow, endingRow, numberOfRows);
			}
			else {
				// Show custom row range panel
				report.rowNumbers.showCustomPanel(shortReportElementId);
			}
		},
		setRowRange: function() {
			var id = this.id;
			var dat = id.split(':');
			var shortReportElementId = dat[0];
			var isNext = (dat[1].indexOf('next_rows') != -1);
			var o = reportInfo.reportElements[util.h(shortReportElementId)];
			var startingRow = o.startingRow;
			var endingRow = o.endingRow;
			var numberOfRows = o.numberOfRows;
			var totalRows = o.totalRows;
			// isUnknownTotalRows and numberOfRowsInTable are relevant for log_detail only
			var isUnknownTotalRows = false;
			var numberOfRowsInTable = 0;
			if (o.reportElementType == 'log_detail' && o.hasOwnProperty('isUnknownTotalRows')) {
				isUnknownTotalRows = o.isUnknownTotalRows;
				numberOfRowsInTable = o.numberOfRowsInTable;
			}
			var newStartingRow = -1;
			var newEndingRow = -1;
			if (isNext &&
				((!isUnknownTotalRows && endingRow < totalRows) ||
				(isUnknownTotalRows && numberOfRowsInTable > 0))) {
				// Go to next rows
				newStartingRow = endingRow + 1;
				newEndingRow = endingRow + numberOfRows;
				if (!isUnknownTotalRows && newEndingRow > totalRows) {
					// Reset to totalRows
					newEndingRow = totalRows;
				}
			}
			else if (startingRow != 1) {
				// Go to previous rows
				newStartingRow = (startingRow - numberOfRows >= 1) ? startingRow - numberOfRows : 1;
				newEndingRow = startingRow - 1;
			}
//			util.showObject({
//				startingRow: startingRow,
//				endingRow: endingRow,
//				numberOfRows: numberOfRows,
//				totalRows: totalRows,
//				newStartingRow: newStartingRow,
//				newEndingRow: newEndingRow
//			});
//
			// Simply ignore clicks if we didn't set a new starting row and ending row
			if (newStartingRow != -1) {
				newReport.setRowNumber(shortReportElementId, newStartingRow, newEndingRow, numberOfRows);
			}
		},
		setCustomRowRange: function() {
			var validator = report.rowNumbers.validator;
			validator.reset();
			var calleeId = this.id;
			var dat = calleeId.split(':');
			var shortReportElementId = dat[0];
			var o = reportInfo.reportElements[util.h(shortReportElementId)];
			var reportElementType = o.reportElementType;
			var totalRows = o.totalRows;
			var isUnknownTotalRows = false;
			if (reportElementType == 'log_detail' && o.hasOwnProperty('isUnknownTotalRows')) {
				isUnknownTotalRows = o.isUnknownTotalRows;
			}
			var startingRow = validator.isInteger(shortReportElementId + ':custom_row_range:starting_row', 1);
			var endingRow = validator.isInteger(shortReportElementId + ':custom_row_range:ending_row', 1);
			// Check if values are in range
			if (util.isInteger(startingRow, 1) && util.isInteger(endingRow, 1)) {
				startingRow = parseInt(startingRow, 10);
				endingRow = parseInt(endingRow, 10);
				if (startingRow > endingRow) {
					validator.isCustom(shortReportElementId + ':custom_row_range:starting_row',
							langVar('lang_stats.row_numbers.invalid_row_numbers_message'));
				}
				// Allow endingRow to exceed totalRows if total rows is an estimate.
				else if (!isUnknownTotalRows && endingRow > totalRows) {
					validator.isCustom(shortReportElementId + ':custom_row_range:ending_row',
							langVar('lang_stats.row_numbers.invalid_row_numbers_message'));
				}
				if (startingRow > 0 && startingRow <= endingRow && (endingRow <= totalRows || isUnknownTotalRows)) {
					isValidRange = true;
				}
			}
			if (validator.allValid()) {
				var numberOfRows = endingRow - startingRow + 1;
				newReport.setRowNumber(shortReportElementId, startingRow, endingRow, numberOfRows);
			}
//			var startingRow = util.getF(shortReportElementId + ':custom_row_range:starting_row');
//			var endingRow = util.getF(shortReportElementId + ':custom_row_range:ending_row');
//			var isValidRange = false;
//
//			if (util.isInteger(startingRow) && util.isInteger(endingRow)) {
//
//				startingRow = parseInt(startingRow, 10);
//				endingRow = parseInt(endingRow, 10);
//
//				// Allow endingRow to exceed totalRows if total rows is an estimate.
//				if (startingRow > 0 && startingRow <= endingRow && (endingRow <= totalRows || isUnknownTotalRows)) {
//					isValidRange = true;
//				}
//			}
//			if (isValidRange) {
//
//				var numberOfRows = endingRow - startingRow + 1;
//				newReport.setRowNumber(shortReportElementId, startingRow, endingRow, numberOfRows);
//			}
//			else {
//				alert(langVar('lang_stats.row_numbers.invalid_row_numbers_message'));
//			}
		},
		showCustomPanel: function(shortReportElementId) {
			report.rowNumbers.validator = new util.Validator();
			var YD = YAHOO.util.Dom;
			var element = util.getE(shortReportElementId + ':custom_row_range:panel');
			var rowsBtnRegion = YD.getRegion(shortReportElementId + ':rows:btn');
			var viewportWidth = YD.getViewportWidth();
//			util.showObject(rowsBtnRegion);
			element.style.top = rowsBtnRegion.bottom + 'px';
			element.style.right = (viewportWidth - rowsBtnRegion.right) + 'px';
			element.style.display = 'block';
			util.focusE(shortReportElementId + ':custom_row_range:starting_row');
		},
		closeCustomPanel: function(evt) {
			var id = this.id;
			var dat = id.split(':');
			var shortReportElementId = dat[0];
			util.hideE(shortReportElementId + ':custom_row_range:panel');
		},
//		setButtonSate: function(
//			shortReportElementId,
//			startingRow,
//			endingRow,
//			totalRows,
//			isUnknownTotalRows,
//			numberOfRowsInTable) {
//
//			var prevBtn = util.getE(shortReportElementId + ':prev_rows:btn');
//			var nextBtn = util.getE(shortReportElementId + ':next_rows:btn');
//
//			// prevBtn.disabled = startingRow
//
//
//
//		},
		init: function(shortReportElementId,
			reportElementType,
			startingRow,
			endingRow,
			numberOfRows,
			totalRows,
			isUnknownTotalRows,
			numberOfRowsInTable) {
			var YE = YAHOO.util.Event;
			// Row number controls are disabled by default
			//
			// Enable previous next rows buttons
			//
			if (reportElementType !== 'session_page_paths' &&
				(totalRows > 0 || isUnknownTotalRows)) {
				if (startingRow > 1) {
					var preRowsBtn = util.getE(shortReportElementId + ':prev_rows:btn');
					preRowsBtn.disabled = false;
					preRowsBtn.className = 'btn-60';
					YE.addListener(preRowsBtn, 'click', report.rowNumbers.setRowRange);
				}
				if (endingRow < totalRows || isUnknownTotalRows) {
					var nextRowsBtn = util.getE(shortReportElementId + ':next_rows:btn');
					nextRowsBtn.disabled = false;
					nextRowsBtn.className = 'btn-60';
					YE.addListener(nextRowsBtn, 'click', report.rowNumbers.setRowRange);
				}
			}
			//
			// Handle drop down
			//
			if (totalRows > 1 || isUnknownTotalRows) {
				var rowsBtn = util.getE(shortReportElementId + ':rows:btn');
				rowsBtn.disabled = false;
				rowsBtn.className = 'btn-60';
				var sequence = report.rowNumbers.sequence;
				var theRows = [];
				var rowNumberInSequence;
				for (var i = 0, sequenceLen = sequence.length; i < sequenceLen; i++) {
					rowNumberInSequence = sequence[i];
					if (rowNumberInSequence <  totalRows) {
						theRows[i] = {value:rowNumberInSequence, label:rowNumberInSequence};
					}
					else {
						// Add 'All Rows' number if appropriate
						var maxRowNumber = sequence[sequenceLen - 1];
						if (totalRows <= maxRowNumber) {
							theRows[i] = {value:totalRows, label:totalRows};
						}
						break;
					}
				}
				// Add Custom entry
				theRows[theRows.length] = {value:-1, label:langVar('lang_stats.btn.custom')};
				// Create rows drop down
				var rowsDropDownContainer = util.getE(shortReportElementId + ':rows:menu');
				var rowsDropDownElement = report.rowNumbers.getRowsDropDownElement(shortReportElementId, theRows);
				util.chainE(rowsDropDownContainer, rowsDropDownElement);
				YE.addListener(shortReportElementId + ':custom_row_range:apply_btn', 'click', report.rowNumbers.setCustomRowRange);
				YE.addListener([shortReportElementId + ':custom_row_range:close_btn', shortReportElementId + ':next_rows:btn'], 'click', report.rowNumbers.closeCustomPanel);
				// Init drop down navigation
				var navInfo = {
					containerId: (shortReportElementId + '_table_nav'),
					btnClassName: 'btn-60',
					btnActiveClassName: 'btn-60',
					menuBaseIds: [
					(shortReportElementId + ':export'),
					(shortReportElementId + ':prev_rows'),
					(shortReportElementId + ':next_rows'),
					(shortReportElementId + ':rows')]
				};
				new util.NavGroup(navInfo);
			}
		},
		getRowsDropDownElement: function(shortReportElementId, theRows) {
			// var menuId = shortReportElementId + ':rows_menu';
			var ul = util.createE('ul', {className:'drop-down-10 drop-down-10-inline'});
			var rowsItem;
			var li;
			var a;
			var aText;
			for (var i = 0, theRowsLen = theRows.length; i < theRowsLen; i++) {
				rowsItem = theRows[i];
				li = util.createE('li', {id:shortReportElementId + ':rows_list:' + rowsItem.value});
				a = util.createE('a', {href:'javascript:;'});
				aText = util.createT(rowsItem.label);
				util.chainE(ul, [li, [a, aText]]);
				YAHOO.util.Event.addListener(li, 'click', report.rowNumbers.setRows);
			}
			return ul;
		}
	},
	rowSelection: {
		// Note, row selction handles row selection, zoom item selection and breakdown links and page links.
		// A click on a page link (anchor, img or span element) should be simply ignored.
		rowsDb: {}, // keeps the row-Ids and row state of activated rows, i.e.:
		/*
		selectedRows: {
			're0:row:1': {
				oriClassName: '', className of row if not selected and not zoomed
				isSelect: true,
				isZoom: false
			},
			're1:row:17': {
				oriClassName: ''
				isSelect: false,
				isZoom: true
			}
		}	
		*/
		rowActivated: function(evt) {
			var element = evt.target || evt.srcElement;
			// var elementId = element.id;
			var tdClassName = '';
			var anchorElement = null;
			var isAnchorElementClick = false;
			var tagName = element.nodeName;
			// alert('rowActivated()' + '\nelementId: ' + element.id + '\ntagName: ' + tagName);
			while (tagName != 'TR') {
				// Check if this is a click on an anchor element or td element
				if (tagName == 'A') {
					anchorElement = element;
					isAnchorElementClick = true;
				}
				else if (tagName == 'TD') {
					tdClassName = element.className;
				}
				element = element.parentNode;
				tagName = element.nodeName;
				// alert('tagName: ' + tagName);
			}
			var rowId = element.id;
			if (isAnchorElementClick) {
				//
				//
				// Handle breakdown or page link (page link is simply ignored
				//
				//
				if (anchorElement.href == 'javascript:;') {
					// This must be a breakdown link, so we breakdown to the item
					// alert(' breakdown link');
					newReport.setBreakdown(rowId);
				}
			}
			else if (rowId != '') {
				//
				//
				// Handle row or zoom icon selection
				//
				//
				// alert('rowId: ' + rowId + '\ntdClassName: ' + tdClassName + '\ntr backgroundColor: ' + element.style.backgroundColor);
				var isZoomItem = (tdClassName.indexOf('zoom') != -1);
				var rowsDb = report.rowSelection.rowsDb;
				var isSelect;
				var isZoom;
				if (rowsDb[rowId]) {
					var currentItem = rowsDb[rowId];
					if (isZoomItem) {
						isZoom = !currentItem.isZoom;
						report.rowSelection.updateTrAndRowItemZoom(element, currentItem, isZoom);
						zoomControl.addRemoveZoomItem(rowId, isZoom);
					}
					else {
						isSelect = !currentItem.isSelect;
						report.rowSelection.updateTrAndRowItemSelect(element, currentItem, isSelect);
					}
				}
				else {
					// Row item is not yet in database, add it now
					// isSelect = !isZoomItem;
					// isZoom = isZoomItem;
					var oriClassName = element.className;
					rowsDb[rowId] = {oriClassName:oriClassName, isSelect:false, isZoom:false};
					if (isZoomItem) {
						report.rowSelection.updateTrAndRowItemZoom(element, rowsDb[rowId], true);
						zoomControl.addRemoveZoomItem(rowId, true);
					}
					else {
						report.rowSelection.updateTrAndRowItemSelect(element, rowsDb[rowId], true);
					}
				}
			}
		},
		resetZoomItems: function() {
			// Resets and deselects all zoomed items. It is invoked from zoom control
			var rowsDb = report.rowSelection.rowsDb;
			for (var prop in rowsDb) {
				var rowItem = rowsDb[prop];
				if (rowItem.isZoom) {
					var trElement = util.getE(prop); // prop is equal the tr element id
					report.rowSelection.updateTrAndRowItemZoom(trElement, rowItem, false);
				}
			}
		},
		updateTrAndRowItemZoom: function(trElement, rowItem, isZoom) {
			// Sets the tr element and rowItem object to the given arguments
			rowItem.isZoom = isZoom;
			/*
			alert('trElement.nodeName: ' + trElement.nodeName);
			// Get the image element
			var td = trElement.firstChild;
			alert('td.nodeName: ' + td.nodeName);
			*/
			var images = trElement.getElementsByTagName('img');
			var img = images[0];
			// alert('img.nodeName: ' + img.nodeName);
			img.src = isZoom ? imgDb.zoomSelectActive.src : imgDb.zoomSelect.src;
		},
		updateTrAndRowItemSelect: function(trElement, rowItem, isSelect) {
			// Sets the tr element and rowItem object to the given arguments
			rowItem.isSelect = isSelect;
			var oriClassName = rowItem.oriClassName;
			var newClassName = '';
			if (isSelect) {
				newClassName = (oriClassName == '') ? 'standard-re-row-select' : oriClassName + ' standard-re-row-select';
			}
			else {
				newClassName = oriClassName;
			}
			trElement.className = newClassName;
		}
	}
};
function toggleReportsDropDownMenu() {
	// This is a fake function. The actual toolbar item is a drop down.
	// alert('toggleReportsDropDownMenu()');
	// KHP-RC, revise if we can remove this fake function.
}
