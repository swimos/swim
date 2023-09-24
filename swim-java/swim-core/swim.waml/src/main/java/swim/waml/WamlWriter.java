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
import swim.codec.WriteException;
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
 * A writer of values to WAML.
 *
 * @param <T> the type of values to write to WAML
 */
@Public
@Since("5.0")
public interface WamlWriter<@Contravariant T> extends TermWriter<T> {

  @Nullable String typeName();

  default WamlAttrsWriter<?, Object> attrsWriter() {
    return WamlReprs.attrsWriter();
  }

  default @Nullable Object getAttrs(@Nullable T value) throws WamlException {
    return null;
  }

  default boolean filter(@Nullable T value, FilterMode filterMode) throws WamlException {
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
    return this.write(output, value, WamlWriterOptions.readable().withOptions(options));
  }

  Write<?> write(Output<?> output, @Nullable Object attrs, @Nullable T value, WamlWriterOptions options);

  default Write<?> write(Output<?> output, @Nullable T value, WamlWriterOptions options) {
    final Object attrs;
    try {
      attrs = this.getAttrs(value);
    } catch (WamlException cause) {
      return Write.error(cause);
    }
    return this.write(output, attrs, value, options);
  }

  @Override
  default Write<?> write(Output<?> output, @Nullable T value) {
    return this.write(output, value, WamlWriterOptions.readable());
  }

  default Write<?> write(@Nullable T value, WamlWriterOptions options) {
    return this.write(BinaryOutput.full(), value, options);
  }

  @Override
  default Write<?> write(@Nullable T value) {
    return this.write(value, WamlWriterOptions.readable());
  }

  default String toString(@Nullable T value, WamlWriterOptions options) {
    final StringOutput output = new StringOutput();
    this.write(output, value, options).assertDone();
    return output.get();
  }

  @Override
  default String toString(@Nullable T value) {
    return this.toString(value, WamlWriterOptions.readable());
  }

  default Write<?> writeBlock(Output<?> output, @Nullable T value, WamlWriterOptions options) {
    return this.write(output, value, options);
  }

  default Write<?> writeBlock(Output<?> output, @Nullable T value) {
    return this.writeBlock(output, value, WamlWriterOptions.readable());
  }

  default Write<?> writeBlock(@Nullable T value, WamlWriterOptions options) {
    return this.writeBlock(BinaryOutput.full(), value, options);
  }

  default Write<?> writeBlock(@Nullable T value) {
    return this.writeBlock(value, WamlWriterOptions.readable());
  }

  default String toBlockString(@Nullable T value, WamlWriterOptions options) {
    final StringOutput output = new StringOutput();
    this.writeBlock(output, value, options).assertDone();
    return output.get();
  }

  default String toBlockString(@Nullable T value) {
    return this.toBlockString(value, WamlWriterOptions.readable());
  }

  default Write<?> writeUnit(Output<?> output) {
    return Text.write(output, "()");
  }

  default boolean isInline(@Nullable T value) {
    return false;
  }

  default Write<?> writeInline(Output<?> output, @Nullable T value, WamlWriterOptions options) {
    return this.write(output, value, options);
  }

  default Write<?> writeUnit(Output<?> output, @Nullable Object attrs, WamlWriterOptions options) {
    return WriteWamlUnit.write(output, this, options, attrs, null, 1);
  }

  default Write<?> writeTuple(Output<?> output, @Nullable Object attrs,
                              @Nullable T value, WamlWriterOptions options) {
    return WriteWamlTuple.write(output, this, options, attrs, value, null, 1);
  }

  default Write<?> writeTerm(Output<?> output, @Nullable Object attrs,
                             Term term, WamlWriterOptions options) {
    return WriteWamlTerm.write(output, this, options, attrs, term, null, 1);
  }

  @Override
  default Write<?> writeTerm(Output<?> output, Term term, TermWriterOptions options) {
    options = WamlWriterOptions.readable().withOptions(options);
    if (term instanceof Expr) {
      return ((Expr) term).write(output, this, options);
    }
    final Object value;
    try {
      value = options.termRegistry().fromTerm(term);
    } catch (TermException cause) {
      return Write.error(cause);
    }
    return Waml.metaCodec().write(output, value, options);
  }

