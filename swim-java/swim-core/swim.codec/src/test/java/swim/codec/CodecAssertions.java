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

package swim.codec;

import java.nio.charset.Charset;
import java.util.Objects;
import java.util.function.Supplier;
import org.junit.platform.commons.JUnitException;
import swim.annotations.Nullable;
import swim.util.Notation;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

public final class CodecAssertions {

  private CodecAssertions() {
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
          assertEquals(expected, actual, CodecAssertions.describeParser(string, split, (int) input.offset()));
        }
      } else if (parse.isError()) {
        final Throwable cause = parse.getError();
        if (cause.getMessage() != null) {
          fail(cause.getMessage() + "; " + CodecAssertions.describeParser(string, split, (int) input.offset()), cause);
        } else {
          fail(CodecAssertions.describeParser(string, split, (int) input.offset()), cause);
        }
      } else {
        fail(CodecAssertions.describeParser(string, split, (int) input.offset()));
      }
    }
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
    CodecAssertions.assertWrites(expected.getBytes(Charset.forName("UTF-8")), writer);
  }

}
