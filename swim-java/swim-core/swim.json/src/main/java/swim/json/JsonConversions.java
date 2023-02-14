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
import swim.expr.ExprParser;
import swim.expr.Term;
import swim.repr.ArrayRepr;
import swim.repr.ObjectRepr;
import swim.repr.Repr;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class JsonConversions implements JsonProvider, ToSource {

  final int priority;

  private JsonConversions(int priority) {
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable JsonForm<?> resolveJsonForm(Type javaType) {
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

    JsonForm<?> form = JsonConversions.stringConversionForm(javaClass);
    if (form == null) {
      form = JsonConversions.reprConversionForm(javaClass);
    }
    return form;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonConversions", "provider");
    if (this.priority != GENERIC_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final JsonConversions PROVIDER = new JsonConversions(GENERIC_PRIORITY);

  public static JsonConversions provider(int priority) {
    if (priority == GENERIC_PRIORITY) {
      return PROVIDER;
    } else {
      return new JsonConversions(priority);
    }
  }

  public static JsonConversions provider() {
    return PROVIDER;
  }

  public static @Nullable JsonForm<?> stringConversionForm(Class<?> javaClass) {
    try {
      // public static T fromJsonString(String value);
      final Method fromJsonStringMethod = javaClass.getDeclaredMethod("fromJsonString", String.class);
      // public static String toJsonString(T object);
      final Method toJsonStringMethod = javaClass.getDeclaredMethod("toJsonString", javaClass);
      if ((fromJsonStringMethod.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
          && javaClass.isAssignableFrom(fromJsonStringMethod.getReturnType())
          && (toJsonStringMethod.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
          && String.class.isAssignableFrom(toJsonStringMethod.getReturnType())) {
        return new JsonStringConversionForm<Object>(fromJsonStringMethod, toJsonStringMethod);
      }
    } catch (ReflectiveOperationException cause) {
      // ignore
    }
    return null;
  }

  public static @Nullable JsonForm<?> reprConversionForm(Class<?> javaClass) {
    try {
      // public static T fromJsonRepr(Repr repr);
      final Method fromJsonReprMethod = javaClass.getDeclaredMethod("fromJsonRepr", Repr.class);
      // public static Repr toJsonRepr(T object);
      final Method toJsonReprMethod = javaClass.getDeclaredMethod("toJsonRepr", javaClass);
      if ((fromJsonReprMethod.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
          && !javaClass.isAssignableFrom(fromJsonReprMethod.getReturnType())
          && (toJsonReprMethod.getModifiers() & (Modifier.PUBLIC | Modifier.STATIC)) == (Modifier.PUBLIC | Modifier.STATIC)
          && Repr.class.isAssignableFrom(toJsonReprMethod.getReturnType())) {
        return new JsomReprConversionForm<Object>(fromJsonReprMethod, toJsonReprMethod);
      }
    } catch (ReflectiveOperationException cause) {
      // ignore
    }
    return null;
  }

}

final class JsonStringConversionForm<T> implements JsonStringForm<StringBuilder, T>, ToSource {

  final Method fromJsonStringMethod;
  final Method toJsonStringMethod;

  JsonStringConversionForm(Method fromJsonStringMethod, Method toJsonStringMethod) {
    this.fromJsonStringMethod = fromJsonStringMethod;
    this.toJsonStringMethod = toJsonStringMethod;
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
      return Assume.conformsNullable(this.fromJsonStringMethod.invoke(null, builder.toString()));
    } catch (ReflectiveOperationException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T object, JsonWriter writer) {
    try {
      return writer.writeString(output, (String) this.toJsonStringMethod.invoke(null, object));
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
    return Assume.conformsNullable(term.objectValue(this.fromJsonStringMethod.getDeclaringClass()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonConversions", "stringConversionForm")
            .appendArgument(this.fromJsonStringMethod.getDeclaringClass())
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}

final class JsomReprConversionForm<T> implements JsonUndefinedForm<T>, JsonNullForm<T>, JsonNumberForm<T>, JsonIdentifierForm<T>, JsonStringForm<StringBuilder, T>, JsonArrayForm<Repr, ArrayRepr, T>, JsonFieldForm<String, Repr, ObjectRepr>, JsonObjectForm<String, Repr, ObjectRepr, T>, ToSource {

  final Method fromJsonReprMethod;
  final Method toJsonReprMethod;

  JsomReprConversionForm(Method fromJsonReprMethod, Method toJsonReprMethod) {
    this.fromJsonReprMethod = fromJsonReprMethod;
    this.toJsonReprMethod = toJsonReprMethod;
  }

  @Nullable T fromJsonRepr(Repr repr) {
    try {
      return Assume.conformsNullable(this.fromJsonReprMethod.invoke(null, repr));
    } catch (ReflectiveOperationException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  Repr toJsonRepr(@Nullable T object) {
    try {
      return (Repr) this.toJsonReprMethod.invoke(null, object);
    } catch (ReflectiveOperationException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public JsonUndefinedForm<T> undefinedForm() {
    return this;
  }

  @Override
  public JsonNullForm<T> nullForm() {
    return this;
  }

  @Override
  public JsonNumberForm<T> numberForm() {
    return this;
  }

  @Override
  public JsonIdentifierForm<T> identifierForm() {
    return this;
  }

  @Override
  public JsonStringForm<?, T> stringForm() {
    return this;
  }

  @Override
  public JsonArrayForm<?, ?, T> arrayForm() {
    return this;
  }

  @Override
  public JsonObjectForm<?, ?, ?, T> objectForm() {
    return this;
  }

  @Override
  public @Nullable T undefinedValue() {
    return this.fromJsonRepr(Repr.undefined());
  }

  @Override
  public @Nullable T nullValue() {
    return this.fromJsonRepr(Repr.unit());
  }

  @Override
  public @Nullable T integerValue(long value) {
    return this.fromJsonRepr(Assume.nonNull(JsonReprs.numberForm().integerValue(value)));
  }

  @Override
  public @Nullable T hexadecimalValue(long value, int digits) {
    return this.fromJsonRepr(Assume.nonNull(JsonReprs.numberForm().hexadecimalValue(value, digits)));
  }

  @Override
  public @Nullable T bigIntegerValue(String value) {
    return this.fromJsonRepr(Assume.nonNull(JsonReprs.numberForm().bigIntegerValue(value)));
  }

  @Override
  public @Nullable T decimalValue(String value) {
    return this.fromJsonRepr(Assume.nonNull(JsonReprs.numberForm().decimalValue(value)));
  }

  @Override
  public @Nullable T identifierValue(String value, ExprParser parser) {
    return this.fromJsonRepr(Assume.nonNull(JsonReprs.identifierForm().identifierValue(value, parser)));
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
    return this.fromJsonRepr(Assume.nonNull(JsonReprs.stringForm().buildString(builder)));
  }

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
    Objects.requireNonNull(element);
    builder.add(element);
    return builder;
  }

  @Override
  public @Nullable T buildArray(ArrayRepr builder) {
    return this.fromJsonRepr(builder);
  }

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
  public @Nullable T buildObject(ObjectRepr builder) {
    return this.fromJsonRepr(builder);
  }

  @Override
  public Parse<T> parse(Input input, JsonParser parser) {
    return parser.parseExpr(input, this);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T object, JsonWriter writer) {
    return JsonReprs.reprForm().write(output, this.toJsonRepr(object), writer);
  }

  @Override
  public Term intoTerm(@Nullable T object) {
    return Term.from(object);
  }

  @Override
  public @Nullable T fromTerm(Term term) {
    return Assume.conformsNullable(term.objectValue(this.fromJsonReprMethod.getDeclaringClass()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonConversions", "reprConversionForm")
            .appendArgument(this.fromJsonReprMethod.getDeclaringClass())
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
