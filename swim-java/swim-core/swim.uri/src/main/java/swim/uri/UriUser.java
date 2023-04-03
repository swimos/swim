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

package swim.uri;

import java.io.IOException;
import java.util.Objects;
import swim.annotations.FromForm;
import swim.annotations.IntoForm;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.OutputException;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Utf8DecodedOutput;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.ToString;

@Public
@Since("5.0")
public final class UriUser implements ToSource, ToString {

  final @Nullable String name;

  final @Nullable String pass;

  UriUser(@Nullable String name, @Nullable String pass) {
    this.name = name;
    this.pass = pass;
  }

  public boolean isDefined() {
    return this.name != null;
  }

  public @Nullable String name() {
    return this.name;
  }

  @SuppressWarnings("ReferenceEquality")
  public UriUser withName(@Nullable String name) {
    if (name != this.name) {
      return UriUser.namePass(name, this.pass);
    } else {
      return this;
    }
  }

  public @Nullable String pass() {
    return this.pass;
  }

  @SuppressWarnings("ReferenceEquality")
  public UriUser withPass(@Nullable String pass) {
    if (pass != this.pass) {
      return UriUser.namePass(this.name, pass);
    } else {
      return this;
    }
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriUser) {
      final UriUser that = (UriUser) other;
      return Objects.equals(this.name, that.name)
          && Objects.equals(this.pass, that.pass);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(UriUser.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        Objects.hashCode(this.name)), Objects.hashCode(this.pass)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.name == null && this.pass == null) {
      notation.beginInvoke("UriUser", "undefined").endInvoke();
    } else if (this.pass == null) {
      notation.beginInvoke("UriUser", "name")
              .appendArgument(this.name)
              .endInvoke();
    } else {
      notation.beginInvoke("UriUser", "namePass")
              .appendArgument(this.name)
              .appendArgument(this.pass)
              .endInvoke();
    }
  }

  @Override
  public void writeString(Appendable output) throws IOException {
    final String name = this.name;
    if (name != null) {
      for (int i = 0, n = name.length(); i < n; i = name.offsetByCodePoints(i, 1)) {
        final int c = name.codePointAt(i);
        if (Uri.isUserChar(c)) {
          output.append((char) c);
        } else {
          Uri.writeEncoded(output, c);
        }
      }
      final String pass = this.pass;
      if (pass != null) {
        output.append(':');
        for (int i = 0, n = pass.length(); i < n; i = pass.offsetByCodePoints(i, 1)) {
          final int c = pass.codePointAt(i);
          if (Uri.isUserChar(c)) {
            output.append((char) c);
          } else {
            Uri.writeEncoded(output, c);
          }
        }
      }
    }
  }

  @IntoForm
  @Override
  public String toString() {
    return this.toString(null);
  }

  private static final UriUser UNDEFINED = new UriUser(null, null);

  public static UriUser undefined() {
    return UNDEFINED;
  }

  public static UriUser namePass(@Nullable String name, @Nullable String pass) {
    if (name != null || pass != null) {
      if (name == null) {
        name = "";
      }
      return new UriUser(name, pass);
    } else {
      return UriUser.undefined();
    }
  }

  public static UriUser name(@Nullable String name) {
    if (name != null) {
      return new UriUser(name, null);
    } else {
      return UriUser.undefined();
    }
  }

  @FromForm
  public static @Nullable UriUser from(String value) {
    return UriUser.parse(value).getOr(null);
  }

  public static Parse<UriUser> parse(Input input) {
    return ParseUriUser.parse(input, null, null, 0, 1);
  }

  public static Parse<UriUser> parse(String part) {
    Objects.requireNonNull(part);
    final StringInput input = new StringInput(part);
    return UriUser.parse(input).complete(input);
  }

}

final class ParseUriUser extends Parse<UriUser> {

  final @Nullable Utf8DecodedOutput<String> nameOutput;
  final @Nullable Utf8DecodedOutput<String> passOutput;
  final int c1;
  final int step;

  ParseUriUser(@Nullable Utf8DecodedOutput<String> nameOutput,
               @Nullable Utf8DecodedOutput<String> passOutput,
               int c1, int step) {
    this.nameOutput = nameOutput;
    this.passOutput = passOutput;
    this.c1 = c1;
    this.step = step;
  }

  @Override
  public Parse<UriUser> consume(Input input) {
    return ParseUriUser.parse(input, this.nameOutput,
                              this.passOutput, this.c1, this.step);
  }

  static Parse<UriUser> parse(Input input, @Nullable Utf8DecodedOutput<String> nameOutput,
                              @Nullable Utf8DecodedOutput<String> passOutput,
                              int c1, int step) {
    int c = 0;
    do {
      if (step == 1) {
        if (input.isReady() && nameOutput == null) {
          nameOutput = new Utf8DecodedOutput<String>(new StringOutput());
        }
        while (input.isCont() && Uri.isUserChar(c = input.head())) {
          Assume.nonNull(nameOutput).write(c);
          input.step();
        }
        if (input.isCont() && (c == '%' || c == ':')) {
          input.step();
          if (c == '%') {
            step = 2;
          } else { // c == ':'
            step = 4;
          }
        } else if (input.isReady()) {
          try {
            return Parse.done(UriUser.name(Assume.nonNull(nameOutput).get()));
          } catch (OutputException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
      }
      if (step == 2) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          c1 = c;
          input.step();
          step = 3;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 3) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          Assume.nonNull(nameOutput).write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
          c1 = 0;
          input.step();
          step = 1;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 4) {
        if (input.isReady() && passOutput == null) {
          passOutput = new Utf8DecodedOutput<String>(new StringOutput());
        }
        while (input.isCont() && Uri.isUserInfoChar(c = input.head())) {
          Assume.nonNull(passOutput).write(c);
          input.step();
        }
        if (input.isCont() && c == '%') {
          input.step();
          step = 5;
        } else if (input.isReady()) {
          try {
            return Parse.done(UriUser.namePass(Assume.nonNull(nameOutput).get(),
                                               Assume.nonNull(passOutput).get()));
          } catch (OutputException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
      }
      if (step == 5) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          c1 = c;
          input.step();
          step = 6;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 6) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          Assume.nonNull(passOutput).write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
          c1 = 0;
          input.step();
          step = 4;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseUriUser(nameOutput, passOutput, c1, step);
  }

}
