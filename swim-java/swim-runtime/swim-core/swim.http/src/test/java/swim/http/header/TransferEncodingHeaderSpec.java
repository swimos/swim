// Copyright 2015-2023 Nstream, inc.
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

public class TransferEncodingHeaderSpec {

  @Test
  public void parseTransferEncodingHeaders() {
    assertParses("Transfer-Encoding: chunked", TransferEncodingHeader.create("chunked"));
    assertParses("Transfer-Encoding: enhance", TransferEncodingHeader.create("enhance"));
    assertParses("Transfer-Encoding: gzip, chunked", TransferEncodingHeader.create("gzip", "chunked"));
    assertParses("Transfer-Encoding: enhance;zoom=500x",
                 TransferEncodingHeader.create("enhance; zoom=500x"));
    assertParses("Transfer-Encoding: enhance; zoom=500x; quality=\"very good\"",
                 TransferEncodingHeader.create("enhance; zoom=500x; quality=\"very good\""));
    assertParses("Transfer-Encoding: enhance; zoom= 500x; quality =\"very good\" , time; dilation = on",
                 TransferEncodingHeader.create("enhance; zoom=500x; quality=\"very good\"", "time; dilation=on"));
  }

  @Test
  public void writeTransferEncodingHeaders() {
    assertWrites(TransferEncodingHeader.create("chunked"), "Transfer-Encoding: chunked");
    assertWrites(TransferEncodingHeader.create("enhance"), "Transfer-Encoding: enhance");
    assertWrites(TransferEncodingHeader.create("gzip", "chunked"),
                 "Transfer-Encoding: gzip, chunked");
    assertWrites(TransferEncodingHeader.create("enhance; zoom=500x"),
                 "Transfer-Encoding: enhance; zoom=500x");
    assertWrites(TransferEncodingHeader.create("enhance; zoom=500x; quality=\"very good\""),
                 "Transfer-Encoding: enhance; zoom=500x; quality=\"very good\"");
    assertWrites(TransferEncodingHeader.create("enhance; zoom=500x; quality=\"very good\"", "time; dilation=on"),
                 "Transfer-Encoding: enhance; zoom=500x; quality=\"very good\", time; dilation=on");
  }

  public static void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

}
