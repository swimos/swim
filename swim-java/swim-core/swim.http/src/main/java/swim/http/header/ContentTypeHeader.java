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
public final class ContentTypeHeader extends HttpHeader {

  @Nullable MediaType mediaType;

  ContentTypeHeader(String name, String value, @Nullable MediaType mediaType) {
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
  public ContentTypeHeader withValue(String newValue) {
    return ContentTypeHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("ContentTypeHeader", "of")
            .appendArgument(this.mediaType())
            .endInvoke();
  }

  public static final String NAME = "Content-Type";

  public static final HttpHeaderType<MediaType> TYPE = new ContentTypeHeaderType();

  public static ContentTypeHeader of(String name, String value) {
    return new ContentTypeHeader(name, value, null);
  }

  public static ContentTypeHeader of(String name, MediaType mediaType) {
    final String value = mediaType.toString();
    return new ContentTypeHeader(name, value, mediaType);
  }

  public static ContentTypeHeader of(MediaType mediaType) {
    return ContentTypeHeader.of(NAME, mediaType);
  }

  public static ContentTypeHeader of(String value) {
    return ContentTypeHeader.of(NAME, value);
  }

}

final class ContentTypeHeaderType implements HttpHeaderType<MediaType>, ToSource {

  @Override
  public String name() {
    return ContentTypeHeader.NAME;
  }

  @Override
  public MediaType getValue(HttpHeader header) {
    return ((ContentTypeHeader) header).mediaType();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return ContentTypeHeader.of(name, value);
  }

  @Override
  public HttpHeader of(String name, MediaType mediaType) {
    return ContentTypeHeader.of(name, mediaType);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("ContentTypeHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
