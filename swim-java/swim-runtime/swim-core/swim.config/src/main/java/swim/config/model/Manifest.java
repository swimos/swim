package swim.config.model;

import java.util.ArrayList;
import java.util.List;

/**
 * A representation of the contents of the module
 */
public class Manifest {
  List<AdapterElement> adapters = new ArrayList<>();

  /**
   * List of Adapters for the module.
   * @return
   */
  public List<AdapterElement> adapters() {
    return this.adapters;
  }

  /**
   * List of adapters for the module.
   * @param adapters
   */
  public void adapters(List<AdapterElement> adapters) {
    this.adapters = adapters;
  }
}
