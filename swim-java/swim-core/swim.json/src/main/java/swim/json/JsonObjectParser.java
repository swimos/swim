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

import java.lang.invoke.CallSite;
import java.lang.invoke.LambdaConversionException;
import java.lang.invoke.LambdaMetafactory;
import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;
import java.lang.invoke.WrongMethodTypeException;
import java.lang.reflect.Constructor;
import java.lang.reflect.Executable;
import java.lang.reflect.Method;
import java.util.function.Function;
import java.util.function.Supplier;
import swim.annotations.Covariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.collections.UniformMap;
import swim.decl.FilterMode;
import swim.term.Term;
import swim.term.TermParserOptions;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.Result;
import swim.util.WriteSource;

@Public
@Since("5.0")
public interface JsonObjectParser<V, B, @Covariant T> extends JsonParser<T> {

  @Override
  default JsonObjectParser<?, ?, T> objectParser() throws JsonException {
    return this;
  }

  default JsonParser<String> keyParser() {
    return JsonLang.keyFormat();
  }

  B objectBuilder() throws JsonException;

  JsonFieldParser<? extends V, B> getFieldParser(B builder, String key) throws JsonException;

  @Nullable T buildObject(B builder) throws JsonException;

  @Override
  default Parse<T> parse(Input input, JsonParserOptions options) {
    return this.parseObject(input, options);
  }

  default Parse<T> parseObject(Input input, JsonParserOptions options) {
    return ParseJsonObject.parse(input, this, options, null, null, null, null, 1);
  }

  @Override
  default <U> JsonObjectParser<V, B, U> map(Function<? super T, ? extends U> mapper) {
    return new JsonObjectParserMapper<V, B, T, U>(this, mapper);
  }

  static <V, B, T> JsonObjectParser<V, B, T> dummy() {
    return Assume.conforms(JsonDummyObjectParser.INSTANCE);
  }

  static <V, T> JsonObjectParser<V, T, T> mutator(@Nullable String typeName,
                                                  Supplier<T> creator,
                                                  @Nullable Supplier<T> initializer,
                                                  JsonParser<String> keyParser,
                                                  UniformMap<String, JsonFieldParser<? extends V, T>> fieldParsers,
                                                  @Nullable JsonFieldFormat<? extends V, T> annexFieldFormat) {
    return new JsonObjectMutator<V, T>(typeName, creator, initializer, keyParser,
                                       fieldParsers, annexFieldFormat);
  }

  static <V, T> JsonObjectParser<V, T, T> mutator(@Nullable String typeName,
                                                  MethodHandle creatorHandle,
                                                  @Nullable Supplier<T> initializer,
                                                  JsonParser<String> keyParser,
                                                  UniformMap<String, JsonFieldParser<? extends V, T>> fieldParsers,
                                                  @Nullable JsonFieldFormat<? extends V, T> annexFieldFormat) throws JsonProviderException {
    final MethodType methodType = creatorHandle.type();
    if (methodType.parameterCount() != 0) {
      throw new JsonProviderException("invalid creator signature " + creatorHandle);
    }

    final CallSite callSite;
    try {
      callSite = LambdaMetafactory.metafactory(MethodHandles.lookup(), "get",
                                               MethodType.methodType(Supplier.class),
                                               MethodType.methodType(Object.class),
                                               creatorHandle, methodType);
    } catch (LambdaConversionException cause) {
      throw new JsonProviderException(cause);
    }

    final Supplier<T> creator;
    try {
      creator = (Supplier<T>) callSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonProviderException(cause);
    }

    return new JsonObjectMutator<V, T>(typeName, creator, initializer, keyParser,
                                       fieldParsers, annexFieldFormat);
  }

  static <V, T> JsonObjectParser<V, T, T> mutator(@Nullable String typeName,
                                                  Executable creatorExecutable,
                                                  @Nullable Supplier<T> initializer,
                                                  JsonParser<String> keyParser,
                                                  UniformMap<String, JsonFieldParser<? extends V, T>> fieldParsers,
                                                  @Nullable JsonFieldFormat<? extends V, T> annexFieldFormat) throws JsonProviderException {
    MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      lookup = MethodHandles.privateLookupIn(creatorExecutable.getDeclaringClass(), lookup);
    } catch (IllegalAccessException | SecurityException cause) {
      // Proceed with the original lookup object.
    }

