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

package swim.log;

import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.StringOutput;
import swim.codec.Write;
import swim.codec.Writer;
import swim.util.Result;
import swim.util.Severity;

@Public
@Since("5.0")
public class LogPrinter implements LogHandler {

  final Output<?> output;

  final Writer<LogEvent> writer;

  Severity threshold;

  public LogPrinter(Output<?> output, @Nullable Writer<LogEvent> writer) {
    if (writer == null) {
      writer = LogFormat.provider();
    }
    this.output = output;
    this.writer = writer;
    this.threshold = Severity.DEBUG;
  }

  public LogPrinter(Output<?> output) {
    this(output, null);
  }

  public LogPrinter(Appendable output, @Nullable Writer<LogEvent> writer) {
    this((Output<?>) StringOutput.from(output), writer);
  }

  public LogPrinter(Appendable output) {
    this((Output<?>) StringOutput.from(output), null);
  }

  public LogPrinter(@Nullable Writer<LogEvent> writer) {
    this((Output<?>) new StringOutput(System.err), writer);
  }

  public LogPrinter() {
    this((Output<?>) new StringOutput(System.err), null);
  }

  public final Output<?> output() {
    return this.output;
  }

  public final Writer<LogEvent> writer() {
    return this.writer;
  }

  @Override
  public final Severity threshold() {
    return (Severity) THRESHOLD.getOpaque(this);
  }

  public LogPrinter threshold(Severity threshold) {
    THRESHOLD.setRelease(this, threshold);
    return this;
  }

  @Override
  public synchronized void publish(LogEvent event) {
    try {
      Write<?> write = this.writer.write(this.output, event);
      while (write.isCont()) {
        write = write.produce(this.output);
      }
      write.assertDone();
      final String lineSeparator = System.lineSeparator();
      for (int i = 0; i < lineSeparator.length(); i = lineSeparator.offsetByCodePoints(i, 1)) {
        this.output.write(lineSeparator.codePointAt(i));
      }
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      cause.printStackTrace();
    }
  }

  @Override
  public void flush() {
    this.output.flush();
  }

  @Override
  public void close() {
    // nop
  }

  private static @Nullable LogPrinter console;

  public static LogPrinter console() {
    if (LogPrinter.console == null) {
      LogPrinter.console = new LogPrinter();
    }
    return LogPrinter.console;
  }

  /**
   * {@code VarHandle} for atomically accessing the {@link #threshold} field.
   */
  static final VarHandle THRESHOLD;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      THRESHOLD = lookup.findVarHandle(LogPrinter.class, "threshold", Severity.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
