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

package swim.http.header;

import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Writer;
import swim.collections.FingerTrieSeq;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Murmur3;

public final class ContentEncodingHeader extends HttpHeader {

  final FingerTrieSeq<String> codings;

  ContentEncodingHeader(FingerTrieSeq<String> codings) {
    this.codings = codings;
  }

  @Override
  public boolean isBlank() {
    return this.codings.isEmpty();
  }

  @Override
  public String lowerCaseName() {
    return "content-encoding";
  }

  @Override
  public String name() {
    return "Content-Encoding";
  }

  public FingerTrieSeq<String> codings() {
    return this.codings;
  }

  public boolean contains(String coding) {
    final FingerTrieSeq<String> codings = this.codings;
    for (int i = 0, n = codings.size(); i < n; i += 1) {
      if (coding.equalsIgnoreCase(codings.get(i))) {
        return true;
      }
    }
    return false;
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return http.writeTokenList(output, this.codings.iterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ContentEncodingHeader) {
      final ContentEncodingHeader that = (ContentEncodingHeader) other;
      return this.codings.equals(that.codings);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (ContentEncodingHeader.hashSeed == 0) {
      ContentEncodingHeader.hashSeed = Murmur3.seed(ContentEncodingHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(ContentEncodingHeader.hashSeed, this.codings.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("ContentEncodingHeader").write('.').write("create").write('(');
    final int n = this.codings.size();
    if (n > 0) {
      output = output.debug(this.codings.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.codings.get(i));
      }
    }
    output = output.write(')');
    return output;
  }

  public static ContentEncodingHeader empty() {
    return new ContentEncodingHeader(FingerTrieSeq.empty());
  }

  public static ContentEncodingHeader create(FingerTrieSeq<String> codings) {
    return new ContentEncodingHeader(codings);
  }

  public static ContentEncodingHeader create(String... codings) {
    return new ContentEncodingHeader(FingerTrieSeq.of(codings));
  }

  public static Parser<ContentEncodingHeader> parseHeaderValue(Input input, HttpParser http) {
    return ContentEncodingHeaderParser.parse(input, http);
  }

}