    final MethodHandle creatorHandle;
    if (creatorExecutable instanceof Constructor<?>) {
      try {
        creatorHandle = lookup.unreflectConstructor((Constructor<?>) creatorExecutable);
      } catch (IllegalAccessException cause) {
        throw new JsonProviderException("inaccessible creator " + creatorExecutable, cause);
      }
    } else if (creatorExecutable instanceof Method) {
      try {
        creatorHandle = lookup.unreflect((Method) creatorExecutable);
      } catch (IllegalAccessException cause) {
        throw new JsonProviderException("inaccessible creator " + creatorExecutable, cause);
      }
    } else {
      throw new AssertionError("unreachable");
    }

    return JsonObjectParser.mutator(typeName, creatorHandle, initializer, keyParser,
                                    fieldParsers, annexFieldFormat);
  }

  static <V, T> JsonObjectParser<V, Object[], T> creator(@Nullable String typeName,
                                                         MethodHandle creatorHandle,
                                                         @Nullable Supplier<T> initializer,
                                                         JsonParser<String> keyParser,
                                                         UniformMap<String, JsonFieldParser<? extends V, Object[]>> fieldParsers,
                                                         UniformMap<String, JsonFieldFormat<? extends V, Object[]>> flattenedFieldFormats,
                                                         @Nullable JsonFieldFormat<? extends V, Object[]> annexFieldFormat) throws JsonProviderException {
    final MethodType methodType = creatorHandle.type();
    if (methodType.parameterCount() != fieldParsers.size()) {
      throw new JsonProviderException("parameter count of creator " + creatorHandle
                                    + " does not match number of field parsers");
    }

    try {
      creatorHandle = creatorHandle.asSpreader(Object[].class, fieldParsers.size());
      creatorHandle = creatorHandle.asType(MethodType.methodType(Object.class, Object[].class));
    } catch (IllegalArgumentException | WrongMethodTypeException cause) {
      throw new JsonProviderException(cause);
    }
    return new JsonObjectCreator<V, T>(typeName, creatorHandle, initializer, keyParser,
                                       fieldParsers, flattenedFieldFormats, annexFieldFormat);
  }

  static <V, T> JsonObjectParser<V, Object[], T> creator(@Nullable String typeName,
                                                         Executable creatorExecutable,
                                                         @Nullable Supplier<T> initializer,
                                                         JsonParser<String> keyParser,
                                                         UniformMap<String, JsonFieldParser<? extends V, Object[]>> fieldParsers,
                                                         UniformMap<String, JsonFieldFormat<? extends V, Object[]>> flattenedFieldFormats,
                                                         @Nullable JsonFieldFormat<? extends V, Object[]> annexFieldFormat) throws JsonProviderException {
    MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      lookup = MethodHandles.privateLookupIn(creatorExecutable.getDeclaringClass(), lookup);
    } catch (IllegalAccessException | SecurityException cause) {
      // Proceed with the original lookup object.
    }

    final MethodHandle creatorHandle;
    if (creatorExecutable instanceof Method) {
      try {
        creatorHandle = lookup.unreflect((Method) creatorExecutable);
      } catch (IllegalAccessException cause) {
        throw new JsonProviderException("inaccessible creator " + creatorExecutable, cause);
      }
    } else if (creatorExecutable instanceof Constructor<?>) {
      try {
        creatorHandle = lookup.unreflectConstructor((Constructor<?>) creatorExecutable);
      } catch (IllegalAccessException cause) {
        throw new JsonProviderException("inaccessible creator " + creatorExecutable, cause);
      }
    } else {
      throw new AssertionError("unreachable");
    }

    return JsonObjectParser.creator(typeName, creatorHandle, initializer, keyParser,
                                    fieldParsers, flattenedFieldFormats, annexFieldFormat);
  }

}

final class JsonObjectParserMapper<V, B, S, T> implements JsonObjectParser<V, B, T>, WriteSource {

  final JsonObjectParser<V, B, S> parser;
  final Function<? super S, ? extends T> mapper;

  JsonObjectParserMapper(JsonObjectParser<V, B, S> parser, Function<? super S, ? extends T> mapper) {
    this.parser = parser;
    this.mapper = mapper;
  }

  @Override
  public @Nullable String typeName() {
    return this.parser.typeName();
  }

  @Override
  public JsonIdentifierParser<T> identifierParser() throws JsonException {
    return this.parser.identifierParser().map(this.mapper);
  }

  @Override
  public JsonNumberParser<T> numberParser() throws JsonException {
    return this.parser.numberParser().map(this.mapper);
  }

