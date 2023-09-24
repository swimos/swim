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

import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.ByteBuffer;
import java.nio.channels.ReadableByteChannel;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class Binary {

  private Binary() {
    // static
  }

  static final MediaType APPLICATION_OCTET_STREAM = MediaType.of("application", "octet-stream");

  public static <T> Format<T> blankCodec() {
    return Assume.conforms(BlankCodec.INSTANCE);
  }

  public static <T> Format<T> blankCodec(MediaType mediaType) {
    if (APPLICATION_OCTET_STREAM.equals(mediaType)) {
      return Assume.conforms(BlankCodec.INSTANCE);
    }
    return new BlankCodec<T>(mediaType);
  }

  public static Format<byte[]> byteArrayCodec() {
    return ByteArrayCodec.INSTANCE;
  }

  public static Format<byte[]> byteArrayCodec(MediaType mediaType) {
    if (APPLICATION_OCTET_STREAM.equals(mediaType)) {
      return ByteArrayCodec.INSTANCE;
    }
    return new ByteArrayCodec(mediaType);
  }

  public static Format<ByteBuffer> byteBufferCodec() {
    return ByteBufferCodec.INSTANCE;
  }

  public static Format<ByteBuffer> byteBufferCodec(MediaType mediaType) {
    if (APPLICATION_OCTET_STREAM.equals(mediaType)) {
      return ByteBufferCodec.INSTANCE;
    }
    return new ByteBufferCodec(mediaType);
  }

  public static MetaCodec metaCodec() {
    return BinaryMetaCodec.INSTANCE;
  }

  public static MetaCodec metaCodec(MediaType mediaType) {
    if (APPLICATION_OCTET_STREAM.equals(mediaType)) {
      return BinaryMetaCodec.INSTANCE;
    }
    return new BinaryMetaCodec(mediaType);
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

final class BlankCodec<T> implements Format<T>, WriteSource {

  final MediaType mediaType;

  BlankCodec(MediaType mediaType) {
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

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Binary", "blankCodec");
    if (!this.mediaType.equals(Binary.APPLICATION_OCTET_STREAM)) {
      notation.appendArgument(this.mediaType);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final BlankCodec<?> INSTANCE = new BlankCodec<Object>(Binary.APPLICATION_OCTET_STREAM);

}

final class ByteArrayCodec implements Format<byte[]>, WriteSource {

  final MediaType mediaType;

  ByteArrayCodec(MediaType mediaType) {
    this.mediaType = mediaType;
  }

  @Override
  public MediaType mediaType() {
    return this.mediaType;
  }

  @Override
  public long sizeOf(byte @Nullable [] value) {
    if (value == null) {
      return 0L;
    }
    return (long) value.length;
  }

  @Override
  public Decode<byte[]> decode(InputBuffer input) {
    return Binary.decode(input, new ByteArrayOutput());
  }

  @Override
  public Encode<?> encode(OutputBuffer<?> output, byte @Nullable [] value) {
    if (value == null) {
      return Encode.done();
    }
    return Binary.encode(output, new BinaryInput(value));
  }

  @Override
  public Parse<byte[]> parse(Input input) {
    return Binary.decode(input, new ByteArrayOutput());
  }

  @Override
  public Write<?> write(Output<?> output, byte @Nullable [] value) {
    if (value == null) {
      return Write.done();
    }
    return Binary.encode(output, new BinaryInput(value));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Binary", "byteArrayCodec");
    if (!this.mediaType.equals(Binary.APPLICATION_OCTET_STREAM)) {
      notation.appendArgument(this.mediaType);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final ByteArrayCodec INSTANCE = new ByteArrayCodec(Binary.APPLICATION_OCTET_STREAM);

}

final class ByteBufferCodec implements Format<ByteBuffer>, WriteSource {

  final MediaType mediaType;

  ByteBufferCodec(MediaType mediaType) {
    this.mediaType = mediaType;
  }

  @Override
  public MediaType mediaType() {
    return this.mediaType;
  }

  @Override
  public long sizeOf(@Nullable ByteBuffer value) {
    if (value == null) {
      return 0L;
    }
    return (long) value.remaining();
  }

  @Override
  public Decode<ByteBuffer> decode(InputBuffer input) {
    return Binary.decode(input, new ByteBufferOutput());
  }

  @Override
  public Encode<?> encode(OutputBuffer<?> output, @Nullable ByteBuffer value) {
    if (value == null) {
      return Encode.done();
    }
    return Binary.encode(output, new BinaryInputBuffer(value.duplicate()));
  }

  @Override
  public Parse<ByteBuffer> parse(Input input) {
    return Binary.decode(input, new ByteBufferOutput());
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable ByteBuffer value) {
    if (value == null) {
      return Write.done();
    }
    return Binary.encode(output, new BinaryInputBuffer(value.duplicate()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Binary", "byteBufferCodec");
    if (!this.mediaType.equals(Binary.APPLICATION_OCTET_STREAM)) {
      notation.appendArgument(this.mediaType);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final ByteBufferCodec INSTANCE = new ByteBufferCodec(Binary.APPLICATION_OCTET_STREAM);

}

final class BinaryMetaCodec implements MetaFormat, WriteSource {

  final MediaType mediaType;

  BinaryMetaCodec(MediaType mediaType) {
    this.mediaType = mediaType;
  }

  @Override
  public MediaType mediaType() {
    return this.mediaType;
  }

  @Override
  public <T> Format<T> getFormat(Type type) throws CodecException {
    if (type instanceof Class<?>) {
      final Class<?> classType = (Class<?>) type;
      if (classType.isAssignableFrom(Byte.TYPE.arrayType())) {
        return Assume.conforms(ByteArrayCodec.INSTANCE);
      } else if (classType.isAssignableFrom(ByteBuffer.class)) {
        return Assume.conforms(ByteBufferCodec.INSTANCE);
      }
    }
    throw new CodecException("no codec for " + type);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Binary", "metaCodec");
    if (!this.mediaType.equals(Binary.APPLICATION_OCTET_STREAM)) {
      notation.appendArgument(this.mediaType);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final BinaryMetaCodec INSTANCE = new BinaryMetaCodec(Binary.APPLICATION_OCTET_STREAM);

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
      return Parse.done(output.getUnchecked());
    } else if (input.isError()) {
      return Parse.error(input.getError());
    } else if (output.isDone()) {
      return Parse.error(new ParseException("incomplete parse"));
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
      return Parse.done(output.getUnchecked());
    } else if (input.isError()) {
      return Parse.error(input.getError());
    } else if (output.isDone()) {
      return Parse.error(new ParseException("incomplete parse"));
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
      return Write.error(new WriteException("truncated write"));
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
      return Write.error(new WriteException("truncated write"));
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
    } catch (IOException cause) {
      try {
        input.close();
      } catch (IOException swallow) {
        // ignore
      }
      return Encode.error(cause);
    } catch (Throwable cause) {
      try {
        input.close();
      } catch (IOException swallow) {
        // ignore
      }
      throw cause;
    }
  }

}
