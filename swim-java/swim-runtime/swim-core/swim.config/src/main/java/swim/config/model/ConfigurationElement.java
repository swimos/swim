package swim.config.model;

import java.util.ArrayList;
import java.util.List;

public class ConfigurationElement extends AbstractConfigurationElement {
  List<ConfigurationItemElement> configurationItems = new ArrayList<>();

  public List<ConfigurationItemElement> configurationItems() {
    return this.configurationItems;
  }

  public void configurationItems(List<ConfigurationItemElement> configurationItems) {
    this.configurationItems = configurationItems;
  }
}
