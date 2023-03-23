package swim.config.model;

import java.util.ArrayList;
import java.util.List;

public class ConfigurationItemElement extends AbstractConfigurationElement {
  String name;

  String type;

  List<String> validations = new ArrayList<>();

  List<String> recommendations = new ArrayList<>();

  public String name() {
    return this.name;
  }

  public void name(String name) {
    this.name = name;
  }

  public String type() {
    return this.type;
  }

  public void type(String type) {
    this.type = type;
  }

  public List<String> validations() {
    return this.validations;
  }

  public void validations(List<String> validations) {
    this.validations = validations;
  }

  public List<String> recommendations() {
    return this.recommendations;
  }

  public void recommendations(List<String> recommendations) {
    this.recommendations = recommendations;
  }
}
