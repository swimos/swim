package swim.config.model;

import java.util.ArrayList;
import java.util.List;

public class ConfigurationElement extends AbstractConfigurationElement {
  List<ConfigurationItemElement> configurationItems = new ArrayList<>();

  /**
   * Settings that are associated with the configuration.
   * @return
   */
  public List<ConfigurationItemElement> configurationItems() {
    return this.configurationItems;
  }

  /**
   * Settings that are associated with the configuration.
   * @param configurationItems
   */
  public void configurationItems(List<ConfigurationItemElement> configurationItems) {
    this.configurationItems = configurationItems;
  }
}
