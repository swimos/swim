package swim.config.validator;

import swim.config.ConfigError;

import java.util.List;

public abstract class AbstractValidator<T, Value> {
  protected Class<T> attributeClass;

  public AbstractValidator(Class<T> attributeClass) {
    this.attributeClass = attributeClass;
  }

  public Class<T> supports() {
    return this.attributeClass;
  }

  /**
   * Method is used to validate a key
   * @param errors
   * @param attribute
   * @param key
   * @param value
   */
  public abstract void validate(List<ConfigError> errors, T attribute, String key, Value value);

  /**
   * Method is used to capture the documentation about this validation.
   * @param attribute
   * @return
   */
  public abstract String doc(T attribute);
}
