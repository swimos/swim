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

package swim.ws;

import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.util.Objects;
import java.util.Random;
import java.util.function.Supplier;
import org.junit.platform.commons.JUnitException;
import swim.annotations.Nullable;
import swim.codec.BinaryInput;
import swim.codec.BinaryInputBuffer;
import swim.codec.BinaryOutput;
import swim.codec.BinaryOutputBuffer;
import swim.codec.Decode;
import swim.codec.Encode;
import swim.codec.InputBuffer;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.Utf8EncodedOutput;
import swim.codec.Write;
import swim.collections.FingerTrieList;
import swim.util.Assume;
import swim.util.Notation;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

public final class WsAssertions {

  private WsAssertions() {
    // static
  }

  static String describeParser(String string, int split, int offset) {
    final Notation notation = new Notation();
    if (offset < split) {
      notation.append("consumed: ");
      notation.appendSource(string.substring(0, offset));
      notation.append("; remaining: ");
      notation.appendSource(string.substring(offset, split));
      notation.append(" + ");
      notation.appendSource(string.substring(split));
    } else if (offset > split) {
      notation.append("consumed: ");
      notation.appendSource(string.substring(0, split));
      notation.append(" + ");
      notation.appendSource(string.substring(split, offset));
      notation.append("; remaining: ");
      notation.appendSource(string.substring(offset));
    } else {
      notation.append("consumed: ");
      notation.appendSource(string.substring(0, split));
      notation.append("; remaining: ");
      notation.appendSource(string.substring(split));
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
        final Object actual = parse.get();
        if (!Objects.equals(expected, actual)) {
          assertEquals(expected, actual, WsAssertions.describeParser(string, split, (int) input.offset()));
        }
      } else if (parse.isError()) {
        final Throwable cause = parse.getError();
        if (cause.getMessage() != null) {
          fail(cause.getMessage() + "; " + WsAssertions.describeParser(string, split, (int) input.offset()), cause);
        } else {
          fail(WsAssertions.describeParser(string, split, (int) input.offset()), cause);
        }
      } else {
        fail(WsAssertions.describeParser(string, split, (int) input.offset()));
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
        throw new JUnitException("Decode failed", decode.getError());
      }
      assertFalse(decode.isCont());
      assertTrue(decode.isDone());
      assertFalse(decode.isError());
      assertEquals(expected, decode.get());
    }
  }

  public static <T> void assertDecodes(Decode<T> decoder, T expected, String input) {
    WsAssertions.assertDecodes(decoder, expected, new BinaryInput(input.getBytes(Charset.forName("UTF-8"))));
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
        throw new JUnitException("Write failure", write.getError());
      }
      assertFalse(write.isCont());
      assertTrue(write.isDone());
      assertArrayEquals(expected, actual);
    }
  }

  public static void assertWrites(String expected, Supplier<Write<?>> writer) {
    WsAssertions.assertWrites(expected.getBytes(Charset.forName("UTF-8")), writer);
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
      throw new JUnitException("Encode failure", encode.getError());
    }
    assertFalse(encode.isCont());
    assertTrue(encode.isDone());
    actual.flip();
    if (!actual.equals(expected)) {
      final Notation notation = new Notation();
      notation.append("expected ");
      notation.append(new String(expected.array(), expected.arrayOffset(), expected.remaining(), Charset.forName("UTF-8")));
      notation.append(", but found ");
      notation.append(new String(actual.array(), actual.arrayOffset(), actual.remaining(), Charset.forName("UTF-8")));
      fail(notation.toString());
    }
  }

  public static void assertEncodes(String expected, Encode<?> encoder) {
    WsAssertions.assertEncodes(ByteBuffer.wrap(expected.getBytes(Charset.forName("UTF-8"))), encoder);
  }

  static <T> void assertDecodes(WsDecoder decoder, WsCodec<T> codec,
                                WsFrame<?> expected, ByteBuffer encoded) {
    for (int i = 0, n = encoded.remaining(); i <= n; i += 1) {
      // Frame decoding mutates the input buffer,
      // so always decode a copy of the encoded data.
      final ByteBuffer buffer = ByteBuffer.allocate(n);
      final BinaryInputBuffer input = new BinaryInputBuffer(buffer);
      buffer.put(encoded);
      encoded.rewind();
      buffer.rewind();
      decoder.reset();

      input.position(0).limit(i).asLast(false);
      Decode<WsFrame<T>> decodeMessage = decoder.decodeMessage(input, codec).checkError();
      while (decodeMessage.isDone() && decodeMessage.get() instanceof WsFragmentFrame<?>) {
        decodeMessage = decoder.decodeContinuation(input, (WsFragmentFrame<T>) decodeMessage.getNonNull()).checkError();
      }

      input.limit(n).asLast(true);
      decodeMessage = decodeMessage.consume(input).checkError();
      while (decodeMessage.isDone() && decodeMessage.get() instanceof WsFragmentFrame<?>) {
        decodeMessage = decoder.decodeContinuation(input, (WsFragmentFrame<T>) decodeMessage.getNonNull()).checkError();
      }

      assertEquals(expected, decodeMessage.get());
    }
  }

  static void assertDecodes(WsDecoder decoder, WsFrame<?> expected, ByteBuffer encoded) {
    assertDecodes(decoder, Ws.javaCodec(), expected, encoded);
  }

  static void assertEncodes(WsEncoder encoder, ByteBuffer expected,
                            WsFrame<?> frame, int... bufferSizes) {
    if (bufferSizes == null || bufferSizes.length == 0) {
      bufferSizes = new int[] {expected.remaining()};
    }
    int bufferTotal = 0;
    for (int i = 0; i < bufferSizes.length; i += 1) {
      bufferTotal += bufferSizes[i];
    }
    final ByteBuffer encoded = ByteBuffer.allocate(bufferTotal);
    final BinaryOutputBuffer output = new BinaryOutputBuffer(encoded);
    Encode<?> encodeMessage = encoder.encodeMessage(frame);
    for (int i = 0; i < bufferSizes.length; i += 1) {
      final int bufferSize = bufferSizes[i];
      output.limit(Math.min(output.position() + bufferSize, output.capacity())).asLast(i == bufferSizes.length);
      encodeMessage = encodeMessage.produce(output).checkError();
      while (encodeMessage.isDone() && encodeMessage.get() instanceof WsContinuationFrame<?>) {
        encodeMessage = encoder.encodeContinuation(output, (WsContinuationFrame<?>) encodeMessage.getNonNull()).checkError();
      }
    }
    assertEquals(expected, encoded.flip());
  }

  static void assertTranscodes(WsEncoder encoder, WsDecoder decoder, int bufferSize,
                               int messageCount, Supplier<WsFrame<?>> messageSupplier) {
    final ByteBuffer buffer = ByteBuffer.allocate(bufferSize);
    final BinaryOutputBuffer output = new BinaryOutputBuffer(buffer).asLast(false);
    final BinaryInputBuffer input = new BinaryInputBuffer(buffer).asLast(false);
    Encode<?> encodeMessage = null;
    Decode<? extends WsFrame<?>> decodeMessage = null;
    FingerTrieList<WsFrame<?>> decodeQueue = FingerTrieList.empty();
    int encodeIndex = 0;
    int decodeIndex = 0;
    do {
      if (encodeMessage != null && !encodeMessage.isDone()) {
        encodeMessage = encodeMessage.produce(output).checkError();
      } else if (encodeIndex < messageCount) {
        if (encodeMessage == null) {
          final WsFrame<?> message = messageSupplier.get();
          decodeQueue = decodeQueue.appended(message);
          encodeMessage = encoder.encodeMessage(output, message).checkError();
        } else {
          encodeMessage = encoder.encodeContinuation(output, (WsContinuationFrame<?>) encodeMessage.getNonNull()).checkError();
        }
      }
      buffer.flip();
      if (decodeMessage != null && !decodeMessage.isDone()) {
        decodeMessage = decodeMessage.consume(input).checkError();
      } else if (decodeIndex < messageCount) {
        final WsFrame<?> message = Assume.nonNull(decodeQueue.head());
        if (decodeMessage == null) {
          final WsCodec<?> codec = WsCodec.of(message.transcoder(), message.transcoder());
          decodeMessage = decoder.decodeMessage(input, codec).checkError();
        } else {
          decodeMessage = decoder.decodeContinuation(input, (WsFragmentFrame<?>) decodeMessage.getNonNull()).checkError();
        }
      }
      buffer.compact();
      if (encodeMessage != null && encodeMessage.isDone() && !(encodeMessage.get() instanceof WsContinuationFrame<?>)) {
        encodeMessage = null;
        encodeIndex += 1;
      }
      if (decodeMessage != null && decodeMessage.isDone() && !(decodeMessage.get() instanceof WsFragmentFrame<?>)) {
        final WsFrame<?> message = Assume.nonNull(decodeQueue.head());
        assertEquals(message, decodeMessage.get(), "message " + decodeIndex);
        decodeMessage = null;
        decodeIndex += 1;
        decodeQueue = decodeQueue.tail();
      }
    } while (encodeIndex < messageCount || decodeIndex < messageCount);
  }

  static void assertTranscodes(WsEncoder encoder, WsDecoder decoder, int bufferSize, WsFrame<?>... messages) {
    final Supplier<WsFrame<?>> messageSupplier = new Supplier<WsFrame<?>>() {
      int index = 0;
      @Override
      public WsFrame<?> get() {
        final int index = this.index;
        this.index = index + 1;
        return messages[index];
      }
    };
    WsAssertions.assertTranscodes(encoder, decoder, bufferSize, messages.length, messageSupplier);
  }

  static void assertTranscodesRandom(WsEncoder encoder, WsDecoder decoder, int bufferSize, int entropy,
                                     int minMessageSize, int maxMessageSize, int messageCount) {
    final Random random = new Random(0xCAFE);
    final Supplier<WsFrame<?>> messageSupplier = () -> {
      final int messageSize = minMessageSize + random.nextInt(maxMessageSize - minMessageSize);
      final byte[] message = new byte[messageSize];
      random.nextBytes(message);
      if (entropy != 0xFF) {
        for (int j = 0; j < message.length; j += 1) {
          message[j] = (byte) (message[j] & entropy);
        }
      }
      final ByteBuffer payload = ByteBuffer.wrap(message);
      return WsBinaryFrame.of(payload);
    };
    WsAssertions.assertTranscodes(encoder, decoder, bufferSize, messageCount, messageSupplier);
  }

}
