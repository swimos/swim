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

public class LanguageRangeSpec {
  public void assertParses(String string, LanguageRange language) {
    HttpAssertions.assertParses(Http.standardParser().languageRangeParser(), string, language);
  }

  @Test
  public void parseLanguageRanges() {
    assertParses("*", LanguageRange.star());
    assertParses("en", LanguageRange.from("en"));
    assertParses("en-US", LanguageRange.from("en", "US"));
  }

  @Test
  public void writeLanguageRanges() {
    assertWrites(LanguageRange.star(), "*");
    assertWrites(LanguageRange.from("en"), "en");
    assertWrites(LanguageRange.from("en", "US"), "en-US");
  }

  @Test
  public void parseLanguageRangesWithWeights() {
    assertParses("en-US;q=0.5", LanguageRange.from("en", "US", 0.5f));
    assertParses("en-US ; q=0.5", LanguageRange.from("en", "US", 0.5f));
  }

  @Test
  public void writeLanguageRangesWithWeights() {
    assertWrites(LanguageRange.from("en", "US", 0.5f), "en-US; q=0.5");
  }
}
