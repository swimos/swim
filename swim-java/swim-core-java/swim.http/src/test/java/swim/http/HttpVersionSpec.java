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

public class HttpVersionSpec {
  public void assertParses(String string, HttpVersion version) {
    HttpAssertions.assertParses(Http.standardParser().versionParser(), string, version);
  }

  @Test
  public void parseVersions() {
    assertParses("HTTP/1.1", HttpVersion.HTTP_1_1);
    assertParses("HTTP/1.0", HttpVersion.HTTP_1_0);
  }

  @Test
  public void writeVersions() {
    assertWrites(HttpVersion.HTTP_1_1, "HTTP/1.1");
    assertWrites(HttpVersion.HTTP_1_0, "HTTP/1.0");
  }
}
