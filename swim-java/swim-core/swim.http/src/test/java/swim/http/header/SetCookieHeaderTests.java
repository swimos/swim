// Copyright 2015-2023 Nstream, inc.
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
import swim.http.HttpAssertions;
import swim.http.HttpCookieState;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class SetCookieHeaderTests {

  @Test
  public void parseSetCookieHeaderType() throws ParseException, HttpException {
    final HttpHeaders headers = HttpHeaders.parse("Set-Cookie: foo=bar\r\n").getNonNull();
    assertInstanceOf(SetCookieHeader.class, headers.getHeader(SetCookieHeader.TYPE));
    assertEquals(SetCookieHeader.of(HttpCookieState.of("foo", "bar")),
                 headers.getHeader(SetCookieHeader.TYPE));
    assertEquals("foo=bar",
                 headers.get(SetCookieHeader.TYPE));
    assertEquals(HttpCookieState.of("foo", "bar"),
                 headers.getValue(SetCookieHeader.TYPE));
  }

  @Test
  public void parseSetCookieHeaders() {
    assertParses(SetCookieHeader.of(HttpCookieState.of("foo", "bar")),
                 "Set-Cookie: foo=bar");
    assertParses(SetCookieHeader.of(HttpCookieState.of("foo", "bar").withParam("Domain", "example.com")),
                 "Set-Cookie: foo=bar; Domain=example.com");
  }

  @Test
  public void writeSetCookieHeaders() {
    assertWrites("Set-Cookie: foo=bar",
                 SetCookieHeader.of(HttpCookieState.of("foo", "bar")));
    assertWrites("Set-Cookie: foo=bar; Domain=example.com",
                 SetCookieHeader.of(HttpCookieState.of("foo", "bar").withParam("Domain", "example.com")));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
