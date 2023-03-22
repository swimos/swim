package swim.config;

import swim.codec.Debug;
import swim.structure.Value;

import java.util.List;

public interface Configurable extends Debug {
  void validate() throws ConfigException;
  void configure(Value value);
}