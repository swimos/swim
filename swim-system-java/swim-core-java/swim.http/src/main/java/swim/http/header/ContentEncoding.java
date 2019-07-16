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

public final class ContentEncoding extends HttpHeader {
  final FingerTrieSeq<String> codings;

  ContentEncoding(FingerTrieSeq<String> codings) {
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
  public Writer<?, ?> writeHttpValue(Output<?> output, HttpWriter http) {
    return http.writeTokenList(this.codings.iterator(), output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ContentEncoding) {
      final ContentEncoding that = (ContentEncoding) other;
      return this.codings.equals(that.codings);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(ContentEncoding.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.codings.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("ContentEncoding").write('.').write("from").write('(');
    final int n = this.codings.size();
    if (n > 0) {
      output.debug(this.codings.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.codings.get(i));
      }
    }
    output = output.write(')');
  }

  private static int hashSeed;

  public static ContentEncoding from(FingerTrieSeq<String> codings) {
    return new ContentEncoding(codings);
  }

  public static ContentEncoding from(String... codings) {
    return new ContentEncoding(FingerTrieSeq.of(codings));
  }

  public static Parser<ContentEncoding> parseHttpValue(Input input, HttpParser http) {
    return ContentEncodingParser.parse(input, http);
  }
}
