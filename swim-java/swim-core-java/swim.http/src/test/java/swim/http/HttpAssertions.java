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

package swim.http;

import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import org.testng.TestException;
import swim.codec.Binary;
import swim.codec.Decoder;
import swim.codec.Encoder;
import swim.codec.Input;
import swim.codec.InputBuffer;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.codec.Utf8;
import swim.codec.Writer;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;
import static org.testng.Assert.fail;

public final class HttpAssertions {
  private HttpAssertions() {
    // stub
  }

  static <O> void assertParsed(O actual, O expected, String a, String b, int part) {
    if (!actual.equals(expected)) {
      final Output<String> message = Unicode.stringOutput();
      message.write("when parsing part ").debug(part)
          .write(" of ").debug(a).write(", ").debug(b);
      assertEquals(actual, expected, message.toString());
    }
  }

  static void parseFailed(Throwable cause, String a, String b, int part) {
    final Output<String> message = Unicode.stringOutput();
    message.write("failed to parse part ").debug(part)
        .write(" of ").debug(a).write(", ").debug(b).write(": ").write(cause.getMessage());
    fail(message.toString(), cause);
  }

  public static <O> void assertParses(Parser<O> iteratee, String input, O expected) {
    for (int i = 0, n = input.length(); i <= n; i += 1) {
      final String a = input.substring(0, i);
      final String b = input.substring(i, n);

      Parser<O> parser = iteratee.feed(Unicode.stringInput(a).isPart(true));
      if (parser.isDone()) {
        assertParsed(parser.bind(), expected, a, b, 0);
      } else if (parser.isError()) {
        parseFailed(parser.trap(), a, b, 0);
      }

      parser = parser.feed(Unicode.stringInput(b).isPart(true));
      if (parser.isDone()) {
        assertParsed(parser.bind(), expected, a, b, 1);
      } else if (parser.isError()) {
        parseFailed(parser.trap(), a, b, 1);
      }

      parser = parser.feed(Input.done());
      if (parser.isDone()) {
        assertParsed(parser.bind(), expected, a, b, 2);
      } else if (parser.isError()) {
        parseFailed(parser.trap(), a, b, 2);
      } else {
        final Output<String> message = Unicode.stringOutput();
        message.write("failed to completely parse ").debug(a).write(", ").debug(b);
        fail(message.toString());
      }
    }
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

  public static <T> void assertDecodes(Decoder<T> decodee, String input, T expected) {
    assertDecodes(decodee, Binary.inputBuffer(input.getBytes(Charset.forName("UTF-8"))), expected);
  }

  public static void assertWrites(HttpPart part, byte... expected) {
    for (int i = 0, n = expected.length; i <= n; i += 1) {
      final byte[] actual = new byte[n];
      OutputBuffer<?> output = Binary.outputBuffer(actual);
      output = output.limit(i).isPart(true);
      Writer<?, ?> writer = Utf8.writeEncoded(part.httpWriter(), output);
      output = output.limit(output.capacity()).isPart(false);
      writer = writer.pull(output);
      if (writer.isError()) {
        throw new TestException(writer.trap());
      }
      assertFalse(writer.isCont());
      assertTrue(writer.isDone());
      assertEquals(actual, expected);
    }
  }

  public static void assertWrites(HttpPart part, String expected) {
    assertWrites(part, expected.getBytes(Charset.forName("UTF-8")));
  }

  public static void assertEncodes(Encoder<?, ?> part, ByteBuffer expected) {
    final ByteBuffer actual = ByteBuffer.allocate(expected.remaining() + 48);
    final OutputBuffer<?> output = Binary.outputBuffer(actual).isPart(true);
    Encoder<?, ?> encoder = part;
    assertTrue(encoder.isCont());
    assertFalse(encoder.isError());
    assertFalse(encoder.isDone());
    while (encoder.isCont()) {
      encoder = encoder.pull(output);
    }
    if (encoder.isError()) {
      throw new TestException(encoder.trap());
    }
    assertFalse(encoder.isCont());
    assertTrue(encoder.isDone());
    actual.flip();
    if (!actual.equals(expected)) {
      final Output<String> message = Unicode.stringOutput();
      message.write("expected ")
          .debug(new String(expected.array(), expected.arrayOffset(), expected.remaining()))
          .write(" but found ")
          .debug(new String(actual.array(), actual.arrayOffset(), actual.remaining()));
      fail(message.toString());
    }
  }

  public static void assertEncodes(Encoder<?, ?> part, String expected) {
    assertEncodes(part, ByteBuffer.wrap(expected.getBytes(Charset.forName("UTF-8"))));
  }
}
