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
import swim.util.ToSource;

@Public
@Since("5.0")
public interface WamlObjectParser<V, B, @Covariant T> extends WamlParser<T> {

  @Override
  default WamlObjectParser<?, ?, T> objectParser() throws WamlException {
    return this;
  }

  default WamlParser<String> keyParser() {
    return WamlLang.keyFormat();
  }

  B objectBuilder(@Nullable Object attrs) throws WamlException;

  WamlFieldParser<? extends V, B> getFieldParser(B builder, String key) throws WamlException;

  @Nullable T buildObject(@Nullable Object attrs, B builder) throws WamlException;

  @Override
  default Parse<T> parse(Input input, WamlParserOptions options) {
    return this.parseObject(input, options, null);
  }

  default Parse<T> parseObject(Input input, WamlParserOptions options,
                               @Nullable Parse<?> parseAttrs) {
    return ParseWamlObject.parse(input, this, options, parseAttrs, null, null, null, null, 1);
  }

  @Override
  default <U> WamlObjectParser<V, B, U> map(Function<? super T, ? extends U> mapper) {
    return new WamlObjectParserMapper<V, B, T, U>(this, mapper);
  }

  static <V, B, T> WamlObjectParser<V, B, T> dummy() {
    return Assume.conforms(WamlDummyObjectParser.INSTANCE);
  }

  static <V, T> WamlObjectParser<V, T, T> mutator(@Nullable String typeName,
                                                  Supplier<T> creator,
                                                  @Nullable Supplier<T> initializer,
                                                  WamlParser<String> keyParser,
                                                  UniformMap<String, WamlFieldParser<? extends V, T>> fieldParsers,
                                                  @Nullable WamlFieldFormat<? extends V, T> annexFieldFormat) {
    return new WamlObjectMutator<V, T>(typeName, creator, initializer, keyParser,
                                       fieldParsers, annexFieldFormat);
  }

  static <V, T> WamlObjectParser<V, T, T> mutator(@Nullable String typeName,
                                                  MethodHandle creatorHandle,
                                                  @Nullable Supplier<T> initializer,
                                                  WamlParser<String> keyParser,
                                                  UniformMap<String, WamlFieldParser<? extends V, T>> fieldParsers,
                                                  @Nullable WamlFieldFormat<? extends V, T> annexFieldFormat) throws WamlProviderException {
    final MethodType methodType = creatorHandle.type();
    if (methodType.parameterCount() != 0) {
      throw new WamlProviderException("invalid creator signature " + creatorHandle);
    }

    final CallSite callSite;
    try {
      callSite = LambdaMetafactory.metafactory(MethodHandles.lookup(), "get",
                                               MethodType.methodType(Supplier.class),
                                               MethodType.methodType(Object.class),
                                               creatorHandle, methodType);
    } catch (LambdaConversionException cause) {
      throw new WamlProviderException(cause);
    }

    final Supplier<T> creator;
    try {
      creator = (Supplier<T>) callSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlProviderException(cause);
    }

    return new WamlObjectMutator<V, T>(typeName, creator, initializer, keyParser,
                                       fieldParsers, annexFieldFormat);
  }

