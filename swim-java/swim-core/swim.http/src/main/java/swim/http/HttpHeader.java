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

import java.util.Map;
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
import swim.collections.StringTrieMap;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.WriteSource;
import swim.util.WriteString;

@Public
@Since("5.0")
public class HttpHeader implements Map.Entry<String, String>, Comparable<HttpHeader>, WriteSource, WriteString {

  protected final String name;

  protected final String value;

  protected HttpHeader(String name, String value) {
    this.name = name;
    this.value = value;
  }

  public final String name() {
    return this.name;
  }

  public final String value() {
    return this.value;
  }

  @Override
  public final String getKey() {
    return this.name;
  }

  @Override
  public final String getValue() {
    return this.value;
  }

  @Override
  public String setValue(String newValue) {
    throw new UnsupportedOperationException();
  }

  public HttpHeader withValue(String newValue) {
    return HttpHeader.of(this.name, newValue);
  }

  public Write<?> write(Output<?> output) {
    return WriteHttpHeader.write(output, this.name, this.value, 0, 1);
  }

  public Write<?> write() {
    return new WriteHttpHeader(this.name, this.value, 0, 1);
  }

  @Override
  public int compareTo(HttpHeader that) {
    int order = this.name.compareTo(that.name);
    if (order == 0) {
      order = this.value.compareTo(that.value);
    }
    return order;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpHeader that) {
      return this.name.equals(that.name) && this.value.equals(that.value);
    }
    return false;
  }

  @Override
  public int hashCode() {
    return this.name.hashCode() ^ this.value.hashCode();
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpHeader", "of")
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

  public static HttpHeader of(String name, String value) {
    final HttpHeaderType<?, ?> type = HttpHeader.registry().getHeaderType(name);
    if (type != null) {
      return type.of(name, value);
    }
    return new HttpHeader(name, value);
  }

  public static Parse<HttpHeader> parse(Input input, @Nullable HttpHeaderRegistry headerRegistry) {
    final StringTrieMap<HttpHeaderType<?, ?>> headerTypes = headerRegistry != null
                                                          ? headerRegistry.headerTypes()
                                                          : null;
    return ParseHttpHeader.parse(input, headerTypes, null, null, 1);
  }

  public static Parse<HttpHeader> parse(Input input) {
    return HttpHeader.parse(input, HttpHeader.registry());
  }

  public static Parse<HttpHeader> parse(@Nullable HttpHeaderRegistry headerRegistry) {
    final StringTrieMap<HttpHeaderType<?, ?>> headerTypes = headerRegistry != null
                                                          ? headerRegistry.headerTypes()
                                                          : null;
    return new ParseHttpHeader(headerTypes, null, null, 1);
  }

  public static Parse<HttpHeader> parse() {
    return HttpHeader.parse(HttpHeader.registry());
  }

  public static Parse<HttpHeader> parse(String string) {
    final StringInput input = new StringInput(string);
    return HttpHeader.parse(input).complete(input);
  }

  public static HttpHeaderRegistry registry() {
    return HttpHeaderRegistry.REGISTRY;
  }

}

final class ParseHttpHeader extends Parse<HttpHeader> {

  final @Nullable StringTrieMap<HttpHeaderType<?, ?>> nameTrie;
  final @Nullable StringBuilder nameBuilder;
  final @Nullable StringBuilder valueBuilder;
  final int step;

  ParseHttpHeader(@Nullable StringTrieMap<HttpHeaderType<?, ?>> nameTrie,
                  @Nullable StringBuilder nameBuilder,
                  @Nullable StringBuilder valueBuilder, int step) {
    this.nameTrie = nameTrie;
    this.nameBuilder = nameBuilder;
    this.valueBuilder = valueBuilder;
    this.step = step;
  }

  @Override
  public Parse<HttpHeader> consume(Input input) {
    return ParseHttpHeader.parse(input, this.nameTrie, this.nameBuilder,
                                 this.valueBuilder, this.step);
  }

