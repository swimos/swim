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

public final class Http2WindowUpdateFrame extends Http2Frame<Object> implements Debug {

  final int frameFlags;
  final int streamIdentifier;
  final int windowSizeIncrement;

  Http2WindowUpdateFrame(int frameFlags, int streamIdentifier, int windowSizeIncrement) {
    this.frameFlags = frameFlags;
    this.streamIdentifier = streamIdentifier;
    this.windowSizeIncrement = windowSizeIncrement;
  }

  @Override
  public int frameType() {
    return 0x8;
  }

  @Override
  public int frameFlags() {
    return this.frameFlags;
  }

  public int streamIdentifier() {
    return this.streamIdentifier;
  }

  public Http2WindowUpdateFrame streamIdentifier(int streamIdentifier) {
    return new Http2WindowUpdateFrame(this.frameFlags, streamIdentifier, this.windowSizeIncrement);
  }

  public int windowSizeIncrement() {
    return this.windowSizeIncrement;
  }

  public Http2WindowUpdateFrame windowSizeIncrement(int windowSizeIncrement) {
    return new Http2WindowUpdateFrame(this.frameFlags, this.streamIdentifier, windowSizeIncrement);
  }

  @Override
  public Encoder<?, Http2WindowUpdateFrame> http2Encoder(Http2Encoder http2) {
    return http2.windowUpdateFrameEncoder(this);
  }

  @Override
  public Encoder<?, Http2WindowUpdateFrame> encodeHttp2(OutputBuffer<?> output, Http2Encoder http2) {
    return http2.encodeWindowUpdateFrame(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Http2WindowUpdateFrame) {
      final Http2WindowUpdateFrame that = (Http2WindowUpdateFrame) other;
      return this.frameFlags == that.frameFlags && this.streamIdentifier == that.streamIdentifier
          && this.windowSizeIncrement == that.windowSizeIncrement;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Http2WindowUpdateFrame.hashSeed == 0) {
      Http2WindowUpdateFrame.hashSeed = Murmur3.seed(Http2WindowUpdateFrame.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Http2WindowUpdateFrame.hashSeed,
        this.frameFlags), this.streamIdentifier), this.windowSizeIncrement));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Http2WindowUpdateFrame").write('.').write("create").write('(')
                   .debug(this.streamIdentifier).write(", ").debug(this.windowSizeIncrement).write(')');
    if (this.frameFlags != 0) {
      output = output.write('.').write("frameFlags").write('(').debug(this.frameFlags).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static Http2WindowUpdateFrame create(int frameFlags, int streamIdentifier, int windowSizeIncrement) {
    return new Http2WindowUpdateFrame(frameFlags, streamIdentifier, windowSizeIncrement);
  }

  public static Http2WindowUpdateFrame create(int streamIdentifier, int windowSizeIncrement) {
    return new Http2WindowUpdateFrame(0, streamIdentifier, windowSizeIncrement);
  }

}
