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

public class SetCookieHeader extends HttpHeader {

  final FingerTrieSeq<Cookie> cookies;

  SetCookieHeader(FingerTrieSeq<Cookie> cookies) {
    this.cookies = cookies;
  }

  @Override
  public boolean isBlank() {
    return this.cookies.isEmpty();
  }

  @Override
  public String lowerCaseName() {
    return "set-cookie";
  }

  @Override
  public String name() {
    return "Set-Cookie";
  }

  public FingerTrieSeq<Cookie> cookies() {
    return this.cookies;
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return http.writeParamList(output, this.cookies.iterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof SetCookieHeader) {
      final SetCookieHeader that = (SetCookieHeader) other;
      return this.cookies.equals(that.cookies);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (SetCookieHeader.hashSeed == 0) {
      SetCookieHeader.hashSeed = Murmur3.seed(SetCookieHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(SetCookieHeader.hashSeed, this.cookies.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("SetCookieHeader").write('.').write("create").write('(');
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

  public static SetCookieHeader empty() {
    return new SetCookieHeader(FingerTrieSeq.empty());
  }

  public static SetCookieHeader create(FingerTrieSeq<Cookie> cookies) {
    return new SetCookieHeader(cookies);
  }

  public static SetCookieHeader create(Cookie... cookies) {
    return new SetCookieHeader(FingerTrieSeq.of(cookies));
  }

  public static SetCookieHeader create(String... cookiesString) {
    final Builder<Cookie, FingerTrieSeq<Cookie>> cookies = FingerTrieSeq.builder();
    for (int i = 0, n = cookiesString.length; i < n; i += 1) {
      cookies.add(Cookie.parse(cookiesString[i]));
    }
    return new SetCookieHeader(cookies.bind());
  }

  public static Parser<SetCookieHeader> parseHeaderValue(Input input, HttpParser http) {
    return SetCookieHeaderParser.parse(input, http);
  }
}