  static Parse<HttpHeader> parse(Input input,
                                 @Nullable StringTrieMap<HttpHeaderType<?, ?>> nameTrie,
                                 @Nullable StringBuilder nameBuilder,
                                 @Nullable StringBuilder valueBuilder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && Http.isTokenChar(c = input.head())) {
        if (nameTrie != null) {
          final StringTrieMap<HttpHeaderType<?, ?>> subTrie =
              nameTrie.getBranch(nameTrie.normalized(c));
          if (subTrie != null) {
            nameTrie = subTrie;
          } else {
            nameBuilder = new StringBuilder();
            nameBuilder.appendCodePoint(c);
            nameTrie = null;
          }
        } else {
          nameBuilder = new StringBuilder();
          nameBuilder.appendCodePoint(c);
        }
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("header name", input));
      }
    }
    if (step == 2) {
      while (input.isCont() && Http.isTokenChar(c = input.head())) {
        if (nameTrie != null) {
          final StringTrieMap<HttpHeaderType<?, ?>> subTrie =
              nameTrie.getBranch(nameTrie.normalized(c));
          if (subTrie != null) {
            nameTrie = subTrie;
          } else {
            nameBuilder = new StringBuilder(nameTrie.prefix());
            nameBuilder.appendCodePoint(c);
            nameTrie = null;
          }
        } else {
          Assume.nonNull(nameBuilder).appendCodePoint(c);
        }
        input.step();
      }
      if (input.isCont()) {
        step = 3;
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.unexpected(input));
      }
    }
    if (step == 3) {
      if (input.isCont() && input.head() == ':') {
        input.step();
        step = 4;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected(':', input));
      }
    }
    do {
      if (step == 4) {
        while (input.isCont() && Http.isFieldChar(c = input.head())) {
          if (valueBuilder == null) {
            valueBuilder = new StringBuilder();
          }
          valueBuilder.appendCodePoint(c);
          input.step();
        }
        if (input.isCont() && Http.isSpace(c)) {
          input.step();
          step = 5;
        } else if (input.isReady()) {
          final HttpHeaderType<?, ?> type = nameTrie != null ? nameTrie.value() : null;
          final String value = valueBuilder != null ? valueBuilder.toString() : "";
          if (type != null) {
            return Parse.done(type.of(value));
          } else {
            final String name = nameTrie != null
                              ? nameTrie.prefix()
                              : Assume.nonNull(nameBuilder).toString();
            return Parse.done(new HttpHeader(name, value));
          }
        }
      }
      if (step == 5) {
        while (input.isCont() && Http.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && Http.isFieldChar(c)) {
          if (valueBuilder != null) {
            valueBuilder.appendCodePoint(' ');
          }
          step = 4;
          continue;
        } else if (input.isReady()) {
          step = 4;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseHttpHeader(nameTrie, nameBuilder, valueBuilder, step);
  }

}

final class WriteHttpHeader extends Write<Object> {

  final String name;
  final String value;
  final int index;
  final int step;

  WriteHttpHeader(String name, String value, int index, int step) {
    this.name = name;
    this.value = value;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteHttpHeader.write(output, this.name, this.value,
                                 this.index, this.step);
  }

  static Write<Object> write(Output<?> output, String name, String value,
                             int index, int step) {
    int c = 0;
    if (step == 1) {
      if (name.length() == 0) {
        return Write.error(new WriteException("blank header name"));
      }
      while (index < name.length() && output.isCont()) {
        c = name.codePointAt(index);
        if (Http.isTokenChar(c)) {
          output.write(c);
          index = name.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("invalid header name: " + name));
        }
      }
      if (index >= name.length()) {
        index = 0;
        step = 2;
      }
    }
    if (step == 2 && output.isCont()) {
      output.write(':');
      if (value.isEmpty()) {
        return Write.done();
      } else {
        step = 3;
      }
    }
    if (step == 3 && output.isCont()) {
      output.write(' ');
      step = 4;
    }
    if (step == 4) {
      while (index < value.length() && output.isCont()) {
        c = value.codePointAt(index);
        if (Http.isFieldChar(c) || Http.isSpace(c)) {
          output.write(c);
          index = value.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("invalid header value: " + value));
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
    return new WriteHttpHeader(name, value, index, step);
  }

}
