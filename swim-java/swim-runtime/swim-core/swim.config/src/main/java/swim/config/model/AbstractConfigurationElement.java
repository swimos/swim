package swim.config.model;

public class AbstractConfigurationElement {
  String documentation;

  /**
   * Documentation for the element
   * @return
   */
  public String documentation() {
    return this.documentation;
  }

  /**
   * Documentation for the element
   * @param documentation
   */
  public void documentation(String documentation) {
    this.documentation = documentation;
  }
}
