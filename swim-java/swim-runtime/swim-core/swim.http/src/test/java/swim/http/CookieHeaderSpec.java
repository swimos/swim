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
