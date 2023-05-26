package swim.config.model;

public class IconElement {
  byte[] imageBytes;

  String contentType;

  public byte[] imageBytes() {
    return this.imageBytes;
  }

  public void imageBytes(byte[] imageBytes) {
    this.imageBytes = imageBytes;
  }

  public String contentType() {
    return this.contentType;
  }

  public void contentType(String contentType) {
    this.contentType = contentType;
  }
}
