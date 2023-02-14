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

public class HttpCookieStateTests {

  @Test
  public void parseCookieStates() {
    assertParses(HttpCookieState.create("foo", "bar"), "foo=bar");
    assertParses(HttpCookieState.create("foo", "baz.bar"), "foo=baz.bar");
    assertParses(HttpCookieState.create("foo.bar", "baz.qux"), "foo.bar=baz.qux");
    assertParses(HttpCookieState.create("foo", ""), "foo=");
    assertParses(HttpCookieState.create("email", "foo@example.com"), "email=foo@example.com");
  }

  @Test
  public void writeCookieStates() {
    assertWrites("foo=bar", HttpCookieState.create("foo", "bar"));
    assertWrites("foo=baz.bar", HttpCookieState.create("foo", "baz.bar"));
    assertWrites("foo.bar=baz.qux", HttpCookieState.create("foo.bar", "baz.qux"));
    assertWrites("foo=", HttpCookieState.create("foo", ""));
    assertWrites("email=foo@example.com", HttpCookieState.create("email", "foo@example.com"));
  }

  @Test
  public void parseCookieStatesWithParams() {
    assertParses(HttpCookieState.create("foo", "bar").withParam("Path", "/"),
                 "foo=bar; Path=/");
    assertParses(HttpCookieState.create("foo", "bar").withParam("Path", "/")
                                                     .withParam("Domain", "example.com"),
                 "foo=bar; Path=/; Domain=example.com");
    assertParses(HttpCookieState.create("foo", "bar").withParam("HttpOnly"),
                 "foo=bar; HttpOnly");
    assertParses(HttpCookieState.create("foo", "bar").withParam("Secure")
                                                     .withParam("HttpOnly"),
                 "foo=bar; Secure; HttpOnly");
    assertParses(HttpCookieState.create("foo", "bar").withParam("Expires", "Wed, 09 Jun 2021 10:18:14 GMT"),
                 "foo=bar; Expires=Wed, 09 Jun 2021 10:18:14 GMT");
    assertParses(HttpCookieState.create("foo", "bar").withParam("Path", "/")
                                                     .withParam("Domain", "example.com")
                                                     .withParam("Expires", "Wed, 09 Jun 2021 10:18:14 GMT")
                                                     .withParam("Secure")
                                                     .withParam("HttpOnly"),
                 "foo=bar; Path=/; Domain=example.com; Expires=Wed, 09 Jun 2021 10:18:14 GMT; Secure; HttpOnly");
  }

  @Test
  public void writeCookieStatesWithParams() {
    assertWrites("foo=bar; Path=/",
                 HttpCookieState.create("foo", "bar").withParam("Path", "/"));
    assertWrites("foo=bar; Path=/; Domain=example.com",
                 HttpCookieState.create("foo", "bar").withParam("Path", "/")
                                                     .withParam("Domain", "example.com"));
    assertWrites("foo=bar; HttpOnly",
                 HttpCookieState.create("foo", "bar").withParam("HttpOnly"));
    assertWrites("foo=bar; Secure; HttpOnly",
                 HttpCookieState.create("foo", "bar").withParam("Secure")
                                                     .withParam("HttpOnly"));
    assertWrites("foo=bar; Expires=Wed, 09 Jun 2021 10:18:14 GMT",
                 HttpCookieState.create("foo", "bar").withParam("Expires", "Wed, 09 Jun 2021 10:18:14 GMT"));
    assertWrites("foo=bar; Path=/; Domain=example.com; Expires=Wed, 09 Jun 2021 10:18:14 GMT; Secure; HttpOnly",
                 HttpCookieState.create("foo", "bar").withParam("Path", "/")
                                                     .withParam("Domain", "example.com")
                                                     .withParam("Expires", "Wed, 09 Jun 2021 10:18:14 GMT")
                                                     .withParam("Secure")
                                                     .withParam("HttpOnly"));
  }

  public static void assertParses(HttpCookieState expected, String string) {
    HttpAssertions.assertParses(HttpCookieState.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpCookieState cookie) {
    HttpAssertions.assertWrites(expected, cookie::write);
  }

}
