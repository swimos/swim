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

import swim.codec.Debug;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.util.Murmur3;

public final class Http2RstStreamFrame extends Http2Frame<Object> implements Debug {

  final int frameFlags;
  final int streamIdentifier;
  final int errorCode;

  Http2RstStreamFrame(int frameFlags, int streamIdentifier, int errorCode) {
    this.frameFlags = frameFlags;
    this.streamIdentifier = streamIdentifier;
    this.errorCode = errorCode;
  }

  @Override
  public int frameType() {
    return 0x3;
  }

  @Override
  public int frameFlags() {
    return this.frameFlags;
  }

  public int streamIdentifier() {
    return this.streamIdentifier;
  }

  public Http2RstStreamFrame streamIdentifier(int streamIdentifier) {
    return new Http2RstStreamFrame(this.frameFlags, streamIdentifier, this.errorCode);
  }

  public int errorCode() {
    return this.errorCode;
  }

  public Http2RstStreamFrame errorCode(int errorCode) {
    return new Http2RstStreamFrame(this.frameFlags, this.streamIdentifier, errorCode);
  }

  @Override
  public Encoder<?, Http2RstStreamFrame> http2Encoder(Http2Encoder http2) {
    return http2.rstStreamFrameEncoder(this);
  }

  @Override
  public Encoder<?, Http2RstStreamFrame> encodeHttp2(OutputBuffer<?> output, Http2Encoder http2) {
    return http2.encodeRstStreamFrame(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Http2RstStreamFrame) {
      final Http2RstStreamFrame that = (Http2RstStreamFrame) other;
      return this.frameFlags == that.frameFlags && this.streamIdentifier == that.streamIdentifier
          && this.errorCode == that.errorCode;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Http2RstStreamFrame.hashSeed == 0) {
      Http2RstStreamFrame.hashSeed = Murmur3.seed(Http2RstStreamFrame.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Http2RstStreamFrame.hashSeed,
        this.frameFlags), this.streamIdentifier), this.errorCode));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Http2RstStreamFrame").write('.').write("create").write('(')
                   .debug(this.streamIdentifier).write(", ").debug(this.errorCode).write(')');
    if (this.frameFlags != 0) {
      output = output.write('.').write("frameFlags").write('(').debug(this.frameFlags).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static Http2RstStreamFrame create(int frameFlags, int streamIdentifier, int errorCode) {
    return new Http2RstStreamFrame(frameFlags, streamIdentifier, errorCode);
  }

  public static Http2RstStreamFrame create(int streamIdentifier, int errorCode) {
    return new Http2RstStreamFrame(0, streamIdentifier, errorCode);
  }

}
