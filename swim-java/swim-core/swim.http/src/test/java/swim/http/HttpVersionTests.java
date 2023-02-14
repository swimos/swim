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

public class HttpVersionTests {

  @Test
  public void parseVersions() {
    assertParses(HttpVersion.HTTP_1_1, "HTTP/1.1");
    assertParses(HttpVersion.HTTP_1_0, "HTTP/1.0");
  }

  @Test
  public void writeVersions() {
    assertWrites("HTTP/1.1", HttpVersion.HTTP_1_1);
    assertWrites("HTTP/1.0", HttpVersion.HTTP_1_0);
  }

  public static void assertParses(HttpVersion expected, String string) {
    HttpAssertions.assertParses(HttpVersion.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpVersion version) {
    HttpAssertions.assertWrites(expected, version::write);
  }

}
