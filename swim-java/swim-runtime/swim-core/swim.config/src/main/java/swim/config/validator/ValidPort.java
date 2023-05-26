package swim.config.validator;

import swim.config.ConfigError;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.List;


@Target(ElementType.METHOD)
@ValidatorImplementation(ValidPort.Validator.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPort {
  int min() default 1024;

  int max() default 65535;

  class Validator extends AbstractValidator<ValidPort, Number> {
    public Validator() {
      super(ValidPort.class);
    }

    @Override
    public void validate(List<ConfigError> errors, ValidPort attribute, String key, Number value) {
      if (null == value) {
        errors.add(
            new ConfigError(key, value, "Value cannot be null.")
        );
        return;
      }
      int port = value.intValue();
      if (port < attribute.min() || port > attribute.max()) {
        errors.add(
            new ConfigError(key, value, "Value must be between %s and %s.", attribute.min(), attribute.max())
        );
      }
    }

    @Override
    public String doc(ValidPort attribute) {
      return String.format("Value must be between %s and %s.", attribute.min(), attribute.max());
    }
  }
}
