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
import static swim.http.HttpAssertions.assertWrites;

public class TransferEncodingSpec {
  public void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

  @Test
  public void parseTransferEncodingHeaders() {
    assertParses("Transfer-Encoding: chunked", TransferEncoding.from("chunked"));
    assertParses("Transfer-Encoding: enhance", TransferEncoding.from("enhance"));
    assertParses("Transfer-Encoding: gzip, chunked", TransferEncoding.from("gzip", "chunked"));
    assertParses("Transfer-Encoding: enhance;zoom=500x",
                 TransferEncoding.from("enhance; zoom=500x"));
    assertParses("Transfer-Encoding: enhance; zoom=500x; quality=\"very good\"",
                 TransferEncoding.from("enhance; zoom=500x; quality=\"very good\""));
    assertParses("Transfer-Encoding: enhance; zoom= 500x; quality =\"very good\" , time; dilation = on",
                 TransferEncoding.from("enhance; zoom=500x; quality=\"very good\"", "time; dilation=on"));
  }

  @Test
  public void writeTransferEncodingHeaders() {
    assertWrites(TransferEncoding.from("chunked"), "Transfer-Encoding: chunked");
    assertWrites(TransferEncoding.from("enhance"), "Transfer-Encoding: enhance");
    assertWrites(TransferEncoding.from("gzip", "chunked"),
                 "Transfer-Encoding: gzip, chunked");
    assertWrites(TransferEncoding.from("enhance; zoom=500x"),
                 "Transfer-Encoding: enhance; zoom=500x");
    assertWrites(TransferEncoding.from("enhance; zoom=500x; quality=\"very good\""),
                 "Transfer-Encoding: enhance; zoom=500x; quality=\"very good\"");
    assertWrites(TransferEncoding.from("enhance; zoom=500x; quality=\"very good\"", "time; dilation=on"),
                 "Transfer-Encoding: enhance; zoom=500x; quality=\"very good\", time; dilation=on");
  }
}
