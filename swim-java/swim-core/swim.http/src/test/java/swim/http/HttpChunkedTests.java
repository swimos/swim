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
import swim.annotations.Nullable;
import swim.codec.Decode;
import swim.codec.Encode;
import swim.codec.InputBuffer;
import swim.codec.MediaType;
import swim.codec.OutputBuffer;
import swim.codec.Text;
import swim.codec.Transcoder;
import swim.codec.Utf8DecodedInput;
import swim.codec.Utf8EncodedOutput;
import swim.codec.Write;

public class HttpChunkedTests {

  @Test
  public void decodeEmptyChunk() {
    assertDecodes(HttpChunked.create("", Text.transcoder()), "0\r\n\r\n");
  }

  @Test
  public void decodeSingleChunk() {
    assertDecodes(HttpChunked.create("test", Text.transcoder()), "4\r\ntest\r\n0\r\n\r\n");
  }

  @Test
  public void decodeMultipleChunks() {
    assertDecodes(HttpChunked.create("Hello, world!", Text.transcoder()), "7\r\nHello, \r\n6\r\nworld!\r\n0\r\n\r\n");
  }

  @Test
  public void encodeEmptyChunk() {
    assertEncodes("0\r\n\r\n", HttpChunked.create("", Text.transcoder()));
  }

  @Test
  public void encodeSingleChunk() {
    assertEncodes("4\r\ntest\r\n0\r\n\r\n", HttpChunked.create("test", Text.transcoder()));
  }

  @Test
  public void encodeMultipleChunks() {
    final Transcoder<String> transcoder = new SplitTranscoder(7);
    assertEncodes("7\r\nHello, \r\n6\r\nworld!\r\n0\r\n\r\n",
                  HttpChunked.create("Hello, world!", transcoder));
  }

  public static <T> void assertDecodes(HttpChunked<T> expected, String string) {
    HttpAssertions.assertDecodes(HttpChunked.decode(expected.transcoder()), expected, string);
  }

  public static void assertEncodes(String expected, HttpChunked<?> payload) {
    HttpAssertions.assertEncodes(expected, payload.encode());
  }

  static final class SplitTranscoder implements Transcoder<String> {

    final int index;

    SplitTranscoder(int index) {
      this.index = index;
    }

    @Override
    public MediaType mediaType() {
      return MediaType.create("text", "plain");
    }

    @Override
    public Decode<String> decode(InputBuffer input) {
      return Text.transcoder().decode(input);
    }

    @Override
    public Encode<?> encode(OutputBuffer<?> output, @Nullable String value) {
      if (value != null) {
        final String a = value.substring(0, this.index);
        final String b = value.substring(this.index);
        final Write<?> aWriter = Utf8EncodedOutput.full().writeFrom(Text.transcoder().write(a));
        final Write<?> bWriter = Utf8EncodedOutput.full().writeFrom(Text.transcoder().write(b));
        return aWriter.andThen(bWriter).produce(output);
      } else {
        return Encode.done();
      }
    }

  }

}
