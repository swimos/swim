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

final class ChildrenSelectorWriter<I, V> extends Writer<Object, Object> {

  final ReconWriter<I, V> recon;
  final V then;
  final int step;

  ChildrenSelectorWriter(ReconWriter<I, V> recon, V then, int step) {
    this.recon = recon;
    this.then = then;
    this.step = step;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return ChildrenSelectorWriter.write(output, this.recon, this.then, this.step);
  }

  static <I, V> int sizeOf(ReconWriter<I, V> recon, V then) {
    int size = 2; // ('$' | '.') '*'
    size += recon.sizeOfThen(then);
    return size;
  }

  @SuppressWarnings("unchecked")
  static <I, V> Writer<Object, Object> write(Output<?> output, ReconWriter<I, V> recon,
                                             V then, int step) {
    if (step == 1 && output.isCont()) {
      output = output.write('$');
      step = 3;
    } else if (step == 2 && output.isCont()) {
      output = output.write('.');
      step = 3;
    }
    if (step == 3 && output.isCont()) {
      output = output.write('*');
      return (Writer<Object, Object>) recon.writeThen(output, then);
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new ChildrenSelectorWriter<I, V>(recon, then, step);
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, ReconWriter<I, V> recon, V then) {
    return ChildrenSelectorWriter.write(output, recon, then, 1);
  }

  static <I, V> Writer<Object, Object> writeThen(Output<?> output, ReconWriter<I, V> recon, V then) {
    return ChildrenSelectorWriter.write(output, recon, then, 2);
  }

}
