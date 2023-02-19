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
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.util.AbstractMap;
import java.util.Iterator;
import java.util.Map;
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
public final class JsonReprs implements JsonProvider, ToSource {

  final int priority;

  private JsonReprs(int priority) {
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
    notation.beginInvoke("JsonReprs", "provider");
    if (this.priority != BUILTIN_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final JsonReprs PROVIDER = new JsonReprs(BUILTIN_PRIORITY);

  public static JsonReprs provider(int priority) {
    if (priority == BUILTIN_PRIORITY) {
      return PROVIDER;
    } else {
      return new JsonReprs(priority);
    }
  }

  public static JsonReprs provider() {
    return PROVIDER;
  }

  private static final JsonReprs.UndefinedForm UNDEFINED_FORM = new JsonReprs.UndefinedForm();

  public static JsonUndefinedForm<UndefinedRepr> undefinedForm() {
    return UNDEFINED_FORM;
  }

  private static final JsonReprs.UnitForm UNIT_FORM = new JsonReprs.UnitForm();

  public static JsonNullForm<UnitRepr> unitForm() {
    return UNIT_FORM;
  }

  private static final JsonReprs.BooleanForm BOOLEAN_FORM = new JsonReprs.BooleanForm();

  public static JsonForm<BooleanRepr> booleanForm() {
    return BOOLEAN_FORM;
  }

  private static final JsonReprs.NumberForm NUMBER_FORM = new JsonReprs.NumberForm();

  public static JsonNumberForm<NumberRepr> numberForm() {
    return NUMBER_FORM;
  }

  private static final JsonReprs.IdentifierForm IDENTIFIER_FORM = new JsonReprs.IdentifierForm();

  public static JsonIdentifierForm<Repr> identifierForm() {
    return IDENTIFIER_FORM;
  }

  private static final JsonReprs.StringForm STRING_FORM = new JsonReprs.StringForm();

  public static JsonStringForm<StringBuilder, StringRepr> stringForm() {
    return STRING_FORM;
  }

  private static final JsonReprs.BlobForm BLOB_FORM = new JsonReprs.BlobForm();

  public static JsonForm<BlobRepr> blobForm() {
    return BLOB_FORM;
  }

  private static final JsonReprs.TermForm TERM_FORM = new JsonReprs.TermForm();

  public static JsonForm<Repr> termForm() {
    return TERM_FORM;
  }

  private static final JsonReprs.ArrayForm ARRAY_FORM = new JsonReprs.ArrayForm();

  public static JsonArrayForm<Repr, ArrayRepr, ArrayRepr> arrayForm() {
    return ARRAY_FORM;
  }

  private static final JsonReprs.KeyForm KEY_FORM = new JsonReprs.KeyForm();

  public static JsonForm<String> keyForm() {
    return KEY_FORM;
  }

  private static final JsonReprs.ObjectForm OBJECT_FORM = new JsonReprs.ObjectForm();

  public static JsonObjectForm<String, Repr, ObjectRepr, ObjectRepr> objectForm() {
    return OBJECT_FORM;
  }

  private static final JsonReprs.TupleForm TUPLE_FORM = new JsonReprs.TupleForm();

  public static JsonObjectForm<String, Repr, TupleRepr, TupleRepr> tupleForm() {
    return TUPLE_FORM;
  }

  private static final JsonReprs.ReprForm REPR_FORM = new JsonReprs.ReprForm();

  public static JsonForm<Repr> reprForm() {
    return REPR_FORM;
  }

  private static final ThreadLocal<CacheMap<String, StringRepr>> STRING_CACHE = new ThreadLocal<CacheMap<String, StringRepr>>();

  public static CacheMap<String, StringRepr> stringCache() {
    CacheMap<String, StringRepr> stringCache = STRING_CACHE.get();
    if (stringCache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.json.string.repr.cache.size"));
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
        cacheSize = Integer.parseInt(System.getProperty("swim.json.key.repr.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 512;
      }
      keyCache = new LruCacheSet<String>(cacheSize);
      KEY_CACHE.set(keyCache);
    }
    return keyCache;
  }

  static final class UndefinedForm implements JsonUndefinedForm<UndefinedRepr>, ToSource {

    @Override
    public UndefinedRepr undefinedValue() {
      return UndefinedRepr.undefined();
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable UndefinedRepr value, JsonWriter writer) {
      return writer.writeUndefined(output);
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
      notation.beginInvoke("JsonReprs", "undefinedForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class UnitForm implements JsonNullForm<UnitRepr>, ToSource {

    @Override
    public UnitRepr nullValue() {
      return UnitRepr.unit();
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable UnitRepr value, JsonWriter writer) {
      return writer.writeNull(output);
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
      notation.beginInvoke("JsonReprs", "unitForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class BooleanForm implements JsonIdentifierForm<BooleanRepr>, ToSource {

    @Override
    public BooleanRepr identifierValue(String value, ExprParser parser) {
      if ("true".equals(value)) {
        return BooleanRepr.of(true);
      } else if ("false".equals(value)) {
        return BooleanRepr.of(false);
      } else {
        throw new ParseException("Unexpected identifier: " + value);
      }
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable BooleanRepr value, JsonWriter writer) {
      if (value != null) {
        return writer.writeBoolean(output, value.booleanValue());
      } else {
        return writer.writeNull(output);
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
      notation.beginInvoke("JsonReprs", "booleanForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class NumberForm implements JsonNumberForm<NumberRepr>, ToSource {

    @Override
    public NumberRepr integerValue(long value) {
      if (value == (long) (int) value) {
        return NumberRepr.of((int) value);
      } else {
        return NumberRepr.of(value);
      }
    }

    @Override
    public NumberRepr hexadecimalValue(long value, int digits) {
      if (value == (long) (int) value && digits <= 8) {
        return NumberRepr.of((int) value);
      } else {
        return NumberRepr.of(value);
      }
    }

    @Override
    public NumberRepr bigIntegerValue(String value) {
      return NumberRepr.of(new BigInteger(value));
    }

    @Override
    public NumberRepr decimalValue(String value) {
      return NumberRepr.parse(value);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable NumberRepr value, JsonWriter writer) {
      if (value == null) {
        return writer.writeNull(output);
      } else if (value.isValidInt()) {
        return writer.writeNumber(output, value.intValue());
      } else if (value.isValidLong()) {
        return writer.writeNumber(output, value.longValue());
      } else if (value.isValidFloat()) {
        return writer.writeNumber(output, value.floatValue());
      } else if (value.isValidDouble()) {
        return writer.writeNumber(output, value.doubleValue());
      } else if (value.isValidBigInteger()) {
        return writer.writeNumber(output, value.bigIntegerValue());
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
      notation.beginInvoke("JsonReprs", "numberForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class IdentifierForm implements JsonIdentifierForm<Repr>, ToSource {

    @Override
    public Repr identifierValue(String value, ExprParser parser) {
      switch (value) {
        case "undefined":
          return UndefinedRepr.undefined();
        case "null":
          return UnitRepr.unit();
        case "false":
          return BooleanRepr.of(false);
        case "true":
          return BooleanRepr.of(true);
        default:
          if (parser instanceof JsonParser && ((JsonParser) parser).options().exprsEnabled()) {
            return TermRepr.of(new ChildExpr(ContextExpr.of(), StringRepr.of(value)));
          } else {
            throw new ParseException("Unexpected identifier: " + value);
          }
      }
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Repr value, JsonWriter writer) {
      if (value == null) {
        return writer.writeNull(output);
      } else if (value instanceof UndefinedRepr) {
        return writer.writeUndefined(output);
      } else if (value instanceof UnitRepr) {
        return writer.writeNull(output);
      } else if (value instanceof BooleanRepr) {
        return writer.writeBoolean(output, value.booleanValue());
      } else {
        return writer.writeIdentifier(output, value.stringValue());
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
        if (Json.parser().isIdentifier(string)) {
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
      notation.beginInvoke("JsonReprs", "identifierForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class StringForm implements JsonStringForm<StringBuilder, StringRepr>, ToSource {

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
      final CacheMap<String, StringRepr> stringCache = JsonReprs.stringCache();
      final String value = builder.toString();
      StringRepr stringValue = stringCache.get(value);
      if (stringValue == null) {
        stringValue = stringCache.put(value, StringRepr.of(value));
      }
      return stringValue;
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable StringRepr value, JsonWriter writer) {
      if (value != null) {
        return writer.writeString(output, value.stringValue());
      } else {
        return writer.writeNull(output);
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
      notation.beginInvoke("JsonReprs", "stringForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class BlobForm implements JsonStringForm<Output<BlobRepr>, BlobRepr>, ToSource {

    @Override
    public Output<BlobRepr> stringBuilder() {
      return Base64.standard().decodedOutput(new BlobReprOutput());
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
    public Write<?> write(Output<?> output, @Nullable BlobRepr value, JsonWriter writer) {
      if (value != null) {
        return writer.writeString(output, value.toBase64());
      } else {
        return writer.writeNull(output);
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
      notation.beginInvoke("JsonReprs", "blobForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class TermForm implements JsonForm<Repr>, ToSource {

    @Override
    public Parse<Repr> parse(Input input, JsonParser parser) {
      return parser.parseExpr(input, this);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Repr value, JsonWriter writer) {
      if (value == null) {
        return writer.writeNull(output);
      } else if (value instanceof TermRepr) {
        return writer.writeTerm(output, this, ((TermRepr) value).term());
      } else {
        return JsonReprs.reprForm().write(output, value, writer);
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
      notation.beginInvoke("JsonReprs", "termForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class ArrayForm implements JsonArrayForm<Repr, ArrayRepr, ArrayRepr>, ToSource {

    @Override
    public JsonForm<Repr> elementForm() {
      return JsonReprs.reprForm();
    }

    @Override
    public ArrayRepr arrayBuilder() {
      return ArrayRepr.of();
    }

    @Override
    public ArrayRepr appendElement(ArrayRepr builder, @Nullable Repr element) {
      Objects.requireNonNull(element, "element");
      builder.add(element);
      return builder;
    }

    @Override
    public ArrayRepr buildArray(ArrayRepr builder) {
      return builder;
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable ArrayRepr value, JsonWriter writer) {
      if (value != null) {
        return writer.writeArray(output, this, value.iterator());
      } else {
        return writer.writeNull(output);
      }
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
      notation.beginInvoke("JsonReprs", "arrayForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class KeyForm implements JsonIdentifierForm<String>, JsonStringForm<StringBuilder, String>, ToSource {

    @Override
    public String identifierValue(String value, ExprParser parser) {
      return JsonReprs.keyCache().put(value);
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
      return JsonReprs.keyCache().put(builder.toString());
    }

    @Override
    public Parse<String> parse(Input input, JsonParser parser) {
      return parser.parseValue(input, this);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable String value, JsonWriter writer) {
      if (value == null) {
        return writer.writeNull(output);
      } else if (writer.options().identifierKeys() && writer.isIdentifier(value) && !writer.isKeyword(value)) {
        return writer.writeIdentifier(output, value);
      } else {
        return writer.writeString(output, value);
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
      notation.beginInvoke("JsonReprs", "keyForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class ObjectForm implements JsonObjectForm<String, Repr, ObjectRepr, ObjectRepr>, JsonFieldForm<String, Repr, ObjectRepr>, ToSource {

    @Override
    public JsonForm<String> keyForm() {
      return JsonReprs.keyForm();
    }

    @Override
    public JsonForm<Repr> valueForm() {
      return JsonReprs.reprForm();
    }

    @Override
    public JsonFieldForm<String, Repr, ObjectRepr> getFieldForm(String key) {
      return this;
    }

    @Override
    public ObjectRepr objectBuilder() {
      return ObjectRepr.of();
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
    public Write<?> write(Output<?> output, @Nullable ObjectRepr value, JsonWriter writer) {
      if (value != null) {
        return writer.writeObject(output, this, value.iterator());
      } else {
        return writer.writeNull(output);
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
      notation.beginInvoke("JsonReprs", "objectForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class TupleForm implements JsonArrayForm<Repr, TupleRepr, TupleRepr>, JsonObjectForm<String, Repr, TupleRepr, TupleRepr>, JsonFieldForm<String, Repr, TupleRepr>, ToSource {

    @Override
    public JsonForm<String> keyForm() {
      return JsonReprs.keyForm();
    }

    @Override
    public JsonForm<Repr> valueForm() {
      return JsonReprs.reprForm();
    }

    @Override
    public JsonFieldForm<String, Repr, TupleRepr> getFieldForm(String key) {
      return this;
    }

    @Override
    public TupleRepr objectBuilder() {
      return TupleRepr.of();
    }

    @Override
    public TupleRepr updateField(TupleRepr builder, String key, @Nullable Repr value) {
      Objects.requireNonNull(value, "value");
      builder.put(key, value);
      return builder;
    }

    @Override
    public TupleRepr buildObject(TupleRepr builder) {
      return builder;
    }

    @Override
    public JsonForm<Repr> elementForm() {
      return JsonReprs.reprForm();
    }

    @Override
    public TupleRepr arrayBuilder() {
      return TupleRepr.of();
    }

    @Override
    public TupleRepr appendElement(TupleRepr builder, @Nullable Repr element) {
      Objects.requireNonNull(element, "element");
      builder.add(element);
      return builder;
    }

    @Override
    public TupleRepr buildArray(TupleRepr builder) {
      return builder;
    }

    @Override
    public Parse<TupleRepr> parse(Input input, JsonParser parser) {
      return parser.parseExpr(input, this);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable TupleRepr value, JsonWriter writer) {
      if (value == null) {
        return writer.writeNull(output);
      } else if (!value.isEmpty() && value.isArray()) {
        return writer.writeArray(output, this, value.valueIterator());
      } else {
        return writer.writeObject(output, this, new JsonReprs.TupleForm.ParamIterator(value.iterator()));
      }
    }

    @Override
    public Term intoTerm(@Nullable TupleRepr value) {
      return value != null ? value : Repr.unit();
    }

    @Override
    public @Nullable TupleRepr fromTerm(Term term) {
      if (term instanceof TupleRepr) {
        return (TupleRepr) term;
      } else {
        return null;
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonReprs", "tupleForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final class ParamIterator implements Iterator<Map.Entry<String, Repr>> {

      final Iterator<Map.Entry<String, Repr>> params;
      int index;

      ParamIterator(Iterator<Map.Entry<String, Repr>> params) {
        this.params = params;
        this.index = 0;
      }

      @Override
      public boolean hasNext() {
        return this.params.hasNext();
      }

      @Override
      public Map.Entry<String, Repr> next() {
        Map.Entry<String, Repr> param = this.params.next();
        final int index = this.index;
        String key = param.getKey();
        if (key == null) {
          key = "$" + Integer.toString(index);
          final Repr value = param.getValue();
          param = new AbstractMap.SimpleImmutableEntry<String, Repr>(key, value);
        }
        this.index = index + 1;
        return param;
      }

    }

  }

  static final class ReprForm implements JsonForm<Repr>, ToSource {

    @Override
    public JsonUndefinedForm<UndefinedRepr> undefinedForm() {
      return JsonReprs.undefinedForm();
    }

    @Override
    public JsonNullForm<UnitRepr> nullForm() {
      return JsonReprs.unitForm();
    }

    @Override
    public JsonNumberForm<NumberRepr> numberForm() {
      return JsonReprs.numberForm();
    }

    @Override
    public JsonIdentifierForm<Repr> identifierForm() {
      return JsonReprs.identifierForm();
    }

    @Override
    public JsonStringForm<?, StringRepr> stringForm() {
      return JsonReprs.stringForm();
    }

    @Override
    public JsonArrayForm<?, ?, ArrayRepr> arrayForm() {
      return JsonReprs.arrayForm();
    }

    @Override
    public JsonObjectForm<?, ?, ?, ObjectRepr> objectForm() {
      return JsonReprs.objectForm();
    }

    @Override
    public Parse<Repr> parse(Input input, JsonParser parser) {
      return parser.parseExpr(input, this);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Repr value, JsonWriter writer) {
      if (value == null) {
        return writer.writeNull(output);
      } else if (value instanceof UndefinedRepr) {
        return JsonReprs.undefinedForm().write(output, (UndefinedRepr) value, writer);
      } else if (value instanceof UnitRepr) {
        return JsonReprs.unitForm().write(output, (UnitRepr) value, writer);
      } else if (value instanceof BooleanRepr) {
        return JsonReprs.booleanForm().write(output, (BooleanRepr) value, writer);
      } else if (value instanceof NumberRepr) {
        return JsonReprs.numberForm().write(output, (NumberRepr) value, writer);
      } else if (value instanceof StringRepr) {
        return JsonReprs.stringForm().write(output, (StringRepr) value, writer);
      } else if (value instanceof BlobRepr) {
        return JsonReprs.blobForm().write(output, (BlobRepr) value, writer);
      } else if (value instanceof TermRepr) {
        return JsonReprs.termForm().write(output, (TermRepr) value, writer);
      } else if (value instanceof ArrayRepr) {
        return JsonReprs.arrayForm().write(output, (ArrayRepr) value, writer);
      } else if (value instanceof ObjectRepr) {
        return JsonReprs.objectForm().write(output, (ObjectRepr) value, writer);
      } else if (value instanceof TupleRepr) {
        return JsonReprs.tupleForm().write(output, (TupleRepr) value, writer);
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
      notation.beginInvoke("JsonReprs", "reprForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

}
