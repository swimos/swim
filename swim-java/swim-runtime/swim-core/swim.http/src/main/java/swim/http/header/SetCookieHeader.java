package swim.http.header;

import swim.codec.Output;
import swim.codec.Writer;
import swim.collections.HashTrieMap;
import swim.http.Cookie;
import swim.http.HttpHeader;
import swim.http.HttpWriter;
import swim.uri.UriPath;
import swim.util.Murmur3;

public class SetCookieHeader extends HttpHeader {

  final Cookie cookie;
  HashTrieMap<String, String> params;

  SetCookieHeader(Cookie cookie, HashTrieMap<String, String> params) {
    this.cookie = cookie;
    this.params = params;
  }

  @Override
  public boolean isBlank() {
    return this.cookie.getName().isEmpty();
  }

  @Override
  public String lowerCaseName() {
    return "set-cookie";
  }

  @Override
  public String name() {
    return "Set-Cookie";
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return SetCookieHeaderWriter.write(output, http, this.cookie, this.params);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof SetCookieHeader) {
      final SetCookieHeader that = (SetCookieHeader) other;
      return this.cookie.equals(that.cookie) && this.params.equals(that.params);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (SetCookieHeader.hashSeed == 0) {
      SetCookieHeader.hashSeed = Murmur3.seed(SetCookieHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(SetCookieHeader.hashSeed, this.cookie.hashCode()), this.params.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("SetCookieHeader").write('.').write("create").write('(').debug(this.cookie);

    for (HashTrieMap.Entry<String, String> param : this.params) {
      output = output.write('.').write("param").write('(').debug(param.getKey());

      if (!param.getValue().isEmpty()) {
        output.write(", ").debug(param.getValue());
      }

      output.write(')');
    }

    output.write(')');
    return output;
  }

  public static SetCookieHeader create(Cookie cookie) {
    return new SetCookieHeader(cookie, HashTrieMap.empty());
  }

  public static SetCookieHeader create(String name, String value) {
    return new SetCookieHeader(Cookie.create(name, value), HashTrieMap.empty());
  }

  public static SetCookieHeader create(String name) {
    return new SetCookieHeader(Cookie.create(name), HashTrieMap.empty());
  }

  public void expire() {
    this.setMaxAge(0);
  }

  public void setSecure() {
    this.params = this.params.updated("Secure", "");
  }

  public void unsetSecure() {
    this.params = this.params.removed("Secure");
  }

  public void setHttpOnly() {
    this.params = this.params.updated("HttpOnly", "");
  }

  public void unsetHttpOnly() {
    this.params = this.params.removed("HttpOnly");
  }

  public void setMaxAge(long maxAge) {
    this.params = this.params.updated("Max-Age", Long.toString(maxAge));
  }

  public void unsetMaxAge() {
    this.params = this.params.removed("Max-Age");
  }

  public void setDomain(String domain) {
    this.params = this.params.updated("Domain", domain);
  }

  public void unsetDomain() {
    this.params = this.params.removed("Domain");
  }

  public void setPath(String path) {
    this.params = this.params.updated("Path", UriPath.of(path).toString());
  }

  public void unsetPath() {
    this.params = this.params.removed("Path");
  }

  public void setSameSite(SameSite sameSite) {
    this.params = this.params.updated("SameSite", sameSite.name());
  }

  public void unsetSameSite() {
    this.params = this.params.removed("SameSite");
  }

  public enum SameSite {
    Strict,
    Lax,
    None,
  }

}
