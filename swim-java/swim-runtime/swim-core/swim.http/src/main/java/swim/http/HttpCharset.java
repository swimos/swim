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
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.Writer;
import swim.util.Murmur3;

public final class HttpCharset extends HttpPart implements Debug {

  final String name;
  final float weight;

  HttpCharset(String name, float weight) {
    this.name = name;
    this.weight = weight;
  }

  public boolean isStar() {
    return "*".equals(this.name);
  }

  public String name() {
    return this.name;
  }

  public float weight() {
    return this.weight;
  }

  public HttpCharset weight(float weight) {
    if (this.weight == weight) {
      return this;
    } else {
      return HttpCharset.create(this.name, weight);
    }
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.charsetWriter(this.name, this.weight);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeCharset(output, this.name, this.weight);
  }

  public boolean matches(HttpCharset that) {
    if (this == that) {
      return true;
    } else {
      return this.name.equalsIgnoreCase(that.name);
    }
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpCharset) {
      final HttpCharset that = (HttpCharset) other;
      return this.name.equals(that.name) && this.weight == that.weight;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (HttpCharset.hashSeed == 0) {
      HttpCharset.hashSeed = Murmur3.seed(HttpCharset.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HttpCharset.hashSeed,
        this.name.hashCode()), Murmur3.hash(this.weight)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("HttpCharset").write('.').write("create").write('(').debug(this.name);
    if (this.weight != 1f) {
      output = output.write(", ").debug(this.weight);
    }
    output = output.write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static HttpCharset star;

  public static HttpCharset star() {
    if (HttpCharset.star == null) {
      HttpCharset.star = new HttpCharset("*", 1f);
    }
    return HttpCharset.star;
  }

  public static HttpCharset create(String name, float weight) {
    if (weight == 1f) {
      return HttpCharset.create(name);
    } else {
      return new HttpCharset(name, weight);
    }
  }

  public static HttpCharset create(String name) {
    if ("*".equals(name)) {
      return HttpCharset.star();
    } else {
      return new HttpCharset(name, 1f);
    }
  }

  public static HttpCharset parse(String string) {
    return Http.standardParser().parseCharsetString(string);
  }

}
