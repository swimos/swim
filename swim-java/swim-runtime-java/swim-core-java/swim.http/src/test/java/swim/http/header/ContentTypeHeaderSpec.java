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

package swim.http.header;

import org.testng.annotations.Test;
import swim.http.Http;
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import static swim.http.HttpAssertions.assertWrites;

public class ContentTypeHeaderSpec {

  @Test
  public void parseContentTypeHeaders() {
    assertParses("Content-Type: text/plain", ContentTypeHeader.create("text", "plain"));
    assertParses("Content-Type: text/html;charset=UTF-8",
                 ContentTypeHeader.create("text", "html").param("charset", "UTF-8"));
    assertParses("Content-Type: text/html ; charset = UTF-8",
                 ContentTypeHeader.create("text", "html").param("charset", "UTF-8"));
  }

  @Test
  public void writeContentTypeHeaders() {
    assertWrites(ContentTypeHeader.create("text", "plain"), "Content-Type: text/plain");
    assertWrites(ContentTypeHeader.create("text", "html").param("charset", "UTF-8"),
                 "Content-Type: text/html; charset=UTF-8");
  }

  public static void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

}
