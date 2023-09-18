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

package swim.http;

import org.testng.annotations.Test;
import swim.http.header.SetCookieHeader;
import static swim.http.HttpAssertions.assertWrites;

public class SetCookieHeaderSpec {

  @Test
  public void writesCookieHeader() {
    SetCookieHeader header = SetCookieHeader.create(Cookie.create("foo", "bar"));
    header.setSecure();
    assertWrites(header, "Set-Cookie: foo=bar; Secure");
    header.setHttpOnly();
    assertWrites(header, "Set-Cookie: foo=bar; HttpOnly; Secure");
    header.setMaxAge(1800);
    assertWrites(header, "Set-Cookie: foo=bar; HttpOnly; Max-Age=1800; Secure");
    header.setDomain("example.com");
    assertWrites(header, "Set-Cookie: foo=bar; Domain=example.com; HttpOnly; Max-Age=1800; Secure");
    header.setDomain("example.com");
    assertWrites(header, "Set-Cookie: foo=bar; Domain=example.com; HttpOnly; Max-Age=1800; Secure");
    header.setPath("/my/custom/path");
    assertWrites(header, "Set-Cookie: foo=bar; Domain=example.com; Path=/my/custom/path; HttpOnly; Max-Age=1800; Secure");
    header.setSameSite(SetCookieHeader.SameSite.Strict);
    assertWrites(header, "Set-Cookie: foo=bar; Domain=example.com; Path=/my/custom/path; SameSite=Strict; HttpOnly; Max-Age=1800; Secure");
    header.expire();
    assertWrites(header, "Set-Cookie: foo=bar; Domain=example.com; Path=/my/custom/path; SameSite=Strict; HttpOnly; Max-Age=0; Secure");
    header.unsetSecure();
    assertWrites(header, "Set-Cookie: foo=bar; Domain=example.com; Path=/my/custom/path; SameSite=Strict; HttpOnly; Max-Age=0");
    header.unsetHttpOnly();
    assertWrites(header, "Set-Cookie: foo=bar; Domain=example.com; Path=/my/custom/path; SameSite=Strict; Max-Age=0");
    header.unsetMaxAge();
    assertWrites(header, "Set-Cookie: foo=bar; Domain=example.com; Path=/my/custom/path; SameSite=Strict");
    header.unsetDomain();
    assertWrites(header, "Set-Cookie: foo=bar; Path=/my/custom/path; SameSite=Strict");
    header.unsetPath();
    assertWrites(header, "Set-Cookie: foo=bar; SameSite=Strict");
    header.unsetSameSite();
    assertWrites(header, "Set-Cookie: foo=bar");

    header = SetCookieHeader.create(Cookie.create("baz"));
    header.setSecure();
    assertWrites(header, "Set-Cookie: baz=; Secure");
    header.setHttpOnly();
    assertWrites(header, "Set-Cookie: baz=; HttpOnly; Secure");
    header.setMaxAge(1800);
    assertWrites(header, "Set-Cookie: baz=; HttpOnly; Max-Age=1800; Secure");
    header.setDomain("example.com");
    assertWrites(header, "Set-Cookie: baz=; Domain=example.com; HttpOnly; Max-Age=1800; Secure");
    header.setDomain("example.com");
    assertWrites(header, "Set-Cookie: baz=; Domain=example.com; HttpOnly; Max-Age=1800; Secure");
    header.setPath("/my/custom/path");
    assertWrites(header, "Set-Cookie: baz=; Domain=example.com; Path=/my/custom/path; HttpOnly; Max-Age=1800; Secure");
    header.setSameSite(SetCookieHeader.SameSite.Strict);
    assertWrites(header, "Set-Cookie: baz=; Domain=example.com; Path=/my/custom/path; SameSite=Strict; HttpOnly; Max-Age=1800; Secure");
    header.expire();
    assertWrites(header, "Set-Cookie: baz=; Domain=example.com; Path=/my/custom/path; SameSite=Strict; HttpOnly; Max-Age=0; Secure");
    header.unsetSecure();
    assertWrites(header, "Set-Cookie: baz=; Domain=example.com; Path=/my/custom/path; SameSite=Strict; HttpOnly; Max-Age=0");
    header.unsetHttpOnly();
    assertWrites(header, "Set-Cookie: baz=; Domain=example.com; Path=/my/custom/path; SameSite=Strict; Max-Age=0");
    header.unsetMaxAge();
    assertWrites(header, "Set-Cookie: baz=; Domain=example.com; Path=/my/custom/path; SameSite=Strict");
    header.unsetDomain();
    assertWrites(header, "Set-Cookie: baz=; Path=/my/custom/path; SameSite=Strict");
    header.unsetPath();
    assertWrites(header, "Set-Cookie: baz=; SameSite=Strict");
    header.unsetSameSite();
    assertWrites(header, "Set-Cookie: baz=");
  }

}
