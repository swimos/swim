package swim.http.header;

import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Writer;
import swim.collections.FingerTrieSeq;
import swim.http.Cookie;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Builder;
import swim.util.Murmur3;

public class CookieHeader extends HttpHeader {

  final FingerTrieSeq<Cookie> cookies;

  CookieHeader(FingerTrieSeq<Cookie> cookies) {
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

  public FingerTrieSeq<Cookie> cookies() {
    return this.cookies;
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return http.writeParamListWithSeparator(output, this.cookies.iterator(), ';');
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
    final int n = this.cookies.size();
    if (n > 0) {
      output = output.debug(this.cookies.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.cookies.get(i));
      }
    }
    output = output.write(')');
    return output;
  }

  public static CookieHeader empty() {
    return new CookieHeader(FingerTrieSeq.empty());
  }

  public static CookieHeader create(FingerTrieSeq<Cookie> cookies) {
    return new CookieHeader(cookies);
  }

  public static CookieHeader create(Cookie... cookies) {
    return new CookieHeader(FingerTrieSeq.of(cookies));
  }

  public static CookieHeader create(String... cookiesString) {
    final Builder<Cookie, FingerTrieSeq<Cookie>> cookies = FingerTrieSeq.builder();
    for (int i = 0, n = cookiesString.length; i < n; i += 1) {
      cookies.add(Cookie.parse(cookiesString[i]));
    }
    return new CookieHeader(cookies.bind());
  }

  public static Parser<CookieHeader> parseHeaderValue(Input input, HttpParser http) {
    return CookieHeaderParser.parse(input, http);
  }

}
