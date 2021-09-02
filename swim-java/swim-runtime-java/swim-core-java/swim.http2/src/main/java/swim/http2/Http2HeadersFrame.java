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

public final class Http2HeadersFrame extends Http2Frame<Object> implements Debug {

  final int frameFlags;
  final int streamIdentifier;
  final int padLength;
  final int streamDependency;
  final int weight;
  final FingerTrieSeq<HpackHeader> headers;

  Http2HeadersFrame(int frameFlags, int streamIdentifier, int padLength,
                    int streamDependency, int weight, FingerTrieSeq<HpackHeader> headers) {
    this.frameFlags = frameFlags;
    this.streamIdentifier = streamIdentifier;
    this.padLength = padLength;
    this.streamDependency = streamDependency;
    this.weight = weight;
    this.headers = headers;
  }

  @Override
  public int frameType() {
    return 0x1;
  }

  @Override
  public int frameFlags() {
    return this.frameFlags;
  }

  public boolean endStream() {
    return (this.frameFlags & Http2HeadersFrame.END_STREAM_FLAG) != 0;
  }

  public Http2HeadersFrame endStream(boolean endStream) {
    final int frameFlags = endStream
                         ? this.frameFlags | Http2HeadersFrame.END_STREAM_FLAG
                         : this.frameFlags & ~Http2HeadersFrame.END_STREAM_FLAG;
    return new Http2HeadersFrame(frameFlags, this.streamIdentifier, this.padLength,
                                 this.streamDependency, this.weight, this.headers);
  }

  public boolean endHeaders() {
    return (this.frameFlags & Http2HeadersFrame.END_HEADERS_FLAG) != 0;
  }

  public Http2HeadersFrame endHeaders(boolean endHeaders) {
    final int frameFlags = endHeaders
                         ? this.frameFlags | Http2HeadersFrame.END_HEADERS_FLAG
                         : this.frameFlags & ~Http2HeadersFrame.END_HEADERS_FLAG;
    return new Http2HeadersFrame(frameFlags, this.streamIdentifier, this.padLength,
                                 this.streamDependency, this.weight, this.headers);
  }

  public boolean padded() {
    return (this.frameFlags & Http2HeadersFrame.PADDED_FLAG) != 0;
  }

  public Http2HeadersFrame padded(boolean padded) {
    final int frameFlags = padded
                         ? this.frameFlags | Http2HeadersFrame.PADDED_FLAG
                         : this.frameFlags & ~Http2HeadersFrame.PADDED_FLAG;
    return new Http2HeadersFrame(frameFlags, this.streamIdentifier, this.padLength,
                                 this.streamDependency, this.weight, this.headers);
  }

  public boolean priority() {
    return (this.frameFlags & Http2HeadersFrame.PRIORITY_FLAG) != 0;
  }

  public Http2HeadersFrame priority(boolean priority) {
    final int frameFlags = priority
                         ? this.frameFlags | Http2HeadersFrame.PRIORITY_FLAG
                         : this.frameFlags & ~Http2HeadersFrame.PRIORITY_FLAG;
    return new Http2HeadersFrame(frameFlags, this.streamIdentifier, this.padLength,
                                 this.streamDependency, this.weight, this.headers);
  }

  public int streamIdentifier() {
    return this.streamIdentifier;
  }

  public Http2HeadersFrame streamIdentifier(int streamIdentifier) {
    return new Http2HeadersFrame(this.frameFlags, streamIdentifier, this.padLength,
                                 this.streamDependency, this.weight, this.headers);
  }

  public int padLength() {
    return this.padLength;
  }

  public Http2HeadersFrame padLength(int padLength) {
    return new Http2HeadersFrame(this.frameFlags, this.streamIdentifier, padLength,
                                 this.streamDependency, this.weight, this.headers);
  }

  public int streamDependency() {
    return this.streamDependency;
  }

  public Http2HeadersFrame streamDependency(int streamDependency) {
    return new Http2HeadersFrame(this.frameFlags, this.streamIdentifier, this.padLength,
                                 streamDependency, this.weight, this.headers);
  }

  public int weight() {
    return this.weight;
  }

