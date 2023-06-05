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

import java.lang.reflect.Constructor;
import java.lang.reflect.Type;
import java.util.Iterator;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.UniformMap;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class JsonThrowables implements JsonProvider, ToSource {

  final int priority;

  private JsonThrowables(int priority) {
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
      if (StackTraceElement.class.isAssignableFrom(classType)) {
        return JsonThrowables.stackTraceElementFormat();
      } else if (Throwable.class.isAssignableFrom(classType)) {
        return JsonThrowables.throwableFormat();
      }
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonThrowables", "provider");
    if (this.priority != GENERIC_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final JsonThrowables PROVIDER = new JsonThrowables(GENERIC_PRIORITY);

  public static JsonThrowables provider(int priority) {
    if (priority == GENERIC_PRIORITY) {
      return PROVIDER;
    }
    return new JsonThrowables(priority);
  }

  public static JsonThrowables provider() {
    return PROVIDER;
  }

  public static JsonFormat<StackTraceElement> stackTraceElementFormat() {
    return JsonStackTraceElementFormat.INSTANCE;
  }

  public static JsonFormat<Throwable> throwableFormat() {
    return JsonThrowableFormat.INSTANCE;
  }

}

final class JsonStackTraceElementFormat implements JsonFormat<StackTraceElement>, JsonObjectParser<Object, JsonStackTraceElementBuilder, StackTraceElement>, JsonObjectWriter<Object, StackTraceElement>, ToSource {

  @Override
  public @Nullable String typeName() {
    return "StackTraceElement";
  }

  @Override
  public JsonStackTraceElementBuilder objectBuilder() {
    return new JsonStackTraceElementBuilder();
  }

  @Override
  public JsonFieldParser<?, JsonStackTraceElementBuilder> getFieldParser(JsonStackTraceElementBuilder builder, String key) throws JsonException {
    final JsonFieldParser<?, JsonStackTraceElementBuilder> fieldParser = FIELD_PARSERS.get(key);
    if (fieldParser == null) {
      throw new JsonException(Notation.of("unsupported key: ")
                                      .appendSource(key)
                                      .toString());
    }
    return fieldParser;
  }

  @Override
  public @Nullable StackTraceElement buildObject(JsonStackTraceElementBuilder builder) throws JsonException {
    try {
      return new StackTraceElement(builder.classLoaderName, builder.moduleName, builder.moduleVersion,
                                   builder.className, builder.methodName, builder.fileName, builder.lineNumber);
    } catch (NullPointerException cause) {
      throw new JsonException(cause);
    }
  }

  @Override
  public JsonFieldWriter<?, StackTraceElement> getFieldWriter(StackTraceElement object, String key) throws JsonException {
    final JsonFieldWriter<?, StackTraceElement> fieldWriter = FIELD_WRITERS.get(key);
    if (fieldWriter == null) {
      throw new JsonException(Notation.of("unsupported key: ")
                                      .appendSource(key)
                                      .toString());
    }
    return fieldWriter;
  }

  @Override
  public Iterator<JsonFieldWriter<?, StackTraceElement>> getFieldWriters(StackTraceElement object) {
    return FIELD_WRITERS.valueIterator();
  }

  @Override
  public @Nullable StackTraceElement initializer() {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonThrowables", "stackTraceElementFormat").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  @SuppressWarnings("SameNameButDifferent")
  static final UniformMap<String, JsonFieldParser<?, JsonStackTraceElementBuilder>> FIELD_PARSERS =
      UniformMap.of("loader", LoaderField.INSTANCE,
                    "module", ModuleField.INSTANCE,
                    "version", VersionField.INSTANCE,
                    "class", ClassField.INSTANCE,
                    "method", MethodField.INSTANCE,
                    "file", FileField.INSTANCE,
                    "line", LineField.INSTANCE,
                    "native", NativeField.INSTANCE);

  static final UniformMap<String, JsonFieldWriter<?, StackTraceElement>> FIELD_WRITERS =
      Assume.conforms(FIELD_PARSERS);

  static final JsonStackTraceElementFormat INSTANCE = new JsonStackTraceElementFormat();

  static final class LoaderField implements JsonFieldParser<String, JsonStackTraceElementBuilder>, JsonFieldWriter<String, StackTraceElement> {

    @Override
    public String key() {
      return "loader";
    }

    @Override
    public JsonParser<String> valueParser() {
      return JsonLang.stringFormat();
    }

    @Override
    public JsonWriter<String> valueWriter() {
      return JsonLang.stringFormat();
    }

    @Override
    public boolean filterValue(StackTraceElement object, @Nullable String classLoaderName) {
      return classLoaderName != null;
    }

    @Override
    public @Nullable String getValue(StackTraceElement object) {
      return object.getClassLoaderName();
    }

    @Override
    public JsonStackTraceElementBuilder updatedValue(JsonStackTraceElementBuilder builder, @Nullable String classLoaderName) {
      builder.classLoaderName = classLoaderName;
      return builder;
    }

    static final LoaderField INSTANCE = new LoaderField();

  }

  static final class ModuleField implements JsonFieldParser<String, JsonStackTraceElementBuilder>, JsonFieldWriter<String, StackTraceElement> {

    @Override
    public String key() {
      return "module";
    }

    @Override
    public JsonParser<String> valueParser() {
      return JsonLang.stringFormat();
    }

    @Override
    public JsonWriter<String> valueWriter() {
      return JsonLang.stringFormat();
    }

    @Override
    public boolean filterValue(StackTraceElement object, @Nullable String moduleName) {
      return moduleName != null;
    }

    @Override
    public @Nullable String getValue(StackTraceElement object) {
      return object.getModuleName();
    }

    @Override
    public JsonStackTraceElementBuilder updatedValue(JsonStackTraceElementBuilder builder, @Nullable String moduleName) {
      builder.moduleName = moduleName;
      return builder;
    }

    static final ModuleField INSTANCE = new ModuleField();

  }

  static final class VersionField implements JsonFieldParser<String, JsonStackTraceElementBuilder>, JsonFieldWriter<String, StackTraceElement> {

    @Override
    public String key() {
      return "version";
    }

    @Override
    public JsonParser<String> valueParser() {
      return JsonLang.stringFormat();
    }

    @Override
    public JsonWriter<String> valueWriter() {
      return JsonLang.stringFormat();
    }

    @Override
    public boolean filterValue(StackTraceElement object, @Nullable String moduleVersion) {
      return moduleVersion != null;
    }

    @Override
    public @Nullable String getValue(StackTraceElement object) {
      return object.getModuleVersion();
    }

    @Override
    public JsonStackTraceElementBuilder updatedValue(JsonStackTraceElementBuilder builder, @Nullable String moduleVersion) {
      builder.moduleVersion = moduleVersion;
      return builder;
    }

    static final VersionField INSTANCE = new VersionField();

  }

  static final class ClassField implements JsonFieldParser<String, JsonStackTraceElementBuilder>, JsonFieldWriter<String, StackTraceElement> {

    @Override
    public String key() {
      return "class";
    }

    @Override
    public JsonParser<String> valueParser() {
      return JsonLang.stringFormat();
    }

    @Override
    public JsonWriter<String> valueWriter() {
      return JsonLang.stringFormat();
    }

    @Override
    public boolean filterValue(StackTraceElement object, @Nullable String className) {
      return className != null;
    }

    @Override
    public @Nullable String getValue(StackTraceElement object) {
      return object.getClassName();
    }

    @Override
    public JsonStackTraceElementBuilder updatedValue(JsonStackTraceElementBuilder builder, @Nullable String className) {
      builder.className = className;
      return builder;
    }

    static final ClassField INSTANCE = new ClassField();

  }

  static final class MethodField implements JsonFieldParser<String, JsonStackTraceElementBuilder>, JsonFieldWriter<String, StackTraceElement> {

    @Override
    public String key() {
      return "method";
    }

    @Override
    public JsonParser<String> valueParser() {
      return JsonLang.stringFormat();
    }

    @Override
    public JsonWriter<String> valueWriter() {
      return JsonLang.stringFormat();
    }

    @Override
    public boolean filterValue(StackTraceElement object, @Nullable String methodName) {
      return methodName != null;
    }

    @Override
    public @Nullable String getValue(StackTraceElement object) {
      return object.getMethodName();
    }

    @Override
    public JsonStackTraceElementBuilder updatedValue(JsonStackTraceElementBuilder builder, @Nullable String methodName) {
      builder.methodName = methodName;
      return builder;
    }

    static final MethodField INSTANCE = new MethodField();

  }

  static final class FileField implements JsonFieldParser<String, JsonStackTraceElementBuilder>, JsonFieldWriter<String, StackTraceElement> {

    @Override
    public String key() {
      return "file";
    }

    @Override
    public JsonParser<String> valueParser() {
      return JsonLang.stringFormat();
    }

    @Override
    public JsonWriter<String> valueWriter() {
      return JsonLang.stringFormat();
    }

    @Override
    public boolean filterValue(StackTraceElement object, @Nullable String fileName) {
      return fileName != null;
    }

    @Override
    public @Nullable String getValue(StackTraceElement object) {
      return object.getFileName();
    }

    @Override
    public JsonStackTraceElementBuilder updatedValue(JsonStackTraceElementBuilder builder, @Nullable String fileName) {
      builder.fileName = fileName;
      return builder;
    }

    static final FileField INSTANCE = new FileField();

  }

  static final class LineField implements JsonFieldParser<Integer, JsonStackTraceElementBuilder>, JsonFieldWriter<Integer, StackTraceElement> {

    @Override
    public String key() {
      return "line";
    }

    @Override
    public JsonParser<Integer> valueParser() {
      return JsonLang.intFormat();
    }

    @Override
    public JsonWriter<Integer> valueWriter() {
      return JsonLang.intFormat();
    }

    @Override
    public boolean filterValue(StackTraceElement object, @Nullable Integer lineNumber) {
      return lineNumber != null && lineNumber.intValue() >= 0;
    }

    @Override
    public @Nullable Integer getValue(StackTraceElement object) {
      return Integer.valueOf(object.getLineNumber());
    }

    @Override
    public JsonStackTraceElementBuilder updatedValue(JsonStackTraceElementBuilder builder, @Nullable Integer lineNumber) {
      builder.lineNumber = lineNumber != null ? lineNumber.intValue() : -1;
      return builder;
    }

    static final LineField INSTANCE = new LineField();

  }

  static final class NativeField implements JsonFieldParser<Boolean, JsonStackTraceElementBuilder>, JsonFieldWriter<Boolean, StackTraceElement> {

    @Override
    public String key() {
      return "native";
    }

    @Override
    public JsonParser<Boolean> valueParser() {
      return JsonLang.booleanFormat();
    }

    @Override
    public JsonWriter<Boolean> valueWriter() {
      return JsonLang.booleanFormat();
    }

    @Override
    public boolean filterValue(StackTraceElement object, @Nullable Boolean nativeMethod) {
      return nativeMethod != null && nativeMethod.booleanValue();
    }

    @Override
    public @Nullable Boolean getValue(StackTraceElement object) {
      return Boolean.valueOf(object.isNativeMethod());
    }

    @Override
    public JsonStackTraceElementBuilder updatedValue(JsonStackTraceElementBuilder builder, @Nullable Boolean nativeMethod) {
      if (builder.lineNumber == -1 && nativeMethod != null && nativeMethod.booleanValue()) {
        builder.lineNumber = -2;
      } else if (builder.lineNumber == -2 && (nativeMethod == null || !nativeMethod.booleanValue())) {
        builder.lineNumber = -1;
      }
      return builder;
    }

    static final NativeField INSTANCE = new NativeField();

  }

}

final class JsonStackTraceElementBuilder {

  @Nullable String classLoaderName;
  @Nullable String moduleName;
  @Nullable String moduleVersion;
  @Nullable String className;
  @Nullable String methodName;
  @Nullable String fileName;
  int lineNumber;

  JsonStackTraceElementBuilder() {
    this.classLoaderName = null;
    this.moduleName = null;
    this.moduleVersion = null;
    this.className = null;
    this.methodName = null;
    this.fileName = null;
    this.lineNumber = -1;
  }

}

final class JsonThrowableFormat implements JsonFormat<Throwable>, JsonObjectParser<Object, JsonThrowableBuilder, Throwable>, JsonObjectWriter<Object, Throwable>, ToSource {

  @Override
  public @Nullable String typeName() {
    return "Throwable";
  }

  @Override
  public JsonThrowableBuilder objectBuilder() {
    return new JsonThrowableBuilder();
  }

  @Override
  public JsonFieldParser<?, JsonThrowableBuilder> getFieldParser(JsonThrowableBuilder builder, String key) throws JsonException {
    final JsonFieldParser<?, JsonThrowableBuilder> fieldParser = FIELD_PARSERS.get(key);
    if (fieldParser == null) {
      throw new JsonException(Notation.of("unsupported key: ")
                                      .appendSource(key)
                                      .toString());
    }
    return fieldParser;
  }

  @Override
  public @Nullable Throwable buildObject(JsonThrowableBuilder builder) throws JsonException {
    final Class<?> throwableClass;
    try {
      throwableClass = Class.forName(builder.className);
    } catch (ReflectiveOperationException cause) {
      throw new JsonException("unknown throwable class: " + builder.className, cause);
    }
    if (!Throwable.class.isAssignableFrom(throwableClass)) {
      throw new JsonException("non-throwable class: " + builder.className);
    }

    try {
      // new Throwable(String message, Throwable cause);
      final Constructor<?> constructor = throwableClass.getConstructor(String.class, Throwable.class);
      final Throwable throwable = (Throwable) constructor.newInstance(builder.message, builder.cause);
      throwable.setStackTrace(builder.stackTrace);
      return throwable;
    } catch (ReflectiveOperationException cause) {
      // ignore
    }

    try {
      // new Throwable(String message);
      final Constructor<?> constructor = throwableClass.getConstructor(String.class);
      final Throwable throwable = (Throwable) constructor.newInstance(builder.message);
      throwable.setStackTrace(builder.stackTrace);
      return throwable;
    } catch (ReflectiveOperationException cause) {
      // ignore
    }

    try {
      // new Throwable(Throwable cause);
      final Constructor<?> constructor = throwableClass.getConstructor(Throwable.class);
      final Throwable throwable = (Throwable) constructor.newInstance(builder.cause);
      throwable.setStackTrace(builder.stackTrace);
      return throwable;
    } catch (ReflectiveOperationException cause) {
      // ignore
    }

    try {
      // new Throwable();
      final Constructor<?> constructor = throwableClass.getConstructor();
      final Throwable throwable = (Throwable) constructor.newInstance();
      throwable.setStackTrace(builder.stackTrace);
      return throwable;
    } catch (ReflectiveOperationException cause) {
      // ignore
    }

    throw new JsonException("unable to construct throwable class: " + builder.className);
  }

  @Override
  public JsonFieldWriter<?, Throwable> getFieldWriter(Throwable object, String key) throws JsonException {
    final JsonFieldWriter<?, Throwable> fieldWriter = FIELD_WRITERS.get(key);
    if (fieldWriter == null) {
      throw new JsonException(Notation.of("unsupported key: ")
                                      .appendSource(key)
                                      .toString());
    }
    return fieldWriter;
  }

  @Override
  public Iterator<JsonFieldWriter<?, Throwable>> getFieldWriters(Throwable object) {
    return FIELD_WRITERS.valueIterator();
  }

  @Override
  public @Nullable Throwable initializer() {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonThrowables", "throwableFormat").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  @SuppressWarnings("SameNameButDifferent")
  static final UniformMap<String, JsonFieldParser<?, JsonThrowableBuilder>> FIELD_PARSERS =
      UniformMap.of("class", ClassField.INSTANCE,
                    "message", MessageField.INSTANCE,
                    "trace", TraceField.INSTANCE,
                    "cause", CauseField.INSTANCE);

  static final UniformMap<String, JsonFieldWriter<?, Throwable>> FIELD_WRITERS =
      Assume.conforms(FIELD_PARSERS);

  static final JsonThrowableFormat INSTANCE = new JsonThrowableFormat();

  static final class ClassField implements JsonFieldParser<String, JsonThrowableBuilder>, JsonFieldWriter<String, Throwable> {

    @Override
    public String key() {
      return "class";
    }

    @Override
    public JsonParser<String> valueParser() {
      return JsonLang.stringFormat();
    }

    @Override
    public JsonWriter<String> valueWriter() {
      return JsonLang.stringFormat();
    }

    @Override
    public boolean filterValue(Throwable object, @Nullable String className) {
      return true;
    }

    @Override
    public @Nullable String getValue(Throwable object) {
      return object.getClass().getName();
    }

    @Override
    public JsonThrowableBuilder updatedValue(JsonThrowableBuilder builder, @Nullable String className) {
      builder.className = className;
      return builder;
    }

    static final ClassField INSTANCE = new ClassField();

  }

  static final class MessageField implements JsonFieldParser<String, JsonThrowableBuilder>, JsonFieldWriter<String, Throwable> {

    @Override
    public String key() {
      return "message";
    }

    @Override
    public JsonParser<String> valueParser() {
      return JsonLang.stringFormat();
    }

    @Override
    public JsonWriter<String> valueWriter() {
      return JsonLang.stringFormat();
    }

    @Override
    public boolean filterValue(Throwable object, @Nullable String message) {
      return message != null;
    }

    @Override
    public @Nullable String getValue(Throwable object) {
      return object.getMessage();
    }

    @Override
    public JsonThrowableBuilder updatedValue(JsonThrowableBuilder builder, @Nullable String message) {
      builder.message = message;
      return builder;
    }

    static final MessageField INSTANCE = new MessageField();

  }

  static final class TraceField implements JsonFieldParser<StackTraceElement[], JsonThrowableBuilder>, JsonFieldWriter<StackTraceElement[], Throwable> {

    @Override
    public String key() {
      return "trace";
    }

    @Override
    public JsonParser<StackTraceElement[]> valueParser() {
      return VALUE_FORMAT;
    }

    @Override
    public JsonWriter<StackTraceElement[]> valueWriter() {
      return VALUE_FORMAT;
    }

    @Override
    public boolean filterValue(Throwable object, @Nullable StackTraceElement[] stackTrace) {
      return stackTrace != null && stackTrace.length != 0;
    }

    @Override
    public @Nullable StackTraceElement[] getValue(Throwable object) {
      return object.getStackTrace();
    }

    @Override
    public JsonThrowableBuilder updatedValue(JsonThrowableBuilder builder, @Nullable StackTraceElement[] stackTrace) {
      builder.stackTrace = stackTrace;
      return builder;
    }

    static final JsonFormat<StackTraceElement[]> VALUE_FORMAT =
        JsonLang.arrayFormat(StackTraceElement.class, JsonThrowables.stackTraceElementFormat());

    static final TraceField INSTANCE = new TraceField();

  }

  static final class CauseField implements JsonFieldParser<Throwable, JsonThrowableBuilder>, JsonFieldWriter<Throwable, Throwable> {

    @Override
    public String key() {
      return "cause";
    }

    @Override
    public JsonParser<Throwable> valueParser() {
      return JsonThrowables.throwableFormat();
    }

    @Override
    public JsonWriter<Throwable> valueWriter() {
      return JsonThrowables.throwableFormat();
    }

    @Override
    public boolean filterValue(Throwable object, @Nullable Throwable cause) {
      return cause != null;
    }

    @Override
    public @Nullable Throwable getValue(Throwable object) {
      return object.getCause();
    }

    @Override
    public JsonThrowableBuilder updatedValue(JsonThrowableBuilder builder, @Nullable Throwable cause) {
      builder.cause = cause;
      return builder;
    }

    static final CauseField INSTANCE = new CauseField();

  }

}

final class JsonThrowableBuilder {

  @Nullable String className;
  @Nullable String message;
  @Nullable StackTraceElement[] stackTrace;
  @Nullable Throwable cause;

  JsonThrowableBuilder() {
    this.className = null;
    this.message = null;
    this.stackTrace = null;
    this.cause = null;
  }

}
