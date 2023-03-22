package swim.config.validator;

import org.testng.annotations.Test;
import swim.config.ConfigError;

import java.util.ArrayList;
import java.util.List;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;


public class ValidPortSpec extends AbstractValidatorSpecImplementation<ValidPort, Number, ValidPort.Validator> {
  protected ValidPortSpec() {
    super(ValidPort.class);
  }

  @ValidPort
  @Test(dataProvider = "attribute")
  public void valid(ValidPort attribute) {
    List<ConfigError> errors = new ArrayList<>();
    int input = 4213;
    this.validator.validate(errors, attribute, "input", input);
    assertTrue(errors.isEmpty());
  }

  @ValidPort
  @Test(dataProvider = "attribute")
  public void invalidLow(ValidPort attribute) {
    final String key = "input";
    List<ConfigError> errors = new ArrayList<>();
    int input = -123;
    this.validator.validate(errors, attribute, key, input);
    assertEquals(1, errors.size(), "Error count does not match");
    ConfigError error = errors.get(0);
    assertEquals(key, error.key(), "Key does not match");
    assertEquals(input, error.value(), "Value does not match.");
  }

  @ValidPort
  @Test(dataProvider = "attribute")
  public void invalidHigh(ValidPort attribute) {
    final String key = "input";
    List<ConfigError> errors = new ArrayList<>();
    int input = Integer.MAX_VALUE;
    this.validator.validate(errors, attribute, key, input);
    assertEquals(1, errors.size(), "Error count does not match");
    ConfigError error = errors.get(0);
    assertEquals(key, error.key(), "Key does not match");
    assertEquals(input, error.value(), "Value does not match.");
  }


  @Override
  protected ValidPort.Validator createValidator() {
    return new ValidPort.Validator();
  }
}
