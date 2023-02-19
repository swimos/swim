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

package swim.http;

import org.junit.jupiter.api.Test;

public class HttpTransferCodingTests {

  @Test
  public void parseTransferCodings() {
    assertParses(HttpTransferCoding.chunked(), "chunked");
    assertParses(HttpTransferCoding.compress(), "compress");
    assertParses(HttpTransferCoding.deflate(), "deflate");
    assertParses(HttpTransferCoding.gzip(), "gzip");
    assertParses(HttpTransferCoding.of("enhance"), "enhance");
  }

  @Test
  public void writeTransferCodings() {
    assertWrites("chunked", HttpTransferCoding.chunked());
    assertWrites("compress", HttpTransferCoding.compress());
    assertWrites("deflate", HttpTransferCoding.deflate());
    assertWrites("gzip", HttpTransferCoding.gzip());
    assertWrites("enhance", HttpTransferCoding.of("enhance"));
  }

  @Test
  public void parseTransferCodingsWithParams() {
    assertParses(HttpTransferCoding.of("time")
                                   .withParam("dilation", "on"),
                 "time;dilation=on");
    assertParses(HttpTransferCoding.of("enhance")
                                   .withParam("zoom", "500x"),
                 "enhance; zoom=500x");
    assertParses(HttpTransferCoding.of("enhance")
                                   .withParam("zoom", "500x")
                                   .withParam("quality", "very good"),
                 "enhance; zoom=500x; quality=\"very good\"");
  }

  @Test
  public void writeTransferCodingsWithParams() {
    assertWrites("time; dilation=on",
                 HttpTransferCoding.of("time")
                                   .withParam("dilation", "on"));
    assertWrites("enhance; zoom=500x",
                 HttpTransferCoding.of("enhance")
                                   .withParam("zoom", "500x"));
    assertWrites("enhance; zoom=500x; quality=\"very good\"",
                 HttpTransferCoding.of("enhance")
                                   .withParam("zoom", "500x")
                                   .withParam("quality", "very good"));
  }

  public static void assertParses(HttpTransferCoding expected, String string) {
    HttpAssertions.assertParses(HttpTransferCoding.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpTransferCoding transferCoding) {
    HttpAssertions.assertWrites(expected, transferCoding::write);
  }

}
