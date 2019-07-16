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
import swim.http.MediaRange;
import static swim.http.HttpAssertions.assertWrites;

public class AcceptSpec {
  public void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

  @Test
  public void parseAcceptHeaders() {
    assertParses("Accept: */*", Accept.from(MediaRange.from("*", "*")));
    assertParses("Accept: text/*;q=0.5;charset=UTF-8",
                 Accept.from(MediaRange.from("text", "*", 0.5f).param("charset", "UTF-8")));
    assertParses("Accept: text/* ; q=0.5 ; charset = UTF-8",
                 Accept.from(MediaRange.from("text", "*", 0.5f).param("charset", "UTF-8")));
    assertParses("Accept: text/*;q=0.3, text/html;q=0.7, text/html;level=1, text/html;q=0.4;level=2, */*;q=0.5",
                 Accept.from(MediaRange.from("text", "*", 0.3f),
                             MediaRange.from("text", "html", 0.7f),
                             MediaRange.from("text", "html").param("level", "1"),
                             MediaRange.from("text", "html", 0.4f).param("level", "2"),
                             MediaRange.from("*", "*", 0.5f)));
  }

  @Test
  public void writeAcceptHeaders() {
    assertWrites(Accept.from(MediaRange.from("*", "*")), "Accept: */*");
    assertWrites(Accept.from(MediaRange.from("text", "*", 0.5f).param("charset", "UTF-8")),
                 "Accept: text/*; q=0.5; charset=UTF-8");
    assertWrites(Accept.from(MediaRange.from("text", "*", 0.3f),
                             MediaRange.from("text", "html", 0.7f),
                             MediaRange.from("text", "html").param("level", "1"),
                             MediaRange.from("text", "html", 0.4f).param("level", "2"),
                             MediaRange.from("*", "*", 0.5f)),
                 "Accept: text/*; q=0.3, text/html; q=0.7, text/html; level=1, text/html; q=0.4; level=2, */*; q=0.5");
  }
}
