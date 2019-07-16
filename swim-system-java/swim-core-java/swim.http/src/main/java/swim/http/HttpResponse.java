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

import swim.codec.Debug;
import swim.codec.Decoder;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.codec.Writer;
import swim.collections.FingerTrieSeq;
import swim.util.Murmur3;

public final class HttpResponse<T> extends HttpMessage<T> implements Debug {
  final HttpVersion version;
  final HttpStatus status;
  final FingerTrieSeq<HttpHeader> headers;
  final HttpEntity<T> entity;

  HttpResponse(HttpVersion version, HttpStatus status,
               FingerTrieSeq<HttpHeader> headers, HttpEntity<T> entity) {
    this.version = version;
    this.status = status;
    this.headers = headers;
    this.entity = entity;
  }

  HttpResponse(HttpVersion version, HttpStatus status,
               FingerTrieSeq<HttpHeader> headers) {
    this(version, status, headers, HttpEntity.<T>empty());
  }

  @Override
  public HttpVersion version() {
    return this.version;
  }

  public HttpResponse<T> version(HttpVersion version) {
    return from(version, this.status, this.headers, this.entity);
  }

  public HttpStatus status() {
    return this.status;
  }

  public HttpResponse<T> status(HttpStatus status) {
    return from(this.version, status, this.headers, this.entity);
  }

  @Override
  public FingerTrieSeq<HttpHeader> headers() {
    return this.headers;
  }

  @Override
  public HttpResponse<T> headers(FingerTrieSeq<HttpHeader> headers) {
    return from(this.version, this.status, headers, this.entity);
  }

  @Override
  public HttpResponse<T> headers(HttpHeader... headers) {
    return headers(FingerTrieSeq.of(headers));
  }

  @Override
  public HttpResponse<T> appendedHeaders(FingerTrieSeq<HttpHeader> newHeaders) {
    final FingerTrieSeq<HttpHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HttpHeader> headers = oldHeaders.appended(newHeaders);
    if (oldHeaders != headers) {
      return from(this.version, this.status, headers, this.entity);
    } else {
      return this;
    }
  }

  @Override
  public HttpResponse<T> appendedHeaders(HttpHeader... newHeaders) {
    return appendedHeaders(FingerTrieSeq.of(newHeaders));
  }

  @Override
  public HttpResponse<T> appendedHeader(HttpHeader newHeader) {
    final FingerTrieSeq<HttpHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HttpHeader> headers = oldHeaders.appended(newHeader);
    if (oldHeaders != headers) {
      return from(this.version, this.status, headers, this.entity);
    } else {
      return this;
    }
  }

  @Override
  public HttpResponse<T> updatedHeaders(FingerTrieSeq<HttpHeader> newHeaders) {
    final FingerTrieSeq<HttpHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HttpHeader> headers = updatedHeaders(oldHeaders, newHeaders);
    if (oldHeaders != headers) {
      return from(this.version, this.status, headers, this.entity);
    } else {
      return this;
    }
  }

  @Override
  public HttpResponse<T> updatedHeaders(HttpHeader... newHeaders) {
    return updatedHeaders(FingerTrieSeq.of(newHeaders));
  }

  @Override
  public HttpResponse<T> updatedHeader(HttpHeader newHeader) {
    final FingerTrieSeq<HttpHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HttpHeader> headers = updatedHeaders(oldHeaders, newHeader);
    if (oldHeaders != headers) {
      return from(this.version, this.status, headers, this.entity);
    } else {
      return this;
    }
  }

  @Override
  public HttpEntity<T> entity() {
    return this.entity;
  }

  @Override
  public <T2> HttpResponse<T2> entity(HttpEntity<T2> entity) {
    return from(this.version, this.status, this.headers, entity);
  }

  @Override
  public <T2> HttpResponse<T2> content(HttpEntity<T2> entity) {
    final FingerTrieSeq<HttpHeader> headers = updatedHeaders(this.headers, entity.headers());
    return from(this.version, this.status, headers, entity);
  }

