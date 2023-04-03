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
import swim.codec.ParseException;
import swim.collections.FingerTrieList;
import swim.http.HttpAssertions;
import swim.http.HttpCookie;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class CookieHeaderTests {

  @Test
  public void parseCookieHeaderType() throws ParseException, HttpException {
    final HttpHeaders headers = HttpHeaders.parse("Cookie: foo=bar\r\n").getNonNull();
    assertInstanceOf(CookieHeader.class, headers.getHeader(CookieHeader.TYPE));
    assertEquals(CookieHeader.of(HttpCookie.of("foo", "bar")),
                 headers.getHeader(CookieHeader.TYPE));
    assertEquals("foo=bar",
                 headers.get(CookieHeader.TYPE));
    assertEquals(FingerTrieList.of(HttpCookie.of("foo", "bar")),
                 headers.getValue(CookieHeader.TYPE));
  }

  @Test
  public void parseCookieHeaders() {
    assertParses(CookieHeader.of(HttpCookie.of("foo", "bar")),
                 "Cookie: foo=bar");
    assertParses(CookieHeader.of(HttpCookie.of("foo", ""), HttpCookie.of("bar", "baz")),
                 "Cookie: foo=; bar=baz");
    assertParses(CookieHeader.of(HttpCookie.of("foo", "bar"), HttpCookie.of("baz", "")),
                 "Cookie: foo=bar; baz=");
    assertParses(CookieHeader.of(HttpCookie.of("foo", "bar"), HttpCookie.of("baz", "qux")),
                 "Cookie: foo=bar; baz=qux");
  }

  @Test
  public void writeCookieHeaders() {
    assertWrites("Cookie: foo=bar",
                 CookieHeader.of(HttpCookie.of("foo", "bar")));
    assertWrites("Cookie: foo=; bar=baz",
                 CookieHeader.of(HttpCookie.of("foo", ""), HttpCookie.of("bar", "baz")));
    assertWrites("Cookie: foo=bar; baz=",
                 CookieHeader.of(HttpCookie.of("foo", "bar"), HttpCookie.of("baz", "")));
    assertWrites("Cookie: foo=bar; baz=qux",
                 CookieHeader.of(HttpCookie.of("foo", "bar"), HttpCookie.of("baz", "qux")));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
