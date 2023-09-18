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
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Murmur3;

public final class ExpectHeader extends HttpHeader {

  final String value;

  ExpectHeader(String value) {
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
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return http.writePhrase(output, this.value);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ExpectHeader) {
      final ExpectHeader that = (ExpectHeader) other;
      return this.value.equals(that.value);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (ExpectHeader.hashSeed == 0) {
      ExpectHeader.hashSeed = Murmur3.seed(ExpectHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(ExpectHeader.hashSeed, this.value.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("ExpectHeader").write('.').write("create").write('(')
                   .debug(this.value).write(')');
    return output;
  }

  public static ExpectHeader create(String value) {
    return new ExpectHeader(value);
  }

  public static Parser<ExpectHeader> parseHeaderValue(Input input, HttpParser http) {
    return ExpectHeaderParser.parse(input);
  }

}
