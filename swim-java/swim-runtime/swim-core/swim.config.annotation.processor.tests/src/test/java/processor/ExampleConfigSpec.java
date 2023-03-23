package processor;

import org.testng.annotations.Test;
import swim.config.ConfigError;
import swim.config.ConfigException;
import swim.structure.Record;
import swim.structure.Value;

import java.util.Optional;

import static org.testng.Assert.assertEquals;
import static org.testng.AssertJUnit.assertNotNull;
import static org.testng.AssertJUnit.assertTrue;
import static org.testng.AssertJUnit.fail;


public class ExampleConfigSpec {

  @Test
  public void load() throws ConfigException {
    Value input = Record.create().attr("exampleConfig")
        .slot("port", 1025)
        .slot("limitedPort", 3000)
        .slot("hostName", "localhost")
        .slot("additionalProperties", Record.create().slot("batch.size", "1234"));
    ExampleConfig exampleConfig = ExampleConfigImpl.load(input);
    exampleConfig.validate();
    assertEquals(exampleConfig.port(), 1025, "port should match.");
    assertEquals(exampleConfig.limitedPort(), 3000, "limitedPort should match.");
    assertEquals(exampleConfig.hostName(), "localhost", "hostName should match.");
  }

  @Test
  public void loadMissingPort() throws ConfigException {
    Value input = Record.create().attr("exampleConfig")
        .slot("limitedPort", 3000)
        .slot("additionalProperties", Record.create().slot("batch.size", "1234"))
        .slot("hostName", "localhost");
    ExampleConfig exampleConfig = ExampleConfigImpl.load(input);

    try {
      exampleConfig.validate();
      fail();
    } catch (ConfigException ex) {
      assertNotNull(ex);
      Optional<ConfigError> portError = ex.errors().stream().filter(e -> "port".equals(e.key())).findFirst();
      assertTrue(portError.isPresent());
    }
  }

  @Test
  public void loadMissingHostname() throws ConfigException {
    Value input = Record.create().attr("exampleConfig")
        .slot("port", 1025)
        .slot("additionalProperties", Record.create().slot("batch.size", "1234"))

        .slot("limitedPort", 3000);
    ExampleConfig exampleConfig = ExampleConfigImpl.load(input);
    try {
      exampleConfig.validate();
    } catch (ConfigException ex) {
      assertNotNull(ex);
      Optional<ConfigError> portError = ex.errors().stream().filter(e -> "hostName".equals(e.key())).findFirst();
      assertTrue(portError.isPresent());
    }
  }

  @Test
  public void loadDefaultValue() throws ConfigException {
    Value input = Record.create().attr("exampleConfig")
        .slot("port", 1025)
        .slot("limitedPort", 3000)
        .slot("additionalProperties", Record.create().slot("batch.size", "1234"))
        .slot("hostName", "localhost");
    ExampleConfig exampleConfig = ExampleConfigImpl.load(input);
    exampleConfig.validate();

    assertEquals(8080, exampleConfig.portWithDefault(), "portWithDefault should match.");
  }
}
