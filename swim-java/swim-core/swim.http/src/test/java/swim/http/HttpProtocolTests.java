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

public class HttpProtocolTests {

  @Test
  public void parseProducts() {
    assertParses(HttpProtocol.h2c(), "h2c");
    assertParses(HttpProtocol.websocket(), "websocket");
    assertParses(HttpProtocol.create("foo"), "foo");
  }

  @Test
  public void writeProducts() {
    assertWrites("h2c", HttpProtocol.h2c());
    assertWrites("websocket", HttpProtocol.websocket());
    assertWrites("foo", HttpProtocol.create("foo"));
  }

  @Test
  public void parseProductsWithVersions() {
    assertParses(HttpProtocol.create("proto", "1.0"), "proto/1.0");
    assertParses(HttpProtocol.create("foo", "bar"), "foo/bar");
  }

  @Test
  public void writeProductsWithVersions() {
    assertWrites("proto/1.0", HttpProtocol.create("proto", "1.0"));
    assertWrites("foo/bar", HttpProtocol.create("foo", "bar"));
  }

  public static void assertParses(HttpProtocol expected, String string) {
    HttpAssertions.assertParses(HttpProtocol.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpProtocol protocol) {
    HttpAssertions.assertWrites(expected, protocol::write);
  }

}
