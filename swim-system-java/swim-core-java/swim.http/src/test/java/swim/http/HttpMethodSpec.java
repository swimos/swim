// Copyright 2015-2019 SWIM.AI inc.
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

public class HttpMethodSpec {
  public void assertParses(String string, HttpMethod method) {
    HttpAssertions.assertParses(Http.standardParser().methodParser(), string, method);
  }

  @Test
  public void parseMethods() {
    assertParses("GET", HttpMethod.GET);
    assertParses("HEAD", HttpMethod.HEAD);
    assertParses("POST", HttpMethod.POST);
    assertParses("PUT", HttpMethod.PUT);
    assertParses("DELETE", HttpMethod.DELETE);
    assertParses("CONNECT", HttpMethod.CONNECT);
    assertParses("OPTIONS", HttpMethod.OPTIONS);
    assertParses("TRACE", HttpMethod.TRACE);
  }

  @Test
  public void writeMethods() {
    assertWrites(HttpMethod.GET, "GET");
    assertWrites(HttpMethod.HEAD, "HEAD");
    assertWrites(HttpMethod.POST, "POST");
    assertWrites(HttpMethod.PUT, "PUT");
    assertWrites(HttpMethod.DELETE, "DELETE");
    assertWrites(HttpMethod.CONNECT, "CONNECT");
    assertWrites(HttpMethod.OPTIONS, "OPTIONS");
    assertWrites(HttpMethod.TRACE, "TRACE");
  }
}
