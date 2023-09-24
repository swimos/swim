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
import swim.util.WriteSource;
import swim.util.WriteString;

@Public
@Since("5.0")
public final class HttpCookie implements WriteSource, WriteString {

  final String name;
  final String value;

  HttpCookie(String name, String value) {
    this.name = name;
    this.value = value;
  }

  public String name() {
    return this.name;
  }

  public String value() {
    return this.value;
  }

  public Write<?> write(Output<?> output) {
    return WriteHttpCookie.write(output, this.name, this.value, 0, 0, 1);
  }

  public Write<?> write() {
    return new WriteHttpCookie(this.name, this.value, 0, 0, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpCookie that) {
      return this.name.equals(that.name) && this.value.equals(that.value);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpCookie.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.name.hashCode()), this.value.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpCookie", "of")
            .appendArgument(this.name)
            .appendArgument(this.value)
            .endInvoke();
  }

  @Override
  public void writeString(Appendable output) {
    this.write(StringOutput.from(output)).assertDone();
  }

  @Override
  public String toString() {
    final StringOutput output = new StringOutput();
    this.write(output).assertDone();
    return output.get();
  }

  public static HttpCookie of(String name, String value) {
    return new HttpCookie(name, value);
  }

  public static Parse<HttpCookie> parse(Input input) {
    return ParseHttpCookie.parse(input, null, null, 1);
  }

  public static Parse<HttpCookie> parse() {
    return new ParseHttpCookie(null, null, 1);
  }

  public static Parse<HttpCookie> parse(String string) {
    final StringInput input = new StringInput(string);
    return HttpCookie.parse(input).complete(input);
  }

}

final class ParseHttpCookie extends Parse<HttpCookie> {

  final @Nullable StringBuilder nameBuilder;
  final @Nullable StringBuilder valueBuilder;
  final int step;

  ParseHttpCookie(@Nullable StringBuilder nameBuilder,
                  @Nullable StringBuilder valueBuilder, int step) {
    this.nameBuilder = nameBuilder;
    this.valueBuilder = valueBuilder;
    this.step = step;
  }

  @Override
  public Parse<HttpCookie> consume(Input input) {
    return ParseHttpCookie.parse(input, this.nameBuilder,
                                 this.valueBuilder, this.step);
  }

  static Parse<HttpCookie> parse(Input input, @Nullable StringBuilder nameBuilder,
                                 @Nullable StringBuilder valueBuilder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && Http.isTokenChar(c = input.head())) {
        nameBuilder = new StringBuilder();
        nameBuilder.appendCodePoint(c);
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("cookie name", input));
      }
    }
    if (step == 2) {
      while (input.isCont() && Http.isTokenChar(c = input.head())) {
        Assume.nonNull(nameBuilder).appendCodePoint(c);
        input.step();
      }
      if (input.isCont() && c == '=') {
        valueBuilder = new StringBuilder();
        input.step();
        step = 3;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('=', input));
      }
    }
    if (step == 3) {
      if (input.isCont()) {
        if (input.head() == '"') {
          input.step();
          step = 4;
        } else {
          step = 6;
        }
      } else if (input.isDone()) {
        return Parse.done(HttpCookie.of(Assume.nonNull(nameBuilder).toString(), ""));
      }
    }
    if (step == 4) {
      while (input.isCont() && Http.isCookieChar(c = input.head())) {
        Assume.nonNull(valueBuilder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        step = 5;
      }
    }
    if (step == 5) {
      if (input.isCont() && input.head() == '"') {
        input.step();
        return Parse.done(HttpCookie.of(Assume.nonNull(nameBuilder).toString(),
                                        Assume.nonNull(valueBuilder).toString()));
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('"', input));
      }
    }
    if (step == 6) {
      while (input.isCont() && Http.isCookieChar(c = input.head())) {
        Assume.nonNull(valueBuilder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        return Parse.done(HttpCookie.of(Assume.nonNull(nameBuilder).toString(),
                                        Assume.nonNull(valueBuilder).toString()));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseHttpCookie(nameBuilder, valueBuilder, step);
  }

}

final class WriteHttpCookie extends Write<Object> {

  final String name;
  final String value;
  final int index;
  final int escape;
  final int step;

  WriteHttpCookie(String name, String value, int index, int escape, int step) {
    this.name = name;
    this.value = value;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteHttpCookie.write(output, this.name, this.value,
                                 this.index, this.escape, this.step);
  }

  static Write<Object> write(Output<?> output, String name, String value,
                             int index, int escape, int step) {
    int c = 0;
    if (step == 1) {
      if (name.length() == 0) {
        return Write.error(new WriteException("blank cookie name"));
      }
      while (index < name.length() && output.isCont()) {
        c = name.codePointAt(index);
        if (Http.isTokenChar(c)) {
          output.write(c);
          index = name.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("invalid cookie name: " + name));
        }
      }
      if (index >= name.length()) {
        index = 0;
        step = 2;
      }
    }
    if (step == 2 && output.isCont()) {
      output.write('=');
      step = 3;
    }
    if (step == 3) {
      while (index < value.length() && output.isCont()) {
        c = value.codePointAt(index);
        if (Http.isCookieChar(c)) {
          output.write(c);
          index = value.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("invalid cookie value: " + value));
        }
      }
      if (index >= value.length()) {
        return Write.done();
      }
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteHttpCookie(name, value, index, escape, step);
  }

}
