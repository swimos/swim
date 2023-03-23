package swim.config.model;

import java.util.ArrayList;
import java.util.List;

public class ConfigurationItemElement extends AbstractConfigurationElement {
  String name;

  String type;

  List<String> validations = new ArrayList<>();

  List<String> recommendations = new ArrayList<>();

  /**
   * The name of the configuration setting.
   * @return
   */
  public String name() {
    return this.name;
  }

  /**
   * The name of the configuration setting.
   * @param name
   */
  public void name(String name) {
    this.name = name;
  }

  /**
   * The data type for the configuration setting.
   * @return
   */
  public String type() {
    return this.type;
  }

  /**
   * The data type for the configuration setting.
   * @param type
   */
  public void type(String type) {
    this.type = type;
  }

  /**
   * The documentation for the validations that are performed.
   * @return
   */
  public List<String> validations() {
    return this.validations;
  }

  /**
   * The documentation for the validations that are performed.
   * @param validations
   */
  public void validations(List<String> validations) {
    this.validations = validations;
  }

  /**
   * Recommended values for the setting.
   * @return
   */
  public List<String> recommendations() {
    return this.recommendations;
  }

  /**
   * Recommended values for the setting.
   * @param recommendations
   */
  public void recommendations(List<String> recommendations) {
    this.recommendations = recommendations;
  }
}
