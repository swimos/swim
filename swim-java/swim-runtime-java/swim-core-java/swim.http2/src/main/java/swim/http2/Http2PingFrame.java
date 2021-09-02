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

public final class Http2PingFrame extends Http2Frame<Object> implements Debug {

  final int frameFlags;
  final int streamIdentifier;
  final long opaqueData;

  Http2PingFrame(int frameFlags, int streamIdentifier, long opaqueData) {
    this.frameFlags = frameFlags;
    this.streamIdentifier = streamIdentifier;
    this.opaqueData = opaqueData;
  }

  @Override
  public int frameType() {
    return 0x6;
  }

  @Override
  public int frameFlags() {
    return this.frameFlags;
  }

  public boolean ack() {
    return (this.frameFlags & Http2PingFrame.ACK_FLAG) != 0;
  }

  public Http2PingFrame ack(boolean ack) {
    final int frameFlags = ack
                         ? this.frameFlags | Http2PingFrame.ACK_FLAG
                         : this.frameFlags & ~Http2PingFrame.ACK_FLAG;
    return new Http2PingFrame(frameFlags, this.streamIdentifier, this.opaqueData);
  }

  public int streamIdentifier() {
    return this.streamIdentifier;
  }

  public Http2PingFrame streamIdentifier(int streamIdentifier) {
    return new Http2PingFrame(this.frameFlags, streamIdentifier, this.opaqueData);
  }

  public long opaqueData() {
    return this.opaqueData;
  }

  public Http2PingFrame opaqueData(long opaqueData) {
    return new Http2PingFrame(this.frameFlags, this.streamIdentifier, opaqueData);
  }

  @Override
  public Encoder<?, Http2PingFrame> http2Encoder(Http2Encoder http2) {
    return http2.pingFrameEncoder(this);
  }

  @Override
  public Encoder<?, Http2PingFrame> encodeHttp2(OutputBuffer<?> output, Http2Encoder http2) {
    return http2.encodePingFrame(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Http2PingFrame) {
      final Http2PingFrame that = (Http2PingFrame) other;
      return this.frameFlags == that.frameFlags && this.streamIdentifier == that.streamIdentifier
          && this.opaqueData == that.opaqueData;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Http2PingFrame.hashSeed == 0) {
      Http2PingFrame.hashSeed = Murmur3.seed(Http2PingFrame.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Http2PingFrame.hashSeed,
        this.frameFlags), this.streamIdentifier), Murmur3.hash(this.opaqueData)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Http2PingFrame").write('.').write("create").write('(')
                   .debug(this.streamIdentifier).write(')');
    if (this.frameFlags != 0) {
      output = output.write('.').write("frameFlags").write('(').debug(this.frameFlags).write(')');
    }
    if (this.ack()) {
      output = output.write('.').write("ack").write('(').write("true").write(')');
    }
    if (this.opaqueData != 0) {
      output = output.write('.').write("opaqueData").write('(').debug(this.opaqueData).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  static final int ACK_FLAG = 0x01;

  public static Http2PingFrame create(int frameFlags, int streamIdentifier, long opaqueData) {
    return new Http2PingFrame(frameFlags, streamIdentifier, opaqueData);
  }

  public static Http2PingFrame create(long opaqueData) {
    return new Http2PingFrame(0, 0, opaqueData);
  }

}
