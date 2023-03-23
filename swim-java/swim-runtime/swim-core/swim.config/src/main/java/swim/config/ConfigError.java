package swim.config;

/**
 * A representation of a configuration problem
 */
public class ConfigError {
  private final String key;
  private final Object value;
  private final String message;

  public ConfigError(String key, Object value, String format, Object... args) {
    this.key = key;
    this.value = value;
    this.message = String.format(format, args);
  }

  /**
   * The key in the configuration with issues
   * @return
   */
  public String key() {
    return this.key;
  }

  /**
   * The value that has issues
   * @return
   */
  public Object value() {
    return this.value;
  }

  /**
   * A message to return to the user.
   * @return
   */
  public String message() {
    return this.message;
  }

  @Override
  public String toString() {
    return String.format(
        "%s: %s",
        this.key,
        this.message
    );
  }
}
