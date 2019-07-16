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

public class MediaTypeSpec {
  public void assertParses(String string, MediaType mediaType) {
    HttpAssertions.assertParses(Http.standardParser().mediaTypeParser(), string, mediaType);
  }

  @Test
  public void parseMediaTypes() {
    assertParses("text/plain", MediaType.from("text", "plain"));
  }

  @Test
  public void writeMediaTypes() {
    assertWrites(MediaType.from("text", "plain"), "text/plain");
  }

  @Test
  public void parseMediaTypesWithParams() {
    assertParses("text/html;charset=UTF-8",
                 MediaType.from("text", "html").param("charset", "UTF-8"));
    assertParses("text/html ; charset = UTF-8",
                 MediaType.from("text", "html").param("charset", "UTF-8"));
  }

  @Test
  public void writeMediaTypesWithParams() {
    assertWrites(MediaType.from("text", "html").param("charset", "UTF-8"),
                 "text/html; charset=UTF-8");
  }
}