  static <V, T> WamlObjectParser<V, T, T> mutator(@Nullable String typeName,
                                                  Executable creatorExecutable,
                                                  @Nullable Supplier<T> initializer,
                                                  WamlParser<String> keyParser,
                                                  UniformMap<String, WamlFieldParser<? extends V, T>> fieldParsers,
                                                  @Nullable WamlFieldFormat<? extends V, T> annexFieldFormat) throws WamlProviderException {
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
        throw new WamlProviderException("inaccessible creator " + creatorExecutable, cause);
      }
    } else if (creatorExecutable instanceof Method) {
      try {
        creatorHandle = lookup.unreflect((Method) creatorExecutable);
      } catch (IllegalAccessException cause) {
        throw new WamlProviderException("inaccessible creator " + creatorExecutable, cause);
      }
    } else {
      throw new AssertionError("unreachable");
    }

    return WamlObjectParser.mutator(typeName, creatorHandle, initializer, keyParser,
                                    fieldParsers, annexFieldFormat);
  }

  static <V, T> WamlObjectParser<V, Object[], T> creator(@Nullable String typeName,
                                                         MethodHandle creatorHandle,
                                                         @Nullable Supplier<T> initializer,
                                                         WamlParser<String> keyParser,
                                                         UniformMap<String, WamlFieldParser<? extends V, Object[]>> fieldParsers,
                                                         UniformMap<String, WamlFieldFormat<? extends V, Object[]>> flattenedFieldFormats,
                                                         @Nullable WamlFieldFormat<? extends V, Object[]> annexFieldFormat) throws WamlProviderException {
    final MethodType methodType = creatorHandle.type();
    if (methodType.parameterCount() != fieldParsers.size()) {
      throw new WamlProviderException("parameter count of creator " + creatorHandle
                                    + " does not match number of field parsers");
    }

    try {
      creatorHandle = creatorHandle.asSpreader(Object[].class, fieldParsers.size());
      creatorHandle = creatorHandle.asType(MethodType.methodType(Object.class, Object[].class));
    } catch (IllegalArgumentException | WrongMethodTypeException cause) {
      throw new WamlProviderException(cause);
    }
    return new WamlObjectCreator<V, T>(typeName, creatorHandle, initializer, keyParser,
                                       fieldParsers, flattenedFieldFormats, annexFieldFormat);
  }

  static <V, T> WamlObjectParser<V, Object[], T> creator(@Nullable String typeName,
                                                         Executable creatorExecutable,
                                                         @Nullable Supplier<T> initializer,
                                                         WamlParser<String> keyParser,
                                                         UniformMap<String, WamlFieldParser<? extends V, Object[]>> fieldParsers,
                                                         UniformMap<String, WamlFieldFormat<? extends V, Object[]>> flattenedFieldFormats,
                                                         @Nullable WamlFieldFormat<? extends V, Object[]> annexFieldFormat) throws WamlProviderException {
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
        throw new WamlProviderException("inaccessible creator " + creatorExecutable, cause);
      }
    } else if (creatorExecutable instanceof Constructor<?>) {
      try {
        creatorHandle = lookup.unreflectConstructor((Constructor<?>) creatorExecutable);
      } catch (IllegalAccessException cause) {
        throw new WamlProviderException("inaccessible creator " + creatorExecutable, cause);
      }
    } else {
      throw new AssertionError("unreachable");
    }

    return WamlObjectParser.creator(typeName, creatorHandle, initializer, keyParser,
                                    fieldParsers, flattenedFieldFormats, annexFieldFormat);
  }

}

final class WamlObjectParserMapper<V, B, S, T> implements WamlObjectParser<V, B, T>, ToSource {

  final WamlObjectParser<V, B, S> parser;
  final Function<? super S, ? extends T> mapper;

  WamlObjectParserMapper(WamlObjectParser<V, B, S> parser, Function<? super S, ? extends T> mapper) {
    this.parser = parser;
    this.mapper = mapper;
  }

  @Override
  public @Nullable String typeName() {
    return this.parser.typeName();
  }

  @Override
  public WamlIdentifierParser<T> identifierParser() throws WamlException {
    return this.parser.identifierParser().map(this.mapper);
  }

  @Override
  public WamlNumberParser<T> numberParser() throws WamlException {
    return this.parser.numberParser().map(this.mapper);
  }

  @Override
  public WamlStringParser<?, T> stringParser() throws WamlException {
    return this.parser.stringParser().map(this.mapper);
  }

  @Override
  public WamlMarkupParser<?, ?, T> markupParser() throws WamlException {
    return this.parser.markupParser().map(this.mapper);
  }

  @Override
  public WamlArrayParser<?, ?, T> arrayParser() throws WamlException {
    return this.parser.arrayParser().map(this.mapper);
  }

  @Override
  public WamlTupleParser<?, ?, T> tupleParser() throws WamlException {
    return this.parser.tupleParser().map(this.mapper);
  }

  @Override
  public WamlParser<String> keyParser() {
    return this.parser.keyParser();
  }

  @Override
  public B objectBuilder(@Nullable Object attrs) throws WamlException {
    return this.parser.objectBuilder(attrs);
  }

  @Override
  public WamlFieldParser<? extends V, B> getFieldParser(B builder, String key) throws WamlException {
    return this.parser.getFieldParser(builder, key);
  }