  public Http2HeadersFrame weight(int weight) {
    return new Http2HeadersFrame(this.frameFlags, this.streamIdentifier, this.padLength,
                                 this.streamDependency, weight, this.headers);
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

  public Http2HeadersFrame headers(FingerTrieSeq<HpackHeader> headers) {
    return new Http2HeadersFrame(this.frameFlags, this.streamIdentifier, this.padLength,
                                 this.streamDependency, this.weight, headers);
  }

  public Http2HeadersFrame headers(HpackHeader... headers) {
    return this.headers(FingerTrieSeq.of(headers));
  }

  public Http2HeadersFrame appendedHeaders(FingerTrieSeq<HpackHeader> newHeaders) {
    final FingerTrieSeq<HpackHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HpackHeader> headers = oldHeaders.appended(newHeaders);
    if (oldHeaders != headers) {
      return new Http2HeadersFrame(this.frameFlags, this.streamIdentifier, this.padLength,
                                   this.streamDependency, this.weight, headers);
    } else {
      return this;
    }
  }

  public Http2HeadersFrame appendedHeaders(HpackHeader... newHeaders) {
    return this.appendedHeaders(FingerTrieSeq.of(newHeaders));
  }

  public Http2HeadersFrame appendedHeader(HpackHeader newHeader) {
    final FingerTrieSeq<HpackHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HpackHeader> headers = oldHeaders.appended(newHeader);
    if (oldHeaders != headers) {
      return new Http2HeadersFrame(this.frameFlags, this.streamIdentifier, this.padLength,
                                   this.streamDependency, this.weight, headers);
    } else {
      return this;
    }
  }

  @Override
  public Encoder<?, Http2HeadersFrame> http2Encoder(Http2Encoder http2) {
    return http2.headersFrameEncoder(this);
  }

  @Override
  public Encoder<?, Http2HeadersFrame> encodeHttp2(OutputBuffer<?> output, Http2Encoder http2) {
    return http2.encodeHeadersFrame(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Http2HeadersFrame) {
      final Http2HeadersFrame that = (Http2HeadersFrame) other;
      return this.frameFlags == that.frameFlags && this.streamIdentifier == that.streamIdentifier
          && this.padLength == that.padLength && this.streamDependency == that.streamDependency
          && this.weight == that.weight && this.headers.equals(that.headers);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Http2HeadersFrame.hashSeed == 0) {
      Http2HeadersFrame.hashSeed = Murmur3.seed(Http2HeadersFrame.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Http2HeadersFrame.hashSeed, this.frameFlags), this.streamIdentifier), this.padLength),
        this.streamDependency), this.weight), this.headers.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Http2HeadersFrame").write('.').write("create").write('(')
                   .debug(this.streamIdentifier).write(')');
    if (this.frameFlags != 0) {
      output = output.write('.').write("frameFlags").write('(').debug(this.frameFlags).write(')');
    }
    if (this.endStream()) {
      output = output.write('.').write("endStream").write('(').write("true").write(')');
    }
    if (this.endHeaders()) {
      output = output.write('.').write("endHeaders").write('(').write("true").write(')');
    }
    if (this.padded()) {
      output = output.write('.').write("padded").write('(').write("true").write(')');
    }
    if (this.priority()) {
      output = output.write('.').write("priority").write('(').write("true").write(')');
    }
    if (this.padLength != 0) {
      output = output.write('.').write("padLength").write('(').debug(this.padLength).write(')');
    }
    if (this.streamDependency != 0) {
      output = output.write('.').write("streamDependency").write('(').debug(this.streamDependency).write(')');
    }
    if (this.weight != 0) {
      output = output.write('.').write("weight").write('(').debug(this.weight).write(')');
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

  static final int END_STREAM_FLAG = 0x01;
  static final int END_HEADERS_FLAG = 0x04;
  static final int PADDED_FLAG = 0x08;
  static final int PRIORITY_FLAG = 0x20;

  public static Http2HeadersFrame create(int frameFlags, int streamIdentifier, int padLength,
                                         int streamDependency, int weight, FingerTrieSeq<HpackHeader> headers) {
    return new Http2HeadersFrame(frameFlags, streamIdentifier, padLength, streamDependency, weight, headers);
  }

  public static Http2HeadersFrame create(int streamIdentifier, FingerTrieSeq<HpackHeader> headers) {
    return new Http2HeadersFrame(0, streamIdentifier, 0, 0, 0, headers);
  }

  public static Http2HeadersFrame create(int streamIdentifier, HpackHeader... headers) {
    return new Http2HeadersFrame(0, streamIdentifier, 0, 0, 0, FingerTrieSeq.of(headers));
  }

  public static Http2HeadersFrame create(int streamIdentifier) {
    return new Http2HeadersFrame(0, streamIdentifier, 0, 0, 0, FingerTrieSeq.empty());
  }

}
