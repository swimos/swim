package swim.config.model;

public class IconElement {
  byte[] imageBytes;

  String contentType;

  /**
   * The byte representation of the image.
   * @return
   */
  public byte[] imageBytes() {
    return this.imageBytes;
  }

  /**
   * The byte representation of the image.
   * @param imageBytes
   */
  public void imageBytes(byte[] imageBytes) {
    this.imageBytes = imageBytes;
  }

  /**
   * The content type for the image.
   * @return
   */
  public String contentType() {
    return this.contentType;
  }

  /**
   * The content type for the image.
   * @param contentType
   */
  public void contentType(String contentType) {
    this.contentType = contentType;
  }
}
