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

final class ConditionalOperatorWriter<I, V> extends Writer<Object, Object> {
  final ReconWriter<I, V> recon;
  final I ifTerm;
  final I thenTerm;
  final I elseTerm;
  final int precedence;
  final Writer<?, ?> part;
  final int step;

  ConditionalOperatorWriter(ReconWriter<I, V> recon, I ifTerm, I thenTerm, I elseTerm,
                            int precedence, Writer<?, ?> part, int step) {
    this.recon = recon;
    this.ifTerm = ifTerm;
    this.thenTerm = thenTerm;
    this.elseTerm = elseTerm;
    this.precedence = precedence;
    this.part = part;
    this.step = step;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.recon, this.ifTerm, this.thenTerm, this.elseTerm,
                 this.precedence, this.part, this.step);
  }

  static <I, V> int sizeOf(ReconWriter<I, V> recon, I ifTerm, I thenTerm, I elseTerm, int precedence) {
    int size = 0;
    if (recon.precedence(ifTerm) > 0 && recon.precedence(ifTerm) <= precedence) {
      size += 1; // '('
      size += recon.sizeOfItem(ifTerm);
      size += 1; // ')'
    } else {
      size += recon.sizeOfItem(ifTerm);
    }
    size += 3; // " ? "
    size += recon.sizeOfItem(thenTerm);
    size += 3; // " : "
    size += recon.sizeOfItem(elseTerm);
    return size;
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, ReconWriter<I, V> recon,
                                             I ifTerm, I thenTerm, I elseTerm, int precedence,
                                             Writer<?, ?> part, int step) {
    if (step == 1) {
      if (recon.precedence(ifTerm) > 0 && recon.precedence(ifTerm) <= precedence) {
        if (output.isCont()) {
          output = output.write('(');
          step = 2;
        }
      } else {
        step = 2;
      }
    }
    if (step == 2) {
      if (part == null) {
        part = recon.writeItem(ifTerm, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        step = 3;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 3) {
      if (recon.precedence(ifTerm) > 0 && recon.precedence(ifTerm) <= precedence) {
        if (output.isCont()) {
          output = output.write(')');
          step = 4;
        }
      } else {
        step = 4;
      }
    }
    if (step == 4 && output.isCont()) {
      output = output.write(' ');
      step = 5;
    }
    if (step == 5 && output.isCont()) {
      output = output.write('?');
      step = 6;
    }
    if (step == 6 && output.isCont()) {
      output = output.write(' ');
      step = 7;
    }
    if (step == 7) {
      if (part == null) {
        part = recon.writeItem(thenTerm, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        step = 8;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 8 && output.isCont()) {
      output = output.write(' ');
      step = 9;
    }
    if (step == 9 && output.isCont()) {
      output = output.write(':');
      step = 10;
    }
    if (step == 10 && output.isCont()) {
      output = output.write(' ');
      step = 11;
    }
    if (step == 11) {
      if (part == null) {
        part = recon.writeItem(elseTerm, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        return done();
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new ConditionalOperatorWriter<I, V>(recon, ifTerm, thenTerm, elseTerm,
                                               precedence, part, step);
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, ReconWriter<I, V> recon,
                                             I ifTerm, I thenTerm, I elseTerm, int precedence) {
    return write(output, recon, ifTerm, thenTerm, elseTerm, precedence, null, 1);
  }
}
