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
import swim.http.HttpCharset;
import swim.http.HttpHeader;
import static swim.http.HttpAssertions.assertWrites;

public class AcceptCharsetHeaderSpec {

  @Test
  public void parseAcceptCharsetHeaders() {
    assertParses("Accept-Charset: *", AcceptCharsetHeader.create(HttpCharset.star()));
    assertParses("Accept-Charset: utf-8", AcceptCharsetHeader.create(HttpCharset.create("utf-8")));
    assertParses("Accept-Charset: utf-8;q=0", AcceptCharsetHeader.create(HttpCharset.create("utf-8", 0f)));
    assertParses("Accept-Charset: utf-8; q=0", AcceptCharsetHeader.create(HttpCharset.create("utf-8", 0f)));
    assertParses("Accept-Charset: utf-8 ; q=0", AcceptCharsetHeader.create(HttpCharset.create("utf-8", 0f)));
    assertParses("Accept-Charset: utf-8; q=1", AcceptCharsetHeader.create(HttpCharset.create("utf-8", 1f)));
    assertParses("Accept-Charset: utf-8; q=1.0", AcceptCharsetHeader.create(HttpCharset.create("utf-8", 1f)));
    assertParses("Accept-Charset: utf-8; q=1.00", AcceptCharsetHeader.create(HttpCharset.create("utf-8", 1f)));
    assertParses("Accept-Charset: utf-8; q=1.000", AcceptCharsetHeader.create(HttpCharset.create("utf-8", 1f)));
    assertParses("Accept-Charset: utf-8; q=0.005", AcceptCharsetHeader.create(HttpCharset.create("utf-8", 0.005f)));
    assertParses("Accept-Charset: utf-8,iso-8859-1,*",
                 AcceptCharsetHeader.create(HttpCharset.create("utf-8"),
                                            HttpCharset.create("iso-8859-1"),
                                            HttpCharset.star()));
    assertParses("Accept-Charset: utf-8, iso-8859-1 ,*",
                 AcceptCharsetHeader.create(HttpCharset.create("utf-8"),
                                            HttpCharset.create("iso-8859-1"),
                                            HttpCharset.star()));
    assertParses("Accept-Charset: utf-8; q=1, iso-8859-1; q=0.5, *; q=0",
                 AcceptCharsetHeader.create(HttpCharset.create("utf-8", 1f),
                                            HttpCharset.create("iso-8859-1", 0.5f),
                                            HttpCharset.create("*", 0f)));
  }

  @Test
  public void writeAcceptCharsetHeaders() {
    assertWrites(AcceptCharsetHeader.create(HttpCharset.star()), "Accept-Charset: *");
    assertWrites(AcceptCharsetHeader.create(HttpCharset.create("utf-8")), "Accept-Charset: utf-8");
    assertWrites(AcceptCharsetHeader.create(HttpCharset.create("utf-8", 0f)), "Accept-Charset: utf-8; q=0");
    assertWrites(AcceptCharsetHeader.create(HttpCharset.create("utf-8", 0.005f)), "Accept-Charset: utf-8; q=0.005");
    assertWrites(AcceptCharsetHeader.create(HttpCharset.create("utf-8"),
                                            HttpCharset.create("iso-8859-1"),
                                            HttpCharset.star()),
                 "Accept-Charset: utf-8, iso-8859-1, *");
    assertWrites(AcceptCharsetHeader.create(HttpCharset.create("utf-8", 1f),
                                            HttpCharset.create("iso-8859-1", 0.5f),
                                            HttpCharset.create("*", 0f)),
                 "Accept-Charset: utf-8, iso-8859-1; q=0.5, *; q=0");
  }

  public static void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

}
