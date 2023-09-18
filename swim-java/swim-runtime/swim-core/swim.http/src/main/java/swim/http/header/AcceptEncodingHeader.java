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
import swim.http.ContentCoding;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Builder;
import swim.util.Murmur3;

public final class AcceptEncodingHeader extends HttpHeader {

  final FingerTrieSeq<ContentCoding> codings;

  AcceptEncodingHeader(FingerTrieSeq<ContentCoding> codings) {
    this.codings = codings;
  }

  @Override
  public boolean isBlank() {
    return this.codings.isEmpty();
  }

  @Override
  public String lowerCaseName() {
    return "accept-encoding";
  }

  @Override
  public String name() {
    return "Accept-Encoding";
  }

  public FingerTrieSeq<ContentCoding> codings() {
    return this.codings;
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return http.writeParamList(output, this.codings.iterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof AcceptEncodingHeader) {
      final AcceptEncodingHeader that = (AcceptEncodingHeader) other;
      return this.codings.equals(that.codings);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (AcceptEncodingHeader.hashSeed == 0) {
      AcceptEncodingHeader.hashSeed = Murmur3.seed(AcceptEncodingHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(AcceptEncodingHeader.hashSeed, this.codings.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("AcceptEncodingHeader").write('.').write("create").write('(');
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

  public static AcceptEncodingHeader empty() {
    return new AcceptEncodingHeader(FingerTrieSeq.empty());
  }

  public static AcceptEncodingHeader create(FingerTrieSeq<ContentCoding> codings) {
    return new AcceptEncodingHeader(codings);
  }

  public static AcceptEncodingHeader create(ContentCoding... codings) {
    return new AcceptEncodingHeader(FingerTrieSeq.of(codings));
  }

  public static AcceptEncodingHeader create(String... codingStrings) {
    final Builder<ContentCoding, FingerTrieSeq<ContentCoding>> codings = FingerTrieSeq.builder();
    for (int i = 0, n = codingStrings.length; i < n; i += 1) {
      codings.add(ContentCoding.parse(codingStrings[i]));
    }
    return new AcceptEncodingHeader(codings.bind());
  }

  public static Parser<AcceptEncodingHeader> parseHeaderValue(Input input, HttpParser http) {
    return AcceptEncodingHeaderParser.parse(input, http);
  }

}
