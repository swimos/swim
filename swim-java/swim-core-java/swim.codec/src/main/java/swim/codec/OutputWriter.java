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

package swim.codec;

final class OutputWriter<I, O> extends Writer<I, O> {
  final Output<?> output;
  final Writer<I, O> writer;

  OutputWriter(Output<?> output, Writer<I, O> writer) {
    this.output = output;
    this.writer = writer;
  }

  @Override
  public Writer<I, O> feed(I input) {
    return new OutputWriter<I, O>(this.output, this.writer.feed(input));
  }

  @Override
  public Writer<I, O> pull(Output<?> output) {
    if (this.output != null) {
      output = this.output.fork(output);
    }
    return write(output, this.writer);
  }

  @Override
  public Writer<I, O> fork(Object condition) {
    return new OutputWriter<I, O>(this.output, this.writer.fork(condition));
  }

  @Override
  public O bind() {
    return this.writer.bind();
  }

  @Override
  public Throwable trap() {
    return this.writer.trap();
  }

  static <I, O> Writer<I, O> write(Output<?> output, Writer<I, O> writer) {
    writer = writer.pull(output);
    if (!writer.isCont()) {
      return writer;
    }
    return new OutputWriter<I, O>(output, writer);
  }
}
