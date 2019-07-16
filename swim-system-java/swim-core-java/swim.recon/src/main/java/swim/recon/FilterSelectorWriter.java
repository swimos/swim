// Copyright 2015-2019 SWIM.AI inc.
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

package swim.recon;

import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class FilterSelectorWriter<I, V> extends Writer<Object, Object> {
  final ReconWriter<I, V> recon;
  final V predicate;
  final V then;
  final Writer<?, ?> part;
  final int step;

  FilterSelectorWriter(ReconWriter<I, V> recon, V predicate, V then, Writer<?, ?> part, int step) {
    this.recon = recon;
    this.predicate = predicate;
    this.then = then;
    this.part = part;
    this.step = step;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.recon, this.predicate, this.then, this.part, this.step);
  }

  static <I, V> int sizeOf(ReconWriter<I, V> recon, V predicate, V then) {
    int size = 2; // '$' '['
    size += recon.sizeOfValue(predicate);
    size += 1; // ']'
    size += recon.sizeOfThen(then);
    return size;
  }

  static <I, V> int sizeOfThen(ReconWriter<I, V> recon, V predicate, V then) {
    int size = 1; // '['
    size += recon.sizeOfValue(predicate);
    size += 1; // ']'
    size += recon.sizeOfThen(then);
    return size;
  }

  @SuppressWarnings("unchecked")
  static <I, V> Writer<Object, Object> write(Output<?> output, ReconWriter<I, V> recon,
                                             V predicate, V then, Writer<?, ?> part, int step) {
    if (step == 1 && output.isCont()) {
      output = output.write('$');
      step = 2;
    }
    if (step == 2 && output.isCont()) {
      output = output.write('[');
      step = 3;
    }
    if (step == 3) {
      if (part == null) {
        part = recon.writeValue(predicate, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        step = 4;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 4 && output.isCont()) {
      output = output.write(']');
      return (Writer<Object, Object>) recon.writeThen(then, output);
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new FilterSelectorWriter<I, V>(recon, predicate, then, part, step);
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, ReconWriter<I, V> recon, V predicate, V then) {
    return write(output, recon, predicate, then, null, 1);
  }

  static <I, V> Writer<Object, Object> writeThen(Output<?> output, ReconWriter<I, V> recon, V predicate, V then) {
    return write(output, recon, predicate, then, null, 2);
  }
}
