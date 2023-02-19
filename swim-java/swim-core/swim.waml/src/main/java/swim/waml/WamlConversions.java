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

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.Write;
import swim.expr.ContextExpr;
import swim.expr.ExprParser;
import swim.expr.Term;
import swim.expr.selector.ChildExpr;
import swim.repr.ArrayRepr;
import swim.repr.Attrs;
import swim.repr.ObjectRepr;
import swim.repr.Repr;
import swim.repr.StringRepr;
import swim.repr.TermRepr;
import swim.repr.TupleRepr;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class WamlConversions implements WamlProvider, ToSource {

  final int priority;

  private WamlConversions(int priority) {
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable WamlForm<?> resolveWamlForm(Type javaType) {
    final Class<?> javaClass;
    if (javaType instanceof Class<?>) {
      javaClass = (Class<?>) javaType;
    } else if (javaType instanceof ParameterizedType) {
      final Type rawType = ((ParameterizedType) javaType).getRawType();
      if (rawType instanceof Class<?>) {
        javaClass = (Class<?>) rawType;
      } else {
        return null;
      }
    } else {
      return null;
    }

    WamlForm<?> form = WamlConversions.stringConversionForm(javaClass);
    if (form == null) {
      form = WamlConversions.reprConversionForm(javaClass);
    }
    return form;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlConversions", "provider");
    if (this.priority != GENERIC_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final WamlConversions PROVIDER = new WamlConversions(GENERIC_PRIORITY);

  public static WamlConversions provider(int priority) {
    if (priority == GENERIC_PRIORITY) {
      return PROVIDER;
    } else {
      return new WamlConversions(priority);
    }
  }

  public static WamlConversions provider() {
    return PROVIDER;
  }

  public static @Nullable WamlForm<?> stringConversionForm(Class<?> javaClass) {
    try {
      // public static T fromWamlString(String value);
      final Method fromWamlStringMethod = javaClass.getDeclaredMethod("fromWamlString", String.class);
      // public static String toWamlString(T object);
      final Method toWamlStringMethod = javaClass.getDeclaredMethod("toWamlString", javaClass);
      if ((fromWamlStringMethod.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
          && javaClass.isAssignableFrom(fromWamlStringMethod.getReturnType())
          && (toWamlStringMethod.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
          && String.class.isAssignableFrom(toWamlStringMethod.getReturnType())) {
        return new WamlStringConversionForm<Object>(fromWamlStringMethod, toWamlStringMethod);
      }
    } catch (ReflectiveOperationException cause) {
      // ignore
    }
    return null;
  }

  public static @Nullable WamlForm<?> reprConversionForm(Class<?> javaClass) {
    try {
      // public static T fromWamlRepr(Repr repr);
      final Method fromWamlReprMethod = javaClass.getDeclaredMethod("fromWamlRepr", Repr.class);
      // public static Repr toWamlRepr(T object);
      final Method toWamlReprMethod = javaClass.getDeclaredMethod("toWamlRepr", javaClass);
      if ((fromWamlReprMethod.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
          && !javaClass.isAssignableFrom(fromWamlReprMethod.getReturnType())
          && (toWamlReprMethod.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
          && Repr.class.isAssignableFrom(toWamlReprMethod.getReturnType())) {
        return new WamlReprConversionForm<Object>(Attrs.empty(), fromWamlReprMethod, toWamlReprMethod);
      }
    } catch (ReflectiveOperationException cause) {
      // ignore
    }
    return null;
  }

}

final class WamlStringConversionForm<T> implements WamlStringForm<StringBuilder, T>, ToSource {

  final Method fromWamlStringMethod;
  final Method toWamlStringMethod;

  WamlStringConversionForm(Method fromWamlStringMethod, Method toWamlStringMethod) {
    this.fromWamlStringMethod = fromWamlStringMethod;
    this.toWamlStringMethod = toWamlStringMethod;
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
  public @Nullable T buildString(StringBuilder builder) {
    try {
      return Assume.conformsNullable(this.fromWamlStringMethod.invoke(null, builder.toString()));
    } catch (ReflectiveOperationException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T object, WamlWriter writer) {
    try {
      return WamlJava.stringForm().write(output, (String) this.toWamlStringMethod.invoke(null, object), writer);
    } catch (ReflectiveOperationException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public Write<?> writeBlock(Output<?> output, @Nullable T object, WamlWriter writer) {
    try {
      return WamlJava.stringForm().writeBlock(output, (String) this.toWamlStringMethod.invoke(null, object), writer);
    } catch (ReflectiveOperationException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public Term intoTerm(@Nullable T value) {
    return Term.from(value);
  }

  @Override
  public @Nullable T fromTerm(Term term) {
    return Assume.conformsNullable(term.objectValue(this.fromWamlStringMethod.getDeclaringClass()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlConversions", "stringConversionForm")
            .appendArgument(this.fromWamlStringMethod.getDeclaringClass())
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}

final class WamlReprConversionForm<T> extends WamlReprForm<T> implements WamlUndefinedForm<T>, WamlUnitForm<T>, WamlNumberForm<T>, WamlIdentifierForm<T>, WamlStringForm<StringBuilder, T>, WamlArrayForm<Repr, ArrayRepr, T>, WamlMarkupForm<Repr, ArrayRepr, T>, WamlFieldForm<String, Repr, ObjectRepr>, WamlObjectForm<String, Repr, ObjectRepr, T>, WamlTupleForm<String, Repr, TupleRepr, T>, ToSource {

  final Method fromWamlReprMethod;
  final Method toWamlReprMethod;

  WamlReprConversionForm(Attrs attrs, Method fromWamlReprMethod, Method toWamlReprMethod) {
    super(attrs);
    this.fromWamlReprMethod = fromWamlReprMethod;
    this.toWamlReprMethod = toWamlReprMethod;
  }

  @Nullable T fromWamlRepr(Repr value) {
    try {
      return Assume.conformsNullable(this.fromWamlReprMethod.invoke(null, value));
    } catch (ReflectiveOperationException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  Repr toWamlRepr(@Nullable T object) {
    try {
      return (Repr) this.toWamlReprMethod.invoke(null, object);
    } catch (ReflectiveOperationException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public WamlForm<T> withAttrs(Attrs attrs) {
    return new WamlReprConversionForm<T>(this.attrs, this.fromWamlReprMethod, this.toWamlReprMethod);
  }

  @Override
  public WamlUndefinedForm<T> undefinedForm() {
    return this;
  }

  @Override
  public WamlUnitForm<T> unitForm() {
    return this;
  }

  @Override
  public WamlNumberForm<T> numberForm() {
    return this;
  }

  @Override
  public WamlIdentifierForm<T> identifierForm() {
    return this;
  }

  @Override
  public WamlStringForm<?, T> stringForm() {
    return this;
  }

  @Override
  public WamlArrayForm<?, ?, T> arrayForm() {
    return this;
  }

  @Override
  public WamlMarkupForm<?, ?, T> markupForm() {
    return this;
  }

  @Override
  public WamlObjectForm<?, ?, ?, T> objectForm() {
    return this;
  }

  @Override
  public WamlTupleForm<?, ?, ?, T> tupleForm() {
    return this;
  }

  @Override
  public @Nullable T undefinedValue() {
    return this.fromWamlRepr(Repr.undefined().withAttrs(this.attrs));
  }

  @Override
  public @Nullable T unitValue() {
    return this.fromWamlRepr(Repr.unit().withAttrs(this.attrs));
  }

  @Override
  public @Nullable T integerValue(long value) {
    return this.fromWamlRepr(Assume.nonNull(WamlReprs.numberForm().integerValue(value)).withAttrs(this.attrs));
  }

  @Override
  public @Nullable T hexadecimalValue(long value, int digits) {
    return this.fromWamlRepr(Assume.nonNull(WamlReprs.numberForm().hexadecimalValue(value, digits)).withAttrs(this.attrs));
  }

  @Override
  public @Nullable T bigIntegerValue(String value) {
    return this.fromWamlRepr(Assume.nonNull(WamlReprs.numberForm().bigIntegerValue(value)).withAttrs(this.attrs));
  }

  @Override
  public @Nullable T decimalValue(String value) {
    return this.fromWamlRepr(Assume.nonNull(WamlReprs.numberForm().decimalValue(value)).withAttrs(this.attrs));
  }

  @Override
  public @Nullable T identifierValue(String value, ExprParser parser) {
    return this.fromWamlRepr(Assume.nonNull(WamlReprs.identifierForm().identifierValue(value, parser)).withAttrs(this.attrs));
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
  public @Nullable T buildString(StringBuilder builder) {
    return this.fromWamlRepr(Assume.nonNull(WamlReprs.stringForm().buildString(builder)).withAttrs(this.attrs));
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
  public @Nullable T buildArray(ArrayRepr builder) {
    return this.fromWamlRepr(builder);
  }

  @Override
  public WamlForm<Repr> nodeForm() {
    return WamlReprs.reprForm();
  }

  @Override
  public @Nullable String asText(@Nullable Repr node) {
    return null;
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
  public @Nullable T buildMarkup(ArrayRepr builder) {
    return this.fromWamlRepr(builder);
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
  public @Nullable T buildObject(ObjectRepr builder) {
    return this.fromWamlRepr(builder);
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
  public @Nullable T emptyTuple() {
    return this.fromWamlRepr(Repr.unit().withAttrs(this.attrs));
  }

  @Override
  public @Nullable T unaryTuple(@Nullable Repr param) {
    Objects.requireNonNull(param);
    if (this.attrs.isEmpty()) {
      return this.fromWamlRepr(param);
    } else if (param.attrs().isEmpty()) {
      return this.fromWamlRepr(param.withAttrs(this.attrs));
    } else {
      final Attrs attrs = this.attrs.asMutable();
      attrs.putAll(param.attrs());
      return this.fromWamlRepr(param.withAttrs(attrs));
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
  public @Nullable T buildTuple(TupleRepr builder) {
    return this.fromWamlRepr(builder);
  }

  @Override
  public Parse<T> parse(Input input, WamlParser parser) {
    return parser.parseExpr(input, this);
  }

  @Override
  public Parse<T> parseBlock(Input input, WamlParser parser) {
    return parser.parseBlock(input, this);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T object, WamlWriter writer) {
    return WamlReprs.reprForm().write(output, this.toWamlRepr(object), writer);
  }

  @Override
  public Write<?> writeBlock(Output<?> output, @Nullable T object, WamlWriter writer) {
    return WamlReprs.reprForm().writeBlock(output, this.toWamlRepr(object), writer);
  }

  @Override
  public boolean isInline(@Nullable T object) {
    return WamlReprs.reprForm().isInline(this.toWamlRepr(object));
  }

  @Override
  public Write<?> writeInline(Output<?> output, @Nullable T object, WamlWriter writer) {
    return WamlReprs.reprForm().writeInline(output, this.toWamlRepr(object), writer);
  }

  @Override
  public Term intoTerm(@Nullable T object) {
    return Term.from(object);
  }

  @Override
  public @Nullable T fromTerm(Term term) {
    return Assume.conformsNullable(term.objectValue(this.fromWamlReprMethod.getDeclaringClass()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlConversions", "reprConversionForm")
            .appendArgument(this.fromWamlReprMethod.getDeclaringClass())
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
