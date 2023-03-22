package swim.config.model;

import java.util.ArrayList;
import java.util.List;

public class Manifest {
  List<AdapterElement> adapters = new ArrayList<>();

  public List<AdapterElement> adapters() {
    return this.adapters;
  }

  public void adapters(List<AdapterElement> adapters) {
    this.adapters = adapters;
  }
}
