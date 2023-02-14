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

public class HttpMethodTests {

  @Test
  public void parseMethods() {
    assertParses(HttpMethod.GET, "GET");
    assertParses(HttpMethod.HEAD, "HEAD");
    assertParses(HttpMethod.POST, "POST");
    assertParses(HttpMethod.PUT, "PUT");
    assertParses(HttpMethod.DELETE, "DELETE");
    assertParses(HttpMethod.CONNECT, "CONNECT");
    assertParses(HttpMethod.OPTIONS, "OPTIONS");
    assertParses(HttpMethod.TRACE, "TRACE");
  }

  @Test
  public void writeMethods() {
    assertWrites("GET", HttpMethod.GET);
    assertWrites("HEAD", HttpMethod.HEAD);
    assertWrites("POST", HttpMethod.POST);
    assertWrites("PUT", HttpMethod.PUT);
    assertWrites("DELETE", HttpMethod.DELETE);
    assertWrites("CONNECT", HttpMethod.CONNECT);
    assertWrites("OPTIONS", HttpMethod.OPTIONS);
    assertWrites("TRACE", HttpMethod.TRACE);
  }

  public static void assertParses(HttpMethod expected, String string) {
    HttpAssertions.assertParses(HttpMethod.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpMethod method) {
    HttpAssertions.assertWrites(expected, method::write);
  }

}
