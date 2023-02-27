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

package swim.codec;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.ReadableByteChannel;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class Binary {

  private Binary() {
    // static
  }

  static final MediaType APPLICATION_OCTET_STREAM = MediaType.of("application", "octet-stream");

  static final BlankTranscoder<?> BLANK_TRANSCODER = new BlankTranscoder<Object>(APPLICATION_OCTET_STREAM);

  public static <T> Translator<T> blankTranscoder() {
    return Assume.conforms(BLANK_TRANSCODER);
  }

  public static <T> Translator<T> blankTranscoder(MediaType mediaType) {
    if (APPLICATION_OCTET_STREAM.equals(mediaType)) {
      return Assume.conforms(BLANK_TRANSCODER);
    } else {
      return new BlankTranscoder<T>(mediaType);
    }
  }

  static final ByteArrayTranscoder BYTE_ARRAY_TRANSCODER = new ByteArrayTranscoder(APPLICATION_OCTET_STREAM);

  public static Translator<byte[]> byteArrayTranscoder() {
    return BYTE_ARRAY_TRANSCODER;
  }

  public static Translator<byte[]> byteArrayTranscoder(MediaType mediaType) {
    if (APPLICATION_OCTET_STREAM.equals(mediaType)) {
      return BYTE_ARRAY_TRANSCODER;
    } else {
      return new ByteArrayTranscoder(mediaType);
    }
  }

  static final ByteBufferTranscoder BYTE_BUFFER_TRANSCODER = new ByteBufferTranscoder(APPLICATION_OCTET_STREAM);

  public static Translator<ByteBuffer> byteBufferTranscoder() {
    return BYTE_BUFFER_TRANSCODER;
  }

  public static Translator<ByteBuffer> byteBufferTranscoder(MediaType mediaType) {
    if (APPLICATION_OCTET_STREAM.equals(mediaType)) {
      return BYTE_BUFFER_TRANSCODER;
    } else {
      return new ByteBufferTranscoder(mediaType);
    }
  }

  public static <T> Parse<T> decode(Input input, Output<T> output) {
    return DecodeBinary.parse(input, output);
  }

  public static <T> Parse<T> decode(Output<T> output) {
    return new DecodeBinary<T>(output);
  }

  public static <T> Write<T> encode(Output<?> output, Input input) {
    return EncodeBinary.write(output, input);
  }

  public static <T> Write<T> encode(Input input) {
    return new EncodeBinary<T>(input);
  }

  public static Encode<?> encodeChannel(ReadableByteChannel input) {
    return new EncodeChannel(input);
  }

}

final class BlankTranscoder<T> implements Translator<T> {

  final MediaType mediaType;

  BlankTranscoder(MediaType mediaType) {
    this.mediaType = mediaType;
  }

  @Override
  public MediaType mediaType() {
    return this.mediaType;
  }

  @Override
  public long sizeOf(@Nullable T value) {
    return 0L;
  }

  @Override
  public Decode<T> decode(InputBuffer input) {
    return Decode.done();
  }

  @Override
  public Decode<T> decode() {
    return Decode.done();
  }

  @Override
  public Encode<?> encode(OutputBuffer<?> output, @Nullable T value) {
    return Encode.done();
  }

  @Override
  public Encode<?> encode(@Nullable T value) {
    return Encode.done();
  }

  @Override
  public Parse<T> parse(Input input) {
    return Parse.done();
  }

  @Override
  public Parse<T> parse() {
    return Parse.done();
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T value) {
    return Write.done();
  }

  @Override
  public Write<?> write(@Nullable T value) {
    return Write.done();
  }

}

final class ByteArrayTranscoder implements Translator<byte[]>, ToSource {

  final MediaType mediaType;

  ByteArrayTranscoder(MediaType mediaType) {
    this.mediaType = mediaType;
  }

  @Override
  public MediaType mediaType() {
    return this.mediaType;
  }

  @Override
  public long sizeOf(byte @Nullable [] value) {
    if (value != null) {
      return (long) value.length;
    } else {
      return 0L;
    }
  }

  @Override
  public Decode<byte[]> decode(InputBuffer input) {
    return Binary.decode(input, new ByteArrayOutput());
  }

  @Override
  public Encode<?> encode(OutputBuffer<?> output, byte @Nullable [] value) {
    if (value != null) {
      return Binary.encode(output, new BinaryInput(value));
    } else {
      return Encode.done();
    }
  }

  @Override
  public Parse<byte[]> parse(Input input) {
    return Binary.decode(input, new ByteArrayOutput());
  }

