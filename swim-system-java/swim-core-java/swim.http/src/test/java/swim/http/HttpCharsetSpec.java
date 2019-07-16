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

public class HttpCharsetSpec {
  public void assertParses(String string, HttpCharset charset) {
    HttpAssertions.assertParses(Http.standardParser().charsetParser(), string, charset);
  }

  @Test
  public void parseCharsets() {
    assertParses("*", HttpCharset.star());
    assertParses("utf-8", HttpCharset.from("utf-8"));
  }

  @Test
  public void writeCharsets() {
    assertWrites(HttpCharset.star(), "*");
    assertWrites(HttpCharset.from("utf-8"), "utf-8");
  }

  @Test
  public void parseCharsetsWithWeights() {
    assertParses("utf-8;q=0.5", HttpCharset.from("utf-8", 0.5f));
    assertParses("utf-8 ; q=0.5", HttpCharset.from("utf-8", 0.5f));
  }

  @Test
  public void writeCharsetsWithWeights() {
    assertWrites(HttpCharset.from("utf-8", 0.5f), "utf-8; q=0.5");
  }
}
