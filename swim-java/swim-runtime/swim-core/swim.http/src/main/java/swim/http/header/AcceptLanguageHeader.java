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

package swim.http.header;

import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Writer;
import swim.collections.FingerTrieSeq;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.http.LanguageRange;
import swim.util.Builder;
import swim.util.Murmur3;

public final class AcceptLanguageHeader extends HttpHeader {

  final FingerTrieSeq<LanguageRange> languages;

  AcceptLanguageHeader(FingerTrieSeq<LanguageRange> languages) {
    this.languages = languages;
  }

  @Override
  public boolean isBlank() {
    return this.languages.isEmpty();
  }

  @Override
  public String lowerCaseName() {
    return "accept-language";
  }

  @Override
  public String name() {
    return "Accept-Language";
  }

  public FingerTrieSeq<LanguageRange> languages() {
    return this.languages;
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return http.writeParamList(output, this.languages.iterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof AcceptLanguageHeader) {
      final AcceptLanguageHeader that = (AcceptLanguageHeader) other;
      return this.languages.equals(that.languages);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (AcceptLanguageHeader.hashSeed == 0) {
      AcceptLanguageHeader.hashSeed = Murmur3.seed(AcceptLanguageHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(AcceptLanguageHeader.hashSeed, this.languages.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("AcceptLanguageHeader").write('.').write("create").write('(');
    final int n = this.languages.size();
    if (n > 0) {
      output = output.debug(this.languages.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.languages.get(i));
      }
    }
    output = output.write(')');
    return output;
  }

  public static AcceptLanguageHeader empty() {
    return new AcceptLanguageHeader(FingerTrieSeq.empty());
  }

  public static AcceptLanguageHeader create(FingerTrieSeq<LanguageRange> languages) {
    return new AcceptLanguageHeader(languages);
  }

  public static AcceptLanguageHeader create(LanguageRange... languages) {
    return new AcceptLanguageHeader(FingerTrieSeq.of(languages));
  }

  public static AcceptLanguageHeader create(String... languageStrings) {
    final Builder<LanguageRange, FingerTrieSeq<LanguageRange>> languages = FingerTrieSeq.builder();
    for (int i = 0, n = languageStrings.length; i < n; i += 1) {
      languages.add(LanguageRange.parse(languageStrings[i]));
    }
    return new AcceptLanguageHeader(languages.bind());
  }

  public static Parser<AcceptLanguageHeader> parseHeaderValue(Input input, HttpParser http) {
    return AcceptLanguageHeaderParser.parse(input, http);
  }

}
