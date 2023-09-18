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

package swim.http;

import swim.codec.Debug;
import swim.codec.Output;
import swim.codec.Writer;
import swim.util.Murmur3;

public class Cookie extends HttpPart implements Debug {

  final String name;
  final String value;

  Cookie(String name, String value) {
    this.name = name;
    this.value = value;
  }

  public String getName() {
    return this.name;
  }

  public String getValue() {
    return this.value;
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Cookie").write('.').write("create").write('(').debug(this.name);

    if (this.value != null) {
      output = output.write(", ").debug(this.value);
    }

    output = output.write(')');

    return output;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Cookie) {
      final Cookie that = (Cookie) other;
      return this.name.equals(that.name) && this.value.equals(that.value);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Cookie.hashSeed == 0) {
      Cookie.hashSeed = Murmur3.seed(Cookie.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Cookie.hashSeed,
         this.name.hashCode()), this.value.hashCode()));
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return new CookieWriter(http, this.name, this.value);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return CookieWriter.write(output, http, this.name, this.value);
  }

  public static Cookie create(String name, String value) {
    return new Cookie(name, value);
  }

  public static Cookie create(String name) {
    return new Cookie(name, "");
  }

  public static Cookie parse(String string) {
    return Http.standardParser().parseCookieString(string);
  }

}