  @Override
  public Write<?> write(Output<?> output, byte @Nullable [] value) {
    if (value != null) {
      return Binary.encode(output, new BinaryInput(value));
    } else {
      return Write.done();
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Binary", "byteArrayTranscoder");
    if (!this.mediaType.equals(Binary.APPLICATION_OCTET_STREAM)) {
      notation.appendArgument(this.mediaType);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}

final class ByteBufferTranscoder implements Translator<ByteBuffer>, ToSource {

  final MediaType mediaType;

  ByteBufferTranscoder(MediaType mediaType) {
    this.mediaType = mediaType;
  }

  @Override
  public MediaType mediaType() {
    return this.mediaType;
  }

  @Override
  public long sizeOf(@Nullable ByteBuffer value) {
    if (value != null) {
      return (long) value.remaining();
    } else {
      return 0L;
    }
  }

  @Override
  public Decode<ByteBuffer> decode(InputBuffer input) {
    return Binary.decode(input, new ByteBufferOutput());
  }

  @Override
  public Encode<?> encode(OutputBuffer<?> output, @Nullable ByteBuffer value) {
    if (value != null) {
      return Binary.encode(output, new BinaryInputBuffer(value.duplicate()));
    } else {
      return Encode.done();
    }
  }

  @Override
  public Parse<ByteBuffer> parse(Input input) {
    return Binary.decode(input, new ByteBufferOutput());
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable ByteBuffer value) {
    if (value != null) {
      return Binary.encode(output, new BinaryInputBuffer(value.duplicate()));
    } else {
      return Write.done();
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Binary", "byteBufferTranscoder");
    if (!this.mediaType.equals(Binary.APPLICATION_OCTET_STREAM)) {
      notation.appendArgument(this.mediaType);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}

final class DecodeBinary<T> extends Parse<T> {

  final Output<T> output;

  DecodeBinary(Output<T> output) {
    this.output = output;
  }

  @Override
  public Parse<T> consume(Input input) {
    final Output<T> output = this.output;
    while (input.isCont() && output.isCont()) {
      output.write(input.head());
      input.step();
    }
    if (input.isDone()) {
      return Parse.done(output.get());
    } else if (input.isError()) {
      return Parse.error(input.getError());
    } else if (output.isDone()) {
      return Parse.error(new ParseException("Incomplete parse"));
    } else if (output.isError()) {
      return Parse.error(output.getError());
    }
    return this;
  }

  static <T> Parse<T> parse(Input input, Output<T> output) {
    while (input.isCont() && output.isCont()) {
      output.write(input.head());
      input.step();
    }
    if (input.isDone()) {
      return Parse.done(output.get());
    } else if (input.isError()) {
      return Parse.error(input.getError());
    } else if (output.isDone()) {
      return Parse.error(new ParseException("Incomplete parse"));
    } else if (output.isError()) {
      return Parse.error(output.getError());
    }
    return new DecodeBinary<T>(output);
  }

}

final class EncodeBinary<T> extends Write<T> {

  final Input input;

  EncodeBinary(Input input) {
    this.input = input;
  }

  @Override
  public Write<T> produce(Output<?> output) {
    final Input input = this.input;
    while (input.isCont() && output.isCont()) {
      output.write(input.head());
      input.step();
    }
    if (input.isDone() && !output.isError()) {
      return Write.done();
    } else if (input.isError()) {
      return Write.error(input.getError());
    } else if (output.isDone()) {
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return this;
  }

  static <T> Write<T> write(Output<?> output, Input input) {
    while (input.isCont() && output.isCont()) {
      output.write(input.head());
      input.step();
    }
    if (input.isDone() && !output.isError()) {
      return Write.done();
    } else if (input.isError()) {
      return Write.error(input.getError());
    } else if (output.isDone()) {
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new EncodeBinary<T>(input);
  }

}

final class EncodeChannel extends Encode<Object> {

  final ReadableByteChannel input;

  EncodeChannel(ReadableByteChannel input) {
    this.input = input;
  }

  @Override
  public Encode<Object> produce(OutputBuffer<?> output) {
    final ReadableByteChannel input = this.input;
    try {
      final int k = output.write(input);
      if (k < 0 || output.isLast()) {
        input.close();
        return Encode.done();
      } else if (output.isError()) {
        input.close();
        return Encode.error(output.getError());
      } else {
        return this;
      }
    } catch (IOException error) {
      try {
        input.close();
      } catch (IOException ignore) {
        // swallow
      }
      return Encode.error(error);
    } catch (Throwable error) {
      try {
        input.close();
      } catch (IOException ignore) {
        // swallow
      }
      throw error;
    }
  }

}
