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
import swim.http.HttpCharset;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Builder;
import swim.util.Murmur3;

public final class AcceptCharsetHeader extends HttpHeader {

  final FingerTrieSeq<HttpCharset> charsets;

  AcceptCharsetHeader(FingerTrieSeq<HttpCharset> charsets) {
    this.charsets = charsets;
  }

  @Override
  public boolean isBlank() {
    return this.charsets.isEmpty();
  }

  @Override
  public String lowerCaseName() {
    return "accept-charset";
  }

  @Override
  public String name() {
    return "Accept-Charset";
  }

  public FingerTrieSeq<HttpCharset> charsets() {
    return this.charsets;
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return http.writeParamList(output, this.charsets.iterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof AcceptCharsetHeader) {
      final AcceptCharsetHeader that = (AcceptCharsetHeader) other;
      return this.charsets.equals(that.charsets);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (AcceptCharsetHeader.hashSeed == 0) {
      AcceptCharsetHeader.hashSeed = Murmur3.seed(AcceptCharsetHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(AcceptCharsetHeader.hashSeed, this.charsets.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("AcceptCharsetHeader").write('.').write("create").write('(');
    final int n = this.charsets.size();
    if (n > 0) {
      output = output.debug(this.charsets.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.charsets.get(i));
      }
    }
    output = output.write(')');
    return output;
  }

  public static AcceptCharsetHeader empty() {
    return new AcceptCharsetHeader(FingerTrieSeq.empty());
  }

  public static AcceptCharsetHeader create(FingerTrieSeq<HttpCharset> charsets) {
    return new AcceptCharsetHeader(charsets);
  }

  public static AcceptCharsetHeader create(HttpCharset... charsets) {
    return new AcceptCharsetHeader(FingerTrieSeq.of(charsets));
  }

  public static AcceptCharsetHeader create(String... charsetStrings) {
    final Builder<HttpCharset, FingerTrieSeq<HttpCharset>> charsets = FingerTrieSeq.builder();
    for (int i = 0, n = charsetStrings.length; i < n; i += 1) {
      charsets.add(HttpCharset.parse(charsetStrings[i]));
    }
    return new AcceptCharsetHeader(charsets.bind());
  }

  public static Parser<AcceptCharsetHeader> parseHeaderValue(Input input, HttpParser http) {
    return AcceptCharsetHeaderParser.parse(input, http);
  }

}
