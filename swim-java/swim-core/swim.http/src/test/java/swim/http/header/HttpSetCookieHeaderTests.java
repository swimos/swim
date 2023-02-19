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
import swim.http.HttpAssertions;
import swim.http.HttpCookieState;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class HttpSetCookieHeaderTests {

  @Test
  public void parseSetCookieHeaderType() {
    final HttpHeaders headers = HttpHeaders.parse("Set-Cookie: foo=bar\r\n");
    assertInstanceOf(HttpSetCookieHeader.class, headers.getHeader(HttpSetCookieHeader.TYPE));
    assertEquals(HttpSetCookieHeader.of(HttpCookieState.of("foo", "bar")), headers.getHeader(HttpSetCookieHeader.TYPE));
    assertEquals("foo=bar", headers.get(HttpSetCookieHeader.TYPE));
    assertEquals(HttpCookieState.of("foo", "bar"), headers.getValue(HttpSetCookieHeader.TYPE));
  }

  @Test
  public void parseSetCookieHeaders() {
    assertParses(HttpSetCookieHeader.of(HttpCookieState.of("foo", "bar")), "Set-Cookie: foo=bar");
    assertParses(HttpSetCookieHeader.of(HttpCookieState.of("foo", "bar").withParam("Domain", "example.com")),
                 "Set-Cookie: foo=bar; Domain=example.com");
  }

  @Test
  public void writeSetCookieHeaders() {
    assertWrites("Set-Cookie: foo=bar", HttpSetCookieHeader.of(HttpCookieState.of("foo", "bar")));
    assertWrites("Set-Cookie: foo=bar; Domain=example.com",
                 HttpSetCookieHeader.of(HttpCookieState.of("foo", "bar").withParam("Domain", "example.com")));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
