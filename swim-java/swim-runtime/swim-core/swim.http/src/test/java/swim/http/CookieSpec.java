package swim.http;

import org.testng.annotations.Test;
import static swim.http.HttpAssertions.assertWrites;

public class CookieSpec {

  @Test
  public void parseCookie() {
    assertParses("foo=bar", Cookie.create("foo", "bar"));
    assertParses("foo=baz.bar", Cookie.create("foo", "baz.bar"));
    assertParses("foo.bar=baz.qux", Cookie.create("foo.bar", "baz.qux"));
    assertParses("{foo.bar}={baz.qux}", Cookie.create("{foo.bar}", "{baz.qux}"));
    assertParses("foo=", Cookie.create("foo"));
  }

  @Test
  public void writesCookie() {
    assertWrites(Cookie.create("foo", "bar"), "foo=bar");
    assertWrites(Cookie.create("foo", "baz.bar"), "foo=baz.bar");
    assertWrites(Cookie.create("foo.bar", "baz.qux"), "foo.bar=baz.qux");
    assertWrites(Cookie.create("foo", ""), "foo=");
    assertWrites(Cookie.create("email", "foo@example.com"), "email=foo@example.com");

  }

  public static void assertParses(String string, Cookie cookie) {
    HttpAssertions.assertParses(Http.standardParser().cookieParser(), string, cookie);
  }

}
