package processor;

import org.testng.annotations.Test;
import swim.config.ConfigError;
import swim.config.ConfigException;
import swim.structure.Record;
import swim.structure.Value;

import java.util.Optional;

import static org.testng.AssertJUnit.assertNotNull;
import static org.testng.AssertJUnit.assertTrue;
import static org.testng.AssertJUnit.fail;


public class ExampleConfigSpec {

  @Test
  public void load() throws ConfigException {
    Value input = Record.create().attr("exampleConfig")
        .slot("port", 1025)
        .slot("limitedPort", 3000)
        .slot("hostName", "localhost");
    ExampleConfig exampleConfig = ExampleConfigImpl.load(input);
    exampleConfig.validate();
  }

  @Test
  public void loadMissingPort() throws ConfigException {
    Value input = Record.create().attr("exampleConfig")
        .slot("limitedPort", 3000)
        .slot("hostName", "localhost");
    ExampleConfig exampleConfig = ExampleConfigImpl.load(input);

    try {
      exampleConfig.validate();
      fail();
    } catch (ConfigException ex) {
      assertNotNull(ex);
      Optional<ConfigError> portError = ex.errors().stream().filter(e->"port".equals(e.key())).findFirst();
      assertTrue(portError.isPresent());
    }
  }




}
