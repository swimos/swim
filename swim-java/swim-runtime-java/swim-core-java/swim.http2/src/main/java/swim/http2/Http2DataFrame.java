// Copyright 2015-2021 Swim Inc.
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

package swim.http2;

import java.nio.ByteBuffer;
import swim.codec.Binary;
import swim.codec.Debug;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.codec.Utf8;
import swim.structure.Data;
import swim.util.Murmur3;

public final class Http2DataFrame<T> extends Http2Frame<T> implements Debug {

  final int frameFlags;
  final int streamIdentifier;
  final int padLength;
  final T payloadValue;
  final Encoder<?, ?> payloadEncoder;

  Http2DataFrame(int frameFlags, int streamIdentifier, int padLength,
                 T payloadValue, Encoder<?, ?> payloadEncoder) {
    this.frameFlags = frameFlags;
    this.streamIdentifier = streamIdentifier;
    this.padLength = padLength;
    this.payloadValue = payloadValue;
    this.payloadEncoder = payloadEncoder;
  }

  @Override
  public int frameType() {
    return 0x0;
  }

  @Override
  public int frameFlags() {
    return this.frameFlags;
  }

  public boolean endStream() {
    return (this.frameFlags & Http2DataFrame.END_STREAM_FLAG) != 0;
  }

  public Http2DataFrame<T> endStream(boolean endStream) {
    final int frameFlags = endStream
                         ? this.frameFlags | Http2DataFrame.END_STREAM_FLAG
                         : this.frameFlags & ~Http2DataFrame.END_STREAM_FLAG;
    return new Http2DataFrame<T>(frameFlags, this.streamIdentifier, this.padLength,
                                 this.payloadValue, this.payloadEncoder);
  }

  public boolean padded() {
    return (this.frameFlags & Http2DataFrame.PADDED_FLAG) != 0;
  }

  public Http2DataFrame<T> padded(boolean padded) {
    final int frameFlags = padded
                         ? this.frameFlags | Http2DataFrame.PADDED_FLAG
                         : this.frameFlags & ~Http2DataFrame.PADDED_FLAG;
    return new Http2DataFrame<T>(frameFlags, this.streamIdentifier, this.padLength,
                                 this.payloadValue, this.payloadEncoder);
  }

  public int streamIdentifier() {
    return this.streamIdentifier;
  }

  public Http2DataFrame<T> streamIdentifier(int streamIdentifier) {
    return new Http2DataFrame<T>(this.frameFlags, streamIdentifier, this.padLength,
                                 this.payloadValue, this.payloadEncoder);
  }

  public int padLength() {
    return this.padLength;
  }

  public Http2DataFrame<T> padLength(int padLength) {
    return new Http2DataFrame<T>(this.frameFlags, this.streamIdentifier, padLength,
                                 this.payloadValue, this.payloadEncoder);
  }

  public T payloadValue() {
    return this.payloadValue;
  }

  public <U> Http2DataFrame<U> payloadValue(U payloadValue) {
    return new Http2DataFrame<U>(this.frameFlags, this.streamIdentifier, this.padLength,
                                 payloadValue, this.payloadEncoder);
  }

  public Encoder<?, ?> payloadEncoder() {
    return this.payloadEncoder;
  }

  public <U> Http2DataFrame<U> payloadEncoder(Encoder<?, ?> payloadEncoder) {
    return new Http2DataFrame<U>(this.frameFlags, this.streamIdentifier, this.padLength,
                                 null, payloadEncoder);
  }

  public <U> Http2DataFrame<U> payload(U payloadValue, Encoder<?, ?> payloadEncoder) {
    return new Http2DataFrame<U>(this.frameFlags, this.streamIdentifier, this.padLength,
                                 payloadValue, payloadEncoder);
  }

  public <U> Http2DataFrame<U> payload(ByteBuffer payloadValue) {
    return new Http2DataFrame<U>(this.frameFlags, this.streamIdentifier, this.padLength,
                                 null, Binary.byteBufferWriter(payloadValue));
  }

  public Http2DataFrame<Data> payload(Data payloadValue) {
    return new Http2DataFrame<Data>(this.frameFlags, this.streamIdentifier, this.padLength,
                                    payloadValue, payloadValue.writer());
  }

  public Http2DataFrame<String> payload(String payloadValue) {
    Output<ByteBuffer> output = Utf8.encodedOutput(Binary.byteBufferOutput(payloadValue.length()));
    output = output.write(payloadValue);
    final ByteBuffer payloadData = output.bind();
    return new Http2DataFrame<String>(this.frameFlags, this.streamIdentifier, this.padLength,
                                      payloadValue, Binary.byteBufferWriter(payloadData));
  }

  @Override
  public Encoder<?, Http2DataFrame<T>> http2Encoder(Http2Encoder http2) {
    return http2.dataFrameEncoder(this);
  }

  @Override
  public Encoder<?, Http2DataFrame<T>> encodeHttp2(OutputBuffer<?> output, Http2Encoder http2) {
    return http2.encodeDataFrame(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Http2DataFrame<?>) {
      final Http2DataFrame<?> that = (Http2DataFrame<?>) other;
      return this.frameFlags == that.frameFlags && this.streamIdentifier == that.streamIdentifier
          && this.padLength == that.padLength
          && (this.payloadValue == null ? that.payloadValue == null : this.payloadValue.equals(that.payloadValue));
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Http2DataFrame.hashSeed == 0) {
      Http2DataFrame.hashSeed = Murmur3.seed(Http2DataFrame.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Http2DataFrame.hashSeed,
        this.frameFlags), this.streamIdentifier), this.padLength), Murmur3.hash(this.payloadValue)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Http2DataFrame").write('.').write("create").write('(')
                   .debug(this.streamIdentifier).write(", ")
                   .debug(this.payloadValue).write(",")
                   .debug(this.payloadEncoder).write(')');
    if ((this.frameFlags & ~(Http2DataFrame.END_STREAM_FLAG | Http2DataFrame.PADDED_FLAG)) != 0) {
      output = output.write('.').write("frameFlags").write('(').debug(this.frameFlags).write(')');
    } else {
      if (this.endStream()) {
        output = output.write('.').write("endStream").write('(').write("true").write(')');
      }
      if (this.padded()) {
        output = output.write('.').write("padded").write('(').write("true").write(')');
      }
    }
    if (this.padLength != 0) {
      output = output.write('.').write("padLength").write('(').debug(this.padLength).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  static final int END_STREAM_FLAG = 0x01;
  static final int PADDED_FLAG = 0x08;

  public static <T> Http2DataFrame<T> create(int frameFlags, int streamIdentifier, int padLength,
                                             T payloadValue, Encoder<?, ?> payloadEncoder) {
    return new Http2DataFrame<T>(frameFlags, streamIdentifier, padLength, payloadValue, payloadEncoder);
  }

  public static <T> Http2DataFrame<T> create(int streamIdentifier, T payloadValue, Encoder<?, ?> payloadEncoder) {
    return new Http2DataFrame<T>(0, streamIdentifier, 0, payloadValue, payloadEncoder);
  }

  public static Http2DataFrame<Object> create(int streamIdentifier) {
    return new Http2DataFrame<Object>(0, streamIdentifier, 0, null, Encoder.done());
  }

}
