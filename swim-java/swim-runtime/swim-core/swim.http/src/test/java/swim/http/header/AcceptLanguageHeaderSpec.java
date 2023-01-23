// Copyright 2015-2023 Swim.inc
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

public class AcceptLanguageHeaderSpec {

  @Test
  public void parseAcceptLanguageHeaders() {
    assertParses("Accept-Language: *", AcceptLanguageHeader.create(LanguageRange.star()));
    assertParses("Accept-Language: en-US", AcceptLanguageHeader.create(LanguageRange.create("en", "US")));
    assertParses("Accept-Language: en-US;q=0", AcceptLanguageHeader.create(LanguageRange.create("en", "US", 0f)));
    assertParses("Accept-Language: en-US; q=0", AcceptLanguageHeader.create(LanguageRange.create("en", "US", 0f)));
    assertParses("Accept-Language: en-US ; q=0", AcceptLanguageHeader.create(LanguageRange.create("en", "US", 0f)));
    assertParses("Accept-Language: en-US; q=1", AcceptLanguageHeader.create(LanguageRange.create("en", "US", 1f)));
    assertParses("Accept-Language: en-US; q=1.0", AcceptLanguageHeader.create(LanguageRange.create("en", "US", 1f)));
    assertParses("Accept-Language: en-US; q=1.00", AcceptLanguageHeader.create(LanguageRange.create("en", "US", 1f)));
    assertParses("Accept-Language: en-US; q=1.000", AcceptLanguageHeader.create(LanguageRange.create("en", "US", 1f)));
    assertParses("Accept-Language: en-US; q=0.005", AcceptLanguageHeader.create(LanguageRange.create("en", "US", 0.005f)));
    assertParses("Accept-Language: en-US,en-UK,*",
                 AcceptLanguageHeader.create(LanguageRange.create("en", "US"),
                                             LanguageRange.create("en", "UK"),
                                             LanguageRange.star()));
    assertParses("Accept-Language: en-US, en-UK ,*",
                 AcceptLanguageHeader.create(LanguageRange.create("en", "US"),
                                             LanguageRange.create("en", "UK"),
                                             LanguageRange.star()));
    assertParses("Accept-Language: en-US; q=1, en-UK; q=0.5, *; q=0",
                 AcceptLanguageHeader.create(LanguageRange.create("en", "US", 1f),
                                             LanguageRange.create("en", "UK", 0.5f),
                                             LanguageRange.create("*", 0f)));
  }

  @Test
  public void writeAcceptLanguageHeaders() {
    assertWrites(AcceptLanguageHeader.create(LanguageRange.star()), "Accept-Language: *");
    assertWrites(AcceptLanguageHeader.create(LanguageRange.create("en", "US")), "Accept-Language: en-US");
    assertWrites(AcceptLanguageHeader.create(LanguageRange.create("en", "US", 0f)), "Accept-Language: en-US; q=0");
    assertWrites(AcceptLanguageHeader.create(LanguageRange.create("en", "US", 0.005f)), "Accept-Language: en-US; q=0.005");
    assertWrites(AcceptLanguageHeader.create(LanguageRange.create("en", "US"),
                                             LanguageRange.create("en", "UK"),
                                             LanguageRange.star()),
                 "Accept-Language: en-US, en-UK, *");
    assertWrites(AcceptLanguageHeader.create(LanguageRange.create("en", "US", 1f),
                                             LanguageRange.create("en", "UK", 0.5f),
                                             LanguageRange.create("*", 0f)),
                 "Accept-Language: en-US, en-UK; q=0.5, *; q=0");
  }

  public static void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

}
