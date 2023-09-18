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

package swim.http.header;

import org.testng.annotations.Test;
import swim.http.Http;
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import swim.http.HttpMethod;
import static swim.http.HttpAssertions.assertWrites;

public class AllowHeaderSpec {

  @Test
  public void parseAllowHeaders() {
    assertParses("Allow: GET", AllowHeader.create(HttpMethod.GET));
    assertParses("Allow: GET,PUT", AllowHeader.create(HttpMethod.GET, HttpMethod.PUT));
    assertParses("Allow: GET, PUT", AllowHeader.create(HttpMethod.GET, HttpMethod.PUT));
    assertParses("Allow: GET , PUT", AllowHeader.create(HttpMethod.GET, HttpMethod.PUT));
  }

  @Test
  public void writeAllowHeaders() {
    assertWrites(AllowHeader.create(HttpMethod.GET), "Allow: GET");
    assertWrites(AllowHeader.create(HttpMethod.GET, HttpMethod.PUT), "Allow: GET, PUT");
  }

  public static void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

}
