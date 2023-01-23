// Copyright 2015-2023 Swim.inc
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
