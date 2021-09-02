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
import swim.collections.FingerTrieSeq;
import swim.hpack.HpackHeader;
import swim.util.Murmur3;

public final class Http2PushPromiseFrame extends Http2Frame<Object> implements Debug {

  final int frameFlags;
  final int streamIdentifier;
  final int padLength;
  final int promisedStreamId;
  final FingerTrieSeq<HpackHeader> headers;

  Http2PushPromiseFrame(int frameFlags, int streamIdentifier, int padLength,
                        int promisedStreamId, FingerTrieSeq<HpackHeader> headers) {
    this.frameFlags = frameFlags;
    this.streamIdentifier = streamIdentifier;
    this.padLength = padLength;
    this.promisedStreamId = promisedStreamId;
    this.headers = headers;
  }

  @Override
  public int frameType() {
    return 0x5;
  }

  @Override
  public int frameFlags() {
    return this.frameFlags;
  }

  public boolean endHeaders() {
    return (this.frameFlags & Http2PushPromiseFrame.END_HEADERS_FLAG) != 0;
  }

  public Http2PushPromiseFrame endHeaders(boolean endHeaders) {
    final int frameFlags = endHeaders
                         ? this.frameFlags | Http2PushPromiseFrame.END_HEADERS_FLAG
                         : this.frameFlags & ~Http2PushPromiseFrame.END_HEADERS_FLAG;
    return new Http2PushPromiseFrame(frameFlags, this.streamIdentifier, this.padLength,
                                     this.promisedStreamId, this.headers);
  }

  public boolean padded() {
    return (this.frameFlags & Http2PushPromiseFrame.PADDED_FLAG) != 0;
  }

  public Http2PushPromiseFrame padded(boolean padded) {
    final int frameFlags = padded
                         ? this.frameFlags | Http2PushPromiseFrame.PADDED_FLAG
                         : this.frameFlags & ~Http2PushPromiseFrame.PADDED_FLAG;
    return new Http2PushPromiseFrame(frameFlags, this.streamIdentifier, this.padLength,
                                     this.promisedStreamId, this.headers);
  }

  public int streamIdentifier() {
    return this.streamIdentifier;
  }

  public Http2PushPromiseFrame streamIdentifier(int streamIdentifier) {
    return new Http2PushPromiseFrame(this.frameFlags, streamIdentifier, this.padLength,
                                     this.promisedStreamId, this.headers);
  }

  public int padLength() {
    return this.padLength;
  }

  public Http2PushPromiseFrame padLength(int padLength) {
    return new Http2PushPromiseFrame(this.frameFlags, this.streamIdentifier, padLength,
                                     this.promisedStreamId, this.headers);
  }

  public int promisedStreamId() {
    return this.promisedStreamId;
  }

  public Http2PushPromiseFrame promisedStreamId(int promisedStreamId) {
    return new Http2PushPromiseFrame(this.frameFlags, this.streamIdentifier, this.padLength,
                                     promisedStreamId, this.headers);
  }

  public HpackHeader getHeader(String name) {
    final FingerTrieSeq<HpackHeader> headers = this.headers();
    for (int i = 0, n = headers.size(); i < n; i += 1) {
      final HpackHeader header = headers.get(i);
      if (name.equalsIgnoreCase(header.name())) {
        return header;
      }
    }
    return null;
  }

  public FingerTrieSeq<HpackHeader> headers() {
    return this.headers;
  }

  public Http2PushPromiseFrame headers(FingerTrieSeq<HpackHeader> headers) {
    return new Http2PushPromiseFrame(this.frameFlags, this.streamIdentifier, this.padLength,
                                     this.promisedStreamId, headers);
  }

  public Http2PushPromiseFrame headers(HpackHeader... headers) {
    return this.headers(FingerTrieSeq.of(headers));
  }

  public Http2PushPromiseFrame appendedHeaders(FingerTrieSeq<HpackHeader> newHeaders) {
    final FingerTrieSeq<HpackHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HpackHeader> headers = oldHeaders.appended(newHeaders);
    if (oldHeaders != headers) {
      return new Http2PushPromiseFrame(this.frameFlags, this.streamIdentifier, this.padLength,
                                       this.promisedStreamId, headers);
    } else {
      return this;
    }
  }