  @Override
  public JsonStringParser<?, T> stringParser() throws JsonException {
    return this.parser.stringParser().map(this.mapper);
  }

  @Override
  public JsonArrayParser<?, ?, T> arrayParser() throws JsonException {
    return this.parser.arrayParser().map(this.mapper);
  }

  @Override
  public JsonParser<String> keyParser() {
    return this.parser.keyParser();
  }

  @Override
  public B objectBuilder() throws JsonException {
    return this.parser.objectBuilder();
  }

  @Override
  public JsonFieldParser<? extends V, B> getFieldParser(B builder, String key) throws JsonException {
    return this.parser.getFieldParser(builder, key);
  }

  @Override
  public @Nullable T buildObject(B builder) throws JsonException {
    try {
      return this.mapper.apply(this.parser.buildObject(builder));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonException(cause);
    }
  }

  @Override
  public @Nullable T initializer() throws JsonException {
    try {
      return this.mapper.apply(this.parser.initializer());
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonException(cause);
    }
  }

  @Override
  public Parse<T> parse(Input input, JsonParserOptions options) {
    return this.parser.parse(input, options).map(this.mapper);
  }

  @Override
  public Parse<T> parseObject(Input input, JsonParserOptions options) {
    return this.parser.parseObject(input, options).map(this.mapper);
  }

  @Override
  public Parse<T> parseValue(Input input, TermParserOptions options) {
    return this.parser.parseValue(input, options).map(this.mapper);
  }

