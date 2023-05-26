package swim.config.validator;

import swim.config.ConfigError;

import java.util.List;

public interface Validator<T, V> {
  /**
   * Method is used to validate a key
   *
   * @param errors
   * @param attribute
   * @param key
   * @param value
   */
  void validate(List<ConfigError> errors, T attribute, String key, V value);
}
