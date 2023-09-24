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

import org.junit.jupiter.api.Test;
import swim.annotations.Nullable;
import swim.codec.Codec;
import swim.codec.Decode;
import swim.codec.Encode;
import swim.codec.InputBuffer;
import swim.codec.MediaType;
import swim.codec.OutputBuffer;
import swim.codec.Text;
import swim.codec.Utf8EncodedOutput;
import swim.codec.Write;

public class HttpChunkedTests {

  @Test
  public void decodeEmptyChunk() {
    assertDecodes(HttpChunked.of("", Text.stringCodec()), "0\r\n\r\n");
  }

  @Test
  public void decodeSingleChunk() {
    assertDecodes(HttpChunked.of("test", Text.stringCodec()), "4\r\ntest\r\n0\r\n\r\n");
  }

  @Test
  public void decodeMultipleChunks() {
    assertDecodes(HttpChunked.of("Hello, world!", Text.stringCodec()), "7\r\nHello, \r\n6\r\nworld!\r\n0\r\n\r\n");
  }

  @Test
  public void encodeEmptyChunk() {
    assertEncodes("0\r\n\r\n", HttpChunked.of("", Text.stringCodec()));
  }

  @Test
  public void encodeSingleChunk() {
    assertEncodes("4\r\ntest\r\n0\r\n\r\n", HttpChunked.of("test", Text.stringCodec()));
  }

  @Test
  public void encodeMultipleChunks() {
    final Codec<String> codec = new SplitCodec(7);
    assertEncodes("7\r\nHello, \r\n6\r\nworld!\r\n0\r\n\r\n",
                  HttpChunked.of("Hello, world!", codec));
  }

  public static <T> void assertDecodes(HttpChunked<T> expected, String string) {
    HttpAssertions.assertDecodes(HttpChunked.decode(expected.codec()), expected, string);
  }

  public static void assertEncodes(String expected, HttpChunked<?> payload) {
    HttpAssertions.assertEncodes(expected, payload.encode());
  }

  static final class SplitCodec implements Codec<String> {

    final int index;

    SplitCodec(int index) {
      this.index = index;
    }

    @Override
    public MediaType mediaType() {
      return MediaType.of("text", "plain");
    }

    @Override
    public Decode<String> decode(InputBuffer input) {
      return Text.decode(input);
    }

    @Override
    public Encode<?> encode(OutputBuffer<?> output, @Nullable String value) {
      if (value != null) {
        final String a = value.substring(0, this.index);
        final String b = value.substring(this.index);
        final Write<?> aWriter = Utf8EncodedOutput.full().writeFrom(Text.write(a));
        final Write<?> bWriter = Utf8EncodedOutput.full().writeFrom(Text.write(b));
        return aWriter.andThen(bWriter).produce(output);
      } else {
        return Encode.done();
      }
    }

  }

}
