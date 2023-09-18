// Copyright 2015-2023 Nstream, inc.
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
import swim.http.header.LocationHeader;
import swim.uri.Uri;
import swim.util.Murmur3;

public final class HttpResponse<T> extends HttpMessage<T> implements Debug {

  final HttpVersion version;
  final HttpStatus status;
  final FingerTrieSeq<HttpHeader> headers;
  final HttpPayload<T> payload;

  HttpResponse(HttpVersion version, HttpStatus status,
               FingerTrieSeq<HttpHeader> headers, HttpPayload<T> payload) {
    this.version = version;
    this.status = status;
    this.headers = headers;
    this.payload = payload;
  }

  HttpResponse(HttpVersion version, HttpStatus status,
               FingerTrieSeq<HttpHeader> headers) {
    this(version, status, headers, HttpPayload.<T>empty());
  }

  @Override
  public HttpVersion version() {
    return this.version;
  }

  public HttpResponse<T> version(HttpVersion version) {
    return HttpResponse.create(version, this.status, this.headers, this.payload);
  }

  public HttpStatus status() {
    return this.status;
  }

  public HttpResponse<T> status(HttpStatus status) {
    return HttpResponse.create(this.version, status, this.headers, this.payload);
  }

  @Override
  public FingerTrieSeq<HttpHeader> headers() {
    return this.headers;
  }

  @Override
  public HttpResponse<T> headers(FingerTrieSeq<HttpHeader> headers) {
    return HttpResponse.create(this.version, this.status, headers, this.payload);
  }

  @Override
  public HttpResponse<T> headers(HttpHeader... headers) {
    return this.headers(FingerTrieSeq.of(headers));
  }

  @Override
  public HttpResponse<T> appendedHeaders(FingerTrieSeq<HttpHeader> newHeaders) {
    final FingerTrieSeq<HttpHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HttpHeader> headers = oldHeaders.appended(newHeaders);
    if (oldHeaders != headers) {
      return HttpResponse.create(this.version, this.status, headers, this.payload);
    } else {
      return this;
    }
  }

  @Override
  public HttpResponse<T> appendedHeaders(HttpHeader... newHeaders) {
    return this.appendedHeaders(FingerTrieSeq.of(newHeaders));
  }

  @Override
  public HttpResponse<T> appendedHeader(HttpHeader newHeader) {
    final FingerTrieSeq<HttpHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HttpHeader> headers = oldHeaders.appended(newHeader);
    if (oldHeaders != headers) {
      return HttpResponse.create(this.version, this.status, headers, this.payload);
    } else {
      return this;
    }
  }

  @Override
  public HttpResponse<T> updatedHeaders(FingerTrieSeq<HttpHeader> newHeaders) {
    final FingerTrieSeq<HttpHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HttpHeader> headers = HttpMessage.updatedHeaders(oldHeaders, newHeaders);
    if (oldHeaders != headers) {
      return HttpResponse.create(this.version, this.status, headers, this.payload);
    } else {
      return this;
    }
  }

  @Override
  public HttpResponse<T> updatedHeaders(HttpHeader... newHeaders) {
    return this.updatedHeaders(FingerTrieSeq.of(newHeaders));
  }

  @Override
  public HttpResponse<T> updatedHeader(HttpHeader newHeader) {
    final FingerTrieSeq<HttpHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HttpHeader> headers = HttpMessage.updatedHeaders(oldHeaders, newHeader);
    if (oldHeaders != headers) {
      return HttpResponse.create(this.version, this.status, headers, this.payload);
    } else {
      return this;
    }
  }

  @Override
  public HttpPayload<T> payload() {
    return this.payload;
  }

  @Override
  public <T2> HttpResponse<T2> payload(HttpPayload<T2> payload) {
    return HttpResponse.create(this.version, this.status, this.headers, payload);
  }

  @Override
  public <T2> HttpResponse<T2> content(HttpPayload<T2> payload) {
    final FingerTrieSeq<HttpHeader> headers = HttpMessage.updatedHeaders(this.headers, payload.headers());
    return HttpResponse.create(this.version, this.status, headers, payload);
  }

  @Override
  public HttpResponse<String> body(String content, MediaType mediaType) {
    return this.content(HttpBody.create(content, mediaType));
  }

  @Override
  public HttpResponse<String> body(String content) {
    return this.content(HttpBody.create(content));
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T2> Decoder<HttpResponse<T2>> payloadDecoder(Decoder<T2> contentDecoder) {
    return (Decoder<HttpResponse<T2>>) super.payloadDecoder(contentDecoder);
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
    return this.httpWriter(Http.standardWriter());
  }

  @Override
  public Writer<?, HttpResponse<T>> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeResponse(output, this);
  }

  @Override
  public Writer<?, HttpResponse<T>> writeHttp(Output<?> output) {
    return this.writeHttp(output, Http.standardWriter());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpResponse<?>) {
      final HttpResponse<?> that = (HttpResponse<?>) other;
      return this.version.equals(that.version) && this.status.equals(that.status)
          && this.headers.equals(that.headers) && this.payload.equals(that.payload);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (HttpResponse.hashSeed == 0) {
      HttpResponse.hashSeed = Murmur3.seed(HttpResponse.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        HttpResponse.hashSeed, this.version.hashCode()), this.status.hashCode()),
        this.headers.hashCode()), this.payload.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("HttpResponse").write('.').write("create").write('(')
                   .debug(this.version).write(", ").debug(this.status);
    for (HttpHeader header : this.headers) {
      output = output.write(", ").debug(header);
    }
    output = output.write(')');
    if (this.payload.isDefined()) {
      output = output.write('.').write("payload").write('(').debug(this.payload).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static <T> HttpResponse<T> create(HttpVersion version, HttpStatus status,
                                           FingerTrieSeq<HttpHeader> headers, HttpPayload<T> payload) {
    return new HttpResponse<T>(version, status, headers, payload);
  }

  public static <T> HttpResponse<T> create(HttpVersion version, HttpStatus status,
                                           FingerTrieSeq<HttpHeader> headers) {
    return new HttpResponse<T>(version, status, headers);
  }

  public static <T> HttpResponse<T> create(HttpVersion version, HttpStatus status,
                                           HttpHeader... headers) {
    return new HttpResponse<T>(version, status, FingerTrieSeq.of(headers));
  }

  public static <T> HttpResponse<T> create(HttpVersion version, HttpStatus status) {
    return new HttpResponse<T>(version, status, FingerTrieSeq.<HttpHeader>empty());
  }

  public static <T> HttpResponse<T> create(HttpStatus status, FingerTrieSeq<HttpHeader> headers) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, status, headers);
  }

  public static <T> HttpResponse<T> create(HttpStatus status, HttpHeader... headers) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, status, FingerTrieSeq.of(headers));
  }

  public static <T> HttpResponse<T> create(HttpStatus status) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, status, FingerTrieSeq.<HttpHeader>empty());
  }

  public static <T> HttpResponse<T> redirect(Uri location) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, HttpStatus.FOUND, FingerTrieSeq.of(LocationHeader.create(location)));
  }

  public static <T> HttpResponse<T> redirect(Uri location, FingerTrieSeq<HttpHeader> headers) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, HttpStatus.FOUND, headers.appended(LocationHeader.create(location)));
  }

  public static <T> HttpResponse<T> redirect(Uri location, HttpHeader... headers) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, HttpStatus.FOUND, FingerTrieSeq.of(headers).appended(LocationHeader.create(location)));
  }

  public static <T> HttpResponse<T> parseHttp(String string) {
    return Http.standardParser().parseResponseString(string);
  }

}
