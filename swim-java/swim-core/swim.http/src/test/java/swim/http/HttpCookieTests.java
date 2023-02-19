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

package swim.http;

import org.junit.jupiter.api.Test;

public class HttpCookieTests {

  @Test
  public void parseCookies() {
    assertParses(HttpCookie.of("foo", "bar"), "foo=bar");
    assertParses(HttpCookie.of("foo", "baz.bar"), "foo=baz.bar");
    assertParses(HttpCookie.of("foo.bar", "baz.qux"), "foo.bar=baz.qux");
    assertParses(HttpCookie.of("foo", ""), "foo=");
    assertParses(HttpCookie.of("email", "foo@example.com"), "email=foo@example.com");
  }

  @Test
  public void writeCookies() {
    assertWrites("foo=bar", HttpCookie.of("foo", "bar"));
    assertWrites("foo=baz.bar", HttpCookie.of("foo", "baz.bar"));
    assertWrites("foo.bar=baz.qux", HttpCookie.of("foo.bar", "baz.qux"));
    assertWrites("foo=", HttpCookie.of("foo", ""));
    assertWrites("email=foo@example.com", HttpCookie.of("email", "foo@example.com"));
  }

  public static void assertParses(HttpCookie expected, String string) {
    HttpAssertions.assertParses(HttpCookie.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpCookie cookie) {
    HttpAssertions.assertWrites(expected, cookie::write);
  }

}
