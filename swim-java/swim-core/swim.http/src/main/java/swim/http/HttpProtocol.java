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

import java.util.Objects;
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
public final class HttpProtocol implements ToSource, ToString {

  final String name;
  final @Nullable String version;

  HttpProtocol(String name, @Nullable String version) {
    this.name = name;
    this.version = version;
  }

  HttpProtocol(String name) {
    this(name, null);
  }

  public String name() {
    return this.name;
  }

  public @Nullable String version() {
    return this.version;
  }

  public Write<?> write(Output<?> output) {
    return WriteHttpProtocol.write(output, this.name, this.version, 0, 1);
  }

  public Write<?> write() {
    return new WriteHttpProtocol(this.name, this.version, 0, 1);
  }

  @SuppressWarnings("ReferenceEquality")
  public boolean matches(HttpProtocol that) {
    if (this == that) {
      return true;
    } else {
      return this.name.equalsIgnoreCase(that.name)
          && Objects.equals(this.version, that.version);
    }
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpProtocol) {
      final HttpProtocol that = (HttpProtocol) other;
      return this.name.equals(that.name)
          && Objects.equals(this.version, that.version);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpProtocol.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.name.hashCode()), Objects.hashCode(this.version)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpProtocol", "of")
            .appendArgument(this.name);
    if (this.version != null) {
      notation.appendArgument(this.version);
    }
    notation.endInvoke();
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

  private static final HttpProtocol H2C = new HttpProtocol("h2c");

  public static HttpProtocol h2c() {
    return H2C;
  }

  private static final HttpProtocol WEBSOCKET = new HttpProtocol("websocket");

  public static HttpProtocol websocket() {
    return WEBSOCKET;
  }

  public static HttpProtocol of(String name, @Nullable String version) {
    if (version == null && "h2c".equals(name)) {
      return HttpProtocol.h2c();
    } else if (version == null && "websocket".equals(name)) {
      return HttpProtocol.websocket();
    } else {
      return new HttpProtocol(name, version);
    }
  }

  public static HttpProtocol of(String name) {
    return HttpProtocol.of(name, null);
  }

  public static Parse<HttpProtocol> parse(Input input) {
    return ParseHttpProtocol.parse(input, null, null, 1);
  }

  public static Parse<HttpProtocol> parse() {
    return new ParseHttpProtocol(null, null, 1);
  }

  public static HttpProtocol parse(String string) {
    final Input input = new StringInput(string);
    Parse<HttpProtocol> parse = HttpProtocol.parse(input);
    if (input.isCont() && !parse.isError()) {
      parse = Parse.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parse = Parse.error(input.getError());
    }
    return parse.getNonNull();
  }

}

final class ParseHttpProtocol extends Parse<HttpProtocol> {

  final @Nullable StringBuilder nameBuilder;
  final @Nullable StringBuilder versionBuilder;
  final int step;

  ParseHttpProtocol(@Nullable StringBuilder nameBuilder,
                    @Nullable StringBuilder versionBuilder, int step) {
    this.nameBuilder = nameBuilder;
    this.versionBuilder = versionBuilder;
    this.step = step;
  }

  @Override
  public Parse<HttpProtocol> consume(Input input) {
    return ParseHttpProtocol.parse(input, this.nameBuilder,
                                   this.versionBuilder, this.step);
  }

  static Parse<HttpProtocol> parse(Input input, @Nullable StringBuilder nameBuilder,
                                   @Nullable StringBuilder versionBuilder, int step) {
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
          return Parse.error(Diagnostic.expected("protocol name", input));
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected("protocol name", input));
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
      if (input.isCont() && c == '/') {
        input.step();
        step = 3;
      } else if (input.isReady()) {
        return Parse.done(HttpProtocol.of(nameBuilder.toString(), null));
      }
    }
    if (step == 3) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input.step();
          versionBuilder = new StringBuilder();
          versionBuilder.appendCodePoint(c);
          step = 4;
        } else {
          return Parse.error(Diagnostic.expected("protocol version", input));
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected("protocol version", input));
      }
    }
    if (step == 4) {
      nameBuilder = Assume.nonNull(nameBuilder);
      versionBuilder = Assume.nonNull(versionBuilder);
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input.step();
          versionBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isReady()) {
        return Parse.done(HttpProtocol.of(nameBuilder.toString(),
                                          versionBuilder.toString()));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseHttpProtocol(nameBuilder, versionBuilder, step);
  }

}

final class WriteHttpProtocol extends Write<Object> {

  final String name;
  final @Nullable String version;
  final int index;
  final int step;

  WriteHttpProtocol(String name, @Nullable String version,
                    int index, int step) {
    this.name = name;
    this.version = version;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteHttpProtocol.write(output, this.name, this.version,
                                   this.index, this.step);
  }

  static Write<Object> write(Output<?> output, String name,
                             @Nullable String version, int index, int step) {
    int c = 0;
    if (step == 1) {
      if (name.length() == 0) {
        return Write.error(new WriteException("Blank protocol name"));
      }
      while (index < name.length() && output.isCont()) {
        c = name.codePointAt(index);
        if (Http.isTokenChar(c)) {
          output.write(c);
          index = name.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("Invalid protocol name: " + name));
        }
      }
      if (index >= name.length()) {
        index = 0;
        if (version != null) {
          step = 2;
        } else {
          return Write.done();
        }
      }
    }
    if (step == 2 && output.isCont()) {
      output.write('/');
      step = 3;
    }
    if (step == 3) {
      version = Assume.nonNull(version);
      if (version.length() == 0) {
        return Write.error(new WriteException("Blank protocol version"));
      }
      while (index < version.length() && output.isCont()) {
        c = version.codePointAt(index);
        if (Http.isTokenChar(c)) {
          output.write(c);
          index = version.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("Invalid protocol version: " + version));
        }
      }
      if (index >= version.length()) {
        index = 0;
        return Write.done();
      }
    }
    if (output.isDone()) {
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteHttpProtocol(name, version, index, step);
  }

}
