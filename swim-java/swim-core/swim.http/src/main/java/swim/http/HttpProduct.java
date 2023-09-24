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

import java.util.Iterator;
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
import swim.collections.FingerTrieList;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;
import swim.util.WriteString;

@Public
@Since("5.0")
public final class HttpProduct implements WriteSource, WriteString {

  final String name;
  final @Nullable String version;
  final FingerTrieList<String> comments;

  HttpProduct(String name, @Nullable String version,
              FingerTrieList<String> comments) {
    this.name = name;
    this.version = version;
    this.comments = comments;
  }

  HttpProduct(String name, @Nullable String version) {
    this(name, version, FingerTrieList.<String>empty());
  }

  HttpProduct(String name) {
    this(name, null, FingerTrieList.<String>empty());
  }

  public String name() {
    return this.name;
  }

  public @Nullable String version() {
    return this.version;
  }

  public FingerTrieList<String> comments() {
    return this.comments;
  }

  public HttpProduct withComments(FingerTrieList<String> comments) {
    return new HttpProduct(this.name, this.version, comments);
  }

  public HttpProduct withComment(String comment) {
    return new HttpProduct(this.name, this.version,
                           this.comments.appended(comment));
  }

  public Write<?> write(Output<?> output) {
    return WriteHttpProduct.write(output, this.name, this.version,
                                  this.comments.iterator(), null, 0, 0, 0, 1);
  }

  public Write<?> write() {
    return new WriteHttpProduct(this.name, this.version,
                                this.comments.iterator(), null, 0, 0, 0, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpProduct that) {
      return this.name.equals(that.name)
          && Objects.equals(this.version, that.version)
          && this.comments.equals(that.comments);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpProduct.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.name.hashCode()), Objects.hashCode(this.version)),
        this.comments.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpProduct", "of")
            .appendArgument(this.name);
    if (this.version != null) {
      notation.appendArgument(this.version);
    }
    notation.endInvoke();
    for (String comment : this.comments) {
      notation.beginInvoke("withComment")
              .appendArgument(comment)
              .endInvoke();
    }
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

  public static HttpProduct of(String name, @Nullable String version,
                               FingerTrieList<String> comments) {
    return new HttpProduct(name, version, comments);
  }

  public static HttpProduct of(String name, @Nullable String version,
                               String... comments) {
    return new HttpProduct(name, version, FingerTrieList.of(comments));
  }

  public static HttpProduct of(String name, @Nullable String version) {
    return new HttpProduct(name, version);
  }

  public static HttpProduct of(String name) {
    return new HttpProduct(name);
  }

  public static Parse<HttpProduct> parse(Input input) {
    return ParseHttpProduct.parse(input, null, null, null, FingerTrieList.empty(), 0, 1);
  }

  public static Parse<HttpProduct> parse() {
    return new ParseHttpProduct(null, null, null, FingerTrieList.empty(), 0, 1);
  }

  public static Parse<HttpProduct> parse(String string) {
    final StringInput input = new StringInput(string);
    return HttpProduct.parse(input).complete(input);
  }

}

final class ParseHttpProduct extends Parse<HttpProduct> {

  final @Nullable StringBuilder nameBuilder;
  final @Nullable StringBuilder versionBuilder;
  final @Nullable StringBuilder commentBuilder;
  final FingerTrieList<String> comments;
  final int level;
  final int step;

  ParseHttpProduct(@Nullable StringBuilder nameBuilder,
                   @Nullable StringBuilder versionBuilder,
                   @Nullable StringBuilder commentBuilder,
                   FingerTrieList<String> comments,
                   int level, int step) {
    this.nameBuilder = nameBuilder;
    this.versionBuilder = versionBuilder;
    this.commentBuilder = commentBuilder;
    this.comments = comments;
    this.level = level;
    this.step = step;
  }

  @Override
  public Parse<HttpProduct> consume(Input input) {
    return ParseHttpProduct.parse(input, this.nameBuilder, this.versionBuilder,
                                  this.commentBuilder, this.comments,
                                  this.level, this.step);
  }

