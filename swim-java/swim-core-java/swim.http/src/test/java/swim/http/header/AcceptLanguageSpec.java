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

package swim.http.header;

import org.testng.annotations.Test;
import swim.http.Http;
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import swim.http.LanguageRange;
import static swim.http.HttpAssertions.assertWrites;

public class AcceptLanguageSpec {
  public void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

  @Test
  public void parseAcceptLanguageHeaders() {
    assertParses("Accept-Language: *", AcceptLanguage.from(LanguageRange.star()));
    assertParses("Accept-Language: en-US", AcceptLanguage.from(LanguageRange.from("en", "US")));
    assertParses("Accept-Language: en-US;q=0", AcceptLanguage.from(LanguageRange.from("en", "US", 0f)));
    assertParses("Accept-Language: en-US; q=0", AcceptLanguage.from(LanguageRange.from("en", "US", 0f)));
    assertParses("Accept-Language: en-US ; q=0", AcceptLanguage.from(LanguageRange.from("en", "US", 0f)));
    assertParses("Accept-Language: en-US; q=1", AcceptLanguage.from(LanguageRange.from("en", "US", 1f)));
    assertParses("Accept-Language: en-US; q=1.0", AcceptLanguage.from(LanguageRange.from("en", "US", 1f)));
    assertParses("Accept-Language: en-US; q=1.00", AcceptLanguage.from(LanguageRange.from("en", "US", 1f)));
    assertParses("Accept-Language: en-US; q=1.000", AcceptLanguage.from(LanguageRange.from("en", "US", 1f)));
    assertParses("Accept-Language: en-US; q=0.005", AcceptLanguage.from(LanguageRange.from("en", "US", 0.005f)));
    assertParses("Accept-Language: en-US,en-UK,*",
                 AcceptLanguage.from(LanguageRange.from("en", "US"),
                                     LanguageRange.from("en", "UK"),
                                     LanguageRange.star()));
    assertParses("Accept-Language: en-US, en-UK ,*",
                 AcceptLanguage.from(LanguageRange.from("en", "US"),
                                     LanguageRange.from("en", "UK"),
                                     LanguageRange.star()));
    assertParses("Accept-Language: en-US; q=1, en-UK; q=0.5, *; q=0",
                 AcceptLanguage.from(LanguageRange.from("en", "US", 1f),
                                     LanguageRange.from("en", "UK", 0.5f),
                                     LanguageRange.from("*", 0f)));
  }

  @Test
  public void writeAcceptLanguageHeaders() {
    assertWrites(AcceptLanguage.from(LanguageRange.star()), "Accept-Language: *");
    assertWrites(AcceptLanguage.from(LanguageRange.from("en", "US")), "Accept-Language: en-US");
    assertWrites(AcceptLanguage.from(LanguageRange.from("en", "US", 0f)), "Accept-Language: en-US; q=0");
    assertWrites(AcceptLanguage.from(LanguageRange.from("en", "US", 0.005f)), "Accept-Language: en-US; q=0.005");
    assertWrites(AcceptLanguage.from(LanguageRange.from("en", "US"),
                                     LanguageRange.from("en", "UK"),
                                     LanguageRange.star()),
                 "Accept-Language: en-US, en-UK, *");
    assertWrites(AcceptLanguage.from(LanguageRange.from("en", "US", 1f),
                                     LanguageRange.from("en", "UK", 0.5f),
                                     LanguageRange.from("*", 0f)),
                 "Accept-Language: en-US, en-UK; q=0.5, *; q=0");
  }
}
