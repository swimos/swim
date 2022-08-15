package swim.http.header;

import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Writer;
import swim.collections.HashTrieMap;
import swim.http.Cookie;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Murmur3;

public class CookieHeader extends HttpHeader {

  final HashTrieMap<String, Cookie> cookies;

  CookieHeader(HashTrieMap<String, Cookie> cookies) {
    this.cookies = cookies;
  }

  @Override
  public boolean isBlank() {
    return this.cookies.isEmpty();
  }

  @Override
  public String lowerCaseName() {
    return "cookie";
  }

  @Override
  public String name() {
    return "Cookie";
  }

  public HashTrieMap<String, Cookie> cookies() {
    return this.cookies;
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return http.writeParamListWithSeparator(output, this.cookies.values().iterator(), ';');
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof CookieHeader) {
      final CookieHeader that = (CookieHeader) other;
      return this.cookies.equals(that.cookies);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (CookieHeader.hashSeed == 0) {
      CookieHeader.hashSeed = Murmur3.seed(CookieHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(CookieHeader.hashSeed, this.cookies.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("CookieHeader").write('.').write("create").write('(');

    for (Cookie cookie: this.cookies.values()) {
      output = output.write(", ").debug(cookie);
    }

    output = output.write(')');
    return output;
  }

  public static CookieHeader empty() {
    return new CookieHeader(HashTrieMap.empty());
  }

  public static CookieHeader create(HashTrieMap<String, Cookie> cookies) {
    return new CookieHeader(cookies);
  }

  public static CookieHeader create(Cookie... cookies) {
    HashTrieMap<String, Cookie> cookieMap = HashTrieMap.empty();

    for (Cookie cookie: cookies) {
      cookieMap = cookieMap.updated(cookie.getName(), cookie);
    }

    return new CookieHeader(cookieMap);
  }

  public static CookieHeader create(String... cookiesString) {
    HashTrieMap<String, Cookie> cookieMap = HashTrieMap.empty();

    for (String cookieString: cookiesString) {
      final Cookie cookie = Cookie.parse(cookieString);
      cookieMap = cookieMap.updated(cookie.getName(), cookie);
    }
    return new CookieHeader(cookieMap);
  }

  public static Parser<CookieHeader> parseHeaderValue(Input input, HttpParser http) {
    return CookieHeaderParser.parse(input, http);
  }

}
