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
import swim.http.HttpMethod;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Builder;
import swim.util.Murmur3;

public final class Allow extends HttpHeader {
  final FingerTrieSeq<HttpMethod> methods;

  Allow(FingerTrieSeq<HttpMethod> methods) {
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
  public Writer<?, ?> writeHttpValue(Output<?> output, HttpWriter http) {
    return http.writeParamList(this.methods.iterator(), output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Allow) {
      final Allow that = (Allow) other;
      return this.methods.equals(that.methods);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Allow.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.methods.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Allow").write('.').write("from").write('(');
    final int n = this.methods.size();
    if (n > 0) {
      output.debug(this.methods.head());
      for (int i = 1; i < n; i += 1) {
        output.debug(", ").debug(this.methods.get(i));
      }
    }
    output = output.write(')');
  }

  private static int hashSeed;

  public static Allow from(FingerTrieSeq<HttpMethod> methods) {
    return new Allow(methods);
  }

  public static Allow from(HttpMethod... methods) {
    return new Allow(FingerTrieSeq.of(methods));
  }

  public static Allow from(String... methodStrings) {
    final Builder<HttpMethod, FingerTrieSeq<HttpMethod>> methods = FingerTrieSeq.builder();
    for (int i = 0, n = methodStrings.length; i < n; i += 1) {
      methods.add(HttpMethod.parseHttp(methodStrings[i]));
    }
    return new Allow(methods.bind());
  }

  public static Parser<Allow> parseHttpValue(Input input, HttpParser http) {
    return AllowParser.parse(input, http);
  }
}
