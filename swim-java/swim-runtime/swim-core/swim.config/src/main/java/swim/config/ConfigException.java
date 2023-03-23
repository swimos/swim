package swim.config;

import java.util.List;

/**
 * Exception that is thrown when there are configuration issues.
 */
public class ConfigException extends Exception {
  final List<ConfigError> errors;

  public ConfigException(List<ConfigError> errors) {
    this.errors = errors;
  }

  /**
   * Configuration issues that were found.
   * @return
   */
  public List<ConfigError> errors() {
    return this.errors;
  }

  @Override
  public String getMessage() {
    StringBuilder builder = new StringBuilder();
    builder.append(String.format("%s configuration error(s) were found:", this.errors.size()));

    this.errors.forEach(error -> {
      builder.append("\n    ");
      builder.append(error);
    });

    return builder.toString();
  }
}
