package swim.http;

import swim.codec.Debug;
import swim.codec.Output;
import swim.codec.Writer;
import swim.util.Murmur3;

public class Cookie extends HttpPart implements Debug {

  final String name;
  final String value;

  Cookie(String name, String value) {
    this.name = name;
    this.value = value;
  }

  public String getName() {
    return this.name;
  }

  public String getValue() {
    return this.value;
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Cookie").write('.').write("create").write('(').debug(this.name);

    if (this.value != null) {
      output = output.write(", ").debug(this.value);
    }

    output = output.write(')');

    return output;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Cookie) {
      final Cookie that = (Cookie) other;
      return this.name.equals(that.name) && this.value.equals(that.value);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Cookie.hashSeed == 0) {
      Cookie.hashSeed = Murmur3.seed(Cookie.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Cookie.hashSeed,
         this.name.hashCode()), this.value.hashCode()));
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return new ParamWriter(http, this.name, this.value);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return ParamWriter.write(output, http, this.name, this.value);
  }

  public static Cookie create(String name, String value) {
    return new Cookie(name, value);
  }

  public static Cookie create(String name) {
    return new Cookie(name, "");
  }

  public static Cookie parse(String string) {
    return Http.standardParser().parseCookieString(string);
  }

}
