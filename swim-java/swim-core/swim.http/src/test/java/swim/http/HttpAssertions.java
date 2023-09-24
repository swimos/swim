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

import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.util.Objects;
import java.util.function.Supplier;
import org.junit.platform.commons.JUnitException;
import swim.annotations.Nullable;
import swim.codec.BinaryInput;
import swim.codec.BinaryOutput;
import swim.codec.BinaryOutputBuffer;
import swim.codec.Decode;
import swim.codec.Encode;
import swim.codec.InputBuffer;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.Utf8EncodedOutput;
import swim.codec.Write;
import swim.util.Notation;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

public final class HttpAssertions {

  private HttpAssertions() {
    // static
  }

  static String describeParser(String string, int split, int offset) {
    final Notation notation = Notation.of();
    if (offset < split) {
      notation.append("consumed: ")
              .appendSource(string.substring(0, offset))
              .append("; remaining: ")
              .appendSource(string.substring(offset, split))
              .append(" + ")
              .appendSource(string.substring(split));
    } else if (offset > split) {
      notation.append("consumed: ")
              .appendSource(string.substring(0, split))
              .append(" + ")
              .appendSource(string.substring(split, offset))
              .append("; remaining: ")
              .appendSource(string.substring(offset));
    } else {
      notation.append("consumed: ")
              .appendSource(string.substring(0, split))
              .append("; remaining: ")
              .appendSource(string.substring(split));
    }
    return notation.toString();
  }

  public static void assertParses(Parse<?> parser, @Nullable Object expected, String string) {
    for (int split = string.length(); split >= 0; split -= 1) {
      final StringInput input = new StringInput(string.substring(0, split)).asLast(false);
      Parse<?> parse = parser.consume(input);

      input.extend(string.substring(split));
      parse = parse.consume(input);

      input.asLast(true);
      parse = parse.consume(input);

      if (parse.isDone()) {
        final Object actual = parse.getUnchecked();
        if (!Objects.equals(expected, actual)) {
          assertEquals(expected, actual, HttpAssertions.describeParser(string, split, (int) input.offset()));
        }
      } else if (parse.isError()) {
        final Throwable cause = parse.getError();
        if (cause.getMessage() != null) {
          fail(cause.getMessage() + "; " + HttpAssertions.describeParser(string, split, (int) input.offset()), cause);
        } else {
          fail(HttpAssertions.describeParser(string, split, (int) input.offset()), cause);
        }
      } else {
        fail(HttpAssertions.describeParser(string, split, (int) input.offset()));
      }
    }
  }

  public static <T> void assertDecodes(Decode<T> decoder, T expected, InputBuffer input) {
    for (int i = 0, n = input.remaining(); i <= n; i += 1) {
      Decode<T> decode = decoder;
      assertTrue(decode.isCont());
      assertFalse(decode.isDone());
      assertFalse(decode.isError());
      input.position(0).limit(i).asLast(false);
      decode = decode.consume(input);
      input.limit(n).asLast(true);
      decode = decode.consume(input);
      if (decode.isError()) {
        throw new JUnitException("decode failed", decode.getError());
      }
      assertFalse(decode.isCont());
      assertTrue(decode.isDone());
      assertFalse(decode.isError());
      assertEquals(expected, decode.getUnchecked());
    }
  }

  public static <T> void assertDecodes(Decode<T> decoder, T expected, String input) {
    HttpAssertions.assertDecodes(decoder, expected, new BinaryInput(input.getBytes(Charset.forName("UTF-8"))));
  }

  public static void assertWrites(byte[] expected, Supplier<Write<?>> writer) {
    for (int i = 0; i <= expected.length; i += 1) {
      final byte[] actual = new byte[expected.length];
      final BinaryOutput output = new BinaryOutput(actual);
      output.limit(i).asLast(false);
      Write<?> write = new Utf8EncodedOutput<>(output).writeFrom(writer.get());
      output.limit(output.capacity()).asLast(true);
      write = write.produce(output);
      if (write.isError()) {
        throw new JUnitException("write failed", write.getError());
      }
      assertFalse(write.isCont());
      assertTrue(write.isDone());
      assertArrayEquals(expected, actual);
    }
  }

  public static void assertWrites(String expected, Supplier<Write<?>> writer) {
    HttpAssertions.assertWrites(expected.getBytes(Charset.forName("UTF-8")), writer);
  }

  public static void assertEncodes(ByteBuffer expected, Encode<?> encoder) {
    final ByteBuffer actual = ByteBuffer.allocate(expected.remaining() + 48);
    final BinaryOutputBuffer output = new BinaryOutputBuffer(actual).asLast(false);
    Encode<?> encode = encoder;
    assertTrue(encode.isCont());
    assertFalse(encode.isError());
    assertFalse(encode.isDone());
    while (encode.isCont()) {
      encode = encode.produce(output);
    }
    if (encode.isError()) {
      throw new JUnitException("encode failed", encode.getError());
    }
    assertFalse(encode.isCont());
    assertTrue(encode.isDone());
    actual.flip();
    if (!actual.equals(expected)) {
      fail(Notation.of().append("expected ")
                        .append(new String(expected.array(), expected.arrayOffset(),
                                           expected.remaining(), Charset.forName("UTF-8")))
                        .append(", but found ")
                        .append(new String(actual.array(), actual.arrayOffset(),
                                           actual.remaining(), Charset.forName("UTF-8")))
                        .toString());
    }
  }

  public static void assertEncodes(String expected, Encode<?> encoder) {
    HttpAssertions.assertEncodes(ByteBuffer.wrap(expected.getBytes(Charset.forName("UTF-8"))), encoder);
  }

}
