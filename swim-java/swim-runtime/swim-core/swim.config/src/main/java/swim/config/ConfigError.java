package swim.config;

public class ConfigError {
  private final String key;
  private final Object value;
  private final String message;

  public ConfigError(String key, Object value, String format, Object... args) {
    this.key = key;
    this.value = value;
    this.message = String.format(format, args);
  }

  public String key() {
    return this.key;
  }

  public Object value() {
    return this.value;
  }

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