  default <S> WamlWriter<S> unmap(Function<? super S, ? extends T> unmapper) {
    return new WamlWriterUnmapper<S, T>(this, unmapper);
  }

  static <T> WamlWriter<T> unsupported() {
    return Assume.conforms(WamlWriterUnsupported.INSTANCE);
  }

}

final class WamlWriterUnmapper<T, U> implements WamlWriter<T>, WriteSource {

  final WamlWriter<U> writer;
  final Function<? super T, ? extends U> unmapper;

  WamlWriterUnmapper(WamlWriter<U> writer, Function<? super T, ? extends U> unmapper) {
    this.writer = writer;
    this.unmapper = unmapper;
  }

  @Override
  public @Nullable String typeName() {
    return this.writer.typeName();
  }

  @Override
  public WamlAttrsWriter<?, Object> attrsWriter() {
    return this.writer.attrsWriter();
  }

  @Override
  public @Nullable Object getAttrs(@Nullable T value) throws WamlException {
    try {
      return this.writer.getAttrs(this.unmapper.apply(value));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public boolean filter(@Nullable T value, FilterMode filterMode) throws WamlException {
    try {
      return this.writer.filter(this.unmapper.apply(value), filterMode);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable Object attrs,
                        @Nullable T value, WamlWriterOptions options) {
    try {
      return this.writer.write(output, attrs, this.unmapper.apply(value), options);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      return Write.error(cause);
    }
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T value, WamlWriterOptions options) {
    final U mapped;
    try {
      mapped = this.unmapper.apply(value);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      return Write.error(cause);
    }
    final Object attrs;
    try {
      attrs = this.writer.getAttrs(mapped);
    } catch (WamlException cause) {
      return Write.error(cause);
    }
    return this.writer.write(output, attrs, mapped, options);
  }

  @Override
  public Write<?> writeBlock(Output<?> output, @Nullable T value, WamlWriterOptions options) {
    try {
      return this.writer.writeBlock(output, this.unmapper.apply(value), options);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      return Write.error(cause);
    }
  }

  @Override
  public boolean isInline(@Nullable T value) {
    try {
      return this.writer.isInline(this.unmapper.apply(value));
    } catch (Throwable cause) {
      Result.throwFatal(cause);
    }
    return false;
  }

  @Override
  public Write<?> writeInline(Output<?> output, @Nullable T value, WamlWriterOptions options) {
    try {
      return this.writer.writeInline(output, this.unmapper.apply(value), options);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      return Write.error(cause);
    }
  }

  @Override
  public Write<?> writeTuple(Output<?> output, @Nullable Object attrs,
                              @Nullable T value, WamlWriterOptions options) {
    try {
      return this.writer.writeTuple(output, attrs, this.unmapper.apply(value), options);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      return Write.error(cause);
    }
  }

  @Override
  public <S> WamlWriter<S> unmap(Function<? super S, ? extends T> unmapper) {
    return new WamlWriterUnmapper<S, U>(this.writer, this.unmapper.compose(unmapper));
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

final class WamlWriterUnsupported implements WamlWriter<Object>, WriteSource {

  private WamlWriterUnsupported() {
    // singleton
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @Override
  public @Nullable Object getAttrs(@Nullable Object value) throws WamlException {
    throw new WamlException("unsupported");
  }

  @Override
  public boolean filter(@Nullable Object value, FilterMode filterMode) throws WamlException {
    throw new WamlException("unsupported");
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable Object attrs,
                        @Nullable Object value, WamlWriterOptions options) {
    return Write.error(new WamlException("unsupported"));
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable Object value, WamlWriterOptions options) {
    return Write.error(new WamlException("unsupported"));
  }

  @Override
  public Write<?> writeBlock(Output<?> output, @Nullable Object value, WamlWriterOptions options) {
    return Write.error(new WamlException("unsupported"));
  }

  @Override
  public Write<?> writeInline(Output<?> output, @Nullable Object value, WamlWriterOptions options) {
    return Write.error(new WamlException("unsupported"));
  }

  @Override
  public Write<?> writeTuple(Output<?> output, @Nullable Object attrs,
                              @Nullable Object value, WamlWriterOptions options) {
    return Write.error(new WamlException("unsupported"));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlWriter", "unsupported").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final WamlWriterUnsupported INSTANCE = new WamlWriterUnsupported();

}

final class WriteWamlUnit extends Write<Object> {

  final WamlWriter<?> writer;
  final WamlWriterOptions options;
  final @Nullable Object attrs;
  final @Nullable Write<?> write;
  final int step;

  WriteWamlUnit(WamlWriter<?> writer, WamlWriterOptions options,
                @Nullable Object attrs, @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.options = options;
    this.attrs = attrs;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlUnit.write(output, this.writer, this.options,
                               this.attrs, this.write, this.step);
  }

  static Write<Object> write(Output<?> output, WamlWriter<?> writer, WamlWriterOptions options,
                             @Nullable Object attrs, @Nullable Write<?> write, int step) {
    if (step == 1) {
      if (write == null) {
        final WamlAttrsWriter<?, Object> attrsWriter = writer.attrsWriter();
        if (attrsWriter.isEmptyAttrs(attrs)) {
          step = 2;
        } else {
          write = attrsWriter.writeAttrs(output, attrs, options, false);
        }
      } else {
        write = write.produce(output);
      }
      if (write != null) {
        if (write.isDone()) {
          return Write.done();
        } else if (write.isError()) {
          return write.asError();
        }
      }
    }
    if (step == 2 && output.isCont()) {
      output.write('(');
      step = 3;
    }
    if (step == 3 && output.isCont()) {
      output.write(')');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlUnit(writer, options, attrs, write, step);
  }

}

final class WriteWamlTuple<T> extends Write<Object> {

  final WamlWriter<T> writer;
  final WamlWriterOptions options;
  final @Nullable Object attrs;
  final @Nullable T value;
  final @Nullable Write<?> write;
  final int step;

  WriteWamlTuple(WamlWriter<T> writer, WamlWriterOptions options, @Nullable Object attrs,
                 @Nullable T value, @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.options = options;
    this.attrs = attrs;
    this.value = value;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlTuple.write(output, this.writer, this.options, this.attrs,
                                this.value, this.write, this.step);
  }

  static <T> Write<Object> write(Output<?> output, WamlWriter<T> writer,
                                 WamlWriterOptions options, @Nullable Object attrs,
                                 @Nullable T value, @Nullable Write<?> write, int step) {
    if (step == 1) {
      if (write == null) {
        write = writer.attrsWriter().writeAttrs(output, attrs, options, true);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 2;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 2 && output.isCont()) {
      output.write('(');
      step = 3;
    }
    if (step == 3) {
      if (write == null) {
        write = writer.writeBlock(output, value, options);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 4;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 4 && output.isCont()) {
      output.write(')');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlTuple<T>(writer, options, attrs, value, write, step);
  }

}

final class WriteWamlTerm extends Write<Object> {

  final WamlWriter<?> writer;
  final WamlWriterOptions options;
  final @Nullable Object attrs;
  final Term term;
  final @Nullable Write<?> write;
  final int step;

  WriteWamlTerm(WamlWriter<?> writer, WamlWriterOptions options, @Nullable Object attrs,
                Term term, @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.options = options;
    this.attrs = attrs;
    this.term = term;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlTerm.write(output, this.writer, this.options, this.attrs,
                               this.term, this.write, this.step);
  }

  static Write<Object> write(Output<?> output, WamlWriter<?> writer,
                             WamlWriterOptions options, @Nullable Object attrs,
                             Term term, @Nullable Write<?> write, int step) {
    if (step == 1) {
      if (write == null) {
        write = writer.attrsWriter().writeAttrs(output, attrs, options, true);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 2;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 2) {
      return Assume.covariant(writer.writeTerm(output, term, options));
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlTerm(writer, options, attrs, term, write, step);
  }

}
