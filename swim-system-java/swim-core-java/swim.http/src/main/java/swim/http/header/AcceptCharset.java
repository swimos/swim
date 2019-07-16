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
import swim.http.HttpCharset;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Builder;
import swim.util.Murmur3;

public final class AcceptCharset extends HttpHeader {
  final FingerTrieSeq<HttpCharset> charsets;

  AcceptCharset(FingerTrieSeq<HttpCharset> charsets) {
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
  public Writer<?, ?> writeHttpValue(Output<?> output, HttpWriter http) {
    return http.writeParamList(this.charsets.iterator(), output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof AcceptCharset) {
      final AcceptCharset that = (AcceptCharset) other;
      return this.charsets.equals(that.charsets);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(AcceptCharset.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.charsets.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("AcceptCharset").write('.').write("from").write('(');
    final int n = this.charsets.size();
    if (n > 0) {
      output.debug(this.charsets.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.charsets.get(i));
      }
    }
    output = output.write(')');
  }

  private static int hashSeed;

  public static AcceptCharset from(FingerTrieSeq<HttpCharset> charsets) {
    return new AcceptCharset(charsets);
  }

  public static AcceptCharset from(HttpCharset... charsets) {
    return new AcceptCharset(FingerTrieSeq.of(charsets));
  }

  public static AcceptCharset from(String... charsetStrings) {
    final Builder<HttpCharset, FingerTrieSeq<HttpCharset>> charsets = FingerTrieSeq.builder();
    for (int i = 0, n = charsetStrings.length; i < n; i += 1) {
      charsets.add(HttpCharset.parse(charsetStrings[i]));
    }
    return new AcceptCharset(charsets.bind());
  }

  public static Parser<AcceptCharset> parseHttpValue(Input input, HttpParser http) {
    return AcceptCharsetParser.parse(input, http);
  }
}
