package swim.http;

import org.testng.annotations.Test;
import swim.http.header.CookieHeader;
import static swim.http.HttpAssertions.assertWrites;

public class CookieHeaderSpec {

  @Test
  public void parseCookieHeader() {
    assertParses("Cookie: foo=bar", CookieHeader.create(Cookie.create("foo", "bar")));
    assertParses("Cookie: foo=bar;", CookieHeader.create(Cookie.create("foo", "bar")));
    assertParses("Cookie: foo=bar; baz=qux", CookieHeader.create(Cookie.create("foo", "bar"), Cookie.create("baz", "qux")));
    assertParses("Cookie: foo=bar; baz=qux; qux=quux", CookieHeader.create(Cookie.create("foo", "bar"), Cookie.create("baz", "qux"), Cookie.create("qux", "quux")));
    assertParses("Cookie: foo=", CookieHeader.create(Cookie.create("foo")));
    assertParses("Cookie: foo=; bar=", CookieHeader.create(Cookie.create("foo"), Cookie.create("bar")));
    assertParses("Cookie: foo=; bar=; baz=", CookieHeader.create(Cookie.create("foo"), Cookie.create("bar"), Cookie.create("baz")));
    assertParses("Cookie: foo=bar; baz=", CookieHeader.create(Cookie.create("foo", "bar"), Cookie.create("baz")));
    assertParses("Cookie: foo=; bar=baz", CookieHeader.create(Cookie.create("foo"), Cookie.create("bar", "baz")));
    assertParses("Cookie: foo=; bar=baz; qux=", CookieHeader.create(Cookie.create("foo"), Cookie.create("bar", "baz"), Cookie.create("qux")));
    assertParses("Cookie: foo=; bar=; baz=qux", CookieHeader.create(Cookie.create("foo"), Cookie.create("bar"), Cookie.create("baz", "qux")));

    assertParses("Cookie: {foo}={bar}", CookieHeader.create(Cookie.create("{foo}", "{bar}")));
    assertParses("Cookie: {foo}={bar};", CookieHeader.create(Cookie.create("{foo}", "{bar}")));
    assertParses("Cookie: {foo}={bar}; {baz}={qux}", CookieHeader.create(Cookie.create("{foo}", "{bar}"), Cookie.create("{baz}", "{qux}")));
    assertParses("Cookie: {foo}={bar}; {baz}={qux}; {qux}={quux}", CookieHeader.create(Cookie.create("{foo}", "{bar}"), Cookie.create("{baz}", "{qux}"), Cookie.create("{qux}", "{quux}")));
    assertParses("Cookie: {foo}=", CookieHeader.create(Cookie.create("{foo}")));
    assertParses("Cookie: {foo}=; {bar}=", CookieHeader.create(Cookie.create("{foo}"), Cookie.create("{bar}")));
    assertParses("Cookie: {foo}=; {bar}=; {baz}=", CookieHeader.create(Cookie.create("{foo}"), Cookie.create("{bar}"), Cookie.create("{baz}")));
    assertParses("Cookie: {foo}={bar}; {baz}=", CookieHeader.create(Cookie.create("{foo}", "{bar}"), Cookie.create("{baz}")));
    assertParses("Cookie: {foo}=; {bar}={baz}", CookieHeader.create(Cookie.create("{foo}"), Cookie.create("{bar}", "{baz}")));
    assertParses("Cookie: {foo}=; {bar}={baz}; {qux}=", CookieHeader.create(Cookie.create("{foo}"), Cookie.create("{bar}", "{baz}"), Cookie.create("{qux}")));
    assertParses("Cookie: {foo}=; {bar}=; {baz}={qux}", CookieHeader.create(Cookie.create("{foo}"), Cookie.create("{bar}"), Cookie.create("{baz}", "{qux}")));
  }

  @Test
  public void writesCookieHeader() {
    assertWrites(CookieHeader.create(Cookie.create("foo", "bar")), "Cookie: foo=bar");
    assertWrites(CookieHeader.create(Cookie.create("foo", "bar"), Cookie.create("baz", "qux")), "Cookie: foo=bar; baz=qux");
    assertWrites(CookieHeader.create(Cookie.create("foo", "bar"), Cookie.create("baz", "qux"), Cookie.create("qux", "quux")), "Cookie: foo=bar; qux=quux; baz=qux");
    assertWrites(CookieHeader.create(Cookie.create("foo")), "Cookie: foo=");
    assertWrites(CookieHeader.create(Cookie.create("foo"), Cookie.create("bar")), "Cookie: foo=; bar=");
    assertWrites(CookieHeader.create(Cookie.create("foo"), Cookie.create("bar"), Cookie.create("baz")), "Cookie: foo=; bar=; baz=");
    assertWrites(CookieHeader.create(Cookie.create("foo", "bar"), Cookie.create("baz")), "Cookie: foo=bar; baz=");
    assertWrites(CookieHeader.create(Cookie.create("foo"), Cookie.create("bar", "baz")), "Cookie: foo=; bar=baz");
    assertWrites(CookieHeader.create(Cookie.create("foo"), Cookie.create("bar", "baz"), Cookie.create("qux")), "Cookie: foo=; bar=baz; qux=");
    assertWrites(CookieHeader.create(Cookie.create("foo"), Cookie.create("bar"), Cookie.create("baz", "qux")), "Cookie: foo=; bar=; baz=qux");
  }

  public static void assertParses(String string, CookieHeader cookieHeader) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, cookieHeader);
  }

}
