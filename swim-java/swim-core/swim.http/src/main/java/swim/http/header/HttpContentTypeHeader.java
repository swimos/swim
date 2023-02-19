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

package swim.http.header;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.MediaType;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class HttpContentTypeHeader extends HttpHeader {

  @Nullable MediaType mediaType;

  HttpContentTypeHeader(String name, String value, @Nullable MediaType mediaType) {
    super(name, value);
    this.mediaType = mediaType;
  }

  public MediaType mediaType() {
    if (this.mediaType == null) {
      this.mediaType = MediaType.parse(this.value);
    }
    return this.mediaType;
  }

  @Override
  public HttpContentTypeHeader withValue(String newValue) {
    return HttpContentTypeHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpContentTypeHeader", "of")
            .appendArgument(this.mediaType())
            .endInvoke();
  }

  public static final String NAME = "Content-Type";

  public static final HttpHeaderType<MediaType> TYPE = new HttpContentTypeHeaderType();

  public static HttpContentTypeHeader of(String name, String value) {
    return new HttpContentTypeHeader(name, value, null);
  }

  public static HttpContentTypeHeader of(String name, MediaType mediaType) {
    final String value = mediaType.toString();
    return new HttpContentTypeHeader(name, value, mediaType);
  }

  public static HttpContentTypeHeader of(MediaType mediaType) {
    return HttpContentTypeHeader.of(NAME, mediaType);
  }

  public static HttpContentTypeHeader of(String value) {
    return HttpContentTypeHeader.of(NAME, value);
  }

}

final class HttpContentTypeHeaderType implements HttpHeaderType<MediaType>, ToSource {

  @Override
  public String name() {
    return HttpContentTypeHeader.NAME;
  }

  @Override
  public MediaType getValue(HttpHeader header) {
    return ((HttpContentTypeHeader) header).mediaType();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return HttpContentTypeHeader.of(name, value);
  }

  @Override
  public HttpHeader of(String name, MediaType mediaType) {
    return HttpContentTypeHeader.of(name, mediaType);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("HttpContentTypeHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
