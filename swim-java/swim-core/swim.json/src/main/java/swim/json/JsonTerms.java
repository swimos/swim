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
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.Write;
import swim.repr.Repr;
import swim.term.Term;
import swim.util.Assume;
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
  public @Nullable JsonFormat<?> resolveJsonFormat(Type type) throws JsonProviderException {
    if (type instanceof Class<?>) {
      final Class<?> classType = (Class<?>) type;
      if (classType == Term.class) {
        return JsonTerms.termFormat();
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

  static final JsonTerms PROVIDER = new JsonTerms(BUILTIN_PRIORITY);

  public static JsonTerms provider(int priority) {
    if (priority == BUILTIN_PRIORITY) {
      return PROVIDER;
    }
    return new JsonTerms(priority);
  }

  public static JsonTerms provider() {
    return PROVIDER;
  }

  public static JsonFormat<Term> termFormat() {
    return TermFormat.INSTANCE;
  }

  static final class TermFormat implements JsonFormat<Term>, ToSource {

    @Override
    public @Nullable String typeName() {
      return "any";
    }

    @Override
    public JsonIdentifierParser<Term> identifierParser() throws JsonException {
      return Assume.covariant(JsonReprs.identifierFormat().identifierParser());
    }

    @Override
    public JsonNumberParser<Term> numberParser() throws JsonException {
      return Assume.covariant(JsonReprs.numberFormat().numberParser());
    }

    @Override
    public JsonStringParser<?, Term> stringParser() throws JsonException {
      return Assume.covariant(JsonReprs.stringFormat().stringParser());
    }

    @Override
    public JsonArrayParser<?, ?, Term> arrayParser() throws JsonException {
      return Assume.covariant(JsonReprs.arrayFormat().arrayParser());
    }

    @Override
    public JsonObjectParser<?, ?, Term> objectParser() throws JsonException {
      return Assume.covariant(JsonReprs.objectFormat().objectParser());
    }

    @Override
    public @Nullable Term initializer() {
      return Repr.unit();
    }

    @Override
    public Parse<Term> parse(Input input, JsonParserOptions options) {
      return this.parseTerm(input, options);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Term value, JsonWriterOptions options) {
      if (value == null) {
        return this.writeNull(output);
      } else if (value instanceof Repr) {
        return JsonReprs.valueFormat().write(output, (Repr) value, options);
      }
      return this.writeTerm(output, value, options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonTerms", "termFormat").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final TermFormat INSTANCE = new TermFormat();

  }

}
