package swim.config;

import swim.codec.Debug;
import swim.structure.Value;

import java.util.List;

/**
 * Interface is used to implement a Configurable entity.
 */
public interface Configurable extends Debug {
  /**
   * Method is used to validate that the configuration seems correct.
   * @throws ConfigException Exception that is thrown when there are configuration errors.
   */
  void validate() throws ConfigException;

  /**
   * Method is called after the class is loaded from a form.
   * @param value value to read the configuration from.
   */
  void configure(Value value);
}