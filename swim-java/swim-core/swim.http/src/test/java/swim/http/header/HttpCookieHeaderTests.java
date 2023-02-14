// Copyright 2015-2022 Swim.inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.http.header;

import org.junit.jupiter.api.Test;
import swim.collections.FingerTrieList;
import swim.http.HttpAssertions;
import swim.http.HttpCookie;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class HttpCookieHeaderTests {

  @Test
  public void parseCookieHeaderType() {
    final HttpHeaders headers = HttpHeaders.parse("Cookie: foo=bar\r\n");
    assertInstanceOf(HttpCookieHeader.class, headers.getHeader(HttpHeader.COOKIE));
    assertEquals(HttpCookieHeader.create(HttpCookie.create("foo", "bar")), headers.getHeader(HttpHeader.COOKIE));
    assertEquals("foo=bar", headers.get(HttpHeader.COOKIE));
    assertEquals(FingerTrieList.of(HttpCookie.create("foo", "bar")), headers.getValue(HttpHeader.COOKIE));
  }

  @Test
  public void parseCookieHeaders() {
    assertParses(HttpCookieHeader.create(HttpCookie.create("foo", "bar")),
                 "Cookie: foo=bar");
    assertParses(HttpCookieHeader.create(HttpCookie.create("foo", ""), HttpCookie.create("bar", "baz")),
                 "Cookie: foo=; bar=baz");
    assertParses(HttpCookieHeader.create(HttpCookie.create("foo", "bar"), HttpCookie.create("baz", "")),
                 "Cookie: foo=bar; baz=");
    assertParses(HttpCookieHeader.create(HttpCookie.create("foo", "bar"), HttpCookie.create("baz", "qux")),
                 "Cookie: foo=bar; baz=qux");
  }

  @Test
  public void writeCookieHeaders() {
    assertWrites("Cookie: foo=bar",
                 HttpCookieHeader.create(HttpCookie.create("foo", "bar")));
    assertWrites("Cookie: foo=; bar=baz",
                 HttpCookieHeader.create(HttpCookie.create("foo", ""), HttpCookie.create("bar", "baz")));
    assertWrites("Cookie: foo=bar; baz=",
                 HttpCookieHeader.create(HttpCookie.create("foo", "bar"), HttpCookie.create("baz", "")));
    assertWrites("Cookie: foo=bar; baz=qux",
                 HttpCookieHeader.create(HttpCookie.create("foo", "bar"), HttpCookie.create("baz", "qux")));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
