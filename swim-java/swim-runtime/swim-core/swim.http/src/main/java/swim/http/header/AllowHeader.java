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
import swim.http.HttpMethod;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Builder;
import swim.util.Murmur3;

public final class AllowHeader extends HttpHeader {

  final FingerTrieSeq<HttpMethod> methods;

  AllowHeader(FingerTrieSeq<HttpMethod> methods) {
    this.methods = methods;
  }

  @Override
  public boolean isBlank() {
    return this.methods.isEmpty();
  }

  @Override
  public String lowerCaseName() {
    return "allow";
  }

  @Override
  public String name() {
    return "Allow";
  }

  public FingerTrieSeq<HttpMethod> methods() {
    return this.methods;
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return http.writeParamList(output, this.methods.iterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof AllowHeader) {
      final AllowHeader that = (AllowHeader) other;
      return this.methods.equals(that.methods);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (AllowHeader.hashSeed == 0) {
      AllowHeader.hashSeed = Murmur3.seed(AllowHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(AllowHeader.hashSeed, this.methods.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("AllowHeader").write('.').write("create").write('(');
    final int n = this.methods.size();
    if (n > 0) {
      output = output.debug(this.methods.head());
      for (int i = 1; i < n; i += 1) {
        output = output.debug(", ").debug(this.methods.get(i));
      }
    }
    output = output.write(')');
    return output;
  }

  public static AllowHeader empty() {
    return new AllowHeader(FingerTrieSeq.empty());
  }

  public static AllowHeader create(FingerTrieSeq<HttpMethod> methods) {
    return new AllowHeader(methods);
  }

  public static AllowHeader create(HttpMethod... methods) {
    return new AllowHeader(FingerTrieSeq.of(methods));
  }

  public static AllowHeader create(String... methodStrings) {
    final Builder<HttpMethod, FingerTrieSeq<HttpMethod>> methods = FingerTrieSeq.builder();
    for (int i = 0, n = methodStrings.length; i < n; i += 1) {
      methods.add(HttpMethod.parseHttp(methodStrings[i]));
    }
    return new AllowHeader(methods.bind());
  }

  public static Parser<AllowHeader> parseHeaderValue(Input input, HttpParser http) {
    return AllowHeaderParser.parse(input, http);
  }

}
