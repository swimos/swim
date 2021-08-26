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

public class TransferEncodingSpec {

  @Test
  public void parseTransferEncodingHeaders() {
    assertParses("Transfer-Encoding: chunked", TransferEncoding.create("chunked"));
    assertParses("Transfer-Encoding: enhance", TransferEncoding.create("enhance"));
    assertParses("Transfer-Encoding: gzip, chunked", TransferEncoding.create("gzip", "chunked"));
    assertParses("Transfer-Encoding: enhance;zoom=500x",
                 TransferEncoding.create("enhance; zoom=500x"));
    assertParses("Transfer-Encoding: enhance; zoom=500x; quality=\"very good\"",
                 TransferEncoding.create("enhance; zoom=500x; quality=\"very good\""));
    assertParses("Transfer-Encoding: enhance; zoom= 500x; quality =\"very good\" , time; dilation = on",
                 TransferEncoding.create("enhance; zoom=500x; quality=\"very good\"", "time; dilation=on"));
  }

  @Test
  public void writeTransferEncodingHeaders() {
    assertWrites(TransferEncoding.create("chunked"), "Transfer-Encoding: chunked");
    assertWrites(TransferEncoding.create("enhance"), "Transfer-Encoding: enhance");
    assertWrites(TransferEncoding.create("gzip", "chunked"),
                 "Transfer-Encoding: gzip, chunked");
    assertWrites(TransferEncoding.create("enhance; zoom=500x"),
                 "Transfer-Encoding: enhance; zoom=500x");
    assertWrites(TransferEncoding.create("enhance; zoom=500x; quality=\"very good\""),
                 "Transfer-Encoding: enhance; zoom=500x; quality=\"very good\"");
    assertWrites(TransferEncoding.create("enhance; zoom=500x; quality=\"very good\"", "time; dilation=on"),
                 "Transfer-Encoding: enhance; zoom=500x; quality=\"very good\", time; dilation=on");
  }

  public static void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

}
