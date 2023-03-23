// Copyright 2015-2022 Swim.inc
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

import org.junit.jupiter.api.Test;
import swim.codec.MediaRange;
import swim.collections.FingerTrieList;
import swim.http.HttpAssertions;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class AcceptHeaderTests {

  @Test
  public void parseAcceptHeaderType() throws HttpException {
    final HttpHeaders headers = HttpHeaders.parse("Accept: */*\r\n");
    assertInstanceOf(AcceptHeader.class, headers.getHeader(AcceptHeader.TYPE));
    assertEquals(AcceptHeader.of(MediaRange.of("*", "*")),
                 headers.getHeader(AcceptHeader.TYPE));
    assertEquals("*/*",
                 headers.get(AcceptHeader.TYPE));
    assertEquals(FingerTrieList.of(MediaRange.of("*", "*")),
                 headers.getValue(AcceptHeader.TYPE));
  }

  @Test
  public void parseAcceptHeaders() {
    assertParses(AcceptHeader.of(MediaRange.of("*", "*")),
                 "Accept: */*");
    assertParses(AcceptHeader.of(MediaRange.of("text", "*").withParam("charset", "UTF-8").withWeight(500)),
                 "Accept: text/*; charset=UTF-8; q=0.5");
    assertParses(AcceptHeader.of(MediaRange.of("text", "*").withWeight(300),
                                 MediaRange.of("text", "html").withWeight(700),
                                 MediaRange.of("text", "html").withExtParam("level", "1"),
                                 MediaRange.of("text", "html").withWeight(400).withExtParam("level", "2"),
                                 MediaRange.of("*", "*").withWeight(500)),
                 "Accept: text/*; q=0.3, text/html; q=0.7, text/html; q=1; level=1, text/html; q=0.4; level=2, */*; q=0.5");
  }

  @Test
  public void writeAcceptHeaders() {
    assertWrites("Accept: */*",
                 AcceptHeader.of(MediaRange.of("*", "*")));
    assertWrites("Accept: text/*; charset=UTF-8; q=0.5",
                 AcceptHeader.of(MediaRange.of("text", "*").withParam("charset", "UTF-8").withWeight(500)));
    assertWrites("Accept: text/*; q=0.3, text/html; q=0.7, text/html; q=1; level=1, text/html; q=0.4; level=2, */*; q=0.5",
                 AcceptHeader.of(MediaRange.of("text", "*").withWeight(300),
                                 MediaRange.of("text", "html").withWeight(700),
                                 MediaRange.of("text", "html").withExtParam("level", "1"),
                                 MediaRange.of("text", "html").withWeight(400).withExtParam("level", "2"),
                                 MediaRange.of("*", "*").withWeight(500)));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
