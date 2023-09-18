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

package swim.recon;

import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class GetAttrSelectorWriter<I, V> extends Writer<Object, Object> {

  final ReconWriter<I, V> recon;
  final V key;
  final V then;
  final Writer<?, ?> part;
  final int step;

  GetAttrSelectorWriter(ReconWriter<I, V> recon, V key, V then, Writer<?, ?> part, int step) {
    this.recon = recon;
    this.key = key;
    this.then = then;
    this.part = part;
    this.step = step;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return GetAttrSelectorWriter.write(output, this.recon, this.key, this.then, this.part, this.step);
  }

  static <I, V> int sizeOf(ReconWriter<I, V> recon, V key, V then) {
    int size = 2; // ('$' | '.') '@'
    size += recon.sizeOfValue(key);
    size += recon.sizeOfThen(then);
    return size;
  }

  @SuppressWarnings("unchecked")
  static <I, V> Writer<Object, Object> write(Output<?> output, ReconWriter<I, V> recon,
                                             V key, V then, Writer<?, ?> part, int step) {
    if (step == 1 && output.isCont()) {
      output = output.write('$');
      step = 3;
    } else if (step == 2 && output.isCont()) {
      output = output.write('.');
      step = 3;
    }
    if (step == 3 && output.isCont()) {
      output = output.write('@');
      step = 4;
    }
    if (step == 4) {
      if (part == null) {
        part = recon.writeValue(output, key);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        return (Writer<Object, Object>) recon.writeThen(output, then);
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new GetAttrSelectorWriter<I, V>(recon, key, then, part, step);
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, ReconWriter<I, V> recon, V key, V then) {
    return GetAttrSelectorWriter.write(output, recon, key, then, null, 1);
  }

  static <I, V> Writer<Object, Object> writeThen(Output<?> output, ReconWriter<I, V> recon, V key, V then) {
    return GetAttrSelectorWriter.write(output, recon, key, then, null, 2);
  }

}