  @Override
  public HttpResponse<String> body(String content, MediaType mediaType) {
    return content(HttpBody.from(content, mediaType));
  }

  @Override
  public HttpResponse<String> body(String content) {
    return content(HttpBody.from(content));
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T2> Decoder<HttpResponse<T2>> entityDecoder(Decoder<T2> contentDecoder) {
    return (Decoder<HttpResponse<T2>>) super.entityDecoder(contentDecoder);
  }

  @SuppressWarnings("unchecked")
  @Override
  public Encoder<?, HttpResponse<T>> httpEncoder(HttpWriter http) {
    return (Encoder<?, HttpResponse<T>>) super.httpEncoder(http);
  }

  @SuppressWarnings("unchecked")
  @Override
  public Encoder<?, HttpResponse<T>> httpEncoder() {
    return (Encoder<?, HttpResponse<T>>) super.httpEncoder();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Encoder<?, HttpResponse<T>> encodeHttp(OutputBuffer<?> output, HttpWriter http) {
    return (Encoder<?, HttpResponse<T>>) super.encodeHttp(output, http);
  }

  @SuppressWarnings("unchecked")
  @Override
  public Encoder<?, HttpResponse<T>> encodeHttp(OutputBuffer<?> output) {
    return (Encoder<?, HttpResponse<T>>) super.encodeHttp(output);
  }

  @Override
  public Writer<?, HttpResponse<T>> httpWriter(HttpWriter http) {
    return http.responseWriter(this);
  }

  @Override
  public Writer<?, HttpResponse<T>> httpWriter() {
    return httpWriter(Http.standardWriter());
  }

  @Override
  public Writer<?, HttpResponse<T>> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeResponse(this, output);
  }

  @Override
  public Writer<?, HttpResponse<T>> writeHttp(Output<?> output) {
    return writeHttp(output, Http.standardWriter());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpResponse<?>) {
      final HttpResponse<?> that = (HttpResponse<?>) other;
      return this.version.equals(that.version) && this.status.equals(that.status)
          && this.headers.equals(that.headers) && this.entity.equals(that.entity);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(HttpResponse.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.version.hashCode()), this.status.hashCode()),
        this.headers.hashCode()), this.entity.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("HttpResponse").write('.').write("from").write('(')
        .debug(this.version).write(", ").debug(this.status);
    for (HttpHeader header : this.headers) {
      output = output.write(", ").debug(header);
    }
    output = output.write(')');
    if (this.entity.isDefined()) {
      output = output.write('.').write("entity").write('(').debug(this.entity).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static <T> HttpResponse<T> from(HttpVersion version, HttpStatus status,
                                         FingerTrieSeq<HttpHeader> headers, HttpEntity<T> entity) {
    return new HttpResponse<T>(version, status, headers, entity);
  }

  public static <T> HttpResponse<T> from(HttpVersion version, HttpStatus status,
                                         FingerTrieSeq<HttpHeader> headers) {
    return new HttpResponse<T>(version, status, headers);
  }

  public static <T> HttpResponse<T> from(HttpVersion version, HttpStatus status,
                                         HttpHeader... headers) {
    return new HttpResponse<T>(version, status, FingerTrieSeq.of(headers));
  }

  public static <T> HttpResponse<T> from(HttpVersion version, HttpStatus status) {
    return new HttpResponse<T>(version, status, FingerTrieSeq.<HttpHeader>empty());
  }

  public static <T> HttpResponse<T> from(HttpStatus status, FingerTrieSeq<HttpHeader> headers) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, status, headers);
  }

  public static <T> HttpResponse<T> from(HttpStatus status, HttpHeader... headers) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, status, FingerTrieSeq.of(headers));
  }

  public static <T> HttpResponse<T> from(HttpStatus status) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, status, FingerTrieSeq.<HttpHeader>empty());
  }

  public static <T> HttpResponse<T> parseHttp(String string) {
    return Http.standardParser().parseResponseString(string);
  }
}
