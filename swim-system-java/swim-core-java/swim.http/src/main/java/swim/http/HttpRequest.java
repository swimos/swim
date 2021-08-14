// Copyright 2015-2021 Swim inc.
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
import swim.uri.Uri;
import swim.util.Murmur3;

public final class HttpRequest<T> extends HttpMessage<T> implements Debug {

  final HttpMethod method;
  final Uri uri;
  final HttpVersion version;
  final FingerTrieSeq<HttpHeader> headers;
  final HttpEntity<T> entity;

  HttpRequest(HttpMethod method, Uri uri, HttpVersion version,
              FingerTrieSeq<HttpHeader> headers, HttpEntity<T> entity) {
    this.method = method;
    this.uri = uri;
    this.version = version;
    this.headers = headers;
    this.entity = entity;
  }

  HttpRequest(HttpMethod method, Uri uri, HttpVersion version,
              FingerTrieSeq<HttpHeader> headers) {
    this(method, uri, version, headers, HttpEntity.<T>empty());
  }

  public HttpMethod method() {
    return this.method;
  }

  public HttpRequest<T> method(HttpMethod method) {
    return HttpRequest.create(method, this.uri, this.version, this.headers, this.entity);
  }

  public Uri uri() {
    return this.uri;
  }

  public HttpRequest<T> uri(Uri uri) {
    return HttpRequest.create(this.method, uri, this.version, this.headers, this.entity);
  }

  @Override
  public HttpVersion version() {
    return this.version;
  }

  public HttpRequest<T> version(HttpVersion version) {
    return HttpRequest.create(this.method, this.uri, version, this.headers, this.entity);
  }

  @Override
  public FingerTrieSeq<HttpHeader> headers() {
    return this.headers;
  }

  @Override
  public HttpRequest<T> headers(FingerTrieSeq<HttpHeader> headers) {
    return HttpRequest.create(this.method, this.uri, this.version, headers, this.entity);
  }

  @Override
  public HttpRequest<T> headers(HttpHeader... headers) {
    return this.headers(FingerTrieSeq.of(headers));
  }

  @Override
  public HttpRequest<T> appendedHeaders(FingerTrieSeq<HttpHeader> newHeaders) {
    final FingerTrieSeq<HttpHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HttpHeader> headers = oldHeaders.appended(newHeaders);
    if (oldHeaders != headers) {
      return HttpRequest.create(this.method, this.uri, this.version, headers, this.entity);
    } else {
      return this;
    }
  }

  @Override
  public HttpRequest<T> appendedHeaders(HttpHeader... newHeaders) {
    return this.appendedHeaders(FingerTrieSeq.of(newHeaders));
  }

  @Override
  public HttpRequest<T> appendedHeader(HttpHeader newHeader) {
    final FingerTrieSeq<HttpHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HttpHeader> headers = oldHeaders.appended(newHeader);
    if (oldHeaders != headers) {
      return HttpRequest.create(this.method, this.uri, this.version, headers, this.entity);
    } else {
      return this;
    }
  }

  @Override
  public HttpRequest<T> updatedHeaders(FingerTrieSeq<HttpHeader> newHeaders) {
    final FingerTrieSeq<HttpHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HttpHeader> headers = HttpMessage.updatedHeaders(oldHeaders, newHeaders);
    if (oldHeaders != headers) {
      return HttpRequest.create(this.method, this.uri, this.version, headers, this.entity);
    } else {
      return this;
    }
  }

  @Override
  public HttpRequest<T> updatedHeaders(HttpHeader... newHeaders) {
    return this.updatedHeaders(FingerTrieSeq.of(newHeaders));
  }

  @Override
  public HttpRequest<T> updatedHeader(HttpHeader newHeader) {
    final FingerTrieSeq<HttpHeader> oldHeaders = this.headers;
    final FingerTrieSeq<HttpHeader> headers = HttpMessage.updatedHeaders(oldHeaders, newHeader);
    if (oldHeaders != headers) {
      return HttpRequest.create(this.method, this.uri, this.version, headers, this.entity);
    } else {
      return this;
    }
  }

  @Override
  public HttpEntity<T> entity() {
    return this.entity;
  }

