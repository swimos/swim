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
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Murmur3;

public final class Expect extends HttpHeader {
  final String value;

  Expect(String value) {
    this.value = value;
  }

  @Override
  public boolean isBlank() {
    return this.value.isEmpty();
  }

  @Override
  public String lowerCaseName() {
    return "expect";
  }

  @Override
  public String name() {
    return "Expect";
  }

  @Override
  public String value() {
    return this.value;
  }

  public boolean is100Continue() {
    return "100-continue".equals(this.value);
  }

  @Override
  public Writer<?, ?> writeHttpValue(Output<?> output, HttpWriter http) {
    return http.writePhrase(this.value, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Expect) {
      final Expect that = (Expect) other;
      return this.value.equals(that.value);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Expect.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.value.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Expect").write('.').write("from").write('(').debug(this.value).write(')');
  }

  private static int hashSeed;

  public static Expect from(String value) {
    return new Expect(value);
  }

  public static Parser<Expect> parseHttpValue(Input input, HttpParser http) {
    return ExpectParser.parse(input);
  }
}
