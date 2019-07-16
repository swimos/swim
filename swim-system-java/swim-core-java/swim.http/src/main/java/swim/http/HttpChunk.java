// Copyright 2015-2019 SWIM.AI inc.
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

package swim.http;

import java.nio.ByteBuffer;
import swim.codec.Binary;
import swim.codec.Debug;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.codec.Utf8;
import swim.util.Murmur3;

public final class HttpChunk implements Debug {
  final HttpChunkHeader header;
  final Encoder<?, ?> content;

  public HttpChunk(HttpChunkHeader header, Encoder<?, ?> content) {
    this.header = header;
    this.content = content;
  }

  public boolean isEmpty() {
    return this.header.isEmpty();
  }

  public HttpChunkHeader header() {
    return this.header;
  }

  public Encoder<?, ?> content() {
    return this.content;
  }

  public Encoder<?, ?> httpEncoder(HttpWriter http) {
    if (this.header.isEmpty()) {
      return Utf8.encodedWriter(this.header.httpWriter(http));
    } else {
      return new HttpChunkEncoder(http, this.header, this.content);
    }
  }

  public Encoder<?, ?> httpEncoder() {
    return httpEncoder(Http.standardWriter());
  }

  public Encoder<?, ?> encodeHttp(OutputBuffer<?> output, HttpWriter http) {
    if (this.header.isEmpty()) {
      return Utf8.writeEncoded(this.header.httpWriter(http), output);
    } else {
      return HttpChunkEncoder.encode(output, http, this.header, this.content);
    }
  }

  public Encoder<?, ?> encodeHttp(OutputBuffer<?> output) {
    return encodeHttp(output, Http.standardWriter());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpChunk) {
      final HttpChunk that = (HttpChunk) other;
      return this.header.equals(that.header) && this.content.equals(that.content);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(HttpChunk.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.header.hashCode()), this.content.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("HttpChunk").write('.');
    if (header != HttpChunkHeader.sentinel()) {
      output = output.write("from").write('(').debug(this.header).write(", ").debug(this.content).write(')');
    } else {
      output = output.write("last").write('(').write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static HttpChunk last;

  public static HttpChunk last() {
    if (last == null) {
      last = new HttpChunk(HttpChunkHeader.sentinel(), Encoder.done());
    }
    return last;
  }

  public static HttpChunk from(int length, Encoder<?, ?> content) {
    final HttpChunkHeader header = HttpChunkHeader.from(length);
    return new HttpChunk(header, content);
  }

  public static HttpChunk from(ByteBuffer data) {
    final HttpChunkHeader header = HttpChunkHeader.from(data.remaining());
    return new HttpChunk(header, Binary.byteBufferWriter(data));
  }

  public static HttpChunk from(String text) {
    Output<ByteBuffer> output = Utf8.encodedOutput(Binary.byteBufferOutput(text.length()));
    output = output.write(text);
    final ByteBuffer data = output.bind();
    final HttpChunkHeader header = HttpChunkHeader.from(data.remaining());
    return new HttpChunk(header, Binary.byteBufferWriter(data));
  }
}
