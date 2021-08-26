// Copyright 2015-2021 Swim Inc.
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

  @Test
  public void parseLanguageRanges() {
    assertParses("*", LanguageRange.star());
    assertParses("en", LanguageRange.create("en"));
    assertParses("en-US", LanguageRange.create("en", "US"));
  }

  @Test
  public void writeLanguageRanges() {
    assertWrites(LanguageRange.star(), "*");
    assertWrites(LanguageRange.create("en"), "en");
    assertWrites(LanguageRange.create("en", "US"), "en-US");
  }

  @Test
  public void parseLanguageRangesWithWeights() {
    assertParses("en-US;q=0.5", LanguageRange.create("en", "US", 0.5f));
    assertParses("en-US ; q=0.5", LanguageRange.create("en", "US", 0.5f));
  }

  @Test
  public void writeLanguageRangesWithWeights() {
    assertWrites(LanguageRange.create("en", "US", 0.5f), "en-US; q=0.5");
  }

  public static void assertParses(String string, LanguageRange language) {
    HttpAssertions.assertParses(Http.standardParser().languageRangeParser(), string, language);
  }

}
