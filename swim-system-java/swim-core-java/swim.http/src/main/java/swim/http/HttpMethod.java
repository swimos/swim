// Copyright 2015-2021 Swim inc.
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

public final class HttpMethod extends HttpPart implements Debug {

  final String name;

  HttpMethod(String name) {
    this.name = name;
  }

  public String name() {
    return this.name;
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.methodWriter(this.name);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeMethod(this.name, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpMethod) {
      final HttpMethod that = (HttpMethod) other;
      return this.name.equals(that.name);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (HttpMethod.hashSeed == 0) {
      HttpMethod.hashSeed = Murmur3.seed(HttpMethod.class);
    }
    return Murmur3.mash(Murmur3.mix(HttpMethod.hashSeed, this.name.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("HttpMethod").write('.');
    if ("GET".equals(this.name) || "HEAD".equals(this.name) || "POST".equals(this.name)
        || "PUT".equals(this.name) || "DELETE".equals(this.name) || "CONNECT".equals(this.name)
        || "OPTIONS".equals(this.name) || "TRACE".equals(this.name)) {
      output = output.write(this.name);
    } else {
      output = output.write("create").write('(').debug(this.name).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static final HttpMethod GET = new HttpMethod("GET");
  public static final HttpMethod HEAD = new HttpMethod("HEAD");
  public static final HttpMethod POST = new HttpMethod("POST");
  public static final HttpMethod PUT = new HttpMethod("PUT");
  public static final HttpMethod DELETE = new HttpMethod("DELETE");
  public static final HttpMethod CONNECT = new HttpMethod("CONNECT");
  public static final HttpMethod OPTIONS = new HttpMethod("OPTIONS");
  public static final HttpMethod TRACE = new HttpMethod("TRACE");

  public static HttpMethod create(String name) {
    if ("GET".equals(name)) {
      return HttpMethod.GET;
    } else if ("HEAD".equals(name)) {
      return HttpMethod.HEAD;
    } else if ("POST".equals(name)) {
      return HttpMethod.POST;
    } else if ("PUT".equals(name)) {
      return HttpMethod.PUT;
    } else if ("DELETE".equals(name)) {
      return HttpMethod.DELETE;
    } else if ("CONNECT".equals(name)) {
      return HttpMethod.CONNECT;
    } else if ("OPTIONS".equals(name)) {
      return HttpMethod.OPTIONS;
    } else if ("TRACE".equals(name)) {
      return HttpMethod.TRACE;
    } else {
      return new HttpMethod(name);
    }
  }

  public static HttpMethod parseHttp(String string) {
    return Http.standardParser().parseMethodString(string);
  }

}