  static Parse<HttpProduct> parse(Input input, @Nullable StringBuilder nameBuilder,
                                  @Nullable StringBuilder versionBuilder,
                                  @Nullable StringBuilder commentBuilder,
                                  FingerTrieList<String> comments,
                                  int level, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && Http.isTokenChar(c = input.head())) {
        nameBuilder = new StringBuilder();
        nameBuilder.appendCodePoint(c);
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("product name", input));
      }
    }
    if (step == 2) {
      while (input.isCont() && Http.isTokenChar(c = input.head())) {
        Assume.nonNull(nameBuilder).appendCodePoint(c);
        input.step();
      }
      if (input.isCont() && c == '/') {
        input.step();
        step = 3;
      } else if (input.isReady()) {
        step = 5;
      }
    }
    if (step == 3) {
      if (input.isCont() && Http.isTokenChar(c = input.head())) {
        versionBuilder = new StringBuilder();
        versionBuilder.appendCodePoint(c);
        input.step();
        step = 4;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("product version", input));
      }
    }
    if (step == 4) {
      while (input.isCont() && Http.isTokenChar(c = input.head())) {
        Assume.nonNull(versionBuilder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        step = 5;
      }
    }
    do {
      if (step == 5) {
        if (input.isCont() && Http.isSpace(input.head())) {
          input.step();
          step = 6;
        } else if (input.isReady()) {
          final String name = Assume.nonNull(nameBuilder).toString();
          final String version = versionBuilder != null ? versionBuilder.toString() : null;
          return Parse.done(HttpProduct.of(name, version, comments));
        }
      }
      if (step == 6) {
        while (input.isCont() && Http.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == '(') {
          commentBuilder = new StringBuilder();
          level = 1;
          input.step();
          step = 7;
        } else if (input.isReady()) {
          step = 5;
          continue;
        }
      }
      if (step == 7) {
        while (input.isCont() && Http.isCommentChar(c = input.head())) {
          Assume.nonNull(commentBuilder).appendCodePoint(c);
          input.step();
        }
        if (input.isCont()) {
          if (c == '(') {
            Assume.nonNull(commentBuilder).append('(');
            level += 1;
            input.step();
            continue;
          } else if (c == ')') {
            level -= 1;
            if (level > 0) {
              Assume.nonNull(commentBuilder).append(')');
              input.step();
              continue;
            } else {
              comments = comments.appended(Assume.nonNull(commentBuilder).toString());
              commentBuilder = null;
              input.step();
              step = 5;
              continue;
            }
          } else if (c == '\\') {
            input.step();
            step = 8;
          } else {
            return Parse.error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 8) {
        if (input.isCont() && Http.isEscapeChar(c = input.head())) {
          Assume.nonNull(commentBuilder).appendCodePoint(c);
          input.step();
          step = 7;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("escape character", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseHttpProduct(nameBuilder, versionBuilder, commentBuilder,
                                comments, level, step);
  }

}

final class WriteHttpProduct extends Write<Object> {

  final String name;
  final @Nullable String version;
  final Iterator<String> comments;
  final @Nullable String comment;
  final int index;
  final int escape;
  final int level;
  final int step;

  WriteHttpProduct(String name, @Nullable String version,
                   Iterator<String> comments, @Nullable String comment,
                   int index, int level, int escape, int step) {
    this.name = name;
    this.version = version;
    this.comments = comments;
    this.comment = comment;
    this.index = index;
    this.level = level;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteHttpProduct.write(output, this.name, this.version,
                                  this.comments, this.comment, this.index,
                                  this.level, this.escape, this.step);
  }

  static Write<Object> write(Output<?> output, String name,
                             @Nullable String version,
                             Iterator<String> comments,
                             @Nullable String comment,
                             int index, int level, int escape, int step) {
    int c = 0;
    if (step == 1) {
      if (name.length() == 0) {
        return Write.error(new WriteException("blank product name"));
      }
      while (index < name.length() && output.isCont()) {
        c = name.codePointAt(index);
        if (Http.isTokenChar(c)) {
          output.write(c);
          index = name.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("invalid product name: " + name));
        }
      }
      if (index >= name.length()) {
        index = 0;
        if (version != null) {
          step = 2;
        } else {
          step = 4;
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
        return Write.error(new WriteException("blank product version"));
      }
      while (index < version.length() && output.isCont()) {
        c = version.codePointAt(index);
        if (Http.isTokenChar(c)) {
          output.write(c);
          index = version.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("invalid product version: " + version));
        }
      }
      if (index >= version.length()) {
        index = 0;
        step = 4;
      }
    }
    do {
      if (step == 4) {
        if (!comments.hasNext()) {
          return Write.done();
        } else if (output.isCont()) {
          output.write(' ');
          comment = comments.next();
          step = 5;
        }
      }
      if (step == 5 && output.isCont()) {
        output.write('(');
        level = 1;
        step = 6;
      }
      if (step == 6) {
        comment = Assume.nonNull(comment);
        while (index < comment.length() && level > 0 && output.isCont()) {
          c = comment.codePointAt(index);
          if (c == ')') {
            output.write(c);
            index = comment.offsetByCodePoints(index, 1);
            level -= 1;
          } else if (c == '(') {
            output.write(c);
            index = comment.offsetByCodePoints(index, 1);
            level += 1;
          } else if (Http.isCommentChar(c)) {
            output.write(c);
            index = comment.offsetByCodePoints(index, 1);
          } else if (Http.isVisibleChar(c)) {
            output.write('\\');
            index = comment.offsetByCodePoints(index, 1);
            escape = c;
            step = 7;
            break;
          } else {
            return Write.error(new WriteException("invalid comment: " + comment));
          }
        }
        if (index >= comment.length() && level == 1) {
          comment = null;
          index = 0;
          step = 8;
        } else if (index >= comment.length() || level == 0) {
          return Write.error(new WriteException("unbalanced parentheses: " + comment));
        }
      }
      if (step == 7 && output.isCont()) {
        output.write(escape);
        escape = 0;
        step = 6;
        continue;
      }
      if (step == 8 && output.isCont()) {
        output.write(')');
        level = 0;
        step = 4;
        continue;
      }
      break;
    } while (true);
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteHttpProduct(name, version, comments, comment,
                                index, level, escape, step);
  }

}
