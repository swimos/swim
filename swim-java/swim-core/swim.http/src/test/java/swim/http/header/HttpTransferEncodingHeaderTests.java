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
import swim.collections.FingerTrieList;
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import swim.http.HttpTransferCoding;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class HttpTransferEncodingHeaderTests {

  @Test
  public void parseTransferEncodingHeaderType() {
    final HttpHeaders headers = HttpHeaders.parse("Transfer-Encoding: chunked\r\n");
    assertInstanceOf(HttpTransferEncodingHeader.class, headers.getHeader(HttpHeader.TRANSFER_ENCODING));
    assertEquals(HttpTransferEncodingHeader.create(HttpTransferCoding.chunked()), headers.getHeader(HttpHeader.TRANSFER_ENCODING));
    assertEquals("chunked", headers.get(HttpHeader.TRANSFER_ENCODING));
    assertEquals(FingerTrieList.of(HttpTransferCoding.chunked()), headers.getValue(HttpHeader.TRANSFER_ENCODING));
  }

  @Test
  public void parseTransferEncodingHeaders() {
    assertParses(HttpTransferEncodingHeader.create(HttpTransferCoding.chunked()),
                 "Transfer-Encoding: chunked");
    assertParses(HttpTransferEncodingHeader.create(HttpTransferCoding.create("enhance")),
                 "Transfer-Encoding: enhance");
    assertParses(HttpTransferEncodingHeader.create(HttpTransferCoding.gzip(), HttpTransferCoding.chunked()),
                 "Transfer-Encoding: gzip, chunked");
    assertParses(HttpTransferEncodingHeader.create(HttpTransferCoding.create("enhance").withParam("zoom", "500x")),
                 "Transfer-Encoding: enhance; zoom=500x");
    assertParses(HttpTransferEncodingHeader.create(HttpTransferCoding.create("enhance").withParam("zoom", "500x").withParam("quality", "very good")),
                 "Transfer-Encoding: enhance; zoom=500x; quality=\"very good\"");
    assertParses(HttpTransferEncodingHeader.create(HttpTransferCoding.create("enhance").withParam("zoom", "500x").withParam("quality", "very good"),
                                                   HttpTransferCoding.create("time").withParam("dilation", "on")),
                 "Transfer-Encoding: enhance; zoom=500x; quality=\"very good\", time; dilation=on");
  }

  @Test
  public void writeTransferEncodingHeaders() {
    assertWrites("Transfer-Encoding: chunked",
                 HttpTransferEncodingHeader.create(HttpTransferCoding.chunked()));
    assertWrites("Transfer-Encoding: enhance",
                 HttpTransferEncodingHeader.create(HttpTransferCoding.create("enhance")));
    assertWrites("Transfer-Encoding: gzip, chunked",
                 HttpTransferEncodingHeader.create(HttpTransferCoding.gzip(), HttpTransferCoding.chunked()));
    assertWrites("Transfer-Encoding: enhance; zoom=500x",
                 HttpTransferEncodingHeader.create(HttpTransferCoding.create("enhance").withParam("zoom", "500x")));
    assertWrites("Transfer-Encoding: enhance; zoom=500x; quality=\"very good\"",
                 HttpTransferEncodingHeader.create(HttpTransferCoding.create("enhance").withParam("zoom", "500x").withParam("quality", "very good")));
    assertWrites("Transfer-Encoding: enhance; zoom=500x; quality=\"very good\", time; dilation=on",
                 HttpTransferEncodingHeader.create(HttpTransferCoding.create("enhance").withParam("zoom", "500x").withParam("quality", "very good"),
                                                   HttpTransferCoding.create("time").withParam("dilation", "on")));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
