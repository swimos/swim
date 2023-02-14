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

package swim.json;

import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Write;
import swim.expr.Term;
import swim.expr.term.StringTerm;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class JsonTerms implements JsonProvider, ToSource {

  final int priority;

  private JsonTerms(int priority) {
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable JsonForm<?> resolveJsonForm(Type javaType) {
    if (javaType instanceof Class<?>) {
      final Class<?> javaClass = (Class<?>) javaType;
      if (StringTerm.class.isAssignableFrom(javaClass)) {
        return STRING_FORM;
      }
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonTerms", "provider");
    if (this.priority != BUILTIN_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final JsonTerms PROVIDER = new JsonTerms(BUILTIN_PRIORITY);

  public static JsonTerms provider(int priority) {
    if (priority == BUILTIN_PRIORITY) {
      return PROVIDER;
    } else {
      return new JsonTerms(priority);
    }
  }

  public static JsonTerms provider() {
    return PROVIDER;
  }

  private static final JsonTerms.StringForm STRING_FORM = new JsonTerms.StringForm();

  public static JsonStringForm<StringBuilder, StringTerm> stringForm() {
    return STRING_FORM;
  }

  static final class StringForm implements JsonStringForm<StringBuilder, StringTerm>, ToSource {

    @Override
    public StringBuilder stringBuilder() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public StringTerm buildString(StringBuilder builder) {
      return StringTerm.of(JsonJava.stringCache().put(builder.toString()));
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable StringTerm value, JsonWriter writer) {
      if (value != null) {
        return writer.writeString(output, value.stringValue());
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable StringTerm value) {
      return value != null ? value : Term.from(null);
    }

    @Override
    public @Nullable StringTerm fromTerm(Term term) {
      if (term instanceof StringTerm) {
        return (StringTerm) term;
      } else if (term.isValidString()) {
        return StringTerm.of(term.stringValue());
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonTerms", "stringForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

}
