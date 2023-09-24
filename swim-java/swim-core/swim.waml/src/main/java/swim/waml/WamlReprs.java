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
import java.math.BigInteger;
import java.util.AbstractMap.SimpleImmutableEntry;
import java.util.Collections;
import java.util.Iterator;
import java.util.Map;
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
import swim.term.Term;
import swim.util.Assume;
import swim.util.CacheMap;
import swim.util.Iterators;
import swim.util.LruCacheMap;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class WamlReprs implements WamlProvider, WriteSource {

  final int priority;

  private WamlReprs(int priority) {
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
      if (UndefinedRepr.class.isAssignableFrom(classType)) {
        return WamlReprs.undefinedFormat();
      } else if (UnitRepr.class.isAssignableFrom(classType)) {
        return WamlReprs.unitFormat();
      } else if (BooleanRepr.class.isAssignableFrom(classType)) {
        return WamlReprs.booleanFormat();
      } else if (NumberRepr.class.isAssignableFrom(classType)) {
        return WamlReprs.numberFormat();
      } else if (StringRepr.class.isAssignableFrom(classType)) {
        return WamlReprs.stringFormat();
      } else if (BlobRepr.class.isAssignableFrom(classType)) {
        return WamlReprs.blobFormat();
      } else if (TermRepr.class.isAssignableFrom(classType)) {
        return WamlReprs.termFormat();
      } else if (ArrayRepr.class.isAssignableFrom(classType)) {
        return WamlReprs.arrayFormat();
      } else if (ObjectRepr.class.isAssignableFrom(classType)) {
        return WamlReprs.objectFormat();
      } else if (TupleRepr.class.isAssignableFrom(classType)) {
        return WamlReprs.tupleFormat();
      } else if (classType == Repr.class) {
        return WamlReprs.valueFormat();
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
    return WriteSource.toString(this);
  }

  static final WamlReprs PROVIDER = new WamlReprs(BUILTIN_PRIORITY);

  public static WamlReprs provider(int priority) {
    if (priority == BUILTIN_PRIORITY) {
      return PROVIDER;
    }
    return new WamlReprs(priority);
  }

  public static WamlReprs provider() {
    return PROVIDER;
  }

  public static WamlAttrsParser<Repr, Attrs, Object> attrsParser() {
    return AttrsFormat.INSTANCE;
  }

  public static WamlAttrsWriter<Repr, Object> attrsWriter() {
    return AttrsFormat.INSTANCE;
  }

  public static WamlFormat<UndefinedRepr> undefinedFormat() {
    return UndefinedFormat.INSTANCE;
  }

  public static WamlFormat<UnitRepr> unitFormat() {
    return UnitFormat.INSTANCE;
  }

  public static WamlFormat<Repr> identifierFormat() {
    return IdentifierFormat.INSTANCE;
  }

  public static WamlFormat<BooleanRepr> booleanFormat() {
    return BooleanFormat.INSTANCE;
  }

  public static WamlFormat<NumberRepr> numberFormat() {
    return NumberFormat.INSTANCE;
  }

  public static WamlFormat<StringRepr> stringFormat() {
    return StringFormat.INSTANCE;
  }

  public static WamlFormat<BlobRepr> blobFormat() {
    return BlobFormat.INSTANCE;
  }

  public static WamlFormat<Repr> termFormat() {
    return TermFormat.INSTANCE;
  }

  public static WamlFormat<ArrayRepr> markupFormat() {
    return MarkupFormat.INSTANCE;
  }

  public static WamlFormat<ArrayRepr> arrayFormat() {
    return ArrayFormat.INSTANCE;
  }

  public static WamlFormat<ObjectRepr> objectFormat() {
    return ObjectFormat.INSTANCE;
  }

  public static WamlFormat<Repr> tupleFormat() {
    return TupleFormat.INSTANCE;
  }

  public static WamlFormat<Repr> valueFormat() {
    return ValueFormat.INSTANCE;
  }

  static final ThreadLocal<CacheMap<String, StringRepr>> STRING_CACHE =
      new ThreadLocal<CacheMap<String, StringRepr>>();

  public static CacheMap<String, StringRepr> stringCache() {
    CacheMap<String, StringRepr> stringCache = STRING_CACHE.get();
    if (stringCache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.waml.string.repr.cache.size"));
      } catch (NumberFormatException cause) {
        cacheSize = 512;
      }
      stringCache = new LruCacheMap<String, StringRepr>(cacheSize);
      STRING_CACHE.set(stringCache);
    }
    return stringCache;
  }

  static StringRepr cacheString(String string) {
    final CacheMap<String, StringRepr> stringCache = WamlReprs.stringCache();
    StringRepr value = stringCache.get(string);
    if (value == null) {
      value = stringCache.put(string, StringRepr.of(string));
    }
    return value;
  }

  static final class AttrsFormat implements WamlAttrsParser<Repr, Attrs, Object>, WamlAttrsWriter<Repr, Object>, WriteSource {

    @Override
    public WamlParser<Repr> getAttrValueParser(@Nullable String name) throws WamlException {
      return WamlReprs.tupleFormat();
    }

    @Override
    public @Nullable Attrs emptyAttrs() throws WamlException {
      return null;
    }

    @Override
    public Attrs attrsBuilder() throws WamlException {
      return Attrs.of();
    }

    @Override
    public Attrs updateAttr(Attrs builder, String name) throws WamlException {
      builder.put(name, UnitRepr.unit());
      return builder;
    }

    @Override
    public Attrs updateAttr(Attrs builder, String name, @Nullable Repr value) throws WamlException {
      Objects.requireNonNull(value, "value");
      builder.put(name, value);
      return builder;
    }

    @Override
    public Object buildAttrs(Attrs builder) throws WamlException {
      return builder;
    }

    @Override
    public @Nullable Iterator<String> getAttrNames(@Nullable Object attrs) throws WamlException {
      if (!(attrs instanceof Attrs)) {
        return null;
      }
      return ((Attrs) attrs).keyIterator();
    }

    @Override
    public @Nullable Repr getAttrValue(@Nullable Object attrs, String name) throws WamlException {
      if (!(attrs instanceof Attrs)) {
        return null;
      }
      return ((Attrs) attrs).get(name);
    }

    @Override
    public <V extends Repr> WamlWriter<V> getAttrValueWriter(@Nullable Object attrs, String name, @Nullable V value) throws WamlException {
      return Assume.contravariant(WamlReprs.valueFormat());
    }

    @Override
    public boolean isEmptyAttrs(@Nullable Object attrs) {
      return !(attrs instanceof Attrs) || ((Attrs) attrs).isEmpty();
    }

    @Override
    public boolean isNullaryAttr(@Nullable Object attrs, String name, @Nullable Repr value) {
      return UnitRepr.unit().equals(value);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "attrsFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final AttrsFormat INSTANCE = new AttrsFormat();

  }

  static final class UndefinedFormat implements WamlFormat<UndefinedRepr>, WamlIdentifierParser<UndefinedRepr>, WamlIdentifierWriter<UndefinedRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "undefined";
    }

    @Override
    public @Nullable Object getAttrs(@Nullable UndefinedRepr value) {
      if (value == null) {
        return null;
      }
      return value.attrs();
    }

    @Override
    public UndefinedRepr fromIdentifier(@Nullable Object attrs, String value, WamlParserOptions options) throws WamlException {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      if ("undefined".equals(value)) {
        return UndefinedRepr.undefined().withAttrs((Attrs) attrs);
      }
      throw new WamlException("unsupported identifier: " + value);
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
    public UndefinedRepr initializer(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return UndefinedRepr.undefined().withAttrs((Attrs) attrs);
    }

    @Override
    public Write<?> writeBlock(Output<?> output, @Nullable UndefinedRepr value, WamlWriterOptions options) {
      if (value == null || value.attrs().isEmpty()) {
        return Write.done();
      }
      return WamlIdentifierWriter.super.writeBlock(output, value, options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "undefinedFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final UndefinedFormat INSTANCE = new UndefinedFormat();

  }

  static final class UnitFormat implements WamlFormat<UnitRepr>, WamlTupleParser<Repr, UnitRepr, UnitRepr>, WamlTupleWriter<Repr, UnitRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "unit";
    }

    @Override
    public @Nullable Object getAttrs(@Nullable UnitRepr value) {
      if (value == null) {
        return null;
      }
      return value.attrs();
    }

    @Override
    public WamlParser<Repr> valueParser() {
      return WamlReprs.valueFormat();
    }

    @Override
    public UnitRepr emptyTuple(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return UnitRepr.unit().withAttrs((Attrs) attrs);
    }

    @Override
    public UnitRepr unaryTuple(@Nullable Object attrs, @Nullable Repr value) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return UnitRepr.unit().withAttrs((Attrs) attrs);
    }

    @Override
    public UnitRepr tupleBuilder(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return UnitRepr.unit().withAttrs((Attrs) attrs);
    }

    @Override
    public UnitRepr appendValue(UnitRepr builder, @Nullable Repr value) {
      return builder;
    }

    @Override
    public UnitRepr appendField(UnitRepr builder, @Nullable Repr key, @Nullable Repr value) {
      return builder;
    }

    @Override
    public UnitRepr buildTuple(@Nullable Object attrs, UnitRepr builder) throws WamlException {
      return builder;
    }

    @Override
    public @Nullable Iterator<? extends Map.Entry<String, Repr>> getFields(@Nullable UnitRepr value) {
      return null;
    }

    @Override
    public WamlWriter<String> keyWriter() {
      return WamlLang.keyFormat();
    }

    @Override
    public WamlWriter<Repr> valueWriter() {
      return WamlReprs.valueFormat();
    }

    @Override
    public boolean isInline(@Nullable UnitRepr value) {
      return value == null || value.attrs().size() == 1;
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
    public UnitRepr initializer(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return UnitRepr.unit().withAttrs((Attrs) attrs);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object attrs,
                          @Nullable UnitRepr value, WamlWriterOptions options) {
      return this.writeUnit(output, attrs, options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "unitFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final UnitFormat INSTANCE = new UnitFormat();

  }

  static final class IdentifierFormat implements WamlFormat<Repr>, WamlIdentifierParser<Repr>, WamlIdentifierWriter<Repr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "identifier";
    }

    @Override
    public @Nullable Object getAttrs(@Nullable Repr value) {
      if (value == null) {
        return null;
      }
      return value.attrs();
    }

    @Override
    public Repr fromIdentifier(@Nullable Object attrs, String value, WamlParserOptions options) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      switch (value) {
        case "undefined":
          return UndefinedRepr.undefined().withAttrs((Attrs) attrs);
        case "null":
          return UnitRepr.unit().withAttrs((Attrs) attrs);
        case "false":
          return BooleanRepr.of(false).withAttrs((Attrs) attrs);
        case "true":
          return BooleanRepr.of(true).withAttrs((Attrs) attrs);
        default:
          if (options.exprsEnabled()) {
            return TermRepr.of(new ChildExpr(ContextExpr.of(), Term.of(value))).withAttrs((Attrs) attrs);
          }
          return WamlReprs.cacheString(value).withAttrs((Attrs) attrs);
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
    public Repr initializer(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return UndefinedRepr.undefined().withAttrs((Attrs) attrs);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "identifierFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final IdentifierFormat INSTANCE = new IdentifierFormat();

  }

  static final class BooleanFormat implements WamlFormat<BooleanRepr>, WamlIdentifierParser<BooleanRepr>, WamlIdentifierWriter<BooleanRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "boolean";
    }

    @Override
    public @Nullable Object getAttrs(@Nullable BooleanRepr value) {
      if (value == null) {
        return null;
      }
      return value.attrs();
    }

    @Override
    public BooleanRepr fromIdentifier(@Nullable Object attrs, String value, WamlParserOptions options) throws WamlException {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      if ("true".equals(value)) {
        return BooleanRepr.of(true).withAttrs((Attrs) attrs);
      } else if ("false".equals(value)) {
        return BooleanRepr.of(false).withAttrs((Attrs) attrs);
      }
      throw new WamlException("unsupported identifier: " + value);
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
    public BooleanRepr initializer(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return BooleanRepr.of(false).withAttrs((Attrs) attrs);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "booleanFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final BooleanFormat INSTANCE = new BooleanFormat();

  }

  static final class NumberFormat implements WamlFormat<NumberRepr>, WamlNumberParser<NumberRepr>, WamlNumberWriter<NumberRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "number";
    }

    @Override
    public @Nullable Object getAttrs(@Nullable NumberRepr value) {
      if (value == null) {
        return null;
      }
      return value.attrs();
    }

    @Override
    public NumberRepr fromInteger(@Nullable Object attrs, long value) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      if (value == (long) (int) value) {
        return NumberRepr.of((int) value).withAttrs((Attrs) attrs);
      } else {
        return NumberRepr.of(value).withAttrs((Attrs) attrs);
      }
    }

    @Override
    public NumberRepr fromHexadecimal(@Nullable Object attrs, long value, int digits) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      if (value == (long) (int) value && digits <= 8) {
        return NumberRepr.of((int) value).withAttrs((Attrs) attrs);
      } else {
        return NumberRepr.of(value).withAttrs((Attrs) attrs);
      }
    }

    @Override
    public NumberRepr fromBigInteger(@Nullable Object attrs, String value) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return NumberRepr.of(new BigInteger(value)).withAttrs((Attrs) attrs);
    }

    @Override
    public NumberRepr fromDecimal(@Nullable Object attrs, String value) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return NumberRepr.parse(value).withAttrs((Attrs) attrs);
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
    public NumberRepr initializer(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return NumberRepr.of(0).withAttrs((Attrs) attrs);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object attrs,
                          @Nullable NumberRepr value, WamlWriterOptions options) {
      if (value == null) {
        return this.writeUnit(output, attrs, options);
      } else if (value.isValidInt()) {
        return this.writeInt(output, attrs, value.intValue(), options);
      } else if (value.isValidLong()) {
        return this.writeLong(output, attrs, value.longValue(), options);
      } else if (value.isValidFloat()) {
        return this.writeFloat(output, attrs, value.floatValue(), options);
      } else if (value.isValidDouble()) {
        return this.writeDouble(output, attrs, value.doubleValue(), options);
      } else if (value.isValidBigInteger()) {
        return this.writeBigInteger(output, attrs, value.bigIntegerValue(), options);
      }
      return this.writeNumber(output, attrs, value.numberValue(), options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "numberFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final NumberFormat INSTANCE = new NumberFormat();

  }

  static final class StringFormat implements WamlFormat<StringRepr>, WamlStringParser<StringBuilder, StringRepr>, WamlStringWriter<StringRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "string";
    }

    @Override
    public @Nullable Object getAttrs(@Nullable StringRepr value) {
      if (value == null) {
        return null;
      }
      return value.attrs();
    }

    @Override
    public StringBuilder stringBuilder(@Nullable Object attrs) {
      return new StringBuilder();
    }

    @Override
    public StringBuilder appendCodePoint(StringBuilder builder, int c) {
      return builder.appendCodePoint(c);
    }

    @Override
    public StringRepr buildString(@Nullable Object attrs, StringBuilder builder) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return WamlReprs.cacheString(builder.toString()).withAttrs((Attrs) attrs);
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
    public StringRepr initializer(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return StringRepr.empty().withAttrs((Attrs) attrs);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "stringFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final StringFormat INSTANCE = new StringFormat();

  }

  static final class BlobFormat implements WamlFormat<BlobRepr>, WamlStringParser<Output<BlobRepr>, BlobRepr>, WamlStringWriter<BlobRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "base64";
    }

    @Override
    public @Nullable Object getAttrs(@Nullable BlobRepr value) {
      if (value == null) {
        return null;
      }
      return value.attrs().updated("blob", UnitRepr.unit());
    }

    @Override
    public Output<BlobRepr> stringBuilder(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      } else {
        attrs = ((Attrs) attrs).removed("blob");
      }
      return Base64.standard().decodedOutput(new BlobReprOutput(BlobRepr.of().withAttrs((Attrs) attrs)));
    }

    @Override
    public Output<BlobRepr> appendCodePoint(Output<BlobRepr> builder, int c) {
      if (builder.isCont()) {
        builder.write(c);
      }
      return builder;
    }

    @Override
    public @Nullable BlobRepr buildString(@Nullable Object attrs, Output<BlobRepr> builder) throws WamlException {
      try {
        return builder.get();
      } catch (OutputException cause) {
        throw new WamlException("malformed base-64 string", cause);
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
    public BlobRepr initializer(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return BlobRepr.empty().withAttrs((Attrs) attrs);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "blobFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final BlobFormat INSTANCE = new BlobFormat();

  }

  static final class TermFormat implements WamlFormat<Repr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return null;
    }

    @Override
    public @Nullable Object getAttrs(@Nullable Repr value) {
      if (value == null) {
        return null;
      }
      return value.attrs();
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
    public Repr initializer(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return UndefinedRepr.undefined().withAttrs((Attrs) attrs);
    }

    @Override
    public Parse<Repr> parse(Input input, WamlParserOptions options) {
      return ParseWamlRepr.parse(input, this, options, null);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object attrs,
                          @Nullable Repr value, WamlWriterOptions options) {
      if (value instanceof TermRepr) {
        return this.writeTerm(output, attrs, ((TermRepr) value).term(), options);
      }
      return WamlReprs.valueFormat().write(output, attrs, value, options);
    }

    @Override
    public Write<?> writeBlock(Output<?> output, @Nullable Repr value, WamlWriterOptions options) {
      if (value instanceof TermRepr) {
        return this.writeTerm(output, value.attrs(), ((TermRepr) value).term(), options);
      }
      return WamlReprs.valueFormat().writeBlock(output, value, options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "termFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final TermFormat INSTANCE = new TermFormat();

  }

  static final class MarkupFormat implements WamlFormat<ArrayRepr>, WamlMarkupParser<Repr, ArrayRepr, ArrayRepr>, WamlMarkupWriter<Repr, ArrayRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "markup";
    }

    @Override
    public @Nullable Object getAttrs(@Nullable ArrayRepr value) {
      if (value == null) {
        return null;
      }
      return value.attrs();
    }

    @Override
    public WamlParser<Repr> nodeParser() {
      return WamlReprs.valueFormat();
    }

    @Override
    public ArrayRepr markupBuilder(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return ArrayRepr.of().withAttrs((Attrs) attrs).asMarkup();
    }

    @Override
    public ArrayRepr appendNode(ArrayRepr builder, @Nullable Repr node) {
      Objects.requireNonNull(node, "node");
      builder.add(node);
      return builder;
    }

    @Override
    public ArrayRepr appendText(ArrayRepr builder, String text) {
      builder.add(StringRepr.of(text));
      return builder;
    }

    @Override
    public ArrayRepr buildMarkup(@Nullable Object attrs, ArrayRepr builder) {
      return builder;
    }

    @Override
    public WamlWriter<Repr> nodeWriter() {
      return WamlReprs.valueFormat();
    }

    @Override
    public @Nullable String asText(@Nullable Repr node) {
      if (node instanceof StringRepr) {
        return ((StringRepr) node).stringValue();
      }
      return null;
    }

    @Override
    public @Nullable Iterator<? extends Repr> intoNodes(@Nullable ArrayRepr value) {
      if (value == null) {
        return null;
      }
      return value.iterator();
    }

    @Override
    public boolean isInline(@Nullable ArrayRepr value) {
      return value != null && value.isMarkup() && value.attrs().size() <= 1;
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
    public ArrayRepr initializer(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return ArrayRepr.empty().withAttrs((Attrs) attrs);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "markupFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final MarkupFormat INSTANCE = new MarkupFormat();

  }

  static final class ArrayFormat implements WamlFormat<ArrayRepr>, WamlArrayParser<Repr, ArrayRepr, ArrayRepr>, WamlArrayWriter<Repr, ArrayRepr>, WamlMarkupWriter<Repr, ArrayRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "array";
    }

    @Override
    public WamlMarkupParser<?, ?, ArrayRepr> markupParser() throws WamlException {
      return WamlReprs.markupFormat().markupParser();
    }

    @Override
    public @Nullable Object getAttrs(@Nullable ArrayRepr value) {
      if (value == null) {
        return null;
      }
      return value.attrs();
    }

    @Override
    public WamlParser<Repr> elementParser() {
      return WamlReprs.valueFormat();
    }

    @Override
    public ArrayRepr arrayBuilder(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return ArrayRepr.of().withAttrs((Attrs) attrs);
    }

    @Override
    public ArrayRepr appendElement(ArrayRepr builder, @Nullable Repr element) {
      Objects.requireNonNull(element, "element");
      builder.add(element);
      return builder;
    }

    @Override
    public ArrayRepr buildArray(@Nullable Object attrs, ArrayRepr builder) {
      return builder;
    }

    @Override
    public @Nullable Iterator<? extends Repr> getElements(@Nullable ArrayRepr value) {
      if (value == null) {
        return null;
      }
      return value.iterator();
    }

    @Override
    public WamlWriter<Repr> elementWriter() {
      return WamlReprs.valueFormat();
    }

    @Override
    public WamlWriter<Repr> nodeWriter() {
      return WamlReprs.valueFormat();
    }

    @Override
    public @Nullable String asText(@Nullable Repr node) {
      if (node instanceof StringRepr) {
        return ((StringRepr) node).stringValue();
      }
      return null;
    }

    @Override
    public @Nullable Iterator<? extends Repr> intoNodes(@Nullable ArrayRepr value) {
      if (value == null) {
        return null;
      }
      return value.iterator();
    }

    @Override
    public boolean isInline(@Nullable ArrayRepr value) {
      return value != null && value.isMarkup() && value.attrs().size() <= 1;
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
    public ArrayRepr initializer(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return ArrayRepr.empty().withAttrs((Attrs) attrs);
    }

    @Override
    public Parse<ArrayRepr> parse(Input input, WamlParserOptions options) {
      return this.parseValue(input, options);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object attrs,
                          @Nullable ArrayRepr value, WamlWriterOptions options) {
      if (value != null && value.isMarkup()) {
        return WamlMarkupWriter.super.write(output, attrs, value, options);
      }
      return WamlArrayWriter.super.write(output, attrs, value, options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "arrayFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final ArrayFormat INSTANCE = new ArrayFormat();

  }

  static final class ObjectFormat implements WamlFormat<ObjectRepr>, WamlObjectFormat<Repr, ObjectRepr, ObjectRepr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "object";
    }

    @Override
    public WamlFieldFormat<? extends Repr, ObjectRepr> getFieldFormat(@Nullable ObjectRepr object, String key) {
      return WamlFieldFormat.forKey(key, WamlLang.keyFormat(), WamlReprs.valueFormat(), FilterMode.DEFAULT);
    }

    @Override
    public Iterator<WamlFieldFormat<? extends Repr, ObjectRepr>> getFieldFormats(@Nullable ObjectRepr object) {
      if (object == null) {
        return Collections.emptyIterator();
      }
      return WamlCollections.mapFieldFormatIterator(object.keyIterator(), WamlLang.keyFormat(),
                                                    WamlReprs.valueFormat(), FilterMode.DEFAULT);
    }

    @Override
    public Iterator<WamlFieldFormat<? extends Repr, ObjectRepr>> getDeclaredFieldFormats() {
      return Collections.emptyIterator();
    }

    @Override
    public @Nullable Object getAttrs(@Nullable ObjectRepr value) {
      if (value == null) {
        return null;
      }
      return value.attrs();
    }

    @Override
    public ObjectRepr objectBuilder(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return ObjectRepr.of().withAttrs((Attrs) attrs);
    }

    @Override
    public WamlFieldParser<? extends Repr, ObjectRepr> getFieldParser(ObjectRepr object, String key) {
      return WamlFieldParser.forKey(key, WamlReprs.valueFormat());
    }

    @Override
    public @Nullable ObjectRepr buildObject(@Nullable Object attrs, ObjectRepr builder) {
      return builder;
    }

    @Override
    public WamlFieldWriter<? extends Repr, ObjectRepr> getFieldWriter(ObjectRepr object, String key) {
      return WamlFieldWriter.forKey(key, WamlLang.keyFormat(), WamlReprs.valueFormat(), FilterMode.DEFAULT);
    }

    @Override
    public Iterator<WamlFieldWriter<? extends Repr, ObjectRepr>> getFieldWriters(ObjectRepr object) {
      return Assume.conforms(WamlCollections.mapFieldFormatIterator(object.keyIterator(), WamlLang.keyFormat(),
                                                                    WamlReprs.valueFormat(), FilterMode.DEFAULT));
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
    public ObjectRepr initializer(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return ObjectRepr.empty().withAttrs((Attrs) attrs);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "objectFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final ObjectFormat INSTANCE = new ObjectFormat();

  }

  static final class TupleFormat implements WamlFormat<Repr>, WamlTupleParser<Repr, TupleRepr, Repr>, WamlTupleWriter<Repr, Repr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "tuple";
    }

    @Override
    public @Nullable Object getAttrs(@Nullable Repr value) {
      if (value == null) {
        return null;
      }
      return value.attrs();
    }

    @Override
    public WamlParser<Repr> valueParser() {
      return WamlReprs.valueFormat();
    }

    @Override
    public Repr emptyTuple(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return UnitRepr.unit().withAttrs((Attrs) attrs);
    }

    @Override
    public Repr unaryTuple(@Nullable Object attrs, @Nullable Repr value) {
      Objects.requireNonNull(value, "value");
      if (!(attrs instanceof Attrs) || ((Attrs) attrs).isEmpty()) {
        return value;
      } else if (value.attrs().isEmpty()) {
        return value.withAttrs((Attrs) attrs);
      } else {
        final Attrs newAttrs = ((Attrs) attrs).asMutable();
        newAttrs.putAll(value.attrs());
        return value.withAttrs(newAttrs);
      }
    }

    @Override
    public TupleRepr tupleBuilder(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return TupleRepr.of().withAttrs((Attrs) attrs);
    }

    @Override
    public TupleRepr appendValue(TupleRepr builder, @Nullable Repr value) {
      Objects.requireNonNull(value, "value");
      builder.add(value);
      return builder;
    }

    @Override
    public TupleRepr appendField(TupleRepr builder, @Nullable Repr key, @Nullable Repr value) {
      Objects.requireNonNull(key, "key");
      Objects.requireNonNull(value, "value");
      String keyString = null;
      if (key.isValidString()) {
        keyString = key.stringValue();
      } else if (key instanceof TermRepr) {
        final Term term = ((TermRepr) key).term();
        if (term instanceof ChildExpr && ((ChildExpr) term).scope() instanceof ContextExpr) {
          final Term childKey = ((ChildExpr) term).key();
          if (childKey.isValidString()) {
            keyString = childKey.stringValue();
          }
        }
      }
      if (keyString != null) {
        builder.put(keyString, value);
      } else {
        builder.add(value);
      }
      return builder;
    }

    @Override
    public @Nullable Repr buildTuple(@Nullable Object attrs, @Nullable TupleRepr builder) {
      return builder;
    }

    @Override
    public @Nullable Iterator<? extends Map.Entry<String, Repr>> getFields(@Nullable Repr value) {
      if (value == null) {
        return null;
      } else if (value instanceof TupleRepr) {
        return ((TupleRepr) value).iterator();
      }
      return Iterators.unary(new SimpleImmutableEntry<String, Repr>(null, value));
    }

    @Override
    public WamlWriter<String> keyWriter() {
      return WamlLang.keyFormat();
    }

    @Override
    public WamlWriter<Repr> valueWriter() {
      return WamlReprs.valueFormat();
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
    public TupleRepr initializer(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return TupleRepr.empty().withAttrs((Attrs) attrs);
    }

    @Override
    public Write<?> writeBlock(Output<?> output, @Nullable Repr value, WamlWriterOptions options) {
      if (value instanceof TupleRepr) {
        return WamlTupleWriter.super.writeBlock(output, value, options);
      }
      return WamlReprs.valueFormat().writeBlock(output, value, options);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "tupleFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final TupleFormat INSTANCE = new TupleFormat();

  }

  static final class ValueFormat implements WamlFormat<Repr>, WriteSource {

    @Override
    public @Nullable String typeName() {
      return "any";
    }

    @Override
    public WamlFormat<Repr> withAttrs(@Nullable Object attrs) {
      if (attrs instanceof Attrs attributes) {
        if (attributes.containsKey("blob")) {
          return Assume.covariant(WamlReprs.blobFormat());
        }
      }
      return this;
    }

    @Override
    public @Nullable Object getAttrs(@Nullable Repr value) throws WamlException {
      if (value == null) {
        return null;
      } else if (value instanceof BlobRepr) {
        return WamlReprs.blobFormat().getAttrs((BlobRepr) value);
      }
      return value.attrs();
    }

    @Override
    public WamlIdentifierParser<Repr> identifierParser() throws WamlException {
      return WamlReprs.identifierFormat().identifierParser();
    }

    @Override
    public WamlNumberParser<Repr> numberParser() throws WamlException {
      return Assume.covariant(WamlReprs.numberFormat().numberParser());
    }

    @Override
    public WamlStringParser<?, Repr> stringParser() throws WamlException {
      return Assume.covariant(WamlReprs.stringFormat().stringParser());
    }

    @Override
    public WamlMarkupParser<?, ?, Repr> markupParser() throws WamlException {
      return Assume.covariant(WamlReprs.markupFormat().markupParser());
    }

    @Override
    public WamlArrayParser<?, ?, Repr> arrayParser() throws WamlException {
      return Assume.covariant(WamlReprs.arrayFormat().arrayParser());
    }

    @Override
    public WamlObjectParser<?, ?, Repr> objectParser() throws WamlException {
      return Assume.covariant(WamlReprs.objectFormat().objectParser());
    }

    @Override
    public WamlTupleParser<?, ?, Repr> tupleParser() throws WamlException {
      return WamlReprs.tupleFormat().tupleParser();
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
    public Repr initializer(@Nullable Object attrs) {
      if (!(attrs instanceof Attrs)) {
        attrs = Attrs.empty();
      }
      return UnitRepr.unit().withAttrs((Attrs) attrs);
    }

    @Override
    public Parse<Repr> parse(Input input, WamlParserOptions options) {
      return ParseWamlRepr.parse(input, this, options, null);
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable Object attrs,
                          @Nullable Repr value, WamlWriterOptions options) {
      if (value == null) {
        return this.writeUnit(output, attrs, options);
      } else if (value instanceof UndefinedRepr) {
        return WamlReprs.undefinedFormat().write(output, attrs, (UndefinedRepr) value, options);
      } else if (value instanceof UnitRepr) {
        return WamlReprs.unitFormat().write(output, attrs, (UnitRepr) value, options);
      } else if (value instanceof BooleanRepr) {
        return WamlReprs.booleanFormat().write(output, attrs, (BooleanRepr) value, options);
      } else if (value instanceof NumberRepr) {
        return WamlReprs.numberFormat().write(output, attrs, (NumberRepr) value, options);
      } else if (value instanceof StringRepr) {
        return WamlReprs.stringFormat().write(output, attrs, (StringRepr) value, options);
      } else if (value instanceof BlobRepr) {
        return WamlReprs.blobFormat().write(output, attrs, (BlobRepr) value, options);
      } else if (value instanceof TermRepr) {
        return WamlReprs.termFormat().write(output, attrs, (TermRepr) value, options);
      } else if (value instanceof ArrayRepr && ((ArrayRepr) value).isMarkup()) {
        return WamlReprs.markupFormat().write(output, attrs, (ArrayRepr) value, options);
      } else if (value instanceof ArrayRepr) {
        return WamlReprs.arrayFormat().write(output, attrs, (ArrayRepr) value, options);
      } else if (value instanceof ObjectRepr) {
        return WamlReprs.objectFormat().write(output, attrs, (ObjectRepr) value, options);
      } else if (value instanceof TupleRepr) {
        return WamlReprs.tupleFormat().write(output, attrs, (TupleRepr) value, options);
      }
      return Write.error(new WamlException("unsupported value: " + value));
    }

    @Override
    public Write<?> writeBlock(Output<?> output, @Nullable Repr value, WamlWriterOptions options) {
      if (value == null) {
        return Write.done();
      } else if (value instanceof UndefinedRepr) {
        return WamlReprs.undefinedFormat().writeBlock(output, (UndefinedRepr) value, options);
      } else if (value instanceof UnitRepr) {
        return WamlReprs.unitFormat().writeBlock(output, (UnitRepr) value, options);
      } else if (value instanceof BooleanRepr) {
        return WamlReprs.booleanFormat().writeBlock(output, (BooleanRepr) value, options);
      } else if (value instanceof NumberRepr) {
        return WamlReprs.numberFormat().writeBlock(output, (NumberRepr) value, options);
      } else if (value instanceof StringRepr) {
        return WamlReprs.stringFormat().writeBlock(output, (StringRepr) value, options);
      } else if (value instanceof BlobRepr) {
        return WamlReprs.blobFormat().writeBlock(output, (BlobRepr) value, options);
      } else if (value instanceof TermRepr) {
        return WamlReprs.termFormat().writeBlock(output, (TermRepr) value, options);
      } else if (value instanceof ArrayRepr && ((ArrayRepr) value).isMarkup()) {
        return WamlReprs.markupFormat().writeBlock(output, (ArrayRepr) value, options);
      } else if (value instanceof ArrayRepr) {
        return WamlReprs.arrayFormat().writeBlock(output, (ArrayRepr) value, options);
      } else if (value instanceof ObjectRepr) {
        return WamlReprs.objectFormat().writeBlock(output, (ObjectRepr) value, options);
      } else if (value instanceof TupleRepr) {
        return WamlReprs.tupleFormat().writeBlock(output, (TupleRepr) value, options);
      }
      return Write.error(new WamlException("unsupported value: " + value));
    }

    @Override
    public boolean isInline(@Nullable Repr value) {
      return (value instanceof ArrayRepr && ((ArrayRepr) value).isMarkup() && value.attrs().size() <= 1)
          || (value instanceof UnitRepr && value.attrs().size() == 1);
    }

    @Override
    public Write<?> writeInline(Output<?> output, @Nullable Repr value, WamlWriterOptions options) {
      if (value instanceof UndefinedRepr) {
        return WamlReprs.undefinedFormat().writeInline(output, (UndefinedRepr) value, options);
      } else if (value instanceof UnitRepr) {
        return WamlReprs.unitFormat().writeInline(output, (UnitRepr) value, options);
      } else if (value instanceof BooleanRepr) {
        return WamlReprs.booleanFormat().writeInline(output, (BooleanRepr) value, options);
      } else if (value instanceof NumberRepr) {
        return WamlReprs.numberFormat().writeInline(output, (NumberRepr) value, options);
      } else if (value instanceof StringRepr) {
        return WamlReprs.stringFormat().writeInline(output, (StringRepr) value, options);
      } else if (value instanceof BlobRepr) {
        return WamlReprs.blobFormat().writeInline(output, (BlobRepr) value, options);
      } else if (value instanceof TermRepr) {
        return WamlReprs.termFormat().writeInline(output, (TermRepr) value, options);
      } else if (value instanceof ArrayRepr && ((ArrayRepr) value).isMarkup()) {
        return WamlReprs.markupFormat().writeInline(output, (ArrayRepr) value, options);
      } else if (value instanceof ArrayRepr) {
        return WamlReprs.arrayFormat().writeInline(output, (ArrayRepr) value, options);
      } else if (value instanceof ObjectRepr) {
        return WamlReprs.objectFormat().writeInline(output, (ObjectRepr) value, options);
      } else if (value instanceof TupleRepr) {
        return WamlReprs.tupleFormat().writeInline(output, (TupleRepr) value, options);
      }
      return Write.error(new WamlException("unsupported value: " + value));
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlReprs", "valueFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final ValueFormat INSTANCE = new ValueFormat();

  }

}

final class ParseWamlRepr extends Parse<Repr> {

  final WamlParser<Repr> parser;
  final WamlParserOptions options;
  final @Nullable Parse<Object> parseExpr;

  ParseWamlRepr(WamlParser<Repr> parser, WamlParserOptions options,
                @Nullable Parse<Object> parseExpr) {
    this.parser = parser;
    this.options = options;
    this.parseExpr = parseExpr;
  }

  @Override
  public Parse<Repr> consume(Input input) {
    return ParseWamlRepr.parse(input, this.parser, this.options, this.parseExpr);
  }

  static Parse<Repr> parse(Input input, WamlParser<Repr> parser, WamlParserOptions options,
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
    return new ParseWamlRepr(parser, options, parseExpr);
  }

}
