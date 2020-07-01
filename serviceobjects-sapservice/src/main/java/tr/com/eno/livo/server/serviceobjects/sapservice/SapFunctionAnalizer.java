package tr.com.eno.livo.server.serviceobjects.sapservice;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import com.sap.conn.jco.JCoField;
import com.sap.conn.jco.JCoFieldIterator;
import com.sap.conn.jco.JCoFunction;

public class SapFunctionAnalizer {

	private final JCoFunction function;

	private boolean isContainsChangingParamaters = false;

	private boolean isContainsExportParameters = false;

	private boolean isContainsImportParameters = false;

	private boolean isContainsTable = false;

	public SapFunctionAnalizer(JCoFunction function) {

		this.function = function;
	}

	public JsonObject getExportStructure() {

		JsonObjectBuilder resultBuilder = Json.createObjectBuilder();

		JsonArrayBuilder arrayBuilder;

		JsonArrayBuilder tableArrayBuilder;

		JsonArrayBuilder changingArrayBuilder;

		try {

			JCoFieldIterator iterator = this.function.getExportParameterList()
					.getFieldIterator();

			arrayBuilder = this.getStructure(iterator);

			this.isContainsExportParameters = true;

		} catch (Exception ex) {

			this.isContainsExportParameters = false;

			arrayBuilder = null;
		}

		try {

			JCoFieldIterator iterator = this.function.getTableParameterList()
					.getFieldIterator();

			tableArrayBuilder = this.getStructure(iterator);

			this.isContainsTable = true;

		} catch (Exception ex) {

			this.isContainsTable = false;
			tableArrayBuilder = null;

		}

		try {

			JCoFieldIterator iterator = this.function
					.getChangingParameterList().getFieldIterator();

			changingArrayBuilder = this.getStructure(iterator);

			this.isContainsChangingParamaters = true;

		} catch (Exception ex) {

			this.isContainsChangingParamaters = false;

			changingArrayBuilder = null;
		}

		if (this.isContainsExportParameters)
			resultBuilder.add("exports", arrayBuilder);
		if (this.isContainsTable)
			resultBuilder.add("tables", tableArrayBuilder);
		if (this.isContainsChangingParamaters)
			resultBuilder.add("changings", changingArrayBuilder);

		return resultBuilder.build();

	}

	/**
	 * Returns import structure of the function.
	 * 
	 * @return {@link JsonObject}
	 */
	public JsonObject getImportStructure() {

		JsonObjectBuilder resultBuilder = Json.createObjectBuilder();

		JsonArrayBuilder arrayBuilder;

		JsonArrayBuilder changingArrayBuilder;

		try {

			JCoFieldIterator iterator = this.function.getImportParameterList()
					.getFieldIterator();

			arrayBuilder = this.getStructure(iterator);

			this.isContainsImportParameters = true;

		} catch (Exception ex) {

			this.isContainsImportParameters = false;

			arrayBuilder = null;

			System.out.println("No import parameters found");
		}

		try {

			JCoFieldIterator iterator = this.function
					.getChangingParameterList().getFieldIterator();

			changingArrayBuilder = this.getStructure(iterator);

			this.isContainsChangingParamaters = true;

		} catch (Exception ex) {

			this.isContainsChangingParamaters = false;

			changingArrayBuilder = null;

			System.out.println("No changing parameters");
		}

		if (this.isContainsImportParameters)
			resultBuilder.add("imports", arrayBuilder);
		if (this.isContainsChangingParamaters)
			resultBuilder.add("changings", changingArrayBuilder);

		return resultBuilder.build();
	}

	/**
	 * Gets iterated structure.
	 * 
	 * @param it
	 *            {@link JCoFieldIterator} of structure or table.
	 * @return {@link JsonArrayBuilder}
	 */
	private JsonArrayBuilder getStructure(JCoFieldIterator it) {

		JsonArrayBuilder resultBuilder = Json.createArrayBuilder();

		while (it.hasNextField()) {

			JsonObjectBuilder objectBuilder = Json.createObjectBuilder();

			JCoField field = it.nextField();

			objectBuilder.add("Field Name", field.getName());

			objectBuilder.add("Field Type", field.getTypeAsString());

			if (field.isStructure()) {

				objectBuilder.add("Sub-Fields", this.getStructure(field
						.getStructure().getFieldIterator()));

			} else if (field.isTable()) {

				objectBuilder.add("Sub-Fields",
						this.getStructure(field.getTable().getFieldIterator()));

			} else {

				objectBuilder.add("Field Length", field.getLength());

			}

			resultBuilder.add(objectBuilder);

		}
		return resultBuilder;
	}
}
