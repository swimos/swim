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

public final class Http2PriorityFrame extends Http2Frame<Object> implements Debug {

  final int frameFlags;
  final int streamIdentifier;
  final int streamDependency;
  final int weight;

  Http2PriorityFrame(int frameFlags, int streamIdentifier, int streamDependency, int weight) {
    this.frameFlags = frameFlags;
    this.streamIdentifier = streamIdentifier;
    this.streamDependency = streamDependency;
    this.weight = weight;
  }

  @Override
  public int frameType() {
    return 0x2;
  }

  @Override
  public int frameFlags() {
    return this.frameFlags;
  }

  public int streamIdentifier() {
    return this.streamIdentifier;
  }

  public Http2PriorityFrame streamIdentifier(int streamIdentifier) {
    return new Http2PriorityFrame(this.frameFlags, streamIdentifier,
                                  this.streamDependency, this.weight);
  }

  public int streamDependency() {
    return this.streamDependency;
  }

  public Http2PriorityFrame streamDependency(int streamDependency) {
    return new Http2PriorityFrame(this.frameFlags, this.streamIdentifier,
                                  streamDependency, this.weight);
  }

  public int weight() {
    return this.weight;
  }

  public Http2PriorityFrame weight(int weight) {
    return new Http2PriorityFrame(this.frameFlags, this.streamIdentifier,
                                  this.streamDependency, weight);
  }

  @Override
  public Encoder<?, Http2PriorityFrame> http2Encoder(Http2Encoder http2) {
    return http2.priorityFrameEncoder(this);
  }

  @Override
  public Encoder<?, Http2PriorityFrame> encodeHttp2(OutputBuffer<?> output, Http2Encoder http2) {
    return http2.encodePriorityFrame(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Http2PriorityFrame) {
      final Http2PriorityFrame that = (Http2PriorityFrame) other;
      return this.frameFlags == that.frameFlags && this.streamIdentifier == that.streamIdentifier
          && this.streamDependency == that.streamDependency && this.weight == that.weight;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Http2PriorityFrame.hashSeed == 0) {
      Http2PriorityFrame.hashSeed = Murmur3.seed(Http2PriorityFrame.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Http2PriorityFrame.hashSeed,
        this.frameFlags), this.streamIdentifier), this.streamDependency), this.weight));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Http2PriorityFrame").write('.').write("create").write('(')
                   .debug(this.streamIdentifier).write(')');
    if (this.frameFlags != 0) {
      output = output.write('.').write("frameFlags").write('(').debug(this.frameFlags).write(')');
    }
    if (this.streamDependency != 0) {
      output = output.write('.').write("streamDependency").write('(').debug(this.streamDependency).write(')');
    }
    if (this.weight != 0) {
      output = output.write('.').write("weight").write('(').debug(this.weight).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static Http2PriorityFrame create(int frameFlags, int streamIdentifier,
                                          int streamDependency, int weight) {
    return new Http2PriorityFrame(frameFlags, streamIdentifier, streamDependency, weight);
  }

  public static Http2PriorityFrame create(int streamIdentifier, int streamDependency, int weight) {
    return new Http2PriorityFrame(0, streamIdentifier, streamDependency, weight);
  }

}
