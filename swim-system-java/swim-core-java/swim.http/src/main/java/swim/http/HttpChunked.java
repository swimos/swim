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

import java.io.IOException;
import java.nio.channels.FileChannel;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import swim.codec.Binary;
import swim.codec.Debug;
import swim.codec.Decoder;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.InputBuffer;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.collections.FingerTrieSeq;
import swim.http.header.ContentType;
import swim.http.header.TransferEncoding;
import swim.util.Murmur3;

public final class HttpChunked<T> extends HttpEntity<T> implements Debug {
  final T value;
  final Encoder<?, ?> content;
  final MediaType mediaType;

  HttpChunked(T value, Encoder<?, ?> content, MediaType mediaType) {
    this.value = value;
    this.content = content;
    this.mediaType = mediaType;
  }

  @Override
  public boolean isDefined() {
    return this.value != null;
  }

  @Override
  public T get() {
    return this.value;
  }

  public Encoder<?, ?> content() {
    return this.content;
  }

  @Override
  public long length() {
    return -1L;
  }

  @Override
  public MediaType mediaType() {
    return this.mediaType;
  }

  @Override
  public FingerTrieSeq<TransferCoding> transferCodings() {
    return TransferEncoding.chunked().codings();
  }

  @Override
  public FingerTrieSeq<HttpHeader> headers() {
    FingerTrieSeq<HttpHeader> headers = FingerTrieSeq.empty();
    if (this.mediaType != null) {
      headers = headers.appended(ContentType.from(mediaType));
    }
    headers = headers.appended(TransferEncoding.chunked());
    return headers;
  }

  @Override
  public <T2> Encoder<?, HttpMessage<T2>> httpEncoder(HttpMessage<T2> message, HttpWriter http) {
    return http.chunkedEncoder(message, this.content);
  }

  @Override
  public <T2> Encoder<?, HttpMessage<T2>> encodeHttp(HttpMessage<T2> message,
                                                     OutputBuffer<?> output, HttpWriter http) {
    return http.encodeChunked(message, this.content, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpChunked<?>) {
      final HttpChunked<?> that = (HttpChunked<?>) other;
      return (this.value == null ? that.value == null : this.value.equals(that.value))
          && this.content.equals(that.content)
          && (this.mediaType == null ? that.mediaType == null : this.mediaType.equals(that.mediaType));
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(HttpChunked.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.value)), this.content.hashCode()), Murmur3.hash(this.mediaType)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("HttpChunked").write('.').write("from").write('(');
    if (this.value != null) {
      output.debug(this.value).write(", ");
    }
    output.debug(this.content);
    if (this.mediaType != null) {
      output = output.write(", ").debug(this.mediaType);
    }
    output = output.write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static <T> HttpChunked<T> from(T value, Encoder<?, T> content, MediaType mediaType) {
    return new HttpChunked<T>(value, content, mediaType);
  }

  public static <T> HttpChunked<T> from(T value, Encoder<?, T> content) {
    return new HttpChunked<T>(value, content, null);
  }

  public static <T> HttpChunked<T> from(Encoder<?, T> content, MediaType mediaType) {
    return new HttpChunked<T>(null, content, mediaType);
  }

  public static <T> HttpChunked<T> from(Encoder<?, T> content) {
    return new HttpChunked<T>(null, content, null);
  }

  public static <T> HttpChunked<T> fromFile(String path, MediaType mediaType) throws IOException {
    final FileChannel channel = FileChannel.open(Paths.get(path), StandardOpenOption.READ);
    return new HttpChunked<T>(null, Binary.channelEncoder(channel), mediaType);
  }

  public static <T> HttpChunked<T> fromFile(String path) throws IOException {
    return fromFile(path, MediaType.forPath(path));
  }

  public static <T> Decoder<HttpMessage<T>> httpDecoder(HttpMessage<?> message, Decoder<T> content) {
    return Http.standardParser().chunkedDecoder(message, content);
  }

  public static <T> Decoder<HttpMessage<T>> decodeHttp(HttpMessage<?> message, Decoder<T> content,
                                                       InputBuffer input) {
    return Http.standardParser().decodeChunked(message, content, input);
  }
}