  @Override
  public @Nullable T buildObject(@Nullable Object attrs, B builder) throws WamlException {
    try {
      return this.mapper.apply(this.parser.buildObject(attrs, builder));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) throws WamlException {
    try {
      return this.mapper.apply(this.parser.initializer(attrs));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public Parse<T> parse(Input input, WamlParserOptions options) {
    return this.parser.parse(input, options).map(this.mapper);
  }

  @Override
  public Parse<T> parseObject(Input input, WamlParserOptions options,
                              @Nullable Parse<?> parseAttrs) {
    return this.parser.parseObject(input, options, parseAttrs).map(this.mapper);
  }

  @Override
  public Parse<T> parseBlock(Input input, WamlParserOptions options,
                             @Nullable Parse<?> parseAttrs) {
    return this.parser.parseBlock(input, options, parseAttrs).map(this.mapper);
  }

  @Override
  public Parse<T> parseInline(Input input, WamlParserOptions options) {
    return this.parser.parseInline(input, options).map(this.mapper);
  }

  @Override
  public Parse<T> parseTuple(Input input, WamlParserOptions options,
                             @Nullable Parse<?> parseAttrs) {
    return this.parser.parseTuple(input, options, parseAttrs).map(this.mapper);
  }

  @Override
  public Parse<T> parseValue(Input input, TermParserOptions options) {
    return this.parser.parseValue(input, options).map(this.mapper);
  }

  @Override
  public <U> WamlObjectParser<V, B, U> map(Function<? super T, ? extends U> mapper) {
    return new WamlObjectParserMapper<V, B, S, U>(this.parser, this.mapper.andThen(mapper));
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
    return this.toSource();
  }

}

final class WamlDummyObjectParser<V, B, T> implements WamlObjectParser<V, B, T>, ToSource {

  private WamlDummyObjectParser() {
    // singleton
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @SuppressWarnings("NullAway")
  @Override
  public @Nullable B objectBuilder(@Nullable Object attrs) {
    return null;
  }

  @Override
  public WamlFieldParser<? extends V, B> getFieldParser(@Nullable B builder, String key) {
    return WamlFieldParser.dummy();
  }

  @Override
  public @Nullable T buildObject(@Nullable Object attrs, @Nullable B builder) {
    return null;
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlObjectParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final WamlDummyObjectParser<Object, Object, Object> INSTANCE =
      new WamlDummyObjectParser<Object, Object, Object>();

}

final class WamlObjectMutator<V, T> implements WamlObjectParser<V, T, T>, ToSource {

  final @Nullable String typeName;
  final Supplier<T> creator;
  final @Nullable Supplier<T> initializer;
  final WamlParser<String> keyParser;
  final UniformMap<String, WamlFieldParser<? extends V, T>> fieldParsers;
  final @Nullable WamlFieldFormat<? extends V, T> annexFieldFormat;

  WamlObjectMutator(@Nullable String typeName, Supplier<T> creator,
                    @Nullable Supplier<T> initializer, WamlParser<String> keyParser,
                    UniformMap<String, WamlFieldParser<? extends V, T>> fieldParsers,
                    @Nullable WamlFieldFormat<? extends V, T> annexFieldFormat) {
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
  public WamlParser<String> keyParser() {
    return this.keyParser;
  }

  @Override
  public T objectBuilder(@Nullable Object attrs) throws WamlException {
    try {
      return this.creator.get();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Nullable WamlFieldFormat<? extends V, T> getAnnexFieldFormat(T object, String key) throws WamlException {
    if (this.annexFieldFormat == null) {
      return null;
    }
    final WamlFormat<? extends V> annexValueFormat = this.annexFieldFormat.valueFormat();
    if (!(annexValueFormat instanceof WamlObjectFormat<?, ?, ?>)) {
      return null;
    }
    final V annexValue = this.annexFieldFormat.getValue(object);
    final WamlFieldFormat<?, ? extends V> annexedFieldFormat =
        Assume.<WamlObjectFormat<?, ?, V>>conforms(annexValueFormat).getFieldFormat(annexValue, key);
    return this.annexFieldFormat.flattened(key, Assume.conforms(annexedFieldFormat), FilterMode.DEFINED);
  }

  @Override
  public WamlFieldParser<? extends V, T> getFieldParser(T object, String key) throws WamlException {
    WamlFieldParser<? extends V, T> fieldParser = this.fieldParsers.get(key);
    if (fieldParser == null) {
      fieldParser = this.getAnnexFieldFormat(object, key);
      if (fieldParser == null) {
        throw new WamlException(Notation.of("unsupported key: ")
                                        .appendSource(key)
                                        .toString());
      }
    }
    return fieldParser;
  }

  @Override
  public @Nullable T buildObject(@Nullable Object attrs, T object) {
    return object;
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) throws WamlException {
    if (this.initializer == null) {
      return null;
    }
    try {
      return this.initializer.get();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlObjectParser", "mutator")
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
    return this.toSource();
  }

}

final class WamlObjectCreator<V, T> implements WamlObjectParser<V, Object[], T>, ToSource {

  final @Nullable String typeName;
  final MethodHandle creatorHandle;
  final @Nullable Supplier<T> initializer;
  final WamlParser<String> keyParser;
  final UniformMap<String, WamlFieldParser<? extends V, Object[]>> fieldParsers;
  final UniformMap<String, WamlFieldFormat<? extends V, Object[]>> flattenedFieldFormats;
  final @Nullable WamlFieldFormat<? extends V, Object[]> annexFieldFormat;

  WamlObjectCreator(@Nullable String typeName, MethodHandle creatorHandle,
                    @Nullable Supplier<T> initializer, WamlParser<String> keyParser,
                    UniformMap<String, WamlFieldParser<? extends V, Object[]>> fieldParsers,
                    UniformMap<String, WamlFieldFormat<? extends V, Object[]>> flattenedFieldFormats,
                    @Nullable WamlFieldFormat<? extends V, Object[]> annexFieldFormat) {
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
  public WamlParser<String> keyParser() {
    return this.keyParser;
  }

  @Override
  public Object[] objectBuilder(@Nullable Object attrs) throws WamlException {
    return new Object[this.fieldParsers.size()];
  }

  @Nullable WamlFieldFormat<? extends V, Object[]> getAnnexFieldFormat(Object[] arguments, String key) throws WamlException {
    if (this.annexFieldFormat == null) {
      return null;
    }
    final WamlFormat<? extends V> annexValueFormat = this.annexFieldFormat.valueFormat();
    if (!(annexValueFormat instanceof WamlObjectFormat<?, ?, ?>)) {
      return null;
    }
    final V annexValue = this.annexFieldFormat.getValue(arguments);
    final WamlFieldFormat<?, ? extends V> annexedFieldFormat =
        Assume.<WamlObjectFormat<?, ?, V>>conforms(annexValueFormat).getFieldFormat(annexValue, key);
    return this.annexFieldFormat.flattened(key, Assume.conforms(annexedFieldFormat), FilterMode.DEFINED);
  }

  @Override
  public WamlFieldParser<? extends V, Object[]> getFieldParser(Object[] arguments, String key) throws WamlException {
    WamlFieldParser<? extends V, Object[]> fieldParser = this.fieldParsers.get(key);
    if (fieldParser == null) {
      fieldParser = this.flattenedFieldFormats.get(key);
      if (fieldParser == null) {
        fieldParser = this.getAnnexFieldFormat(arguments, key);
        if (fieldParser == null) {
          throw new WamlException(Notation.of("unsupported key: ")
                                          .appendSource(key)
                                          .toString());
        }
      }
    }
    return fieldParser;
  }

  @Override
  public @Nullable T buildObject(@Nullable Object attrs, Object[] arguments) throws WamlException {
    try {
      return (T) this.creatorHandle.invokeExact(arguments);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) throws WamlException {
    if (this.initializer == null) {
      return null;
    }
    try {
      return this.initializer.get();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlObjectParser", "creator")
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
    return this.toSource();
  }

}

final class ParseWamlObject<V, B, T> extends Parse<T> {

  final WamlObjectParser<V, B, T> parser;
  final WamlParserOptions options;
  final @Nullable Parse<?> parseAttrs;
  final @Nullable B builder;
  final @Nullable Parse<String> parseKey;
  final @Nullable WamlFieldParser<V, B> fieldParser;
  final @Nullable Parse<V> parseValue;
  final int step;

  ParseWamlObject(WamlObjectParser<V, B, T> parser, WamlParserOptions options,
                  @Nullable Parse<?> parseAttrs, @Nullable B builder,
                  @Nullable Parse<String> parseKey, @Nullable WamlFieldParser<V, B> fieldParser,
                  @Nullable Parse<V> parseValue, int step) {
    this.parser = parser;
    this.options = options;
    this.parseAttrs = parseAttrs;
    this.builder = builder;
    this.parseKey = parseKey;
    this.fieldParser = fieldParser;
    this.parseValue = parseValue;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlObject.parse(input, this.parser, this.options, this.parseAttrs, this.builder,
                                 this.parseKey, this.fieldParser, this.parseValue, this.step);
  }

  static <V, B, T> Parse<T> parse(Input input, WamlObjectParser<V, B, T> parser,
                                  WamlParserOptions options, @Nullable Parse<?> parseAttrs,
                                  @Nullable B builder, @Nullable Parse<String> parseKey,
                                  @Nullable WamlFieldParser<V, B> fieldParser,
                                  @Nullable Parse<V> parseValue, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '@') {
        step = 2;
      } else if (input.isReady()) {
        if (parseAttrs == null) {
          parseAttrs = Parse.done();
        }
        step = 4;
      }
    }
    if (step == 2) {
      if (parseAttrs == null) {
        parseAttrs = parser.attrsParser().parseAttrs(input, options);
      } else {
        parseAttrs = parseAttrs.consume(input);
      }
      if (parseAttrs.isDone()) {
        step = 3;
      } else if (parseAttrs.isError()) {
        return parseAttrs.asError();
      }
    }
    if (step == 3) {
      while (input.isCont() && Term.isSpace(input.head())) {
        input.step();
      }
      if (input.isReady()) {
        step = 4;
      }
    }
    if (step == 4) {
      if (input.isCont() && input.head() == '{') {
        try {
          builder = parser.objectBuilder(Assume.nonNull(parseAttrs).getUnchecked());
        } catch (WamlException cause) {
          return Parse.diagnostic(input, cause);
        }
        input.step();
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('{', input));
      }
    }
    do {
      if (step == 5) {
        while (input.isCont() && Term.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == '}') {
            final T object;
            try {
              object = parser.buildObject(Assume.nonNull(parseAttrs).getUnchecked(),
                                          Assume.nonNull(builder));
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            input.step();
            return Parse.done(object);
          } else if (c == '#') {
            input.step();
            step = 11;
          } else {
            step = 6;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected('}', input));
        }
      }
      if (step == 6) {
        if (parseKey == null) {
          parseKey = parser.keyParser().parse(input, options);
        } else {
          parseKey = parseKey.consume(input);
        }
        if (parseKey.isDone()) {
          step = 7;
        } else if (parseKey.isError()) {
          return parseKey.asError();
        }
      }
      if (step == 7) {
        while (input.isCont() && Term.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == ':') {
          input.step();
          step = 8;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected(':', input));
        }
      }
      if (step == 8) {
        while (input.isCont() && Term.isSpace(input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 9;
        }
      }
      if (step == 9) {
        if (parseValue == null) {
          try {
            fieldParser = Assume.conforms(parser.getFieldParser(Assume.nonNull(builder),
                                                                Assume.nonNull(parseKey).getNonNullUnchecked()));
          } catch (WamlException cause) {
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
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
          parseKey = null;
          fieldParser = null;
          parseValue = null;
          step = 10;
        } else if (parseValue.isError()) {
          return parseValue.asError();
        }
      }
      if (step == 10) {
        while (input.isCont() && Term.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == ',' || Term.isNewline(c)) {
            input.step();
            step = 5;
            continue;
          } else if (c == '#') {
            input.step();
            step = 11;
          } else if (c == '}') {
            input.step();
            try {
              return Parse.done(parser.buildObject(Assume.nonNull(parseAttrs).getUnchecked(),
                                                   Assume.nonNull(builder)));
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
          } else {
            return Parse.error(Diagnostic.expected("'}', ',' or newline", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected('}', input));
        }
      }
      if (step == 11) {
        while (input.isCont() && !Term.isNewline(input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 5;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlObject<V, B, T>(parser, options, parseAttrs, builder,
                                        parseKey, fieldParser, parseValue, step);
  }

}
