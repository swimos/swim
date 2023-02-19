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

package swim.waml;

import java.lang.reflect.Type;
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.util.AbstractMap.SimpleImmutableEntry;
import java.util.Collections;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base64;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.ParseException;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.expr.ContextExpr;
import swim.expr.ExprParser;
import swim.expr.Term;
import swim.expr.selector.ChildExpr;
import swim.repr.ArrayRepr;
import swim.repr.Attrs;
import swim.repr.BlobRepr;
import swim.repr.BlobReprOutput;
import swim.repr.BooleanRepr;
import swim.repr.NumberRepr;
import swim.repr.ObjectRepr;
import swim.repr.Repr;
import swim.repr.StringRepr;
import swim.repr.TermRepr;
import swim.repr.TupleRepr;
import swim.repr.UndefinedRepr;
import swim.repr.UnitRepr;
import swim.util.CacheMap;
import swim.util.CacheSet;
import swim.util.LruCacheMap;
import swim.util.LruCacheSet;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class WamlReprs implements WamlProvider, ToSource {

  final int priority;

  private WamlReprs(int priority) {
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable WamlForm<?> resolveWamlForm(Type javaType) {
    if (javaType instanceof Class<?>) {
      final Class<?> javaClass = (Class<?>) javaType;
      if (UndefinedRepr.class.isAssignableFrom(javaClass)) {
        return UNDEFINED_FORM;
      } else if (UnitRepr.class.isAssignableFrom(javaClass)) {
        return UNIT_FORM;
      } else if (BooleanRepr.class.isAssignableFrom(javaClass)) {
        return BOOLEAN_FORM;
      } else if (NumberRepr.class.isAssignableFrom(javaClass)) {
        return NUMBER_FORM;
      } else if (StringRepr.class.isAssignableFrom(javaClass)) {
        return STRING_FORM;
      } else if (BlobRepr.class.isAssignableFrom(javaClass)) {
        return BLOB_FORM;
      } else if (TermRepr.class.isAssignableFrom(javaClass)) {
        return TERM_FORM;
      } else if (ArrayRepr.class.isAssignableFrom(javaClass)) {
        return ARRAY_FORM;
      } else if (ObjectRepr.class.isAssignableFrom(javaClass)) {
        return OBJECT_FORM;
      } else if (TupleRepr.class.isAssignableFrom(javaClass)) {
        return TUPLE_FORM;
      } else if (javaClass == Repr.class) {
        return REPR_FORM;
      }
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlReprs", "provider");
    if (this.priority != BUILTIN_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final WamlReprs PROVIDER = new WamlReprs(BUILTIN_PRIORITY);

  public static WamlReprs provider(int priority) {
    if (priority == BUILTIN_PRIORITY) {
      return PROVIDER;
    } else {
      return new WamlReprs(priority);
    }
  }

  public static WamlReprs provider() {
    return PROVIDER;
  }

  private static final WamlReprs.UndefinedForm UNDEFINED_FORM = new WamlReprs.UndefinedForm(Attrs.empty());

  public static WamlUndefinedForm<UndefinedRepr> undefinedForm() {
    return UNDEFINED_FORM;
  }

  public static WamlUndefinedForm<UndefinedRepr> undefinedForm(Attrs attrs) {
    if (attrs.isEmpty()) {
      return UNDEFINED_FORM;
    } else {
      return new WamlReprs.UndefinedForm(attrs);
    }
  }

  private static final WamlReprs.UnitForm UNIT_FORM = new WamlReprs.UnitForm(Attrs.empty());

  public static WamlUnitForm<UnitRepr> unitForm() {
    return UNIT_FORM;
  }

  public static WamlUnitForm<UnitRepr> unitForm(Attrs attrs) {
    if (attrs.isEmpty()) {
      return UNIT_FORM;
    } else {
      return new WamlReprs.UnitForm(attrs);
    }
  }

  private static final WamlReprs.BooleanForm BOOLEAN_FORM = new WamlReprs.BooleanForm(Attrs.empty());

  public static WamlIdentifierForm<BooleanRepr> booleanForm() {
    return BOOLEAN_FORM;
  }

  public static WamlIdentifierForm<BooleanRepr> booleanForm(Attrs attrs) {
    if (attrs.isEmpty()) {
      return BOOLEAN_FORM;
    } else {
      return new WamlReprs.BooleanForm(attrs);
    }
  }

  private static final WamlReprs.NumberForm NUMBER_FORM = new WamlReprs.NumberForm(Attrs.empty());

  public static WamlNumberForm<NumberRepr> numberForm() {
    return NUMBER_FORM;
  }

  public static WamlNumberForm<NumberRepr> numberForm(Attrs attrs) {
    if (attrs.isEmpty()) {
      return NUMBER_FORM;
    } else {
      return new WamlReprs.NumberForm(attrs);
    }
  }

  private static final WamlReprs.IdentifierForm IDENTIFIER_FORM = new WamlReprs.IdentifierForm(Attrs.empty());

  public static WamlIdentifierForm<Repr> identifierForm() {
    return IDENTIFIER_FORM;
  }

  public static WamlIdentifierForm<Repr> identifierForm(Attrs attrs) {
    if (attrs.isEmpty()) {
      return IDENTIFIER_FORM;
    } else {
      return new WamlReprs.IdentifierForm(attrs);
    }
  }

  private static final WamlReprs.StringForm STRING_FORM = new WamlReprs.StringForm(Attrs.empty());

  public static WamlStringForm<StringBuilder, StringRepr> stringForm() {
    return STRING_FORM;
  }

  public static WamlStringForm<StringBuilder, StringRepr> stringForm(Attrs attrs) {
    if (attrs.isEmpty()) {
      return STRING_FORM;
    } else {
      return new WamlReprs.StringForm(attrs);
    }
  }

  private static final WamlReprs.BlobForm BLOB_FORM = new WamlReprs.BlobForm(Attrs.empty());

  public static WamlStringForm<?, BlobRepr> blobForm() {
    return BLOB_FORM;
  }

  public static WamlStringForm<?, BlobRepr> blobForm(Attrs attrs) {
    if (attrs.isEmpty()) {
      return BLOB_FORM;
    } else {
      return new WamlReprs.BlobForm(attrs);
    }
  }

  private static final WamlReprs.TermForm TERM_FORM = new WamlReprs.TermForm(Attrs.empty());

  public static WamlForm<Repr> termForm() {
    return TERM_FORM;
  }

  public static WamlForm<Repr> termForm(Attrs attrs) {
    if (attrs.isEmpty()) {
      return TERM_FORM;
    } else {
      return new WamlReprs.TermForm(attrs);
    }
  }

  private static final WamlReprs.ArrayForm ARRAY_FORM = new WamlReprs.ArrayForm(Attrs.empty());

  public static WamlArrayForm<Repr, ArrayRepr, ArrayRepr> arrayForm() {
    return ARRAY_FORM;
  }

  public static WamlArrayForm<Repr, ArrayRepr, ArrayRepr> arrayForm(Attrs attrs) {
    if (attrs.isEmpty()) {
      return ARRAY_FORM;
    } else {
      return new WamlReprs.ArrayForm(attrs);
    }
  }

  private static final WamlReprs.MarkupForm MARKUP_FORM = new WamlReprs.MarkupForm(Attrs.empty());

  public static WamlMarkupForm<Repr, ArrayRepr, ArrayRepr> markupForm() {
    return MARKUP_FORM;
  }

  public static WamlMarkupForm<Repr, ArrayRepr, ArrayRepr> markupForm(Attrs attrs) {
    if (attrs.isEmpty()) {
      return MARKUP_FORM;
    } else {
      return new WamlReprs.MarkupForm(attrs);
    }
  }

  private static final WamlReprs.KeyForm KEY_FORM = new WamlReprs.KeyForm();

  public static WamlForm<String> keyForm() {
    return KEY_FORM;
  }

  private static final WamlReprs.ObjectForm OBJECT_FORM = new WamlReprs.ObjectForm(Attrs.empty());

  public static WamlObjectForm<String, Repr, ObjectRepr, ObjectRepr> objectForm() {
    return OBJECT_FORM;
  }

  public static WamlObjectForm<String, Repr, ObjectRepr, ObjectRepr> objectForm(Attrs attrs) {
    if (attrs.isEmpty()) {
      return OBJECT_FORM;
    } else {
      return new WamlReprs.ObjectForm(attrs);
    }
  }

  private static final WamlReprs.TupleForm TUPLE_FORM = new WamlReprs.TupleForm(Attrs.empty());

  public static WamlTupleForm<String, Repr, TupleRepr, Repr> tupleForm() {
    return TUPLE_FORM;
  }

  public static WamlTupleForm<String, Repr, TupleRepr, Repr> tupleForm(Attrs attrs) {
    if (attrs.isEmpty()) {
      return TUPLE_FORM;
    } else {
      return new WamlReprs.TupleForm(attrs);
    }
  }

  private static final WamlReprs.BlobAttrForm BLOB_ATTR_FORM = new WamlReprs.BlobAttrForm(Attrs.empty());

  public static WamlAttrForm<Repr, BlobRepr> blobAttrForm() {
    return BLOB_ATTR_FORM;
  }

  public static WamlAttrForm<Repr, BlobRepr> blobAttrForm(Attrs attrs) {
    if (attrs.isEmpty()) {
      return BLOB_ATTR_FORM;
    } else {
      return new WamlReprs.BlobAttrForm(attrs);
    }
  }

  private static final WamlReprs.ReprForm REPR_FORM = new WamlReprs.ReprForm(Attrs.empty());

  public static WamlForm<Repr> reprForm() {
    return REPR_FORM;
  }

  public static WamlForm<Repr> reprForm(Attrs attrs) {
    if (attrs.isEmpty()) {
      return REPR_FORM;
    } else {
      return new WamlReprs.ReprForm(attrs);
    }
  }

  private static final ThreadLocal<CacheMap<String, StringRepr>> STRING_CACHE = new ThreadLocal<CacheMap<String, StringRepr>>();

  public static CacheMap<String, StringRepr> stringCache() {
    CacheMap<String, StringRepr> stringCache = STRING_CACHE.get();
    if (stringCache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.waml.string.repr.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 512;
      }
      stringCache = new LruCacheMap<String, StringRepr>(cacheSize);
      STRING_CACHE.set(stringCache);
    }
    return stringCache;
  }

  private static final ThreadLocal<CacheSet<String>> KEY_CACHE = new ThreadLocal<CacheSet<String>>();

  public static CacheSet<String> keyCache() {
    CacheSet<String> keyCache = KEY_CACHE.get();
    if (keyCache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.waml.key.repr.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 512;
      }
      keyCache = new LruCacheSet<String>(cacheSize);
      KEY_CACHE.set(keyCache);
    }
    return keyCache;
  }

  static final class UndefinedForm extends WamlReprForm<UndefinedRepr> implements WamlUndefinedForm<UndefinedRepr>, ToSource {

    UndefinedForm(Attrs attrs) {
      super(attrs);
    }

    @Override
    public WamlForm<UndefinedRepr> withAttrs(Attrs attrs) {
      return WamlReprs.undefinedForm(attrs);
    }

    @Override
    public UndefinedRepr undefinedValue() {
      return UndefinedRepr.undefined().withAttrs(this.attrs);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable UndefinedRepr value, WamlWriter writer) {
      if (value != null) {
        return writer.writeIdentifier(output, this, "undefined", value.attrs().iterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      }
    }

    @Override
    public Write<?> writeBlock(Output<?> output, @Nullable UndefinedRepr value, WamlWriter writer) {
      if (value == null || value.attrs().isEmpty()) {
        return Write.done();
      } else {
        return writer.writeIdentifier(output, this, "undefined", value.attrs().iterator());
      }
    }

    @Override
    public Term intoTerm(@Nullable UndefinedRepr value) {
      return value != null ? value : Repr.unit();
    }

    @Override
    public @Nullable UndefinedRepr fromTerm(Term term) {
      if (term instanceof UndefinedRepr) {
        return (UndefinedRepr) term;
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "undefinedForm");
      if (!this.attrs.isEmpty()) {
        notation.appendArgument(this.attrs);
      }
      notation.endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class UnitForm extends WamlReprForm<UnitRepr> implements WamlUnitForm<UnitRepr>, ToSource {

    UnitForm(Attrs attrs) {
      super(attrs);
    }

    @Override
    public WamlForm<UnitRepr> withAttrs(Attrs attrs) {
      return WamlReprs.unitForm(attrs);
    }

    @Override
    public UnitRepr unitValue() {
      return UnitRepr.unit().withAttrs(this.attrs);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable UnitRepr value, WamlWriter writer) {
      if (value != null) {
        return writer.writeUnit(output, this, value.attrs().iterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      }
    }

    @Override
    public boolean isInline(@Nullable UnitRepr value) {
      return value == null || value.attrs().size() == 1;
    }

    @Override
    public Write<?> writeInline(Output<?> output, @Nullable UnitRepr value, WamlWriter writer) {
      Objects.requireNonNull(value);
      return writer.writeUnit(output, this, value.attrs().iterator());
    }

    @Override
    public Term intoTerm(@Nullable UnitRepr value) {
      return value != null ? value : Repr.unit();
    }

    @Override
    public @Nullable UnitRepr fromTerm(Term term) {
      if (term instanceof UnitRepr) {
        return (UnitRepr) term;
      } else if (term.isValidObject() && term.objectValue() == null) {
        return UnitRepr.unit();
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "unitForm");
      if (!this.attrs.isEmpty()) {
        notation.appendArgument(this.attrs);
      }
      notation.endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class BooleanForm extends WamlReprForm<BooleanRepr> implements WamlIdentifierForm<BooleanRepr>, ToSource {

    BooleanForm(Attrs attrs) {
      super(attrs);
    }

    @Override
    public WamlForm<BooleanRepr> withAttrs(Attrs attrs) {
      return WamlReprs.booleanForm(attrs);
    }

    @Override
    public BooleanRepr identifierValue(String value, ExprParser parser) {
      if ("true".equals(value)) {
        return BooleanRepr.of(true).withAttrs(this.attrs);
      } else if ("false".equals(value)) {
        return BooleanRepr.of(false).withAttrs(this.attrs);
      } else {
        throw new ParseException("Unexpected identifier: " + value);
      }
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable BooleanRepr value, WamlWriter writer) {
      if (value != null) {
        return writer.writeIdentifier(output, this, value.stringValue(), value.attrs().iterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      }
    }

    @Override
    public Term intoTerm(@Nullable BooleanRepr value) {
      return value != null ? value : Repr.unit();
    }

    @Override
    public @Nullable BooleanRepr fromTerm(Term term) {
      if (term instanceof BooleanRepr) {
        return (BooleanRepr) term;
      } else if (term.isValidBoolean()) {
        return BooleanRepr.of(term.booleanValue());
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "booleanForm");
      if (!this.attrs.isEmpty()) {
        notation.appendArgument(this.attrs);
      }
      notation.endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class NumberForm extends WamlReprForm<NumberRepr> implements WamlNumberForm<NumberRepr>, ToSource {

    NumberForm(Attrs attrs) {
      super(attrs);
    }

    @Override
    public WamlForm<NumberRepr> withAttrs(Attrs attrs) {
      return WamlReprs.numberForm(attrs);
    }

    @Override
    public NumberRepr integerValue(long value) {
      if (value == (long) (int) value) {
        return NumberRepr.of((int) value).withAttrs(this.attrs);
      } else {
        return NumberRepr.of(value).withAttrs(this.attrs);
      }
    }

    @Override
    public NumberRepr hexadecimalValue(long value, int digits) {
      if (value == (long) (int) value && digits <= 8) {
        return NumberRepr.of((int) value).withAttrs(this.attrs);
      } else {
        return NumberRepr.of(value).withAttrs(this.attrs);
      }
    }

    @Override
    public NumberRepr bigIntegerValue(String value) {
      return NumberRepr.of(new BigInteger(value)).withAttrs(this.attrs);
    }

    @Override
    public NumberRepr decimalValue(String value) {
      return NumberRepr.parse(value).withAttrs(this.attrs);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable NumberRepr value, WamlWriter writer) {
      if (value == null) {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      } else if (value.isValidInt()) {
        return writer.writeNumber(output, this, value.intValue(), value.attrs().iterator());
      } else if (value.isValidLong()) {
        return writer.writeNumber(output, this, value.longValue(), value.attrs().iterator());
      } else if (value.isValidFloat()) {
        return writer.writeNumber(output, this, value.floatValue(), value.attrs().iterator());
      } else if (value.isValidDouble()) {
        return writer.writeNumber(output, this, value.doubleValue(), value.attrs().iterator());
      } else if (value.isValidBigInteger()) {
        return writer.writeNumber(output, this, value.bigIntegerValue(), value.attrs().iterator());
      } else {
        return Write.error(new WriteException("Unsupported value: " + value));
      }
    }

    @Override
    public Term intoTerm(@Nullable NumberRepr value) {
      return value != null ? value : Repr.unit();
    }

    @Override
    public @Nullable NumberRepr fromTerm(Term term) {
      if (term instanceof NumberRepr) {
        return (NumberRepr) term;
      } else if (term.isValidNumber()) {
        return NumberRepr.of(term.numberValue());
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "numberForm");
      if (!this.attrs.isEmpty()) {
        notation.appendArgument(this.attrs);
      }
      notation.endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class IdentifierForm extends WamlReprForm<Repr> implements WamlIdentifierForm<Repr>, ToSource {

    IdentifierForm(Attrs attrs) {
      super(attrs);
    }

    @Override
    public WamlForm<Repr> withAttrs(Attrs attrs) {
      return WamlReprs.identifierForm(attrs);
    }

    @Override
    public Repr identifierValue(String value, ExprParser parser) {
      switch (value) {
        case "undefined":
          return UndefinedRepr.undefined().withAttrs(this.attrs);
        case "null":
          return UnitRepr.unit().withAttrs(this.attrs);
        case "false":
          return BooleanRepr.of(false).withAttrs(this.attrs);
        case "true":
          return BooleanRepr.of(true).withAttrs(this.attrs);
        default:
          if (parser instanceof WamlParser && ((WamlParser) parser).options().exprsEnabled()) {
            return TermRepr.of(new ChildExpr(ContextExpr.of(), StringRepr.of(value))).withAttrs(this.attrs);
          } else {
            return StringRepr.of(value).withAttrs(this.attrs);
          }
      }
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Repr value, WamlWriter writer) {
      if (value == null) {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      } else if (value instanceof UndefinedRepr) {
        return writer.writeIdentifier(output, this, "undefined", value.attrs().iterator());
      } else if (value instanceof UnitRepr) {
        return writer.writeIdentifier(output, this, "null", value.attrs().iterator());
      } else if (value instanceof BooleanRepr) {
        return writer.writeIdentifier(output, this, value.booleanValue() ? "true" : "false", value.attrs().iterator());
      } else {
        return writer.writeIdentifier(output, this, value.stringValue(), value.attrs().iterator());
      }
    }

    @Override
    public Term intoTerm(@Nullable Repr value) {
      if (value == null) {
        return Repr.unit();
      } else if (value instanceof TermRepr && value.attrs().isEmpty()) {
        return ((TermRepr) value).term();
      } else {
        return value;
      }
    }

    @Override
    public @Nullable Repr fromTerm(Term term) {
      if (term instanceof BooleanRepr) {
        return (BooleanRepr) term;
      } else if (term.isValidString()) {
        final String string = term.stringValue();
        if (Waml.parser().isIdentifier(string)) {
          if (term instanceof StringRepr) {
            return (StringRepr) term;
          } else {
            return StringRepr.of(string);
          }
        }
      } else {
        if (term instanceof TermRepr) {
          term = ((TermRepr) term).term();
        }
        if (term instanceof ChildExpr) {
          final ChildExpr childExpr = (ChildExpr) term;
          final Term scope = childExpr.scope();
          final Term key = childExpr.key();
          if (ContextExpr.of().equals(scope) && key.isValidString()) {
            return StringRepr.of(key.stringValue());
          }
        }
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "identifierForm");
      if (!this.attrs.isEmpty()) {
        notation.appendArgument(this.attrs);
      }
      notation.endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class StringForm extends WamlReprForm<StringRepr> implements WamlStringForm<StringBuilder, StringRepr>, ToSource {

    StringForm(Attrs attrs) {
      super(attrs);
    }

    @Override
    public WamlForm<StringRepr> withAttrs(Attrs attrs) {
      return WamlReprs.stringForm(attrs);
    }

    @Override
    public StringBuilder stringBuilder() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public StringRepr buildString(StringBuilder builder) {
      final CacheMap<String, StringRepr> stringCache = WamlReprs.stringCache();
      final String value = builder.toString();
      StringRepr stringValue = stringCache.get(value);
      if (stringValue == null) {
        stringValue = stringCache.put(value, StringRepr.of(value));
      }
      return stringValue.withAttrs(this.attrs);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable StringRepr value, WamlWriter writer) {
      if (value != null) {
        return writer.writeString(output, this, value.stringValue(), value.attrs().iterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      }
    }

    @Override
    public Term intoTerm(@Nullable StringRepr value) {
      return value != null ? value : Repr.unit();
    }

    @Override
    public @Nullable StringRepr fromTerm(Term term) {
      if (term instanceof StringRepr) {
        return (StringRepr) term;
      } else if (term.isValidString()) {
        return StringRepr.of(term.stringValue());
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "stringForm");
      if (!this.attrs.isEmpty()) {
        notation.appendArgument(this.attrs);
      }
      notation.endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class BlobForm extends WamlReprForm<BlobRepr> implements WamlStringForm<Output<BlobRepr>, BlobRepr>, ToSource {

    BlobForm(Attrs attrs) {
      super(attrs);
    }

    @Override
    public WamlForm<BlobRepr> withAttrs(Attrs attrs) {
      return WamlReprs.blobForm(attrs);
    }

    @Override
    public Output<BlobRepr> stringBuilder() {
      return Base64.standard().decodedOutput(new BlobReprOutput(BlobRepr.of().withAttrs(this.attrs)));
    }

    @Override
    public Output<BlobRepr> appendCodePoint(Output<BlobRepr> builder, int c) {
      return builder.write(c);
    }

    @Override
    public @Nullable BlobRepr buildString(Output<BlobRepr> builder) {
      try {
        return builder.get();
      } catch (IllegalStateException cause) {
        throw new ParseException(cause.getMessage(), cause);
      }
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable BlobRepr value, WamlWriter writer) {
      if (value != null) {
        return writer.writeString(output, this, value.toBase64(), new WamlReprs.BlobForm.AttrIterator(value.attrs().iterator()));
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      }
    }

    @Override
    public Term intoTerm(@Nullable BlobRepr value) {
      return value != null ? value : Repr.unit();
    }

    @Override
    public @Nullable BlobRepr fromTerm(Term term) {
      if (term instanceof BlobRepr) {
        return (BlobRepr) term;
      } else if (term.isValidObject()) {
        final Object object = term.objectValue();
        if (object instanceof ByteBuffer) {
          return BlobRepr.from((ByteBuffer) object);
        } else if (object instanceof byte[]) {
          return BlobRepr.wrap((byte[]) object);
        }
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "blobForm");
      if (!this.attrs.isEmpty()) {
        notation.appendArgument(this.attrs);
      }
      notation.endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final class AttrIterator implements Iterator<Map.Entry<String, Repr>> {

      @Nullable Iterator<Map.Entry<String, Repr>> attrs;

      AttrIterator(@Nullable Iterator<Map.Entry<String, Repr>> attrs) {
        this.attrs = attrs;
      }

      @Override
      public boolean hasNext() {
        return this.attrs != null;
      }

      @Override
      public Map.Entry<String, Repr> next() {
        if (this.attrs != null) {
          if (this.attrs.hasNext()) {
            return this.attrs.next();
          } else {
            this.attrs = null;
            return new SimpleImmutableEntry<String, Repr>("blob", Repr.unit());
          }
        } else {
          throw new NoSuchElementException();
        }
      }

    }

  }

  static final class TermForm extends WamlReprForm<Repr> implements ToSource {

    TermForm(Attrs attrs) {
      super(attrs);
    }

    @Override
    public WamlForm<Repr> withAttrs(Attrs attrs) {
      return WamlReprs.termForm(attrs);
    }

    @Override
    public Parse<Repr> parse(Input input, WamlParser parser) {
      return parser.parseExpr(input, this);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Repr value, WamlWriter writer) {
      if (value == null) {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      } else if (value instanceof TermRepr) {
        return writer.writeTerm(output, this, ((TermRepr) value).term(), value.attrs().iterator());
      } else {
        return WamlReprs.reprForm().write(output, value, writer);
      }
    }

    @Override
    public Write<?> writeBlock(Output<?> output, @Nullable Repr value, WamlWriter writer) {
      if (value == null) {
        return Write.done();
      } else if (value instanceof TermRepr) {
        return writer.writeTerm(output, this, ((TermRepr) value).term(), value.attrs().iterator());
      } else {
        return WamlReprs.reprForm().writeBlock(output, value, writer);
      }
    }

    @Override
    public Term intoTerm(@Nullable Repr value) {
      if (value == null) {
        return Repr.unit();
      } else if (value instanceof TermRepr && value.attrs().isEmpty()) {
        return ((TermRepr) value).term();
      } else {
        return value;
      }
    }

    @Override
    public @Nullable Repr fromTerm(Term term) {
      if (term instanceof Repr) {
        return (Repr) term;
      } else {
        return TermRepr.of(term);
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "termForm");
      if (!this.attrs.isEmpty()) {
        notation.appendArgument(this.attrs);
      }
      notation.endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class ArrayForm extends WamlReprForm<ArrayRepr> implements WamlArrayForm<Repr, ArrayRepr, ArrayRepr>, WamlMarkupForm<Repr, ArrayRepr, ArrayRepr>, ToSource {

    ArrayForm(Attrs attrs) {
      super(attrs);
    }

    @Override
    public WamlForm<ArrayRepr> withAttrs(Attrs attrs) {
      return WamlReprs.arrayForm(attrs);
    }

    @Override
    public WamlForm<Repr> elementForm() {
      return WamlReprs.reprForm();
    }

    @Override
    public ArrayRepr arrayBuilder() {
      return ArrayRepr.of().withAttrs(this.attrs);
    }

    @Override
    public ArrayRepr appendElement(ArrayRepr builder, @Nullable Repr element) {
      Objects.requireNonNull(element);
      builder.add(element);
      return builder;
    }

    @Override
    public ArrayRepr buildArray(ArrayRepr builder) {
      return builder;
    }

    @Override
    public WamlForm<Repr> nodeForm() {
      return WamlReprs.reprForm();
    }

    @Override
    public @Nullable String asText(@Nullable Repr node) {
      if (node instanceof StringRepr) {
        return ((StringRepr) node).stringValue();
      } else {
        return null;
      }
    }

    @Override
    public ArrayRepr markupBuilder() {
      return ArrayRepr.of().withAttrs(this.attrs);
    }

    @Override
    public ArrayRepr appendNode(ArrayRepr builder, @Nullable Repr node) {
      Objects.requireNonNull(node);
      builder.add(node);
      return builder;
    }

    @Override
    public ArrayRepr appendText(ArrayRepr builder, String text) {
      builder.add(StringRepr.of(text));
      return builder;
    }

    @Override
    public ArrayRepr buildMarkup(ArrayRepr builder) {
      return builder;
    }

    @Override
    public Parse<ArrayRepr> parse(Input input, WamlParser parser) {
      return parser.parseExpr(input, this);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable ArrayRepr value, WamlWriter writer) {
      if (value == null) {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      } else if (value.isMarkup()) {
        return writer.writeMarkup(output, this, value.iterator(), value.attrs().iterator());
      } else {
        return writer.writeArray(output, this, value.iterator(), value.attrs().iterator());
      }
    }

    @Override
    public boolean isInline(@Nullable ArrayRepr value) {
      return value != null && value.isMarkup() && value.attrs().size() <= 1;
    }

    @Override
    public Write<?> writeInline(Output<?> output, @Nullable ArrayRepr value, WamlWriter writer) {
      Objects.requireNonNull(value);
      return writer.writeInlineMarkup(output, this, value.iterator(), value.attrs().iterator());
    }

    @Override
    public Term intoTerm(@Nullable ArrayRepr value) {
      return value != null ? value : Repr.unit();
    }

    @Override
    public @Nullable ArrayRepr fromTerm(Term term) {
      if (term instanceof ArrayRepr) {
        return (ArrayRepr) term;
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "arrayForm");
      if (!this.attrs.isEmpty()) {
        notation.appendArgument(this.attrs);
      }
      notation.endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class MarkupForm extends WamlReprForm<ArrayRepr> implements WamlMarkupForm<Repr, ArrayRepr, ArrayRepr>, ToSource {

    MarkupForm(Attrs attrs) {
      super(attrs);
    }

    @Override
    public WamlForm<ArrayRepr> withAttrs(Attrs attrs) {
      return WamlReprs.markupForm(attrs);
    }

    @Override
    public WamlForm<Repr> nodeForm() {
      return WamlReprs.reprForm();
    }

    @Override
    public @Nullable String asText(@Nullable Repr node) {
      if (node instanceof StringRepr) {
        return ((StringRepr) node).stringValue();
      } else {
        return null;
      }
    }

    @Override
    public ArrayRepr markupBuilder() {
      return ArrayRepr.of().withAttrs(this.attrs);
    }

    @Override
    public ArrayRepr appendNode(ArrayRepr builder, @Nullable Repr node) {
      Objects.requireNonNull(node);
      builder.add(node);
      return builder;
    }

    @Override
    public ArrayRepr appendText(ArrayRepr builder, String text) {
      builder.add(StringRepr.of(text));
      return builder;
    }

    @Override
    public ArrayRepr buildMarkup(ArrayRepr builder) {
      return builder;
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable ArrayRepr value, WamlWriter writer) {
      if (value != null) {
        return writer.writeMarkup(output, this, value.iterator(), value.attrs().iterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      }
    }

    @Override
    public boolean isInline(@Nullable ArrayRepr value) {
      return value != null && value.isMarkup() && value.attrs().size() <= 1;
    }

    @Override
    public Write<?> writeInline(Output<?> output, @Nullable ArrayRepr value, WamlWriter writer) {
      Objects.requireNonNull(value);
      return writer.writeInlineMarkup(output, this, value.iterator(), value.attrs().iterator());
    }

    @Override
    public Term intoTerm(@Nullable ArrayRepr value) {
      return value != null ? value : Repr.unit();
    }

    @Override
    public @Nullable ArrayRepr fromTerm(Term term) {
      if (term instanceof ArrayRepr) {
        return (ArrayRepr) term;
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "markupForm");
      if (!this.attrs.isEmpty()) {
        notation.appendArgument(this.attrs);
      }
      notation.endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class KeyForm implements WamlIdentifierForm<String>, WamlStringForm<StringBuilder, String>, ToSource {

    @Override
    public String identifierValue(String value, ExprParser parser) {
      return WamlReprs.keyCache().put(value);
    }

    @Override
    public StringBuilder stringBuilder() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public String buildString(StringBuilder builder) {
      return WamlReprs.keyCache().put(builder.toString());
    }

    @Override
    public Parse<String> parse(Input input, WamlParser parser) {
      return parser.parseValue(input, this);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable String value, WamlWriter writer) {
      if (value == null) {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      } else if (writer.isIdentifier(value) && !writer.isKeyword(value)) {
        return writer.writeIdentifier(output, this, value, Collections.emptyIterator());
      } else {
        return writer.writeString(output, this, value, Collections.emptyIterator());
      }
    }

    @Override
    public Term intoTerm(@Nullable String value) {
      return value != null ? StringRepr.of(value) : Repr.unit();
    }

    @Override
    public @Nullable String fromTerm(Term term) {
      if (term.isValidString()) {
        return term.stringValue();
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "keyForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class ObjectForm extends WamlReprForm<ObjectRepr> implements WamlFieldForm<String, Repr, ObjectRepr>, WamlObjectForm<String, Repr, ObjectRepr, ObjectRepr>, ToSource {

    ObjectForm(Attrs attrs) {
      super(attrs);
    }

    @Override
    public WamlForm<ObjectRepr> withAttrs(Attrs attrs) {
      return WamlReprs.objectForm(attrs);
    }

    @Override
    public WamlForm<String> keyForm() {
      return WamlReprs.keyForm();
    }

    @Override
    public WamlForm<Repr> valueForm() {
      return WamlReprs.reprForm();
    }

    @Override
    public WamlFieldForm<String, Repr, ObjectRepr> getFieldForm(String key) {
      return this;
    }

    @Override
    public ObjectRepr objectBuilder() {
      return ObjectRepr.of().withAttrs(this.attrs);
    }

    @Override
    public ObjectRepr updateField(ObjectRepr builder, String key, @Nullable Repr value) {
      Objects.requireNonNull(value, "value");
      builder.put(key, value);
      return builder;
    }

    @Override
    public ObjectRepr buildObject(ObjectRepr builder) {
      return builder;
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable ObjectRepr value, WamlWriter writer) {
      if (value != null) {
        return writer.writeObject(output, this, value.iterator(), value.attrs().iterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      }
    }

    @Override
    public Term intoTerm(@Nullable ObjectRepr value) {
      return value != null ? value : Repr.unit();
    }

    @Override
    public @Nullable ObjectRepr fromTerm(Term term) {
      if (term instanceof ObjectRepr) {
        return (ObjectRepr) term;
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "objectForm");
      if (!this.attrs.isEmpty()) {
        notation.appendArgument(this.attrs);
      }
      notation.endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class TupleForm extends WamlReprForm<Repr> implements WamlTupleForm<String, Repr, TupleRepr, Repr>, ToSource {

    TupleForm(Attrs attrs) {
      super(attrs);
    }

    @Override
    public WamlForm<Repr> withAttrs(Attrs attrs) {
      return WamlReprs.tupleForm(attrs);
    }

    @Override
    public WamlForm<String> labelForm() {
      return WamlReprs.keyForm();
    }

    @Override
    public WamlForm<Repr> paramForm() {
      return WamlReprs.reprForm();
    }

    @Override
    public Repr emptyTuple() {
      return Repr.unit().withAttrs(this.attrs);
    }

    @Override
    public Repr unaryTuple(@Nullable Repr param) {
      Objects.requireNonNull(param);
      if (this.attrs.isEmpty()) {
        return param;
      } else if (param.attrs().isEmpty()) {
        return param.withAttrs(this.attrs);
      } else {
        final Attrs attrs = this.attrs.asMutable();
        attrs.putAll(param.attrs());
        return param.withAttrs(attrs);
      }
    }

    @Override
    public TupleRepr tupleBuilder() {
      return TupleRepr.of().withAttrs(this.attrs);
    }

    @Override
    public TupleRepr appendParam(TupleRepr builder, @Nullable Repr param) {
      Objects.requireNonNull(param);
      builder.add(param);
      return builder;
    }

    @Override
    public TupleRepr appendParam(TupleRepr builder, @Nullable Repr label, @Nullable Repr param) {
      Objects.requireNonNull(label, "label");
      Objects.requireNonNull(param, "param");
      String key = null;
      if (label.isValidString()) {
        key = label.stringValue();
      } else if (label instanceof TermRepr) {
        final Term term = ((TermRepr) label).term();
        if (term instanceof ChildExpr && ((ChildExpr) term).scope() instanceof ContextExpr) {
          final Term childKey = ((ChildExpr) term).key();
          if (childKey.isValidString()) {
            key = childKey.stringValue();
          }
        }
      }
      if (key != null) {
        builder.put(key, param);
      } else {
        builder.add(param);
      }
      return builder;
    }

    @Override
    public Repr buildTuple(TupleRepr builder) {
      return builder;
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Repr value, WamlWriter writer) {
      if (value != null) {
        return writer.writeTuple(output, this, value, value.attrs().iterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      }
    }

    @Override
    public Write<?> writeBlock(Output<?> output, @Nullable Repr value, WamlWriter writer) {
      if (value == null) {
        return Write.done();
      } else if (value instanceof TupleRepr) {
        if (((TupleRepr) value).attrs().isEmpty()) {
          return writer.writeBlock(output, this, ((TupleRepr) value).iterator());
        } else {
          return writer.writeTuple(output, this, value, value.attrs().iterator());
        }
      } else {
        return WamlReprs.reprForm().writeBlock(output, value, writer);
      }
    }

    @Override
    public Term intoTerm(@Nullable Repr value) {
      if (value == null) {
        return Repr.unit();
      } else if (value instanceof TermRepr && value.attrs().isEmpty()) {
        return ((TermRepr) value).term();
      } else {
        return value;
      }
    }

    @Override
    public @Nullable Repr fromTerm(Term term) {
      if (term instanceof Repr) {
        return (Repr) term;
      } else {
        return TermRepr.of(term);
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "tupleForm");
      if (!this.attrs.isEmpty()) {
        notation.appendArgument(this.attrs);
      }
      notation.endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class BlobAttrForm implements WamlAttrForm<Repr, BlobRepr> {

    final Attrs attrs;

    BlobAttrForm(Attrs attrs) {
      this.attrs = attrs;
    }

    @Override
    public WamlForm<Repr> argsForm() {
      return WamlReprs.tupleForm();
    }

    @Override
    public boolean isNullary(@Nullable Repr args) {
      return Repr.unit().equals(args);
    }

    @Override
    public WamlForm<BlobRepr> refineForm(WamlForm<BlobRepr> form, String name, @Nullable Repr args) {
      // Omit @blob attr
      return WamlReprs.blobForm(this.attrs);
    }

    @Override
    public WamlForm<BlobRepr> refineForm(WamlForm<BlobRepr> form, String name) {
      // Omit @blob attr
      return WamlReprs.blobForm(this.attrs);
    }

  }

  static final class ReprForm extends WamlReprForm<Repr> implements ToSource {

    ReprForm(Attrs attrs) {
      super(attrs);
    }

    @Override
    public WamlForm<Repr> withAttrs(Attrs attrs) {
      return WamlReprs.reprForm(attrs);
    }

    @Override
    public WamlAttrForm<?, ? extends Repr> getAttrForm(String name) {
      if ("blob".equals(name)) {
        return WamlReprs.blobAttrForm(this.attrs);
      } else {
        return super.getAttrForm(name);
      }
    }

    @Override
    public WamlUndefinedForm<UndefinedRepr> undefinedForm() {
      return WamlReprs.undefinedForm(this.attrs);
    }

    @Override
    public WamlUnitForm<UnitRepr> unitForm() {
      return WamlReprs.unitForm(this.attrs);
    }

    @Override
    public WamlNumberForm<NumberRepr> numberForm() {
      return WamlReprs.numberForm(this.attrs);
    }

    @Override
    public WamlIdentifierForm<Repr> identifierForm() {
      return WamlReprs.identifierForm(this.attrs);
    }

    @Override
    public WamlStringForm<?, StringRepr> stringForm() {
      return WamlReprs.stringForm(this.attrs);
    }

    @Override
    public WamlArrayForm<?, ?, ArrayRepr> arrayForm() {
      return WamlReprs.arrayForm(this.attrs);
    }

    @Override
    public WamlMarkupForm<?, ?, ArrayRepr> markupForm() {
      return WamlReprs.markupForm(this.attrs);
    }

    @Override
    public WamlObjectForm<?, ?, ?, ObjectRepr> objectForm() {
      return WamlReprs.objectForm(this.attrs);
    }

    @Override
    public WamlTupleForm<?, ?, ?, Repr> tupleForm() {
      return WamlReprs.tupleForm(this.attrs);
    }

    @Override
    public Parse<Repr> parse(Input input, WamlParser parser) {
      return parser.parseExpr(input, this);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Repr value, WamlWriter writer) {
      if (value == null) {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      } else if (value instanceof UndefinedRepr) {
        return WamlReprs.undefinedForm(this.attrs).write(output, (UndefinedRepr) value, writer);
      } else if (value instanceof UnitRepr) {
        return WamlReprs.unitForm(this.attrs).write(output, (UnitRepr) value, writer);
      } else if (value instanceof BooleanRepr) {
        return WamlReprs.booleanForm(this.attrs).write(output, (BooleanRepr) value, writer);
      } else if (value instanceof NumberRepr) {
        return WamlReprs.numberForm(this.attrs).write(output, (NumberRepr) value, writer);
      } else if (value instanceof StringRepr) {
        return WamlReprs.stringForm(this.attrs).write(output, (StringRepr) value, writer);
      } else if (value instanceof BlobRepr) {
        return WamlReprs.blobForm(this.attrs).write(output, (BlobRepr) value, writer);
      } else if (value instanceof TermRepr) {
        return WamlReprs.termForm(this.attrs).write(output, (TermRepr) value, writer);
      } else if (value instanceof ArrayRepr && ((ArrayRepr) value).isMarkup()) {
        return WamlReprs.markupForm(this.attrs).write(output, (ArrayRepr) value, writer);
      } else if (value instanceof ArrayRepr) {
        return WamlReprs.arrayForm(this.attrs).write(output, (ArrayRepr) value, writer);
      } else if (value instanceof ObjectRepr) {
        return WamlReprs.objectForm(this.attrs).write(output, (ObjectRepr) value, writer);
      } else if (value instanceof TupleRepr) {
        return WamlReprs.tupleForm(this.attrs).write(output, (TupleRepr) value, writer);
      } else {
        return Write.error(new WriteException("Unsupported value: " + value));
      }
    }

    @Override
    public Write<?> writeBlock(Output<?> output, @Nullable Repr value, WamlWriter writer) {
      if (value == null) {
        return Write.done();
      } else if (value instanceof UndefinedRepr) {
        return WamlReprs.undefinedForm(this.attrs).writeBlock(output, (UndefinedRepr) value, writer);
      } else if (value instanceof UnitRepr) {
        return WamlReprs.unitForm(this.attrs).writeBlock(output, (UnitRepr) value, writer);
      } else if (value instanceof BooleanRepr) {
        return WamlReprs.booleanForm(this.attrs).writeBlock(output, (BooleanRepr) value, writer);
      } else if (value instanceof NumberRepr) {
        return WamlReprs.numberForm(this.attrs).writeBlock(output, (NumberRepr) value, writer);
      } else if (value instanceof StringRepr) {
        return WamlReprs.stringForm(this.attrs).writeBlock(output, (StringRepr) value, writer);
      } else if (value instanceof BlobRepr) {
        return WamlReprs.blobForm(this.attrs).writeBlock(output, (BlobRepr) value, writer);
      } else if (value instanceof TermRepr) {
        return WamlReprs.termForm(this.attrs).writeBlock(output, (TermRepr) value, writer);
      } else if (value instanceof ArrayRepr && ((ArrayRepr) value).isMarkup()) {
        return WamlReprs.markupForm(this.attrs).writeBlock(output, (ArrayRepr) value, writer);
      } else if (value instanceof ArrayRepr) {
        return WamlReprs.arrayForm(this.attrs).writeBlock(output, (ArrayRepr) value, writer);
      } else if (value instanceof ObjectRepr) {
        return WamlReprs.objectForm(this.attrs).writeBlock(output, (ObjectRepr) value, writer);
      } else if (value instanceof TupleRepr) {
        return WamlReprs.tupleForm(this.attrs).writeBlock(output, (TupleRepr) value, writer);
      } else {
        return Write.error(new WriteException("Unsupported value: " + value));
      }
    }

    @Override
    public boolean isInline(@Nullable Repr value) {
      return (value instanceof ArrayRepr && ((ArrayRepr) value).isMarkup() && value.attrs().size() <= 1)
          || (value instanceof UnitRepr && value.attrs().size() == 1);
    }

    @Override
    public Write<?> writeInline(Output<?> output, @Nullable Repr value, WamlWriter writer) {
      if (value instanceof UndefinedRepr) {
        return WamlReprs.undefinedForm(this.attrs).writeInline(output, (UndefinedRepr) value, writer);
      } else if (value instanceof UnitRepr) {
        return WamlReprs.unitForm(this.attrs).writeInline(output, (UnitRepr) value, writer);
      } else if (value instanceof BooleanRepr) {
        return WamlReprs.booleanForm(this.attrs).writeInline(output, (BooleanRepr) value, writer);
      } else if (value instanceof NumberRepr) {
        return WamlReprs.numberForm(this.attrs).writeInline(output, (NumberRepr) value, writer);
      } else if (value instanceof StringRepr) {
        return WamlReprs.stringForm(this.attrs).writeInline(output, (StringRepr) value, writer);
      } else if (value instanceof BlobRepr) {
        return WamlReprs.blobForm(this.attrs).writeInline(output, (BlobRepr) value, writer);
      } else if (value instanceof TermRepr) {
        return WamlReprs.termForm(this.attrs).writeInline(output, (TermRepr) value, writer);
      } else if (value instanceof ArrayRepr && ((ArrayRepr) value).isMarkup()) {
        return WamlReprs.markupForm(this.attrs).writeInline(output, (ArrayRepr) value, writer);
      } else if (value instanceof ArrayRepr) {
        return WamlReprs.arrayForm(this.attrs).writeInline(output, (ArrayRepr) value, writer);
      } else if (value instanceof ObjectRepr) {
        return WamlReprs.objectForm(this.attrs).writeInline(output, (ObjectRepr) value, writer);
      } else if (value instanceof TupleRepr) {
        return WamlReprs.tupleForm(this.attrs).writeInline(output, (TupleRepr) value, writer);
      } else {
        return Write.error(new WriteException("Unsupported value: " + value));
      }
    }

    @Override
    public Term intoTerm(@Nullable Repr value) {
      if (value == null) {
        return Repr.unit();
      } else if (value instanceof TermRepr && value.attrs().isEmpty()) {
        return ((TermRepr) value).term();
      } else {
        return value;
      }
    }

    @Override
    public @Nullable Repr fromTerm(Term term) {
      if (term instanceof Repr) {
        return (Repr) term;
      } else {
        return TermRepr.of(term);
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "reprForm");
      if (!this.attrs.isEmpty()) {
        notation.appendArgument(this.attrs);
      }
      notation.endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

}