  @Override
  public <U> JsonObjectParser<V, B, U> map(Function<? super T, ? extends U> mapper) {
    return new JsonObjectParserMapper<V, B, S, U>(this.parser, this.mapper.andThen(mapper));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.appendSource(this.parser)
            .beginInvoke("map")
            .appendArgument(this.mapper)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class JsonDummyObjectParser<V, B, T> implements JsonObjectParser<V, B, T>, WriteSource {

  private JsonDummyObjectParser() {
    // singleton
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B objectBuilder() {
    return null;
  }

  @Override
  public JsonFieldParser<? extends V, B> getFieldParser(@Nullable B builder, String key) {
    return JsonFieldParser.dummy();
  }

  @Override
  public @Nullable T buildObject(@Nullable B builder) {
    return null;
  }

  @Override
  public @Nullable T initializer() {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonObjectParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final JsonDummyObjectParser<Object, Object, Object> INSTANCE =
      new JsonDummyObjectParser<Object, Object, Object>();

}

final class JsonObjectMutator<V, T> implements JsonObjectParser<V, T, T>, WriteSource {

  final @Nullable String typeName;
  final Supplier<T> creator;
  final @Nullable Supplier<T> initializer;
  final JsonParser<String> keyParser;
  final UniformMap<String, JsonFieldParser<? extends V, T>> fieldParsers;
  final @Nullable JsonFieldFormat<? extends V, T> annexFieldFormat;

  JsonObjectMutator(@Nullable String typeName, Supplier<T> creator,
                    @Nullable Supplier<T> initializer, JsonParser<String> keyParser,
                    UniformMap<String, JsonFieldParser<? extends V, T>> fieldParsers,
                    @Nullable JsonFieldFormat<? extends V, T> annexFieldFormat) {
    this.typeName = typeName;
    this.creator = creator;
    this.initializer = initializer;
    this.keyParser = keyParser;
    this.fieldParsers = fieldParsers.commit();
    this.annexFieldFormat = annexFieldFormat;
  }

  @Override
  public @Nullable String typeName() {
    return this.typeName;
  }

  @Override
  public JsonParser<String> keyParser() {
    return this.keyParser;
  }

  @Override
  public T objectBuilder() throws JsonException {
    try {
      return this.creator.get();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonException(cause);
    }
  }

  @Nullable JsonFieldFormat<? extends V, T> getAnnexFieldFormat(T object, String key) throws JsonException {
    if (this.annexFieldFormat == null) {
      return null;
    }
    final JsonFormat<? extends V> annexValueFormat = this.annexFieldFormat.valueFormat();
    if (!(annexValueFormat instanceof JsonObjectFormat<?, ?, ?>)) {
      return null;
    }
    final V annexValue = this.annexFieldFormat.getValue(object);
    final JsonFieldFormat<?, ? extends V> annexedFieldFormat =
        Assume.<JsonObjectFormat<?, ?, V>>conforms(annexValueFormat).getFieldFormat(annexValue, key);
    return this.annexFieldFormat.flattened(key, Assume.conforms(annexedFieldFormat), FilterMode.DEFINED);
  }

  @Override
  public JsonFieldParser<? extends V, T> getFieldParser(T object, String key) throws JsonException {
    JsonFieldParser<? extends V, T> fieldParser = this.fieldParsers.get(key);
    if (fieldParser == null) {
      fieldParser = this.getAnnexFieldFormat(object, key);
      if (fieldParser == null) {
        throw new JsonException(Notation.of("unsupported key: ")
                                        .appendSource(key)
                                        .toString());
      }
    }
    return fieldParser;
  }

  @Override
  public @Nullable T buildObject(T object) {
    return object;
  }

  @Override
  public @Nullable T initializer() throws JsonException {
    if (this.initializer == null) {
      return null;
    }
    try {
      return this.initializer.get();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonException(cause);
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonObjectParser", "mutator")
            .appendArgument(this.typeName)
            .appendArgument(this.creator)
            .appendArgument(this.initializer)
            .appendArgument(this.keyParser)
            .appendArgument(this.fieldParsers)
            .appendArgument(this.annexFieldFormat)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class JsonObjectCreator<V, T> implements JsonObjectParser<V, Object[], T>, WriteSource {

  final @Nullable String typeName;
  final MethodHandle creatorHandle;
  final @Nullable Supplier<T> initializer;
  final JsonParser<String> keyParser;
  final UniformMap<String, JsonFieldParser<? extends V, Object[]>> fieldParsers;
  final UniformMap<String, JsonFieldFormat<? extends V, Object[]>> flattenedFieldFormats;
  final @Nullable JsonFieldFormat<? extends V, Object[]> annexFieldFormat;

  JsonObjectCreator(@Nullable String typeName, MethodHandle creatorHandle,
                    @Nullable Supplier<T> initializer, JsonParser<String> keyParser,
                    UniformMap<String, JsonFieldParser<? extends V, Object[]>> fieldParsers,
                    UniformMap<String, JsonFieldFormat<? extends V, Object[]>> flattenedFieldFormats,
                    @Nullable JsonFieldFormat<? extends V, Object[]> annexFieldFormat) {
    this.typeName = typeName;
    this.creatorHandle = creatorHandle;
    this.initializer = initializer;
    this.keyParser = keyParser;
    this.fieldParsers = fieldParsers.commit();
    this.flattenedFieldFormats = flattenedFieldFormats.commit();
    this.annexFieldFormat = annexFieldFormat;
  }

  @Override
  public @Nullable String typeName() {
    return this.typeName;
  }

  @Override
  public JsonParser<String> keyParser() {
    return this.keyParser;
  }

  @Override
  public Object[] objectBuilder() throws JsonException {
    return new Object[this.fieldParsers.size()];
  }

  @Nullable JsonFieldFormat<? extends V, Object[]> getAnnexFieldFormat(Object[] arguments, String key) throws JsonException {
    if (this.annexFieldFormat == null) {
      return null;
    }
    final JsonFormat<? extends V> annexValueFormat = this.annexFieldFormat.valueFormat();
    if (!(annexValueFormat instanceof JsonObjectFormat<?, ?, ?>)) {
      return null;
    }
    final V annexValue = this.annexFieldFormat.getValue(arguments);
    final JsonFieldFormat<?, ? extends V> annexedFieldFormat =
        Assume.<JsonObjectFormat<?, ?, V>>conforms(annexValueFormat).getFieldFormat(annexValue, key);
    return this.annexFieldFormat.flattened(key, Assume.conforms(annexedFieldFormat), FilterMode.DEFINED);
  }

  @Override
  public JsonFieldParser<? extends V, Object[]> getFieldParser(Object[] arguments, String key) throws JsonException {
    JsonFieldParser<? extends V, Object[]> fieldParser = this.fieldParsers.get(key);
    if (fieldParser == null) {
      fieldParser = this.flattenedFieldFormats.get(key);
      if (fieldParser == null) {
        fieldParser = this.getAnnexFieldFormat(arguments, key);
        if (fieldParser == null) {
          throw new JsonException(Notation.of("unsupported key: ")
                                          .appendSource(key)
                                          .toString());
        }
      }
    }
    return fieldParser;
  }

  @Override
  public @Nullable T buildObject(Object[] arguments) throws JsonException {
    try {
      return (T) this.creatorHandle.invokeExact(arguments);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonException(cause);
    }
  }

  @Override
  public @Nullable T initializer() throws JsonException {
    if (this.initializer == null) {
      return null;
    }
    try {
      return this.initializer.get();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonException(cause);
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonObjectParser", "creator")
            .appendArgument(this.typeName)
            .appendArgument(this.creatorHandle)
            .appendArgument(this.initializer)
            .appendArgument(this.keyParser)
            .appendArgument(this.fieldParsers)
            .appendArgument(this.annexFieldFormat)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class ParseJsonObject<V, B, T> extends Parse<T> {

  final JsonObjectParser<V, B, T> parser;
  final JsonParserOptions options;
  final @Nullable B builder;
  final @Nullable Parse<String> parseKey;
  final @Nullable JsonFieldParser<V, B> fieldParser;
  final @Nullable Parse<V> parseValue;
  final int step;

  ParseJsonObject(JsonObjectParser<V, B, T> parser, JsonParserOptions options,
                  @Nullable B builder, @Nullable Parse<String> parseKey,
                  @Nullable JsonFieldParser<V, B> fieldParser,
                  @Nullable Parse<V> parseValue, int step) {
    this.parser = parser;
    this.options = options;
    this.builder = builder;
    this.parseKey = parseKey;
    this.fieldParser = fieldParser;
    this.parseValue = parseValue;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseJsonObject.parse(input, this.parser, this.options, this.builder,
                                 this.parseKey, this.fieldParser, this.parseValue, this.step);
  }

  static <V, B, T> Parse<T> parse(Input input, JsonObjectParser<V, B, T> parser,
                                  JsonParserOptions options, @Nullable B builder,
                                  @Nullable Parse<String> parseKey,
                                  @Nullable JsonFieldParser<V, B> fieldParser,
                                  @Nullable Parse<V> parseValue, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '{') {
        try {
          builder = parser.objectBuilder();
        } catch (JsonException cause) {
          return Parse.diagnostic(input, cause);
        }
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('{', input));
      }
    }
    if (step == 2) {
      while (input.isCont() && Term.isWhitespace(c = input.head())) {
        input.step();
      }
      if (input.isCont()) {
        if (c == '}') {
          final T object;
          try {
            object = parser.buildObject(Assume.nonNull(builder));
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
          input.step();
          return Parse.done(object);
        } else {
          step = 3;
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected('}', input));
      }
    }
    do {
      if (step == 3) {
        if (parseKey == null) {
          parseKey = parser.keyParser().parse(input, options);
        } else {
          parseKey = parseKey.consume(input);
        }
        if (parseKey.isDone()) {
          step = 4;
        } else if (parseKey.isError()) {
          return parseKey.asError();
        }
      }
      if (step == 4) {
        while (input.isCont() && Term.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == ':') {
          input.step();
          step = 5;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected(':', input));
        }
      }
      if (step == 5) {
        while (input.isCont() && Term.isWhitespace(input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 6;
        }
      }
      if (step == 6) {
        if (parseValue == null) {
          try {
            fieldParser = Assume.conforms(parser.getFieldParser(Assume.nonNull(builder),
                                                                Assume.nonNull(parseKey).getNonNullUnchecked()));
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
          parseValue = fieldParser.valueParser().parse(input, options);
        } else {
          parseValue = parseValue.consume(input);
        }
        if (parseValue.isDone()) {
          try {
            builder = Assume.nonNull(fieldParser).updatedValue(Assume.nonNull(builder),
                                                               parseValue.getUnchecked());
          } catch (JsonException cause) {
            return Parse.diagnostic(input, cause);
          }
          parseKey = null;
          fieldParser = null;
          parseValue = null;
          step = 7;
        } else if (parseValue.isError()) {
          return parseValue.asError();
        }
      }
      if (step == 7) {
        while (input.isCont() && Term.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == ',') {
            input.step();
            step = 8;
          } else if (c == '}') {
            final T object;
            try {
              object = parser.buildObject(Assume.nonNull(builder));
            } catch (JsonException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            return Parse.done(object);
          } else {
            return Parse.error(Diagnostic.expected("',' or '}'", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected('}', input));
        }
      }
      if (step == 8) {
        while (input.isCont() && Term.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 3;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseJsonObject<V, B, T>(parser, options, builder, parseKey,
                                        fieldParser, parseValue, step);
  }

}
