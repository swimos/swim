package swim.config.model;

public class AdapterElement extends AbstractConfigurationElement {
  String adapterClass;
  ConfigurationElement configuration;

  String displayName;

  IconElement smallIcon;
  IconElement largeIcon;
  IconElement galleryIcon;


  /**
   * Java class for the adapter.
   * @return
   */
  public String adapterClass() {
    return this.adapterClass;
  }

  /**
   * Java class for the adapter.
   * @param adapterClass
   */
  public void adapterClass(String adapterClass) {
    this.adapterClass = adapterClass;
  }

  /**
   * Configuration for the Adapter.
   * @return
   */
  public ConfigurationElement configuration() {
    return this.configuration;
  }

  /**
   * Configuration for the Adapter.
   * @param configuration
   */
  public void configuration(ConfigurationElement configuration) {
    this.configuration = configuration;
  }

  /**
   * Friendly representation of the adapter name.
   * @return
   */
  public String displayName() {
    return this.displayName;
  }

  /**
   * Friendly representation of the adapter name.
   * @param displayName
   */
  public void displayName(String displayName) {
    this.displayName = displayName;
  }

  /**
   * Icon for the adapter
   * @return
   */
  public IconElement smallIcon() {
    return this.smallIcon;
  }

  /**
   * Icon for the adapter
   * @param smallIcon
   */
  public void smallIcon(IconElement smallIcon) {
    this.smallIcon = smallIcon;
  }

  /**
   * Icon for the adapter
   * @return
   */
  public IconElement largeIcon() {
    return this.largeIcon;
  }

  /**
   * Icon for the adapter
   * @param largeIcon
   */
  public void largeIcon(IconElement largeIcon) {
    this.largeIcon = largeIcon;
  }

  /**
   * Icon for the adapter
   * @return
   */
  public IconElement galleryIcon() {
    return this.galleryIcon;
  }

  /**
   * Icon for the adapter
   * @param galleryIcon
   */
  public void galleryIcon(IconElement galleryIcon) {
    this.galleryIcon = galleryIcon;
  }
}
