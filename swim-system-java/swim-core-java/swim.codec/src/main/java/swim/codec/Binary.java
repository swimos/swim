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

package swim.codec;

import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.channels.ReadableByteChannel;

/**
 * Byte {@link Input}/{@link Output} factory.
 *
 * <p>The {@code Binary.byteArrayOutput(...)} family of functions return an
 * {@code Output} that writes bytes to a growable array, and {@link
 * Output#bind() bind} a {@code byte[]} array containing all written bytes.</p>
 *
 * <p>The {@code Binary.byteBufferOutput(...)} family of functions return an
 * {@code Output} that writes bytes to a growable array, and {@link
 * Output#bind() bind} a {@code ByteBuffer} containing all written bytes.</p>
 */
public final class Binary {
  private Binary() {
    // nop
  }

  public static InputBuffer input(byte... bytes) {
    return new ByteArrayInput(bytes, 0, bytes.length);
  }

  public static InputBuffer inputBuffer(byte[] array, int offset, int length) {
    return new ByteArrayInput(array, offset, length);
  }

  public static InputBuffer inputBuffer(byte[] array) {
    return new ByteArrayInput(array, 0, array.length);
  }

  public static InputBuffer inputBuffer(ByteBuffer buffer) {
    return new ByteBufferInput(buffer);
  }

  public static OutputBuffer<ByteBuffer> outputBuffer(byte[] array, int offset, int length) {
    return new ByteArrayOutput(array, offset, length);
  }

  public static OutputBuffer<ByteBuffer> outputBuffer(byte[] array) {
    return new ByteArrayOutput(array, 0, array.length);
  }

  public static OutputBuffer<ByteBuffer> outputBuffer(ByteBuffer buffer) {
    return new ByteBufferOutput(buffer);
  }

  /**
   * Returns a new {@code Output} that appends bytes to a growable array,
   * pre-allocated with space for {@code initialCapacity} bytes, using the
   * given {@code settings}.  The returned {@code Output} accepts an unbounded
   * number of bytes, remaining permanently in the <em>cont</em> state, and can
   * {@link Output#bind() bind} a {@code byte[]} array with the current output
   * state at any time.
   */
  public static Output<byte[]> byteArrayOutput(int initialCapacity, OutputSettings settings) {
    if (initialCapacity < 0) {
      throw new IllegalArgumentException(Integer.toString(initialCapacity));
    }
    return new ByteOutputArray(new byte[initialCapacity], 0, settings);
  }

  /**
   * Returns a new {@code Output} that appends bytes to a growable array,
   * pre-allocated with space for {@code initialCapacity} bytes.  The returned
   * {@code Output} accepts an unbounded number of bytes, remaining permanently
   * in the <em>cont</em> state, and can {@link Output#bind() bind} a {@code
   * byte[]} array with the current output state at any time.
   */
  public static Output<byte[]> byteArrayOutput(int initialCapacity) {
    if (initialCapacity < 0) {
      throw new IllegalArgumentException(Integer.toString(initialCapacity));
    }
    return new ByteOutputArray(new byte[initialCapacity], 0, OutputSettings.standard());
  }

  /**
   * Returns a new {@code Output} that appends bytes to a growable array,
   * using the given {@code settings}.  The returned {@code Output} accepts
   * an unbounded number of bytes, remaining permanently in the <em>cont</em>
   * state, and can {@link Output#bind() bind} a {@code byte[]} array with
   * the current output state at any time.
   */
  public static Output<byte[]> byteArrayOutput(OutputSettings settings) {
    return new ByteOutputArray(null, 0, settings);
  }

  /**
   * Returns a new {@code Output} that appends bytes to a growable array.
   * The returned {@code Output} accepts an unbounded number of bytes,
   * remaining permanently in the <em>cont</em> state, and can {@link
   * Output#bind() bind} a {@code byte[]} array with the current output
   * state at any time.
   */
  public static Output<byte[]> byteArrayOutput() {
    return new ByteOutputArray(null, 0, OutputSettings.standard());
  }

  /**
   * Returns a new {@code Output} that appends bytes to a growable array,
   * pre-allocated with space for {@code initialCapacity} bytes, using the
   * given {@code settings}.  The returned {@code Output} accepts an unbounded
   * number of bytes, remaining permanently in the <em>cont</em> state, and can
   * {@link Output#bind() bind} a {@code ByteBuffer} with the current output
   * state at any time.
   */
  public static Output<ByteBuffer> byteBufferOutput(int initialCapacity, OutputSettings settings) {
    if (initialCapacity < 0) {
      throw new IllegalArgumentException(Integer.toString(initialCapacity));
    }
    return new ByteOutputBuffer(new byte[initialCapacity], 0, settings);
  }

