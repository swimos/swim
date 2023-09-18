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

package swim.http;

import org.testng.annotations.Test;
import swim.codec.Decoder;
import swim.codec.Encoder;
import swim.codec.Utf8;

public class HttpChunkedSpec {

  @Test
  public void decodeEmptyChunk() {
    assertDecodes(Utf8.stringParser(), "0\r\n\r\n", "");
  }

  @Test
  public void decodeSingleChunk() {
    assertDecodes(Utf8.stringParser(), "4\r\ntest\r\n0\r\n\r\n", "test");
  }

  @Test
  public void decodeMultipleChunks() {
    assertDecodes(Utf8.stringParser(), "7\r\nHello, \r\n6\r\nworld!\r\n0\r\n\r\n", "Hello, world!");
  }

  @Test
  public void encodeEmptyChunk() {
    assertEncodes(HttpChunked.create(Encoder.done()), "0\r\n\r\n");
  }

  @Test
  public void encodeSingleChunk() {
    assertEncodes(HttpChunked.create(Utf8.stringWriter("test")), "4\r\ntest\r\n0\r\n\r\n");
  }

  @Test
  public void encodeMultipleChunks() {
    assertEncodes(HttpChunked.create(Utf8.stringWriter("Hello, ").andThen(Utf8.stringWriter("world!"))),
                  "7\r\nHello, \r\n6\r\nworld!\r\n0\r\n\r\n");
  }

  public static <T> void assertDecodes(Decoder<T> decodee, String input, T expected) {
    final HttpResponse<T> headers = HttpResponse.create(HttpStatus.OK);
    final HttpResponse<T> response = headers.payload(HttpValue.create(expected));
    HttpAssertions.assertDecodes(Http.standardParser().chunkedDecoder(headers, decodee), input, response);
  }

  public static void assertEncodes(HttpPayload<?> payload, String expected) {
    HttpAssertions.assertEncodes(payload.httpEncoder(null), expected);
  }

}
