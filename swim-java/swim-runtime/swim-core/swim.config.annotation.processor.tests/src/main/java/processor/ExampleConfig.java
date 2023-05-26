package processor;

import swim.config.Config;
import swim.config.Configurable;
import swim.config.Ignore;
import swim.config.validator.ValidPort;
import swim.structure.Tag;
import swim.structure.Value;

import java.util.List;
import java.util.Map;

@Config
@Tag("exampleConfig")
public interface ExampleConfig extends Configurable {
  /**
   * This is the hostname that the adapter should connect to
   *
   * @return
   */
  String hostName();

  /**
   * Port to connect to
   *
   * @return
   */
  @ValidPort()
  int port();

  /**
   * This is a port that is limited to 3000 or 5000
   *
   * @return
   */
  @ValidPort(min = 3000, max = 5000)
  int limitedPort();

  @ValidPort
  default int portWithDefault() {
    return 8080;
  }

  /**
   * This is an example that contains multiple paragraphs.
   *
   * <p>This should be the start of the second paragraph.</p>
   * <p>This should be the start of the third paragraph.</p>
   * @return
   */
  Map<String, String> additionalProperties();

  Value relaySchema();

  @Ignore
  default int weirdCalculation() {
    return this.port() + this.limitedPort();
  }

  List<String> elements();

}
