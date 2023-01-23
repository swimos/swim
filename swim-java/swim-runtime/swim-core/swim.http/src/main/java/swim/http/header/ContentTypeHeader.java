// Copyright 2015-2023 Swim.inc
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

import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Writer;
import swim.collections.HashTrieMap;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.http.MediaType;
import swim.util.Murmur3;

public final class ContentTypeHeader extends HttpHeader {

  final MediaType mediaType;

  ContentTypeHeader(MediaType mediaType) {
    this.mediaType = mediaType;
  }

  @Override
  public String lowerCaseName() {
    return "content-type";
  }

  @Override
  public String name() {
    return "Content-Type";
  }

  public MediaType mediaType() {
    return this.mediaType;
  }

  public String type() {
    return this.mediaType.type();
  }

  public String subtype() {
    return this.mediaType.subtype();
  }

  public HashTrieMap<String, String> params() {
    return this.mediaType.params();
  }

  public String getParam(String key) {
    return this.mediaType.getParam(key);
  }

  public ContentTypeHeader param(String key, String value) {
    return ContentTypeHeader.create(this.mediaType.param(key, value));
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return this.mediaType.writeHttp(output, http);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ContentTypeHeader) {
      final ContentTypeHeader that = (ContentTypeHeader) other;
      return this.mediaType.equals(that.mediaType);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (ContentTypeHeader.hashSeed == 0) {
      ContentTypeHeader.hashSeed = Murmur3.seed(ContentTypeHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(ContentTypeHeader.hashSeed, this.mediaType.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("ContentTypeHeader").write('.').write("create").write('(')
                   .debug(this.mediaType.type()).write(", ")
                   .write(this.mediaType.subtype()).write(')');
    for (HashTrieMap.Entry<String, String> param : this.mediaType.params()) {
      output = output.write('.').write("param").write('(')
                     .debug(param.getKey()).write(", ")
                     .debug(param.getValue()).write(')');
    }
    return output;
  }

  public static ContentTypeHeader create(MediaType mediaType) {
    return new ContentTypeHeader(mediaType);
  }

  public static ContentTypeHeader create(String type, String subtype, HashTrieMap<String, String> params) {
    return ContentTypeHeader.create(MediaType.create(type, subtype, params));
  }

  public static ContentTypeHeader create(String type, String subtype) {
    return ContentTypeHeader.create(MediaType.create(type, subtype));
  }

  public static ContentTypeHeader create(String mediaType) {
    return ContentTypeHeader.create(MediaType.parse(mediaType));
  }

  public static Parser<ContentTypeHeader> parseHeaderValue(Input input, HttpParser http) {
    return ContentTypeHeaderParser.parse(input, http);
  }

}
