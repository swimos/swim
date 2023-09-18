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

package swim.hpack;

import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import org.testng.TestException;
import swim.codec.Binary;
import swim.codec.Decoder;
import swim.codec.Encoder;
import swim.codec.InputBuffer;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.codec.Unicode;
import swim.collections.FingerTrieSeq;
import swim.structure.Data;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;
import static org.testng.Assert.fail;

public final class HpackAssertions {

  private HpackAssertions() {
    // static
  }

  public static <T> void assertDecodes(Decoder<T> decodee, InputBuffer input, T expected) {
    for (int i = 0, n = input.remaining(); i <= n; i += 1) {
      Decoder<?> decoder = decodee;
      assertTrue(decoder.isCont());
      assertFalse(decoder.isDone());
      assertFalse(decoder.isError());
      input = input.index(0).limit(i).isPart(true);
      decoder = decoder.feed(input);
      input = input.limit(n).isPart(false);
      decoder = decoder.feed(input);
      if (decoder.isError()) {
        throw new TestException(decoder.trap());
      }
      assertFalse(decoder.isCont());
      assertTrue(decoder.isDone());
      assertFalse(decoder.isError());
      assertEquals(decoder.bind(), expected);
    }
  }

  public static <T> void assertDecodes(Decoder<T> decodee, Data input, T expected) {
    assertDecodes(decodee, Binary.inputBuffer(input.toByteBuffer()), expected);
  }

  public static <T> void assertDecodes(Decoder<T> decodee, String input, T expected) {
    assertDecodes(decodee, Binary.inputBuffer(input.getBytes(Charset.forName("UTF-8"))), expected);
  }

  public static void assertEncodes(Encoder<?, ?> part, ByteBuffer expected) {
    for (int i = 0, n = expected.capacity(); i <= n; i += 1) {
      final ByteBuffer actual = ByteBuffer.allocate(n);
      OutputBuffer<?> output = Binary.outputBuffer(actual).isPart(true);
      Encoder<?, ?> encoder = part;
      assertTrue(encoder.isCont());
      assertFalse(encoder.isError());
      assertFalse(encoder.isDone());
      output = output.limit(i).isPart(true);
      encoder = encoder.pull(output);
      output = output.limit(n).isPart(false);
      encoder = encoder.pull(output);
      if (encoder.isError()) {
        throw new TestException(encoder.trap());
      }
      assertFalse(encoder.isCont());
      assertTrue(encoder.isDone());
      actual.flip();
      if (!actual.equals(expected)) {
        final Output<String> message = Unicode.stringOutput();
        message.write("expected ").debug(Data.from(expected)).write(" but found ").debug(Data.from(actual));
        fail(message.toString());
      }
    }
  }

  public static void assertEncodes(Encoder<?, ?> part, Data expected) {
    assertEncodes(part, expected.toByteBuffer());
  }

  public static void assertEncodes(Encoder<?, ?> part, String expected) {
    assertEncodes(part, ByteBuffer.wrap(expected.getBytes(Charset.forName("UTF-8"))));
  }

  public static void assertDecodesBlock(HpackDecoder hpack, InputBuffer input,
                                        FingerTrieSeq<HpackHeader> expected) {
    final HpackDecoder hpack0 = hpack.clone();
    for (int i = 0, n = input.remaining(); i <= n; i += 1) {
      Decoder<?> decoder = (i == 0 ? hpack : hpack0.clone()).blockDecoder();
      assertTrue(decoder.isCont());
      assertFalse(decoder.isDone());
      assertFalse(decoder.isError());
      input = input.index(0).limit(i).isPart(true);
      decoder = decoder.feed(input);
      input = input.limit(n).isPart(false);
      decoder = decoder.feed(input);
      if (decoder.isError()) {
        throw new TestException(decoder.trap());
      }
      assertFalse(decoder.isCont());
      assertTrue(decoder.isDone());
      assertFalse(decoder.isError());
      assertEquals(decoder.bind(), expected);
    }
  }

  public static <T> void assertDecodesBlock(HpackDecoder hpack, Data input, HpackHeader... headers) {
    assertDecodesBlock(hpack, Binary.inputBuffer(input.toByteBuffer()), FingerTrieSeq.of(headers));
  }

  public static void assertEncodesBlock(HpackEncoder hpack, Data expected, FingerTrieSeq<HpackHeader> headers) {
    final HpackEncoder hpack0 = hpack.clone();
    for (int i = 0, n = expected.size(); i <= n; i += 1) {
      final ByteBuffer actual = ByteBuffer.allocate(n);
      OutputBuffer<?> output = Binary.outputBuffer(actual).isPart(true);
      Encoder<?, ?> encoder = (i == 0 ? hpack : hpack0.clone()).blockEncoder(headers.iterator());
      assertTrue(encoder.isCont());
      assertFalse(encoder.isError());
      assertFalse(encoder.isDone());
      output = output.limit(i).isPart(true);
      encoder = encoder.pull(output);
      output = output.limit(n).isPart(false);
      encoder = encoder.pull(output);
      if (encoder.isError()) {
        throw new TestException(encoder.trap());
      }
      assertFalse(encoder.isCont());
      assertTrue(encoder.isDone());
      actual.flip();
      if (!Data.from(actual).equals(expected)) {
        final Output<String> message = Unicode.stringOutput();
        message.write("expected ").debug(expected).write(" but found ").debug(Data.from(actual));
        fail(message.toString());
      }
    }
  }

  public static void assertEncodesBlock(HpackEncoder hpack, Data expected, HpackHeader... headers) {
    assertEncodesBlock(hpack, expected, FingerTrieSeq.of(headers));
  }

}
