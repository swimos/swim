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
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.ParseException;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Utf8DecodedOutput;
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

  private static final int hashSeed = Murmur3.seed(UriUser.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(UriUser.hashSeed,
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

  public static UriUser parse(String part) {
    Objects.requireNonNull(part);
    final Input input = new StringInput(part);
    final UriUser user = UriUser.parse(input);
    if (input.isCont()) {
      throw new ParseException(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      throw new ParseException(input.getError());
    }
    return user;
  }

  public static UriUser parse(Input input) {
    final String name = UriUser.parseName(input);
    final String pass;
    if (input.isCont() && input.head() == ':') {
      input.step();
      pass = UriUser.parsePass(input);
    } else {
      pass = null;
    }
    if (input.isReady()) {
      return UriUser.namePass(name, pass);
    }
    if (input.isError()) {
      throw new ParseException(input.getError());
    }
    throw new ParseException(Diagnostic.unexpected(input));
  }

  private static String parseName(Input input) {
    final Utf8DecodedOutput<String> nameOutput = new Utf8DecodedOutput<String>(new StringOutput());
    int c = 0;
    do {
      while (input.isCont()) {
        c = input.head();
        if (Uri.isUserChar(c)) {
          input.step();
          nameOutput.write(c);
        } else {
          break;
        }
      }
      if (input.isCont() && c == '%') {
        input.step();
      } else if (input.isReady()) {
        return nameOutput.getNonNull();
      } else {
        break;
      }
      int c1 = 0;
      if (input.isCont()) {
        c1 = input.head();
        if (Base16.isDigit(c1)) {
          input.step();
        } else {
          throw new ParseException(Diagnostic.expected("hex digit", input));
        }
      } else if (input.isDone()) {
        throw new ParseException(Diagnostic.expected("hex digit", input));
      } else {
        break;
      }
      int c2 = 0;
      if (input.isCont()) {
        c2 = input.head();
        if (Base16.isDigit(c2)) {
          input.step();
          nameOutput.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c2));
          continue;
        } else {
          throw new ParseException(Diagnostic.expected("hex digit", input));
        }
      } else if (input.isDone()) {
        throw new ParseException(Diagnostic.expected("hex digit", input));
      } else {
        break;
      }
    } while (true);
    if (input.isError()) {
      throw new ParseException(input.getError());
    }
    throw new ParseException(Diagnostic.unexpected(input));
  }

  private static String parsePass(Input input) {
    final Utf8DecodedOutput<String> passOutput = new Utf8DecodedOutput<String>(new StringOutput());
    do {
      int c = 0;
      while (input.isCont()) {
        c = input.head();
        if (Uri.isUserInfoChar(c)) {
          input.step();
          passOutput.write(c);
        } else {
          break;
        }
      }
      if (input.isCont() && c == '%') {
        input.step();
      } else if (input.isReady()) {
        return passOutput.getNonNull();
      } else {
        break;
      }
      int c1 = 0;
      if (input.isCont()) {
        c1 = input.head();
        if (Base16.isDigit(c1)) {
          input.step();
        } else {
          throw new ParseException(Diagnostic.expected("hex digit", input));
        }
      } else if (input.isDone()) {
        throw new ParseException(Diagnostic.expected("hex digit", input));
      } else {
        break;
      }
      int c2 = 0;
      if (input.isCont()) {
        c2 = input.head();
        if (Base16.isDigit(c2)) {
          input.step();
          passOutput.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c2));
          continue;
        } else {
          throw new ParseException(Diagnostic.expected("hex digit", input));
        }
      } else if (input.isDone()) {
        throw new ParseException(Diagnostic.expected("hex digit", input));
      } else {
        break;
      }
    } while (true);
    if (input.isError()) {
      throw new ParseException(input.getError());
    }
    throw new ParseException(Diagnostic.unexpected(input));
  }

  public static UriUser fromJsonString(String value) {
    return UriUser.parse(value);
  }

  public static String toJsonString(UriUser user) {
    return user.toString();
  }

  public static UriUser fromWamlString(String value) {
    return UriUser.parse(value);
  }

  public static String toWamlString(UriUser user) {
    return user.toString();
  }

}