  @Override
  public <T2> HttpRequest<T2> entity(HttpEntity<T2> entity) {
    return HttpRequest.create(this.method, this.uri, this.version, this.headers, entity);
  }

  @Override
  public <T2> HttpRequest<T2> content(HttpEntity<T2> entity) {
    final FingerTrieSeq<HttpHeader> headers = HttpMessage.updatedHeaders(this.headers, entity.headers());
    return HttpRequest.create(this.method, this.uri, this.version, headers, entity);
  }

  @Override
  public HttpRequest<String> body(String content, MediaType mediaType) {
    return this.content(HttpBody.create(content, mediaType));
  }

  @Override
  public HttpRequest<String> body(String content) {
    return this.content(HttpBody.create(content));
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T2> Decoder<HttpRequest<T2>> entityDecoder(Decoder<T2> contentDecoder) {
    return (Decoder<HttpRequest<T2>>) super.entityDecoder(contentDecoder);
  }

  @SuppressWarnings("unchecked")
  @Override
  public Encoder<?, HttpRequest<T>> httpEncoder(HttpWriter http) {
    return (Encoder<?, HttpRequest<T>>) super.httpEncoder(http);
  }

  @SuppressWarnings("unchecked")
  @Override
  public Encoder<?, HttpRequest<T>> httpEncoder() {
    return (Encoder<?, HttpRequest<T>>) super.httpEncoder();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Encoder<?, HttpRequest<T>> encodeHttp(OutputBuffer<?> output, HttpWriter http) {
    return (Encoder<?, HttpRequest<T>>) super.encodeHttp(output, http);
  }

  @SuppressWarnings("unchecked")
  @Override
  public Encoder<?, HttpRequest<T>> encodeHttp(OutputBuffer<?> output) {
    return (Encoder<?, HttpRequest<T>>) super.encodeHttp(output);
  }

  @Override
  public Writer<?, HttpRequest<T>> httpWriter(HttpWriter http) {
    return http.requestWriter(this);
  }

  @Override
  public Writer<?, HttpRequest<T>> httpWriter() {
    return this.httpWriter(Http.standardWriter());
  }

  @Override
  public Writer<?, HttpRequest<T>> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeRequest(this, output);
  }

  @Override
  public Writer<?, HttpRequest<T>> writeHttp(Output<?> output) {
    return this.writeHttp(output, Http.standardWriter());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpRequest<?>) {
      final HttpRequest<?> that = (HttpRequest<?>) other;
      return this.method.equals(that.method) && this.uri.equals(that.uri)
          && this.version.equals(that.version) && this.headers.equals(that.headers)
          && this.entity.equals(that.entity);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (HttpRequest.hashSeed == 0) {
      HttpRequest.hashSeed = Murmur3.seed(HttpRequest.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        HttpRequest.hashSeed, this.method.hashCode()), this.uri.hashCode()),
        this.version.hashCode()), this.headers.hashCode()), this.entity.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("HttpRequest").write('.').write("create").write('(')
                   .debug(this.method).write(", ").debug(this.uri).write(", ").debug(this.version);
    for (HttpHeader header : this.headers) {
      output = output.write(", ").debug(header);
    }
    output = output.write(')');
    if (this.entity.isDefined()) {
      output = output.write('.').write("entity").write('(').debug(this.entity).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static <T> HttpRequest<T> create(HttpMethod method, Uri uri, HttpVersion version,
                                          FingerTrieSeq<HttpHeader> headers, HttpEntity<T> entity) {
    return new HttpRequest<T>(method, uri, version, headers, entity);
  }

  public static <T> HttpRequest<T> create(HttpMethod method, Uri uri, HttpVersion version,
                                          FingerTrieSeq<HttpHeader> headers) {
    return new HttpRequest<T>(method, uri, version, headers);
  }

  public static <T> HttpRequest<T> create(HttpMethod method, Uri uri, HttpVersion version,
                                          HttpHeader... headers) {
    return new HttpRequest<T>(method, uri, version, FingerTrieSeq.of(headers));
  }

  public static <T> HttpRequest<T> create(HttpMethod method, Uri uri, HttpVersion version) {
    return new HttpRequest<T>(method, uri, version, FingerTrieSeq.<HttpHeader>empty());
  }

  public static <T> HttpRequest<T> get(Uri uri, FingerTrieSeq<HttpHeader> headers) {
    return new HttpRequest<T>(HttpMethod.GET, uri, HttpVersion.HTTP_1_1, headers);
  }

  public static <T> HttpRequest<T> get(Uri uri, HttpHeader... headers) {
    return new HttpRequest<T>(HttpMethod.GET, uri, HttpVersion.HTTP_1_1, FingerTrieSeq.of(headers));
  }

  public static <T> HttpRequest<T> head(Uri uri, FingerTrieSeq<HttpHeader> headers) {
    return new HttpRequest<T>(HttpMethod.HEAD, uri, HttpVersion.HTTP_1_1, headers);
  }

  public static <T> HttpRequest<T> head(Uri uri, HttpHeader... headers) {
    return new HttpRequest<T>(HttpMethod.HEAD, uri, HttpVersion.HTTP_1_1, FingerTrieSeq.of(headers));
  }

  public static <T> HttpRequest<T> post(Uri uri, FingerTrieSeq<HttpHeader> headers) {
    return new HttpRequest<T>(HttpMethod.POST, uri, HttpVersion.HTTP_1_1, headers);
  }

  public static <T> HttpRequest<T> post(Uri uri, HttpHeader... headers) {
    return new HttpRequest<T>(HttpMethod.POST, uri, HttpVersion.HTTP_1_1, FingerTrieSeq.of(headers));
  }

  public static <T> HttpRequest<T> put(Uri uri, FingerTrieSeq<HttpHeader> headers) {
    return new HttpRequest<T>(HttpMethod.PUT, uri, HttpVersion.HTTP_1_1, headers);
  }

  public static <T> HttpRequest<T> put(Uri uri, HttpHeader... headers) {
    return new HttpRequest<T>(HttpMethod.PUT, uri, HttpVersion.HTTP_1_1, FingerTrieSeq.of(headers));
  }

  public static <T> HttpRequest<T> delete(Uri uri, FingerTrieSeq<HttpHeader> headers) {
    return new HttpRequest<T>(HttpMethod.DELETE, uri, HttpVersion.HTTP_1_1, headers);
  }

  public static <T> HttpRequest<T> delete(Uri uri, HttpHeader... headers) {
    return new HttpRequest<T>(HttpMethod.DELETE, uri, HttpVersion.HTTP_1_1, FingerTrieSeq.of(headers));
  }

  public static <T> HttpRequest<T> connect(Uri uri, FingerTrieSeq<HttpHeader> headers) {
    return new HttpRequest<T>(HttpMethod.CONNECT, uri, HttpVersion.HTTP_1_1, headers);
  }

  public static <T> HttpRequest<T> connect(Uri uri, HttpHeader... headers) {
    return new HttpRequest<T>(HttpMethod.CONNECT, uri, HttpVersion.HTTP_1_1, FingerTrieSeq.of(headers));
  }

  public static <T> HttpRequest<T> options(Uri uri, FingerTrieSeq<HttpHeader> headers) {
    return new HttpRequest<T>(HttpMethod.OPTIONS, uri, HttpVersion.HTTP_1_1, headers);
  }

  public static <T> HttpRequest<T> options(Uri uri, HttpHeader... headers) {
    return new HttpRequest<T>(HttpMethod.OPTIONS, uri, HttpVersion.HTTP_1_1, FingerTrieSeq.of(headers));
  }

  public static <T> HttpRequest<T> trace(Uri uri, FingerTrieSeq<HttpHeader> headers) {
    return new HttpRequest<T>(HttpMethod.TRACE, uri, HttpVersion.HTTP_1_1, headers);
  }

  public static <T> HttpRequest<T> trace(Uri uri, HttpHeader... headers) {
    return new HttpRequest<T>(HttpMethod.TRACE, uri, HttpVersion.HTTP_1_1, FingerTrieSeq.of(headers));
  }

  public static <T> HttpRequest<T> parseHttp(String string) {
    return Http.standardParser().parseRequestString(string);
  }

}
