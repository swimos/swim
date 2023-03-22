package swim.codec;

import java.util.LinkedHashMap;
import java.util.Map;

public class DebugFormatter {
  final Class<?> cls;
  final Map<String, Object> values;

  private DebugFormatter(Class<?> cls) {
    this.cls = cls;
    this.values = new LinkedHashMap<>();
  }

  public <T> Output<T> to(Output<T> output) {
    output.write(cls.getSimpleName()).write("of").write('(').write(')');
    for(Map.Entry<String, Object> kvp: this.values.entrySet()) {
      output.write('.').write(kvp.getKey()).write('(').debug(kvp.getValue()).write(')');
    }

    return output;
  }

  public DebugFormatter add(String name, Object value) {
    this.values.put(name, value);
    return this;
  }

  public static DebugFormatter of(Class<?> cls) {
    return new DebugFormatter(cls);
  }
}
