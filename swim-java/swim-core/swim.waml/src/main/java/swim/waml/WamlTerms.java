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

package swim.waml;

import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.Write;
import swim.repr.Attrs;
import swim.repr.Repr;
import swim.term.Term;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class WamlTerms implements WamlProvider, WriteSource {

  final int priority;

  private WamlTerms(int priority) {
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable WamlFormat<?> resolveWamlFormat(Type type) throws WamlProviderException {
    if (type instanceof Class<?>) {
      final Class<?> classType = (Class<?>) type;
      if (classType == Term.class) {
        return WamlTerms.termFormat();
      }
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlTerms", "provider");
    if (this.priority != BUILTIN_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final WamlTerms PROVIDER = new WamlTerms(BUILTIN_PRIORITY);

  public static WamlTerms provider(int priority) {
    if (priority == BUILTIN_PRIORITY) {
      return PROVIDER;
    }
    return new WamlTerms(priority);
  }

  public static WamlTerms provider() {
    return PROVIDER;
  }

  public static WamlFormat<Term> termFormat() {
    return TermFormat.INSTANCE;
  }

  static final class TermFormat implements WamlFormat<Term>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "any";
    }

    @Override
    public WamlFormat<Term> withAttrs(@Nullable Object attrs) {
      if (attrs instanceof Attrs attributes) {
        if (attributes.containsKey("blob")) {
          return Assume.covariant(WamlReprs.blobFormat());
        }
      }
      return this;
    }

    @Override
    public @Nullable Object getAttrs(@Nullable Term value) {
      if (!(value instanceof Repr)) {
        return null;
      }
      return ((Repr) value).attrs();
    }

    @Override
    public WamlIdentifierParser<Term> identifierParser() throws WamlException {
      return Assume.covariant(WamlReprs.identifierFormat().identifierParser());
    }

    @Override
    public WamlNumberParser<Term> numberParser() throws WamlException {
      return Assume.covariant(WamlReprs.numberFormat().numberParser());
    }

    @Override
    public WamlStringParser<?, Term> stringParser() throws WamlException {
      return Assume.covariant(WamlReprs.stringFormat().stringParser());
    }

    @Override
    public WamlMarkupParser<?, ?, Term> markupParser() throws WamlException {
      return Assume.covariant(WamlReprs.markupFormat().markupParser());
    }

    @Override
    public WamlArrayParser<?, ?, Term> arrayParser() throws WamlException {
      return Assume.covariant(WamlReprs.arrayFormat().arrayParser());
    }

    @Override
    public WamlObjectParser<?, ?, Term> objectParser() throws WamlException {
      return Assume.covariant(WamlReprs.objectFormat().objectParser());
    }

    @Override
    public WamlTupleParser<?, ?, Term> tupleParser() throws WamlException {
      return Assume.covariant(WamlReprs.tupleFormat().tupleParser());
    }

    @Override
    public @Nullable Term initializer(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return Repr.unit().withAttrs((Attrs) attrs);
    }

    @Override
    public Parse<Term> parse(Input input, WamlParserOptions options) {
      return this.parseTerm(input, options);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object attrs,
                          @Nullable Term value, WamlWriterOptions options) {
      if (value == null) {
        return this.writeUnit(output, attrs, options);
      } else if (value instanceof Repr) {
        return WamlReprs.valueFormat().write(output, attrs, (Repr) value, options);
      }
      return this.writeTerm(output, value, options);
    }

    @Override
    public Write<?> writeBlock(Output<?> output, @Nullable Term value, WamlWriterOptions options) {
      if (value == null) {
        return Write.done();
      } else if (value instanceof Repr) {
        return WamlReprs.valueFormat().writeBlock(output, (Repr) value, options);
      }
      return this.writeTerm(output, value, options);
    }

    @Override
    public boolean isInline(@Nullable Term value) {
      if (!(value instanceof Repr)) {
        return false;
      }
      return WamlReprs.valueFormat().isInline((Repr) value);
    }

    @Override
    public Write<?> writeInline(Output<?> output, @Nullable Term value, WamlWriterOptions options) {
      if (value instanceof Repr) {
        return WamlReprs.valueFormat().writeInline(output, (Repr) value, options);
      }
      return Write.error(new WamlException("unsupported value: " + value));
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlTerms", "termFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final TermFormat INSTANCE = new TermFormat();

  }

}
