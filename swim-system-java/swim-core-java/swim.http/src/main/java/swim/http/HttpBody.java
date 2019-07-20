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
import java.io.InputStream;
import java.nio.ByteBuffer;
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
import swim.codec.Utf8;
import swim.collections.FingerTrieSeq;
import swim.http.header.ContentLength;
import swim.http.header.ContentType;
import swim.util.Murmur3;

public final class HttpBody<T> extends HttpEntity<T> implements Debug {
  final T value;
  final Encoder<?, ?> content;
  final long length;
  final MediaType mediaType;

  HttpBody(T value, Encoder<?, ?> content, long length, MediaType mediaType) {
    this.value = value;
    this.content = content;
    this.length = length;
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
    return this.length;
  }

  @Override
  public MediaType mediaType() {
    return this.mediaType;
  }

  @Override
  public FingerTrieSeq<TransferCoding> transferCodings() {
    return FingerTrieSeq.<TransferCoding>empty();
  }

  @Override
  public FingerTrieSeq<HttpHeader> headers() {
    FingerTrieSeq<HttpHeader> headers = FingerTrieSeq.empty();
    if (this.mediaType != null) {
      headers = headers.appended(ContentType.from(this.mediaType));
    }
    headers = headers.appended(ContentLength.from(this.length));
    return headers;
  }

  @Override
  public <T2> Encoder<?, HttpMessage<T2>> httpEncoder(HttpMessage<T2> message, HttpWriter http) {
    return http.bodyEncoder(message, this.content, this.length);
  }

  @Override
  public <T2> Encoder<?, HttpMessage<T2>> encodeHttp(HttpMessage<T2> message,
                                                     OutputBuffer<?> output, HttpWriter http) {
    return http.encodeBody(message, this.content, this.length, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpBody<?>) {
      final HttpBody<?> that = (HttpBody<?>) other;
      return (this.value == null ? that.value == null : this.value.equals(that.value))
          && this.content.equals(that.content) && this.length == that.length
          && (this.mediaType == null ? that.mediaType == null : this.mediaType.equals(that.mediaType));
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(HttpBody.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        hashSeed, Murmur3.hash(this.value)), this.content.hashCode()),
        Murmur3.hash(this.length)), Murmur3.hash(this.mediaType)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("HttpBody").write('.').write("from").write('(');
    if (this.value != null) {
      output.debug(this.value).write(", ");
    }
    output.debug(this.content).write(", ").debug(this.length);
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

  private static HttpBody<Object> empty;

  @SuppressWarnings("unchecked")
  public static <T> HttpBody<T> empty() {
    if (empty == null) {
      empty = new HttpBody<Object>(null, Encoder.done(), 0L, null);
    }
    return (HttpBody<T>) empty;
  }

  public static <T> HttpBody<T> from(T value, Encoder<?, ?> content, long length, MediaType mediaType) {
    return new HttpBody<T>(value, content, length, mediaType);
  }

  public static <T> HttpBody<T> from(T value, Encoder<?, ?> content, long length) {
    return new HttpBody<T>(value, content, length, MediaType.applicationOctetStream());
  }

  public static <T> HttpBody<T> from(Encoder<?, ?> content, long length, MediaType mediaType) {
    return new HttpBody<T>(null, content, length, mediaType);
  }

  public static <T> HttpBody<T> from(Encoder<?, ?> content, long length) {
    return new HttpBody<T>(null, content, length, MediaType.applicationOctetStream());
  }

  public static <T> HttpBody<T> from(ByteBuffer data, MediaType mediaType) {
    return new HttpBody<T>(null, Binary.byteBufferWriter(data), data.remaining(), mediaType);
  }

  public static <T> HttpBody<T> from(ByteBuffer data) {
    return from(data, MediaType.applicationOctetStream());
  }

  public static HttpBody<String> from(String content, MediaType mediaType) {
    Output<ByteBuffer> output = Utf8.encodedOutput(Binary.byteBufferOutput(content.length()));
    output = output.write(content);
    final ByteBuffer data = output.bind();
    return new HttpBody<String>(content, Binary.byteBufferWriter(data), data.remaining(), mediaType);
  }

  public static HttpBody<String> from(String content) {
    return from(content, MediaType.textPlain());
  }

  public static <T> HttpBody<T> fromFile(String path, MediaType mediaType) throws IOException {
    final FileChannel channel = FileChannel.open(Paths.get(path), StandardOpenOption.READ);
    return new HttpBody<T>(null, Binary.channelEncoder(channel), channel.size(), mediaType);
  }

  public static <T> HttpBody<T> fromFile(String path) throws IOException {
    return fromFile(path, MediaType.forPath(path));
  }

  public static <T> HttpBody<T> fromResource(ClassLoader classLoader, String resource, MediaType mediaType) throws IOException {
    HttpBody<T> body = null;
    InputStream input = null;
    try {
      input = classLoader.getResourceAsStream(resource);
      if (input != null) {
        final ByteBuffer data = Binary.read(Binary.outputParser(Binary.byteBufferOutput()), input);
        body = new HttpBody<T>(null, Binary.byteBufferWriter(data), data.remaining(), mediaType);
      }
    } finally {
      try {
        if (input != null) {
          input.close();
        }
      } catch (IOException swallow) {
      }
    }
    return body;
  }

  public static <T> HttpBody<T> fromResource(ClassLoader classLoader, String resource) throws IOException {
    return fromResource(classLoader, resource, MediaType.forPath(resource));
  }

  public static <T> Decoder<HttpMessage<T>> httpDecoder(HttpMessage<?> message, Decoder<T> content, long length) {
    return Http.standardParser().bodyDecoder(message, content, length);
  }

  public static <T> Decoder<HttpMessage<T>> decodeHttp(HttpMessage<?> message, Decoder<T> content,
                                                       long length, InputBuffer input) {
    return Http.standardParser().decodeBody(message, content, length, input);
  }
}
