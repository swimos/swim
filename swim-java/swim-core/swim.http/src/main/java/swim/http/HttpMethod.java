// Copyright 2015-2022 Swim.inc
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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.ToString;

@Public
@Since("5.0")
public final class HttpMethod implements ToSource, ToString {

  final String name;

  HttpMethod(String name) {
    this.name = name;
  }

  public String name() {
    return this.name;
  }

  public Write<?> write(Output<?> output) {
    return WriteHttpMethod.write(output, this.name, 0);
  }

  public Write<?> write() {
    return new WriteHttpMethod(this.name, 0);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpMethod) {
      final HttpMethod that = (HttpMethod) other;
      return this.name.equals(that.name);
    }
    return false;
  }

  private static final int hashSeed = Murmur3.seed(HttpMethod.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HttpMethod.hashSeed, this.name.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if ("GET".equals(this.name) || "HEAD".equals(this.name)
        || "POST".equals(this.name) || "PUT".equals(this.name)
        || "DELETE".equals(this.name) || "CONNECT".equals(this.name)
        || "OPTIONS".equals(this.name) || "TRACE".equals(this.name)) {
      notation.append("HttpMethod").append('.').append(this.name);
    } else {
      notation.beginInvoke("HttpMethod", "create")
              .appendArgument(this.name)
              .endInvoke();
    }
  }

  @Override
  public void writeString(Appendable output) {
    this.write(StringOutput.from(output)).checkDone();
  }

  @Override
  public String toString() {
    final StringOutput output = new StringOutput();
    this.write(output).checkDone();
    return output.get();
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
    switch (name) {
      case "GET": return GET;
      case "HEAD": return HEAD;
      case "POST": return POST;
      case "PUT": return PUT;
      case "DELETE": return DELETE;
      case "CONNECT": return CONNECT;
      case "OPTIONS": return OPTIONS;
      case "TRACE": return TRACE;
      default: return new HttpMethod(name);
    }
  }

  public static Parse<HttpMethod> parse(Input input) {
    return ParseHttpMethod.parse(input, null, 1);
  }

  public static Parse<HttpMethod> parse() {
    return new ParseHttpMethod(null, 1);
  }

  public static HttpMethod parse(String string) {
    final Input input = new StringInput(string);
    Parse<HttpMethod> parse = HttpMethod.parse(input);
    if (input.isCont() && !parse.isError()) {
      parse = Parse.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parse = Parse.error(input.getError());
    }
    return parse.getNonNull();
  }

}

final class ParseHttpMethod extends Parse<HttpMethod> {

  final @Nullable StringBuilder nameBuilder;
  final int step;

  ParseHttpMethod(@Nullable StringBuilder nameBuilder, int step) {
    this.nameBuilder = nameBuilder;
    this.step = step;
  }

  @Override
  public Parse<HttpMethod> consume(Input input) {
    return ParseHttpMethod.parse(input, this.nameBuilder, this.step);
  }

  static Parse<HttpMethod> parse(Input input, @Nullable StringBuilder nameBuilder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input.step();
          nameBuilder = new StringBuilder();
          nameBuilder.appendCodePoint(c);
          step = 2;
        } else {
          return Parse.error(Diagnostic.expected("method", input));
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected("method", input));
      }
    }
    if (step == 2) {
      nameBuilder = Assume.nonNull(nameBuilder);
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input.step();
          nameBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isReady()) {
        return Parse.done(HttpMethod.create(nameBuilder.toString()));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseHttpMethod(nameBuilder, step);
  }

}

final class WriteHttpMethod extends Write<Object> {

  final String name;
  final int index;

  WriteHttpMethod(String name, int index) {
    this.name = name;
    this.index = index;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteHttpMethod.write(output, this.name, this.index);
  }

  static Write<Object> write(Output<?> output, String name, int index) {
    if (name.length() == 0) {
      return Write.error(new WriteException("Blank method name"));
    }
    while (index < name.length() && output.isCont()) {
      final int c = name.codePointAt(index);
      if (Http.isTokenChar(c)) {
        output.write(c);
        index = name.offsetByCodePoints(index, 1);
      } else {
        return Write.error(new WriteException("Invalid method name: " + name));
      }
    }
    if (index >= name.length()) {
      return Write.done();
    } else if (output.isDone()) {
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteHttpMethod(name, index);
  }

}
