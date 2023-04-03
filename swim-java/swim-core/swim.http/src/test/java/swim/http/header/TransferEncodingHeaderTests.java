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
import swim.codec.ParseException;
import swim.collections.FingerTrieList;
import swim.http.HttpAssertions;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import swim.http.HttpTransferCoding;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

public class TransferEncodingHeaderTests {

  @Test
  public void parseTransferEncodingHeaderType() throws ParseException, HttpException {
    final HttpHeaders headers = HttpHeaders.parse("Transfer-Encoding: chunked\r\n").getNonNull();
    assertInstanceOf(TransferEncodingHeader.class, headers.getHeader(TransferEncodingHeader.TYPE));
    assertEquals(TransferEncodingHeader.of(HttpTransferCoding.CHUNKED),
                 headers.getHeader(TransferEncodingHeader.TYPE));
    assertEquals("chunked",
                 headers.get(TransferEncodingHeader.TYPE));
    assertEquals(FingerTrieList.of(HttpTransferCoding.CHUNKED),
                 headers.getValue(TransferEncodingHeader.TYPE));
  }

  @Test
  public void parseTransferEncodingHeaders() {
    assertParses(TransferEncodingHeader.of(HttpTransferCoding.CHUNKED),
                 "Transfer-Encoding: chunked");
    assertParses(TransferEncodingHeader.of(HttpTransferCoding.of("enhance")),
                 "Transfer-Encoding: enhance");
    assertParses(TransferEncodingHeader.of(HttpTransferCoding.GZIP, HttpTransferCoding.CHUNKED),
                 "Transfer-Encoding: gzip, chunked");
    assertParses(TransferEncodingHeader.of(HttpTransferCoding.of("enhance").withParam("zoom", "500x")),
                 "Transfer-Encoding: enhance; zoom=500x");
    assertParses(TransferEncodingHeader.of(HttpTransferCoding.of("enhance").withParam("zoom", "500x").withParam("quality", "very good")),
                 "Transfer-Encoding: enhance; zoom=500x; quality=\"very good\"");
    assertParses(TransferEncodingHeader.of(HttpTransferCoding.of("enhance").withParam("zoom", "500x").withParam("quality", "very good"),
                                           HttpTransferCoding.of("time").withParam("dilation", "on")),
                 "Transfer-Encoding: enhance; zoom=500x; quality=\"very good\", time; dilation=on");
  }

  @Test
  public void writeTransferEncodingHeaders() {
    assertWrites("Transfer-Encoding: chunked",
                 TransferEncodingHeader.of(HttpTransferCoding.CHUNKED));
    assertWrites("Transfer-Encoding: enhance",
                 TransferEncodingHeader.of(HttpTransferCoding.of("enhance")));
    assertWrites("Transfer-Encoding: gzip, chunked",
                 TransferEncodingHeader.of(HttpTransferCoding.GZIP, HttpTransferCoding.CHUNKED));
    assertWrites("Transfer-Encoding: enhance; zoom=500x",
                 TransferEncodingHeader.of(HttpTransferCoding.of("enhance").withParam("zoom", "500x")));
    assertWrites("Transfer-Encoding: enhance; zoom=500x; quality=\"very good\"",
                 TransferEncodingHeader.of(HttpTransferCoding.of("enhance").withParam("zoom", "500x").withParam("quality", "very good")));
    assertWrites("Transfer-Encoding: enhance; zoom=500x; quality=\"very good\", time; dilation=on",
                 TransferEncodingHeader.of(HttpTransferCoding.of("enhance").withParam("zoom", "500x").withParam("quality", "very good"),
                                           HttpTransferCoding.of("time").withParam("dilation", "on")));
  }

  public static void assertParses(HttpHeader expected, String string) {
    HttpAssertions.assertParses(HttpHeader.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpHeader header) {
    HttpAssertions.assertWrites(expected, header::write);
  }

}
