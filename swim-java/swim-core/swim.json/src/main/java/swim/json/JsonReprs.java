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

package swim.json;

import java.lang.reflect.Type;
import java.math.BigInteger;
import java.util.Collections;
import java.util.Iterator;
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base64;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.OutputException;
import swim.codec.Parse;
import swim.codec.Write;
import swim.decl.FilterMode;
import swim.expr.ChildExpr;
import swim.expr.CondExpr;
import swim.expr.ContextExpr;
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
import swim.term.Term;
import swim.util.Assume;
import swim.util.CacheMap;
import swim.util.LruCacheMap;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class JsonReprs implements JsonProvider, WriteSource {

  final int priority;

  private JsonReprs(int priority) {
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
      if (UndefinedRepr.class.isAssignableFrom(classType)) {
        return JsonReprs.undefinedFormat();
      } else if (UnitRepr.class.isAssignableFrom(classType)) {
        return JsonReprs.unitFormat();
      } else if (BooleanRepr.class.isAssignableFrom(classType)) {
        return JsonReprs.booleanFormat();
      } else if (NumberRepr.class.isAssignableFrom(classType)) {
        return JsonReprs.numberFormat();
      } else if (StringRepr.class.isAssignableFrom(classType)) {
        return JsonReprs.stringFormat();
      } else if (BlobRepr.class.isAssignableFrom(classType)) {
        return JsonReprs.blobFormat();
      } else if (TermRepr.class.isAssignableFrom(classType)) {
        return JsonReprs.termFormat();
      } else if (ArrayRepr.class.isAssignableFrom(classType)) {
        return JsonReprs.arrayFormat();
      } else if (ObjectRepr.class.isAssignableFrom(classType)) {
        return JsonReprs.objectFormat();
      } else if (TupleRepr.class.isAssignableFrom(classType)) {
        return JsonReprs.tupleFormat();
      } else if (classType == Repr.class) {
        return JsonReprs.valueFormat();
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
    return WriteSource.toString(this);
  }

  static final JsonReprs PROVIDER = new JsonReprs(BUILTIN_PRIORITY);

  public static JsonReprs provider(int priority) {
    if (priority == BUILTIN_PRIORITY) {
      return PROVIDER;
    }
    return new JsonReprs(priority);
  }

  public static JsonReprs provider() {
    return PROVIDER;
  }

  public static JsonFormat<UndefinedRepr> undefinedFormat() {
    return UndefinedFormat.INSTANCE;
  }

  public static JsonFormat<UnitRepr> unitFormat() {
    return UnitFormat.INSTANCE;
  }

  public static JsonFormat<Repr> identifierFormat() {
    return IdentifierFormat.INSTANCE;
  }

  public static JsonFormat<BooleanRepr> booleanFormat() {
    return BooleanFormat.INSTANCE;
  }

  public static JsonFormat<NumberRepr> numberFormat() {
    return NumberFormat.INSTANCE;
  }

  public static JsonFormat<StringRepr> stringFormat() {
    return StringFormat.INSTANCE;
  }

  public static JsonFormat<BlobRepr> blobFormat() {
    return BlobFormat.INSTANCE;
  }

  public static JsonFormat<Repr> termFormat() {
    return TermFormat.INSTANCE;
  }

  public static JsonFormat<ArrayRepr> arrayFormat() {
    return ArrayFormat.INSTANCE;
  }

  public static JsonFormat<ObjectRepr> objectFormat() {
    return ObjectFormat.INSTANCE;
  }

  public static JsonFormat<TupleRepr> tupleFormat() {
    return TupleFormat.INSTANCE;
  }

  public static JsonFormat<Repr> valueFormat() {
    return ValueFormat.INSTANCE;
  }

  static final ThreadLocal<CacheMap<String, StringRepr>> STRING_CACHE =
      new ThreadLocal<CacheMap<String, StringRepr>>();

  public static CacheMap<String, StringRepr> stringCache() {
    CacheMap<String, StringRepr> stringCache = STRING_CACHE.get();
    if (stringCache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.json.string.repr.cache.size"));
      } catch (NumberFormatException cause) {
        cacheSize = 512;
      }
      stringCache = new LruCacheMap<String, StringRepr>(cacheSize);
      STRING_CACHE.set(stringCache);
    }
    return stringCache;
  }

  static StringRepr cacheString(String string) {
    final CacheMap<String, StringRepr> stringCache = JsonReprs.stringCache();
    StringRepr value = stringCache.get(string);
    if (value == null) {
      value = stringCache.put(string, StringRepr.of(string));
    }
    return value;
  }

  static final class UndefinedFormat implements JsonFormat<UndefinedRepr>, JsonIdentifierParser<UndefinedRepr>, JsonIdentifierWriter<UndefinedRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "undefined";
    }

    @Override
    public UndefinedRepr fromIdentifier(String value, JsonParserOptions options) throws JsonException {
      if ("undefined".equals(value)) {
        return UndefinedRepr.undefined();
      }
      throw new JsonException("unsupported identifier: " + value);
    }

    @Override
    public @Nullable String intoIdentifier(@Nullable UndefinedRepr value) {
      if (value != null) {
        return "undefined";
      }
      return null;
    }

    @Override
    public boolean filter(@Nullable UndefinedRepr value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null && value.isDefined();
        case TRUTHY:
          return value != null && value.isTruthy();
        case DISTINCT:
          return value != null && value.isDistinct();
        default:
          return true;
      }
    }

    @Override
    public UndefinedRepr initializer() {
      return UndefinedRepr.undefined();
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonReprs", "undefinedFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final UndefinedFormat INSTANCE = new UndefinedFormat();

  }

  static final class UnitFormat implements JsonFormat<UnitRepr>, JsonIdentifierParser<UnitRepr>, JsonIdentifierWriter<UnitRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "null";
    }

    @Override
    public UnitRepr fromIdentifier(String value, JsonParserOptions options) throws JsonException {
      if ("null".equals(value)) {
        return UnitRepr.unit();
      }
      throw new JsonException("unsupported identifier: " + value);
    }

    @Override
    public @Nullable String intoIdentifier(@Nullable UnitRepr value) {
      if (value != null) {
        return "null";
      }
      return null;
    }

    @Override
    public boolean filter(@Nullable UnitRepr value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null && value.isDefined();
        case TRUTHY:
          return value != null && value.isTruthy();
        case DISTINCT:
          return value != null && value.isDistinct();
        default:
          return true;
      }
    }

    @Override
    public UnitRepr initializer() {
      return UnitRepr.unit();
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonReprs", "unitFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final UnitFormat INSTANCE = new UnitFormat();

  }

  static final class IdentifierFormat implements JsonFormat<Repr>, JsonIdentifierParser<Repr>, JsonIdentifierWriter<Repr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "identifier";
    }

    @Override
    public Repr fromIdentifier(String value, JsonParserOptions options) throws JsonException {
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
          if (options.exprsEnabled()) {
            return TermRepr.of(new ChildExpr(ContextExpr.of(), Term.of(value)));
          }
          throw new JsonException("unsupported identifier: " + value);
      }
    }

    @Override
    public @Nullable String intoIdentifier(@Nullable Repr value) {
      if (value instanceof UndefinedRepr) {
        return "undefined";
      } else if (value instanceof UnitRepr) {
        return "null";
      } else if (value instanceof BooleanRepr) {
        return value.booleanValue() ? "true" : "false";
      } else if (value instanceof TermRepr) {
        final Term term = ((TermRepr) value).term();
        if (term instanceof ChildExpr expr && expr.scope().equals(ContextExpr.of())
            && expr.key().isValidString()) {
          return expr.key().stringValue();
        }
      }
      return null;
    }

    @Override
    public boolean filter(@Nullable Repr value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null && value.isDefined();
        case TRUTHY:
          return value != null && value.isTruthy();
        case DISTINCT:
          return value != null && value.isDistinct();
        default:
          return true;
      }
    }

    @Override
    public Repr initializer() {
      return UndefinedRepr.undefined();
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonReprs", "identifierFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final IdentifierFormat INSTANCE = new IdentifierFormat();

  }

  static final class BooleanFormat implements JsonFormat<BooleanRepr>, JsonIdentifierParser<BooleanRepr>, JsonIdentifierWriter<BooleanRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "boolean";
    }

    @Override
    public BooleanRepr fromIdentifier(String value, JsonParserOptions options) throws JsonException {
      if ("true".equals(value)) {
        return BooleanRepr.of(true);
      } else if ("false".equals(value)) {
        return BooleanRepr.of(false);
      }
      throw new JsonException("unsupported identifier: " + value);
    }

    @Override
    public @Nullable String intoIdentifier(@Nullable BooleanRepr value) {
      if (value == null) {
        return null;
      }
      return value.booleanValue() ? "true" : "false";
    }

    @Override
    public boolean filter(@Nullable BooleanRepr value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null && value.isDefined();
        case TRUTHY:
          return value != null && value.isTruthy();
        case DISTINCT:
          return value != null && value.isDistinct();
        default:
          return true;
      }
    }

    @Override
    public BooleanRepr initializer() {
      return BooleanRepr.of(false);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonReprs", "booleanFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final BooleanFormat INSTANCE = new BooleanFormat();

  }

  static final class NumberFormat implements JsonFormat<NumberRepr>, JsonNumberParser<NumberRepr>, JsonNumberWriter<NumberRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public NumberRepr fromInteger(long value) {
      if (value == (long) (int) value) {
        return NumberRepr.of((int) value);
      } else {
        return NumberRepr.of(value);
      }
    }

    @Override
    public NumberRepr fromHexadecimal(long value, int digits) {
      if (value == (long) (int) value && digits <= 8) {
        return NumberRepr.of((int) value);
      } else {
        return NumberRepr.of(value);
      }
    }

    @Override
    public NumberRepr fromBigInteger(String value) {
      return NumberRepr.of(new BigInteger(value));
    }

    @Override
    public NumberRepr fromDecimal(String value) {
      return NumberRepr.parse(value);
    }

    @Override
    public @Nullable Number intoNumber(@Nullable NumberRepr value) {
      if (value == null) {
        return null;
      }
      return value.numberValue();
    }

    @Override
    public boolean filter(@Nullable NumberRepr value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null && value.isDefined();
        case TRUTHY:
          return value != null && value.isTruthy();
        case DISTINCT:
          return value != null && value.isDistinct();
        default:
          return true;
      }
    }

    @Override
    public NumberRepr initializer() {
      return NumberRepr.of(0);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable NumberRepr value, JsonWriterOptions options) {
      if (value == null) {
        return this.writeNull(output);
      } else if (value.isValidInt()) {
        return this.writeInt(output, value.intValue());
      } else if (value.isValidLong()) {
        return this.writeLong(output, value.longValue());
      } else if (value.isValidFloat()) {
        return this.writeFloat(output, value.floatValue());
      } else if (value.isValidDouble()) {
        return this.writeDouble(output, value.doubleValue());
      } else if (value.isValidBigInteger()) {
        return this.writeBigInteger(output, value.bigIntegerValue());
      }
      return this.writeNumber(output, value.numberValue());
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonReprs", "numberFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final NumberFormat INSTANCE = new NumberFormat();

  }

  static final class StringFormat implements JsonFormat<StringRepr>, JsonStringParser<StringBuilder, StringRepr>, JsonStringWriter<StringRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "string";
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
      return JsonReprs.cacheString(builder.toString());
    }

    @Override
    public @Nullable String intoString(@Nullable StringRepr value) {
      if (value == null) {
        return null;
      }
      return value.stringValue();
    }

    @Override
    public boolean filter(@Nullable StringRepr value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null && value.isDefined();
        case TRUTHY:
          return value != null && value.isTruthy();
        case DISTINCT:
          return value != null && value.isDistinct();
        default:
          return true;
      }
    }

    @Override
    public StringRepr initializer() {
      return StringRepr.empty();
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonReprs", "stringFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final StringFormat INSTANCE = new StringFormat();

  }

  static final class BlobFormat implements JsonFormat<BlobRepr>, JsonStringParser<Output<BlobRepr>, BlobRepr>, JsonStringWriter<BlobRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "base64";
    }

    @Override
    public Output<BlobRepr> stringBuilder() {
      return Base64.standard().decodedOutput(new BlobReprOutput());
    }

    @Override
    public Output<BlobRepr> appendCodePoint(Output<BlobRepr> builder, int c) {
      if (builder.isCont()) {
        builder.write(c);
      }
      return builder;
    }

    @Override
    public @Nullable BlobRepr buildString(Output<BlobRepr> builder) throws JsonException {
      try {
        return builder.get();
      } catch (OutputException cause) {
        throw new JsonException("malformed base-64 string", cause);
      }
    }

    @Override
    public @Nullable String intoString(@Nullable BlobRepr value) {
      if (value == null) {
        return null;
      }
      return value.toBase64();
    }

    @Override
    public boolean filter(@Nullable BlobRepr value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null && value.isDefined();
        case TRUTHY:
          return value != null && value.isTruthy();
        case DISTINCT:
          return value != null && value.isDistinct();
        default:
          return true;
      }
    }

    @Override
    public BlobRepr initializer() {
      return BlobRepr.empty();
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonReprs", "blobFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final BlobFormat INSTANCE = new BlobFormat();

  }

  static final class TermFormat implements JsonFormat<Repr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return null;
    }

    @Override
    public boolean filter(@Nullable Repr value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null && value.isDefined();
        case TRUTHY:
          return value != null && value.isTruthy();
        case DISTINCT:
          return value != null && value.isDistinct();
        default:
          return true;
      }
    }

    @Override
    public Repr initializer() {
      return UndefinedRepr.undefined();
    }

    @Override
    public Parse<Repr> parse(Input input, JsonParserOptions options) {
      return ParseJsonRepr.parse(input, this, options, null);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Repr value, JsonWriterOptions options) {
      if (value == null) {
        return this.writeNull(output);
      } else if (value instanceof TermRepr) {
        return this.writeTerm(output, ((TermRepr) value).term(), options);
      }
      return JsonReprs.valueFormat().write(output, value, options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonReprs", "termFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final TermFormat INSTANCE = new TermFormat();

  }

  static final class ArrayFormat implements JsonFormat<ArrayRepr>, JsonArrayParser<Repr, ArrayRepr, ArrayRepr>, JsonArrayWriter<Repr, ArrayRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "array";
    }

    @Override
    public JsonParser<Repr> elementParser() {
      return JsonReprs.valueFormat();
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
    public @Nullable Iterator<Repr> getElements(@Nullable ArrayRepr value) {
      if (value == null) {
        return null;
      }
      return value.iterator();
    }

    @Override
    public JsonWriter<Repr> elementWriter() {
      return JsonReprs.valueFormat();
    }

    @Override
    public boolean filter(@Nullable ArrayRepr value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null && value.isDefined();
        case TRUTHY:
          return value != null && value.isTruthy();
        case DISTINCT:
          return value != null && value.isDistinct();
        default:
          return true;
      }
    }

    @Override
    public ArrayRepr initializer() {
      return ArrayRepr.empty();
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonReprs", "arrayFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final ArrayFormat INSTANCE = new ArrayFormat();

  }

  static final class ObjectFormat implements JsonFormat<ObjectRepr>, JsonObjectFormat<Repr, ObjectRepr, ObjectRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "object";
    }

    @Override
    public JsonFieldFormat<? extends Repr, ObjectRepr> getFieldFormat(@Nullable ObjectRepr object, String key) {
      return JsonFieldFormat.forKey(key, JsonLang.keyFormat(), JsonReprs.valueFormat(), FilterMode.DEFAULT);
    }

    @Override
    public Iterator<JsonFieldFormat<? extends Repr, ObjectRepr>> getFieldFormats(@Nullable ObjectRepr object) {
      if (object == null) {
        return Collections.emptyIterator();
      }
      return JsonCollections.mapFieldFormatIterator(object.keyIterator(), JsonLang.keyFormat(),
                                                    JsonReprs.valueFormat(), FilterMode.DEFAULT);
    }

    @Override
    public Iterator<JsonFieldFormat<? extends Repr, ObjectRepr>> getDeclaredFieldFormats() {
      return Collections.emptyIterator();
    }

    @Override
    public ObjectRepr objectBuilder() {
      return ObjectRepr.of();
    }

    @Override
    public JsonFieldParser<? extends Repr, ObjectRepr> getFieldParser(ObjectRepr object, String key) {
      return JsonFieldParser.forKey(key, JsonReprs.valueFormat());
    }

    @Override
    public @Nullable ObjectRepr buildObject(ObjectRepr builder) {
      return builder;
    }

    @Override
    public JsonFieldWriter<? extends Repr, ObjectRepr> getFieldWriter(ObjectRepr object, String key) {
      return JsonFieldWriter.forKey(key, JsonLang.keyFormat(), JsonReprs.valueFormat(), FilterMode.DEFAULT);
    }

    @Override
    public Iterator<JsonFieldWriter<? extends Repr, ObjectRepr>> getFieldWriters(ObjectRepr object) {
      return Assume.conforms(JsonCollections.mapFieldFormatIterator(object.keyIterator(), JsonLang.keyFormat(),
                                                                    JsonReprs.valueFormat(), FilterMode.DEFAULT));
    }

    @Override
    public boolean filter(@Nullable ObjectRepr value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null && value.isDefined();
        case TRUTHY:
          return value != null && value.isTruthy();
        case DISTINCT:
          return value != null && value.isDistinct();
        default:
          return true;
      }
    }

    @Override
    public @Nullable ObjectRepr merged(@Nullable ObjectRepr newObject, @Nullable ObjectRepr oldObject) {
      if (newObject == null || oldObject == null) {
        return newObject;
      }
      return newObject.letAll(oldObject);
    }

    @Override
    public ObjectRepr initializer() {
      return ObjectRepr.empty();
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonReprs", "objectFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final ObjectFormat INSTANCE = new ObjectFormat();

  }

  static final class TupleFormat implements JsonFormat<TupleRepr>, JsonObjectParser<Repr, TupleRepr, TupleRepr>, JsonObjectWriter<Repr, TupleRepr>, JsonArrayWriter<Repr, TupleRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "tuple";
    }

    @Override
    public JsonArrayParser<?, ?, TupleRepr> arrayParser() {
      return TupleArrayParser.INSTANCE;
    }

    @Override
    public TupleRepr objectBuilder() {
      return TupleRepr.of();
    }

    @Override
    public JsonFieldParser<? extends Repr, TupleRepr> getFieldParser(TupleRepr object, String key) {
      return JsonFieldParser.forKey(key, JsonReprs.valueFormat());
    }

    @Override
    public @Nullable TupleRepr buildObject(TupleRepr builder) {
      return builder;
    }

    @Override
    public JsonFieldWriter<? extends Repr, TupleRepr> getFieldWriter(TupleRepr object, String key) {
      return JsonFieldWriter.forKey(key, JsonLang.keyFormat(), JsonReprs.valueFormat(), FilterMode.DEFAULT);
    }

    @Override
    public Iterator<JsonFieldWriter<? extends Repr, TupleRepr>> getFieldWriters(TupleRepr object) {
      return Assume.conforms(JsonCollections.mapFieldFormatIterator(object.keyIterator(), JsonLang.keyFormat(),
                                                                    JsonReprs.valueFormat(), FilterMode.DEFAULT));
    }

    @Override
    public @Nullable Iterator<Repr> getElements(@Nullable TupleRepr object) {
      if (object == null) {
        return null;
      }
      return object.valueIterator();
    }

    @Override
    public JsonWriter<Repr> elementWriter() {
      return JsonReprs.valueFormat();
    }

    @Override
    public boolean filter(@Nullable TupleRepr object, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return object != null && object.isDefined();
        case TRUTHY:
          return object != null && object.isTruthy();
        case DISTINCT:
          return object != null && object.isDistinct();
        default:
          return true;
      }
    }

    @Override
    public TupleRepr initializer() {
      return TupleRepr.empty();
    }

    @Override
    public Parse<TupleRepr> parse(Input input, JsonParserOptions options) {
      return this.parseValue(input, options);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable TupleRepr value, JsonWriterOptions options) {
      if (value != null && !value.isEmpty() && value.isArray()) {
        return JsonArrayWriter.super.write(output, value, options);
      }
      return JsonObjectWriter.super.write(output, value, options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonReprs", "tupleFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final TupleFormat INSTANCE = new TupleFormat();

  }

  static final class TupleArrayParser implements JsonArrayParser<Repr, TupleRepr, TupleRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "tuple";
    }

    @Override
    public JsonParser<Repr> elementParser() {
      return JsonReprs.valueFormat();
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
    public TupleRepr initializer() {
      return TupleRepr.empty();
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonReprs", "tupleFormat").endInvoke()
              .beginInvoke("arrayParser").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final TupleArrayParser INSTANCE = new TupleArrayParser();

  }

  static final class ValueFormat implements JsonFormat<Repr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "any";
    }

    @Override
    public JsonIdentifierParser<Repr> identifierParser() throws JsonException {
      return JsonReprs.identifierFormat().identifierParser();
    }

    @Override
    public JsonNumberParser<Repr> numberParser() throws JsonException {
      return Assume.covariant(JsonReprs.numberFormat().numberParser());
    }

    @Override
    public JsonStringParser<?, Repr> stringParser() throws JsonException {
      return Assume.covariant(JsonReprs.stringFormat().stringParser());
    }

    @Override
    public JsonArrayParser<?, ?, Repr> arrayParser() throws JsonException {
      return Assume.covariant(JsonReprs.arrayFormat().arrayParser());
    }

    @Override
    public JsonObjectParser<?, ?, Repr> objectParser() throws JsonException {
      return Assume.covariant(JsonReprs.objectFormat().objectParser());
    }

    @Override
    public boolean filter(@Nullable Repr value, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
          return value != null && value.isDefined();
        case TRUTHY:
          return value != null && value.isTruthy();
        case DISTINCT:
          return value != null && value.isDistinct();
        default:
          return true;
      }
    }

    @Override
    public Repr initializer() {
      return UnitRepr.unit();
    }

    @Override
    public Parse<Repr> parse(Input input, JsonParserOptions options) {
      return ParseJsonRepr.parse(input, this, options, null);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Repr value, JsonWriterOptions options) {
      if (value == null) {
        return this.writeNull(output);
      } else if (value instanceof UndefinedRepr) {
        return JsonReprs.undefinedFormat().write(output, (UndefinedRepr) value, options);
      } else if (value instanceof UnitRepr) {
        return JsonReprs.unitFormat().write(output, (UnitRepr) value, options);
      } else if (value instanceof BooleanRepr) {
        return JsonReprs.booleanFormat().write(output, (BooleanRepr) value, options);
      } else if (value instanceof NumberRepr) {
        return JsonReprs.numberFormat().write(output, (NumberRepr) value, options);
      } else if (value instanceof StringRepr) {
        return JsonReprs.stringFormat().write(output, (StringRepr) value, options);
      } else if (value instanceof BlobRepr) {
        return JsonReprs.blobFormat().write(output, (BlobRepr) value, options);
      } else if (value instanceof TermRepr) {
        return JsonReprs.termFormat().write(output, (TermRepr) value, options);
      } else if (value instanceof ArrayRepr) {
        return JsonReprs.arrayFormat().write(output, (ArrayRepr) value, options);
      } else if (value instanceof ObjectRepr) {
        return JsonReprs.objectFormat().write(output, (ObjectRepr) value, options);
      } else if (value instanceof TupleRepr) {
        return JsonReprs.tupleFormat().write(output, (TupleRepr) value, options);
      }
      return Write.error(new JsonException("unsupported value: " + value));
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonReprs", "valueFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final ValueFormat INSTANCE = new ValueFormat();

  }

}

final class ParseJsonRepr extends Parse<Repr> {

  final JsonParser<Repr> parser;
  final JsonParserOptions options;
  final @Nullable Parse<Object> parseExpr;

  ParseJsonRepr(JsonParser<Repr> parser, JsonParserOptions options,
                @Nullable Parse<Object> parseExpr) {
    this.parser = parser;
    this.options = options;
    this.parseExpr = parseExpr;
  }

  @Override
  public Parse<Repr> consume(Input input) {
    return ParseJsonRepr.parse(input, this.parser, this.options, this.parseExpr);
  }

  static Parse<Repr> parse(Input input, JsonParser<Repr> parser, JsonParserOptions options,
                           @Nullable Parse<Object> parseExpr) {
    if (parseExpr == null) {
      parseExpr = CondExpr.parse(input, parser, options);
    } else {
      parseExpr = parseExpr.consume(input);
    }
    if (parseExpr.isDone()) {
      final Object value = parseExpr.getUnchecked();
      if (value == null || value instanceof Repr) {
        return Assume.conforms(parseExpr);
      } else {
        return Parse.done(TermRepr.of((Term) value));
      }
    } else if (parseExpr.isError()) {
      return parseExpr.asError();
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseJsonRepr(parser, options, parseExpr);
  }

}
