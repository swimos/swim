// Copyright 2015-2022 Swim.inc
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
import swim.http.header.ContentLengthHeader;
import swim.http.header.ContentTypeHeader;
import swim.util.Murmur3;

public final class HttpBody<T> extends HttpPayload<T> implements Debug {

  final T payloadValue;
  final Encoder<?, ?> payloadEncoder;
  final long contentLength;
  final MediaType mediaType;

  HttpBody(T payloadValue, Encoder<?, ?> payloadEncoder,
           long contentLength, MediaType mediaType) {
    this.payloadValue = payloadValue;
    this.payloadEncoder = payloadEncoder;
    this.contentLength = contentLength;
    this.mediaType = mediaType;
  }

  @Override
  public boolean isDefined() {
    return this.payloadValue != null;
  }

  @Override
  public T get() {
    return this.payloadValue;
  }

  public Encoder<?, ?> payloadEncoder() {
    return this.payloadEncoder;
  }

  public long contentLength() {
    return this.contentLength;
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
      headers = headers.appended(ContentTypeHeader.create(this.mediaType));
    }
    headers = headers.appended(ContentLengthHeader.create(this.contentLength));
    return headers;
  }

  @Override
  public <T2> Encoder<?, HttpMessage<T2>> httpEncoder(HttpMessage<T2> message, HttpWriter http) {
    return http.bodyEncoder(message, this.payloadEncoder, this.contentLength);
  }

  @Override
  public <T2> Encoder<?, HttpMessage<T2>> encodeHttp(OutputBuffer<?> output,
                                                     HttpMessage<T2> message, HttpWriter http) {
    return http.encodeBody(output, message, this.payloadEncoder, this.contentLength);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpBody<?>) {
      final HttpBody<?> that = (HttpBody<?>) other;
      return (this.payloadValue == null ? that.payloadValue == null : this.payloadValue.equals(that.payloadValue))
          && this.contentLength == that.contentLength
          && (this.mediaType == null ? that.mediaType == null : this.mediaType.equals(that.mediaType));
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (HttpBody.hashSeed == 0) {
      HttpBody.hashSeed = Murmur3.seed(HttpBody.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(HttpBody.hashSeed,
        Murmur3.hash(this.payloadValue)), Murmur3.hash(this.contentLength)),
        Murmur3.hash(this.mediaType)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("HttpBody").write('.').write("create").write('(');
    if (this.payloadValue != null) {
      output = output.debug(this.payloadValue).write(", ");
    }
    output = output.debug(this.payloadEncoder).write(", ").debug(this.contentLength);
    if (this.mediaType != null) {
      output = output.write(", ").debug(this.mediaType);
    }
    output = output.write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static HttpBody<Object> empty;

  @SuppressWarnings("unchecked")
  public static <T> HttpBody<T> empty() {
    if (HttpBody.empty == null) {
      HttpBody.empty = new HttpBody<Object>(null, Encoder.done(), 0L, null);
    }
    return (HttpBody<T>) HttpBody.empty;
  }

  public static <T> HttpBody<T> create(T payloadValue, Encoder<?, ?> payloadEncoder, long contentLength, MediaType mediaType) {
    return new HttpBody<T>(payloadValue, payloadEncoder, contentLength, mediaType);
  }

  public static <T> HttpBody<T> create(T payloadValue, Encoder<?, ?> payloadEncoder, long contentLength) {
    return new HttpBody<T>(payloadValue, payloadEncoder, contentLength, MediaType.applicationOctetStream());
  }

  public static <T> HttpBody<T> create(Encoder<?, ?> payloadEncoder, long contentLength, MediaType mediaType) {
    return new HttpBody<T>(null, payloadEncoder, contentLength, mediaType);
  }

  public static <T> HttpBody<T> create(Encoder<?, ?> payloadEncoder, long contentLength) {
    return new HttpBody<T>(null, payloadEncoder, contentLength, MediaType.applicationOctetStream());
  }

  public static <T> HttpBody<T> create(ByteBuffer data, MediaType mediaType) {
    return new HttpBody<T>(null, Binary.byteBufferWriter(data), data.remaining(), mediaType);
  }

  public static <T> HttpBody<T> create(ByteBuffer data) {
    return HttpBody.create(data, MediaType.applicationOctetStream());
  }

  public static HttpBody<String> create(String payloadValue, MediaType mediaType) {
    Output<ByteBuffer> output = Utf8.encodedOutput(Binary.byteBufferOutput(payloadValue.length()));
    output = output.write(payloadValue);
    final ByteBuffer data = output.bind();
    return new HttpBody<String>(payloadValue, Binary.byteBufferWriter(data), data.remaining(), mediaType);
  }

  public static HttpBody<String> create(String payloadValue) {
    return HttpBody.create(payloadValue, MediaType.textPlain());
  }

  public static <T> HttpBody<T> fromFile(String path, MediaType mediaType) throws IOException {
    final FileChannel channel = FileChannel.open(Paths.get(path), StandardOpenOption.READ);
    return new HttpBody<T>(null, Binary.channelEncoder(channel), channel.size(), mediaType);
  }

  public static <T> HttpBody<T> fromFile(String path) throws IOException {
    return HttpBody.fromFile(path, MediaType.forPath(path));
  }

  public static <T> HttpBody<T> fromResource(ClassLoader classLoader, String resource,
                                             MediaType mediaType) throws IOException {
    HttpBody<T> body = null;
    InputStream input = null;
    try {
      input = classLoader.getResourceAsStream(resource);
      if (input != null) {
        final ByteBuffer data = Binary.read(input, Binary.outputParser(Binary.byteBufferOutput()));
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
    return HttpBody.fromResource(classLoader, resource, MediaType.forPath(resource));
  }

  public static <T> Decoder<HttpMessage<T>> httpDecoder(HttpMessage<?> message, Decoder<T> payloadDecoder, long contentLength) {
    return Http.standardParser().bodyDecoder(message, payloadDecoder, contentLength);
  }

  public static <T> Decoder<HttpMessage<T>> decodeHttp(InputBuffer input, HttpMessage<?> message,
                                                       Decoder<T> payloadDecoder, long contentLength) {
    return Http.standardParser().decodeBody(input, message, payloadDecoder, contentLength);
  }

}
