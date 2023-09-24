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

import java.util.function.Function;
import swim.annotations.Contravariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.BinaryOutput;
import swim.codec.Output;
import swim.codec.StringOutput;
import swim.codec.Text;
import swim.codec.Write;
import swim.decl.FilterMode;
import swim.expr.Expr;
import swim.term.Term;
import swim.term.TermException;
import swim.term.TermWriter;
import swim.term.TermWriterOptions;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.Result;
import swim.util.WriteSource;

/**
 * A writer of values to JSON.
 *
 * @param <T> the type of values to write to JSON
 */
@Public
@Since("5.0")
public interface JsonWriter<@Contravariant T> extends TermWriter<T> {

  @Nullable String typeName();

  default boolean filter(@Nullable T value, FilterMode filterMode) throws JsonException {
    switch (filterMode) {
      case DEFINED:
      case TRUTHY:
      case DISTINCT:
        return value != null;
      default:
        return true;
    }
  }

  @Override
  default Write<?> write(Output<?> output, @Nullable T value, TermWriterOptions options) {
    return this.write(output, value, JsonWriterOptions.standard().withOptions(options));
  }

  Write<?> write(Output<?> output, @Nullable T value, JsonWriterOptions options);

  @Override
  default Write<?> write(Output<?> output, @Nullable T value) {
    return this.write(output, value, JsonWriterOptions.standard());
  }

  default Write<?> write(@Nullable T value, JsonWriterOptions options) {
    return this.write(BinaryOutput.full(), value, options);
  }

  @Override
  default Write<?> write(@Nullable T value) {
    return this.write(value, JsonWriterOptions.standard());
  }

  default String toString(@Nullable T value, JsonWriterOptions options) {
    final StringOutput output = new StringOutput();
    this.write(output, value, options).assertDone();
    return output.get();
  }

  @Override
  default String toString(@Nullable T value) {
    return this.toString(value, JsonWriterOptions.standard());
  }

  default Write<?> writeUndefined(Output<?> output) {
    return Text.write(output, "undefined");
  }

  default Write<?> writeNull(Output<?> output) {
    return Text.write(output, "null");
  }

  @Override
  default Write<?> writeTerm(Output<?> output, Term term, TermWriterOptions options) {
    options = JsonWriterOptions.standard().withOptions(options);
    if (term instanceof Expr) {
      return ((Expr) term).write(output, this, options);
    }
    final Object value;
    try {
      value = options.termRegistry().fromTerm(term);
    } catch (TermException cause) {
      return Write.error(cause);
    }
    return Json.metaCodec().write(output, value, options);
  }

  default <S> JsonWriter<S> unmap(Function<? super S, ? extends T> unmapper) {
    return new JsonWriterUnmapper<S, T>(this, unmapper);
  }

  static <T> JsonWriter<T> unsupported() {
    return Assume.conforms(JsonWriterUnsupported.INSTANCE);
  }

}

final class JsonWriterUnmapper<T, U> implements JsonWriter<T>, WriteSource {

  final JsonWriter<U> writer;
  final Function<? super T, ? extends U> unmapper;

  JsonWriterUnmapper(JsonWriter<U> writer, Function<? super T, ? extends U> unmapper) {
    this.writer = writer;
    this.unmapper = unmapper;
  }

  @Override
  public @Nullable String typeName() {
    return this.writer.typeName();
  }

  @Override
  public boolean filter(@Nullable T value, FilterMode filterMode) throws JsonException {
    try {
      return this.writer.filter(this.unmapper.apply(value), filterMode);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonException(cause);
    }
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T value, JsonWriterOptions options) {
    try {
      return this.writer.write(output, this.unmapper.apply(value), options);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      return Write.error(cause);
    }
  }

  @Override
  public <S> JsonWriter<S> unmap(Function<? super S, ? extends T> unmapper) {
    return new JsonWriterUnmapper<S, U>(this.writer, this.unmapper.compose(unmapper));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.appendSource(this.writer)
            .beginInvoke("unmap")
            .appendArgument(this.unmapper)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class JsonWriterUnsupported implements JsonWriter<Object>, WriteSource {

  private JsonWriterUnsupported() {
    // singleton
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @Override
  public boolean filter(@Nullable Object value, FilterMode filterMode) throws JsonException {
    throw new JsonException("unsupported");
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable Object value, JsonWriterOptions options) {
    return Write.error(new JsonException("unsupported"));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonWriter", "unsupported").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final JsonWriterUnsupported INSTANCE = new JsonWriterUnsupported();

}
