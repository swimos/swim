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

public class HttpUpgradeTests {

  @Test
  public void parseUpgrades() {
    assertParses(HttpUpgrade.H2C, "h2c");
    assertParses(HttpUpgrade.WEBSOCKET, "websocket");
    assertParses(HttpUpgrade.of("foo"), "foo");
  }

  @Test
  public void writeUpgrades() {
    assertWrites("h2c", HttpUpgrade.H2C);
    assertWrites("websocket", HttpUpgrade.WEBSOCKET);
    assertWrites("foo", HttpUpgrade.of("foo"));
  }

  @Test
  public void parseUpgradesWithVersions() {
    assertParses(HttpUpgrade.of("proto", "1.0"), "proto/1.0");
    assertParses(HttpUpgrade.of("foo", "bar"), "foo/bar");
  }

  @Test
  public void writeUpgradesWithVersions() {
    assertWrites("proto/1.0", HttpUpgrade.of("proto", "1.0"));
    assertWrites("foo/bar", HttpUpgrade.of("foo", "bar"));
  }

  public static void assertParses(HttpUpgrade expected, String string) {
    HttpAssertions.assertParses(HttpUpgrade.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpUpgrade upgrade) {
    HttpAssertions.assertWrites(expected, upgrade::write);
  }

}
