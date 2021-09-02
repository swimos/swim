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
import swim.structure.Data;
import swim.util.Murmur3;

public final class Http2GoawayFrame extends Http2Frame<Object> implements Debug {

  final int frameFlags;
  final int streamIdentifier;
  final int lastStreamId;
  final int errorCode;
  final Data debugData;

  Http2GoawayFrame(int frameFlags, int streamIdentifier, int lastStreamId,
                   int errorCode, Data debugData) {
    this.frameFlags = frameFlags;
    this.streamIdentifier = streamIdentifier;
    this.lastStreamId = lastStreamId;
    this.errorCode = errorCode;
    this.debugData = debugData.commit();
  }

  @Override
  public int frameType() {
    return 0x7;
  }

  @Override
  public int frameFlags() {
    return this.frameFlags;
  }

  public int streamIdentifier() {
    return this.streamIdentifier;
  }

  public Http2GoawayFrame streamIdentifier(int streamIdentifier) {
    return new Http2GoawayFrame(this.frameFlags, streamIdentifier,
                                this.lastStreamId, this.errorCode, this.debugData);
  }

  public int lastStreamId() {
    return this.lastStreamId;
  }

  public Http2GoawayFrame lastStreamId(int lastStreamId) {
    return new Http2GoawayFrame(this.frameFlags, this.streamIdentifier,
                                lastStreamId, this.errorCode, this.debugData);
  }

  public int errorCode() {
    return this.errorCode;
  }

  public Http2GoawayFrame errorCode(int errorCode) {
    return new Http2GoawayFrame(this.frameFlags, this.streamIdentifier,
                                this.lastStreamId, errorCode, this.debugData);
  }

  public Data debugData() {
    return this.debugData;
  }

  public Http2GoawayFrame debugData(Data debugData) {
    return new Http2GoawayFrame(this.frameFlags, this.streamIdentifier,
                                this.lastStreamId, this.errorCode, debugData);
  }

  @Override
  public Encoder<?, Http2GoawayFrame> http2Encoder(Http2Encoder http2) {
    return http2.goawayFrameEncoder(this);
  }

  @Override
  public Encoder<?, Http2GoawayFrame> encodeHttp2(OutputBuffer<?> output, Http2Encoder http2) {
    return http2.encodeGoawayFrame(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Http2GoawayFrame) {
      final Http2GoawayFrame that = (Http2GoawayFrame) other;
      return this.frameFlags == that.frameFlags && this.streamIdentifier == that.streamIdentifier
          && this.lastStreamId == that.lastStreamId && this.errorCode == that.errorCode
          && this.debugData.equals(that.debugData);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Http2GoawayFrame.hashSeed == 0) {
      Http2GoawayFrame.hashSeed = Murmur3.seed(Http2GoawayFrame.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Http2GoawayFrame.hashSeed, this.frameFlags), this.streamIdentifier),
        this.lastStreamId), this.errorCode), this.debugData.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Http2GoawayFrame").write('.').write("create").write('(')
                   .debug(this.lastStreamId).write(", ")
                   .debug(this.errorCode).write(", ")
                   .debug(this.debugData).write(')');
    if (this.streamIdentifier != 0) {
      output = output.write('.').write("streamIdentifier").write('(').debug(this.streamIdentifier).write(')');
    }
    if (this.frameFlags != 0) {
      output = output.write('.').write("frameFlags").write('(').debug(this.frameFlags).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static Http2GoawayFrame create(int frameFlags, int streamIdentifier,
                                        int lastStreamId, int errorCode, Data debugData) {
    return new Http2GoawayFrame(frameFlags, streamIdentifier, lastStreamId, errorCode, debugData);
  }

  public static Http2GoawayFrame create(int lastStreamId, int errorCode, Data debugData) {
    return new Http2GoawayFrame(0, 0, lastStreamId, errorCode, debugData);
  }

  public static Http2GoawayFrame create(int lastStreamId, int errorCode) {
    return new Http2GoawayFrame(0, 0, lastStreamId, errorCode, Data.empty());
  }

}
