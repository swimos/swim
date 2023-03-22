package swim.config.model;

public class AbstractConfigurationElement {
  String documentation;

  public String documentation() {
    return this.documentation;
  }

  public void documentation(String documentation) {
    this.documentation = documentation;
  }
}
