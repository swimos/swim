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

import java.math.BigInteger;
import swim.annotations.Contravariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base10;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;

@Public
@Since("5.0")
public interface WamlNumberWriter<@Contravariant T> extends WamlWriter<T> {

  @Nullable Number intoNumber(@Nullable T value) throws WamlException;

  @Override
  default Write<?> write(Output<?> output, @Nullable Object attrs,
                         @Nullable T value, WamlWriterOptions options) {
    final Number number;
    try {
      number = this.intoNumber(value);
    } catch (WamlException cause) {
      return Write.error(cause);
    }
    if (number == null) {
      return this.writeUnit(output, attrs, options);
    }
    return this.writeNumber(output, attrs, number, options);
  }

  default Write<?> writeInt(Output<?> output, @Nullable Object attrs,
                            int number, WamlWriterOptions options) {
    return WriteWamlInteger.write(output, this, options, attrs, (long) number, null, 0, 1);
  }

  default Write<?> writeLong(Output<?> output, @Nullable Object attrs,
                             long number, WamlWriterOptions options) {
    return WriteWamlInteger.write(output, this, options, attrs, number, null, 0, 1);
  }

  default Write<?> writeFloat(Output<?> output, @Nullable Object attrs,
                              float number, WamlWriterOptions options) {
    return WriteWamlNumber.write(output, this, options, attrs, Float.toString(number), null, 0, 1);
  }

  default Write<?> writeDouble(Output<?> output, @Nullable Object attrs,
                               double number, WamlWriterOptions options) {
    return WriteWamlNumber.write(output, this, options, attrs, Double.toString(number), null, 0, 1);
  }

  default Write<?> writeBigInteger(Output<?> output, @Nullable Object attrs,
                                  BigInteger number, WamlWriterOptions options) {
    return WriteWamlNumber.write(output, this, options, attrs, number.toString(), null, 0, 1);
  }

  default Write<?> writeNumber(Output<?> output, @Nullable Object attrs,
                               Number number, WamlWriterOptions options) {
    return WriteWamlNumber.write(output, this, options, attrs, number.toString(), null, 0, 1);
  }

}

final class WriteWamlInteger extends Write<Object> {

  final WamlWriter<?> writer;
  final WamlWriterOptions options;
  final @Nullable Object attrs;
  final long value;
  final @Nullable Write<?> write;
  final int index;
  final int step;

  WriteWamlInteger(WamlWriter<?> writer, WamlWriterOptions options, @Nullable Object attrs,
                   long value, @Nullable Write<?> write, int index, int step) {
    this.writer = writer;
    this.options = options;
    this.attrs = attrs;
    this.value = value;
    this.write = write;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlInteger.write(output, this.writer, this.options, this.attrs,
                                  this.value, this.write, this.index, this.step);
  }

  static Write<Object> write(Output<?> output, WamlWriter<?> writer,
                             WamlWriterOptions options, @Nullable Object attrs,
                             long value, @Nullable Write<?> write, int index, int step) {
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
      if (value >= 0L) {
        step = 3;
      } else if (output.isCont()) {
        output.write('-');
        step = 3;
      }
    }
    if (step == 3 && output.isCont()) {
      if (-10L < value && value < 10L) {
        output.write(Base10.encodeDigit(Math.abs((int) value)));
        return Write.done();
      } else {
        final int[] digits = new int[19];
        long x = value;
        int i = 18;
        while (x != 0L) {
          digits[i] = Math.abs((int) (x % 10L));
          x /= 10L;
          i -= 1;
        }
        i += 1 + index;
        while (i < 19 && output.isCont()) {
          output.write(Base10.encodeDigit(digits[i]));
          index += 1;
          i += 1;
        }
        if (i == 19) {
          return Write.done();
        }
      }
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlInteger(writer, options, attrs, value, write, index, step);
  }

}

final class WriteWamlNumber extends Write<Object> {

  final WamlWriter<?> writer;
  final WamlWriterOptions options;
  final @Nullable Object attrs;
  final String value;
  final @Nullable Write<?> write;
  final int index;
  final int step;

  WriteWamlNumber(WamlWriter<?> writer, WamlWriterOptions options, @Nullable Object attrs,
                  String value, @Nullable Write<?> write, int index, int step) {
    this.writer = writer;
    this.options = options;
    this.attrs = attrs;
    this.value = value;
    this.write = write;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlNumber.write(output, this.writer, this.options, this.attrs,
                                 this.value, this.write, this.index, this.step);
  }

  static Write<Object> write(Output<?> output, WamlWriter<?> writer,
                             WamlWriterOptions options, @Nullable Object attrs,
                             String value, @Nullable Write<?> write, int index, int step) {
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
      while (index < value.length() && output.isCont()) {
        output.write(value.codePointAt(index));
        index = value.offsetByCodePoints(index, 1);
      }
      if (index == value.length()) {
        return Write.done();
      }
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlNumber(writer, options, attrs, value, write, index, step);
  }

}
