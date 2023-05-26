package swim.config.model;

public class AdapterElement extends AbstractConfigurationElement {
  String adapterClass;
  ConfigurationElement configuration;

  String displayName;

  IconElement smallIcon;
  IconElement largeIcon;
  IconElement galleryIcon;


  public String adapterClass() {
    return this.adapterClass;
  }

  public void adapterClass(String adapterClass) {
    this.adapterClass = adapterClass;
  }

  public ConfigurationElement configuration() {
    return this.configuration;
  }

  public void configuration(ConfigurationElement configuration) {
    this.configuration = configuration;
  }

  public String displayName() {
    return this.displayName;
  }

  public void displayName(String displayName) {
    this.displayName = displayName;
  }

  public IconElement smallIcon() {
    return this.smallIcon;
  }

  public void smallIcon(IconElement smallIcon) {
    this.smallIcon = smallIcon;
  }

  public IconElement largeIcon() {
    return this.largeIcon;
  }

  public void largeIcon(IconElement largeIcon) {
    this.largeIcon = largeIcon;
  }

  public IconElement galleryIcon() {
    return this.galleryIcon;
  }

  public void galleryIcon(IconElement galleryIcon) {
    this.galleryIcon = galleryIcon;
  }
}
