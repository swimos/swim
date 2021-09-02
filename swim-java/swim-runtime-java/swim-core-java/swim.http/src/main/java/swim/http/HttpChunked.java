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
import swim.http.header.ContentTypeHeader;
import swim.http.header.TransferEncodingHeader;
import swim.util.Murmur3;

public final class HttpChunked<T> extends HttpPayload<T> implements Debug {

  final T payloadValue;
  final Encoder<?, ?> payloadEncoder;
  final MediaType mediaType;

  HttpChunked(T payloadValue, Encoder<?, ?> payloadEncoder, MediaType mediaType) {
    this.payloadValue = payloadValue;
    this.payloadEncoder = payloadEncoder;
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

  @Override
  public MediaType mediaType() {
    return this.mediaType;
  }

  @Override
  public FingerTrieSeq<TransferCoding> transferCodings() {
    return TransferEncodingHeader.chunked().codings();
  }

  @Override
  public FingerTrieSeq<HttpHeader> headers() {
    FingerTrieSeq<HttpHeader> headers = FingerTrieSeq.empty();
    if (this.mediaType != null) {
      headers = headers.appended(ContentTypeHeader.create(this.mediaType));
    }
    headers = headers.appended(TransferEncodingHeader.chunked());
    return headers;
  }

  @Override
  public <T2> Encoder<?, HttpMessage<T2>> httpEncoder(HttpMessage<T2> message, HttpWriter http) {
    return http.chunkedEncoder(message, this.payloadEncoder);
  }

  @Override
  public <T2> Encoder<?, HttpMessage<T2>> encodeHttp(OutputBuffer<?> output,
                                                     HttpMessage<T2> message, HttpWriter http) {
    return http.encodeChunked(output, message, this.payloadEncoder);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpChunked<?>) {
      final HttpChunked<?> that = (HttpChunked<?>) other;
      return (this.payloadValue == null ? that.payloadValue == null : this.payloadValue.equals(that.payloadValue))
          && (this.mediaType == null ? that.mediaType == null : this.mediaType.equals(that.mediaType));
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (HttpChunked.hashSeed == 0) {
      HttpChunked.hashSeed = Murmur3.seed(HttpChunked.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HttpChunked.hashSeed,
        Murmur3.hash(this.payloadValue)), Murmur3.hash(this.mediaType)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("HttpChunked").write('.').write("create").write('(');
    if (this.payloadValue != null) {
      output.debug(this.payloadValue).write(", ");
    }
    output.debug(this.payloadEncoder);
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

  private static int hashSeed;

  public static <T> HttpChunked<T> create(T payloadValue, Encoder<?, T> payloadEncoder, MediaType mediaType) {
    return new HttpChunked<T>(payloadValue, payloadEncoder, mediaType);
  }

  public static <T> HttpChunked<T> create(T payloadValue, Encoder<?, T> payloadEncoder) {
    return new HttpChunked<T>(payloadValue, payloadEncoder, null);
  }

  public static <T> HttpChunked<T> create(Encoder<?, T> payloadEncoder, MediaType mediaType) {
    return new HttpChunked<T>(null, payloadEncoder, mediaType);
  }

  public static <T> HttpChunked<T> create(Encoder<?, T> payloadEncoder) {
    return new HttpChunked<T>(null, payloadEncoder, null);
  }

  public static <T> HttpChunked<T> fromFile(String path, MediaType mediaType) throws IOException {
    final FileChannel channel = FileChannel.open(Paths.get(path), StandardOpenOption.READ);
    return new HttpChunked<T>(null, Binary.channelEncoder(channel), mediaType);
  }

  public static <T> HttpChunked<T> fromFile(String path) throws IOException {
    return HttpChunked.fromFile(path, MediaType.forPath(path));
  }

  public static <T> Decoder<HttpMessage<T>> httpDecoder(HttpMessage<?> message, Decoder<T> payloadDecoder) {
    return Http.standardParser().chunkedDecoder(message, payloadDecoder);
  }

  public static <T> Decoder<HttpMessage<T>> decodeHttp(InputBuffer input, HttpMessage<?> message,
                                                       Decoder<T> payloadDecoder) {
    return Http.standardParser().decodeChunked(input, message, payloadDecoder);
  }

}