  /**
   * Returns a new {@code Output} that appends bytes to a growable array,
   * pre-allocated with space for {@code initialCapacity} bytes.  The returned
   * {@code Output} accepts an unbounded number of bytes, remaining permanently
   * in the <em>cont</em> state, and can {@link Output#bind() bind} a {@code
   * ByteBuffer} with the current output state at any time.
   */
  public static Output<ByteBuffer> byteBufferOutput(int initialCapacity) {
    if (initialCapacity < 0) {
      throw new IllegalArgumentException(Integer.toString(initialCapacity));
    }
    return new ByteOutputBuffer(new byte[initialCapacity], 0, OutputSettings.standard());
  }

  /**
   * Returns a new {@code Output} that appends bytes to a growable array,
   * using the given {@code settings}.  The returned {@code Output} accepts
   * an unbounded number of bytes, remaining permanently in the <em>cont</em>
   * state, and can {@link Output#bind() bind} a {@code ByteBuffer} with the
   * current output state at any time.
   */
  public static Output<ByteBuffer> byteBufferOutput(OutputSettings settings) {
    return new ByteOutputBuffer(null, 0, settings);
  }

  /**
   * Returns a new {@code Output} that appends bytes to a growable array.
   * The returned {@code Output} accepts an unbounded number of bytes,
   * remaining permanently in the <em>cont</em> state, and can {@link
   * Output#bind() bind} a {@code ByteBuffer} with the current output
   * state at any time.
   */
  public static Output<ByteBuffer> byteBufferOutput() {
    return new ByteOutputBuffer(null, 0, OutputSettings.standard());
  }

  /**
   * Returns a new {@code Parser} that writes decoded bytes to the given
   * {@code output}.
   */
  public static <O> Parser<O> outputParser(Output<O> output) {
    return new ByteParser<O>(output);
  }

  /**
   * Writes the decoded bytes of the {@code input} buffer to the given {@code
   * output}, returning a {@code Parser} continuation that knows how to decode
   * subsequent input buffers.
   */
  public static <O> Parser<O> parseOutput(Output<O> output, Input input) {
    return ByteParser.parse(input, output);
  }

  public static <O> Parser<O> nullParser() {
    return new NullParser<O>();
  }

  public static <O> Parser<O> parseNull(Input input) {
    return NullParser.parse(input);
  }

  @SuppressWarnings("unchecked")
  public static Writer<byte[], ?> byteArrayWriter() {
    return (Writer<byte[], ?>) (Writer<?, ?>) new ByteWriter();
  }

  @SuppressWarnings("unchecked")
  public static Writer<Object, byte[]> byteArrayWriter(byte[] input) {
    return (Writer<Object, byte[]>) (Writer<?, ?>) new ByteWriter(input, input);
  }

  @SuppressWarnings("unchecked")
  public static <O> Writer<Object, O> byteArrayWriter(O value, byte[] input) {
    return (Writer<Object, O>) (Writer<?, ?>) new ByteWriter(value, input);
  }

  @SuppressWarnings("unchecked")
  public static Writer<ByteBuffer, Object> byteBufferWriter() {
    return (Writer<ByteBuffer, Object>) (Writer<?, ?>) new ByteWriter();
  }

  @SuppressWarnings("unchecked")
  public static Writer<Object, ByteBuffer> byteBufferWriter(ByteBuffer input) {
    return (Writer<Object, ByteBuffer>) (Writer<?, ?>) new ByteWriter(input, input);
  }

  @SuppressWarnings("unchecked")
  public static <O> Writer<Object, O> byteBufferEWriter(O value, ByteBuffer input) {
    return (Writer<Object, O>) (Writer<?, ?>) new ByteWriter(value, input);
  }

  public static Writer<Object, Object> writeByteArray(byte[] input, Output<?> output) {
    return ByteWriter.write(output, input);
  }

  public static Writer<Object, Object> writeByteBuffer(ByteBuffer input, Output<?> output) {
    return ByteWriter.write(output, input);
  }

  public static Encoder<ReadableByteChannel, ReadableByteChannel> channelEncoder() {
    return new ChannelEncoder();
  }

  public static Encoder<ReadableByteChannel, ReadableByteChannel> channelEncoder(ReadableByteChannel input) {
    return new ChannelEncoder(input);
  }

  public static <O> Decoder<O> decode(Decoder<O> decoder, InputStream input) throws IOException {
    final byte[] data = new byte[4096];
    final InputBuffer buffer = Binary.inputBuffer(data);
    do {
      final int count = input.read(data);
      buffer.index(0).limit(Math.max(0, count)).isPart(count >= 0);
      decoder = decoder.feed(buffer);
      if (!decoder.isCont()) {
        return decoder;
      }
    } while (true);
  }

  public static <O> O read(Decoder<O> decoder, InputStream input) throws IOException {
    decoder = decode(decoder, input);
    if (decoder.isDone()) {
      return decoder.bind();
    } else {
      final Throwable error = decoder.trap();
      if (error instanceof RuntimeException) {
        throw (RuntimeException) error;
      } else {
        throw new RuntimeException(error);
      }
    }
  }
}