  public Http2PushPromiseFrame appendedHeaders(HpackHeader... newHeaders) {
    return this.appendedHeaders(FingerTrieSeq.of(newHeaders));
  }

  public Http2PushPromiseFrame appendedHeader(HpackHeader newHeader) {
    final FingerTrieSeq<HpackHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HpackHeader> headers = oldHeaders.appended(newHeader);
    if (oldHeaders != headers) {
      return new Http2PushPromiseFrame(this.frameFlags, this.streamIdentifier, this.padLength,
                                       this.promisedStreamId, headers);
    } else {
      return this;
    }
  }

  @Override
  public Encoder<?, Http2PushPromiseFrame> http2Encoder(Http2Encoder http2) {
    return http2.pushPromiseFrameEncoder(this);
  }

  @Override
  public Encoder<?, Http2PushPromiseFrame> encodeHttp2(OutputBuffer<?> output, Http2Encoder http2) {
    return http2.encodePushPromiseFrame(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Http2PushPromiseFrame) {
      final Http2PushPromiseFrame that = (Http2PushPromiseFrame) other;
      return this.frameFlags == that.frameFlags && this.streamIdentifier == that.streamIdentifier
          && this.padLength == that.padLength && this.promisedStreamId == that.promisedStreamId
          && this.headers.equals(that.headers);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Http2PushPromiseFrame.hashSeed == 0) {
      Http2PushPromiseFrame.hashSeed = Murmur3.seed(Http2PushPromiseFrame.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Http2PushPromiseFrame.hashSeed, this.frameFlags), this.streamIdentifier), this.padLength),
        this.promisedStreamId), this.headers.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Http2PushPromiseFrame").write('.').write("create").write('(')
                   .debug(this.streamIdentifier).write(')');
    if (this.frameFlags != 0) {
      output = output.write('.').write("frameFlags").write('(').debug(this.frameFlags).write(')');
    }
    if (this.endHeaders()) {
      output = output.write('.').write("endHeaders").write('(').write("true").write(')');
    }
    if (this.padded()) {
      output = output.write('.').write("padded").write('(').write("true").write(')');
    }
    if (this.padLength != 0) {
      output = output.write('.').write("padLength").write('(').debug(this.padLength).write(')');
    }
    if (this.promisedStreamId != 0) {
      output = output.write('.').write("promisedStreamId").write('(').debug(this.promisedStreamId).write(')');
    }
    final FingerTrieSeq<HpackHeader> headers = this.headers;
    final int headerCount = headers.size();
    if (headerCount != 0) {
      output = output.write('.').write("headers").write('(').debug(headers.head());
      for (int i = 1; i < headerCount; i += 1) {
        output = output.write(", ").debug(headers.get(i));
      }
      output = output.write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  static final int END_HEADERS_FLAG = 0x04;
  static final int PADDED_FLAG = 0x08;

  public static Http2PushPromiseFrame create(int frameFlags, int streamIdentifier, int padLength,
                                             int promisedStreamId, FingerTrieSeq<HpackHeader> headers) {
    return new Http2PushPromiseFrame(frameFlags, streamIdentifier, padLength, promisedStreamId, headers);
  }

  public static Http2PushPromiseFrame create(int streamIdentifier, FingerTrieSeq<HpackHeader> headers) {
    return new Http2PushPromiseFrame(0, streamIdentifier, 0, 0, headers);
  }

  public static Http2PushPromiseFrame create(int streamIdentifier, HpackHeader... headers) {
    return new Http2PushPromiseFrame(0, streamIdentifier, 0, 0, FingerTrieSeq.of(headers));
  }

  public static Http2PushPromiseFrame create(int streamIdentifier) {
    return new Http2PushPromiseFrame(0, streamIdentifier, 0, 0, FingerTrieSeq.empty());
  }

}
