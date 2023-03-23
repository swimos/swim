package processor;

import swim.config.Configurable;
import swim.config.annotation.Config;
import swim.config.annotation.Ignore;
import swim.config.annotation.validator.ContainsKey;
import swim.config.annotation.validator.Required;
import swim.config.annotation.validator.ValidPort;
import swim.structure.Tag;
import swim.structure.Value;

import java.util.List;
import java.util.Map;

/**
 * <p>This is documentation that will be displayed in the Configuration section.</p>
 */
@Config
@Tag("exampleConfig")
public interface ExampleConfig extends Configurable {
  /**
   * <p>This is the hostname that the adapter should connect to</p>
   *
   * @return
   */
  @Required
  String hostName();

  /**
   * <p>Port to connect to</p>
   *
   * @return
   */
  @ValidPort()
  int port();

  /**
   * <p>This is a port that is limited to 3000 or 5000</p>
   *
   * @return
   */
  @ValidPort(min = 3000, max = 5000)
  int limitedPort();

  /**
   * <p>This parameter will use a default value if none is specified.</p>
   *
   * @return
   */
  @ValidPort
  default int portWithDefault() {
    return 8080;
  }

  /**
   * <p>This is an example that contains multiple paragraphs.</p>
   * <p>This should be the start of the second paragraph.</p>
   * <p>This should be the start of the third paragraph.</p>
   *
   * @return
   */
  @ContainsKey(value = {"batch.size"})
  Map<String, String> additionalProperties();

  /**
   * <p class='code-recon'>
   * {@literal @}command($value) {
   * nodeUri: {
   * "/dynamic/",
   * $val + 1
   * },
   * laneUri: "unused"
   * value:
   * }
   * }
   * </p>
   *
   * @return
   */
  Value relaySchema();


  @Ignore
  default int weirdCalculation() {
    return this.port() + this.limitedPort();
  }

  List<String> elements();
}
