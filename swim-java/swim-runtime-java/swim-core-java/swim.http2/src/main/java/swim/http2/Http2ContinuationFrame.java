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

public final class Http2ContinuationFrame extends Http2Frame<Object> implements Debug {

  final int frameFlags;
  final int streamIdentifier;
  final FingerTrieSeq<HpackHeader> headers;

  Http2ContinuationFrame(int frameFlags, int streamIdentifier, FingerTrieSeq<HpackHeader> headers) {
    this.frameFlags = frameFlags;
    this.streamIdentifier = streamIdentifier;
    this.headers = headers;
  }

  @Override
  public int frameType() {
    return 0x9;
  }

  @Override
  public int frameFlags() {
    return this.frameFlags;
  }

  public boolean endHeaders() {
    return (this.frameFlags & Http2ContinuationFrame.END_HEADERS_FLAG) != 0;
  }

  public Http2ContinuationFrame endHeaders(boolean endHeaders) {
    final int frameFlags = endHeaders
                         ? this.frameFlags | Http2ContinuationFrame.END_HEADERS_FLAG
                         : this.frameFlags & ~Http2ContinuationFrame.END_HEADERS_FLAG;
    return new Http2ContinuationFrame(frameFlags, this.streamIdentifier, this.headers);
  }

  public int streamIdentifier() {
    return this.streamIdentifier;
  }

  public Http2ContinuationFrame streamIdentifier(int streamIdentifier) {
    return new Http2ContinuationFrame(this.frameFlags, streamIdentifier, this.headers);
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

  public Http2ContinuationFrame headers(FingerTrieSeq<HpackHeader> headers) {
    return new Http2ContinuationFrame(this.frameFlags, this.streamIdentifier, headers);
  }

  public Http2ContinuationFrame headers(HpackHeader... headers) {
    return this.headers(FingerTrieSeq.of(headers));
  }

  public Http2ContinuationFrame appendedHeaders(FingerTrieSeq<HpackHeader> newHeaders) {
    final FingerTrieSeq<HpackHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HpackHeader> headers = oldHeaders.appended(newHeaders);
    if (oldHeaders != headers) {
      return new Http2ContinuationFrame(this.frameFlags, this.streamIdentifier, headers);
    } else {
      return this;
    }
  }

  public Http2ContinuationFrame appendedHeaders(HpackHeader... newHeaders) {
    return this.appendedHeaders(FingerTrieSeq.of(newHeaders));
  }

  public Http2ContinuationFrame appendedHeader(HpackHeader newHeader) {
    final FingerTrieSeq<HpackHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HpackHeader> headers = oldHeaders.appended(newHeader);
    if (oldHeaders != headers) {
      return new Http2ContinuationFrame(this.frameFlags, this.streamIdentifier, headers);
    } else {
      return this;
    }
  }

  @Override
  public Encoder<?, Http2ContinuationFrame> http2Encoder(Http2Encoder http2) {
    return http2.continuationFrameEncoder(this);
  }

  @Override
  public Encoder<?, Http2ContinuationFrame> encodeHttp2(OutputBuffer<?> output, Http2Encoder http2) {
    return http2.encodeContinuationFrame(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Http2ContinuationFrame) {
      final Http2ContinuationFrame that = (Http2ContinuationFrame) other;
      return this.frameFlags == that.frameFlags && this.streamIdentifier == that.streamIdentifier
          && this.headers.equals(that.headers);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Http2ContinuationFrame.hashSeed == 0) {
      Http2ContinuationFrame.hashSeed = Murmur3.seed(Http2ContinuationFrame.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Http2ContinuationFrame.hashSeed,
        this.frameFlags), this.streamIdentifier), this.headers.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Http2ContinuationFrame").write('.').write("create").write('(')
                   .debug(this.streamIdentifier).write(')');
    if (this.frameFlags != 0) {
      output = output.write('.').write("frameFlags").write('(').debug(this.frameFlags).write(')');
    }
    if (this.endHeaders()) {
      output = output.write('.').write("endHeaders").write('(').write("true").write(')');
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

  public static Http2ContinuationFrame create(int frameFlags, int streamIdentifier,
                                              FingerTrieSeq<HpackHeader> headers) {
    return new Http2ContinuationFrame(frameFlags, streamIdentifier, headers);
  }

  public static Http2ContinuationFrame create(int streamIdentifier, FingerTrieSeq<HpackHeader> headers) {
    return new Http2ContinuationFrame(0, streamIdentifier, headers);
  }

  public static Http2ContinuationFrame create(int streamIdentifier, HpackHeader... headers) {
    return new Http2ContinuationFrame(0, streamIdentifier, FingerTrieSeq.of(headers));
  }

  public static Http2ContinuationFrame create(int streamIdentifier) {
    return new Http2ContinuationFrame(0, streamIdentifier, FingerTrieSeq.empty());
  }

}
