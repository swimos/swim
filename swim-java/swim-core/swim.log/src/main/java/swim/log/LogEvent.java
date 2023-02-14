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
import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.expr.Evaluator;
import swim.expr.Term;
import swim.expr.TermForm;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.Severity;
import swim.util.ToSource;

@Public
@Since("5.0")
public class LogEvent implements Term, ToSource {

  protected final long seq;

  protected final Instant time;

  protected final String topic;

  protected final String focus;

  protected final LogScope scope;

  protected final Severity level;

  protected final String message;

  protected final @Nullable Object detail;

  protected final @Nullable Throwable cause;

  public LogEvent(long seq, Instant time, String topic, String focus,
                  LogScope scope, Severity level, String message,
                  @Nullable Object detail, @Nullable Throwable cause) {
    this.seq = seq;
    this.time = time;
    this.topic = topic;
    this.focus = focus;
    this.scope = scope;
    this.level = level;
    this.message = message;
    this.detail = detail;
    this.cause = cause;
  }

  LogEvent() {
    this(0L, Instant.EPOCH, "", "", LogScope.root(), Severity.OFF, "", null, null);
  }

  public final long seq() {
    return this.seq;
  }

  public final Instant time() {
    return this.time;
  }

  public final String topic() {
    return this.topic;
  }

  public final String focus() {
    return this.focus;
  }

  public final LogScope scope() {
    return this.scope;
  }

  public final Severity level() {
    return this.level;
  }

  public final String message() {
    return this.message;
  }

  public final @Nullable Object detail() {
    return this.detail;
  }

  public final @Nullable Throwable cause() {
    return this.cause;
  }

  @Override
  public @Nullable Term getChild(Evaluator evaluator, Term keyExpr) {
    final Term keyTerm = keyExpr.evaluate(evaluator);
    final String key = keyTerm.isValidString() ? keyTerm.stringValue() : null;
    if (key != null) {
      switch (key) {
        case "seq":
          return Term.of(this.seq);
        case "time":
          return INSTANT_FORM.intoTerm(this.time);
        case "topic":
          return Term.of(this.topic);
        case "focus":
          return Term.of(this.focus);
        case "scope":
          return this.scope;
        case "level":
          return SEVERITY_FORM.intoTerm(this.level);
        case "message":
          return Term.of(this.message);
        case "detail":
          return Term.from(this.detail);
        case "cause":
          return THROWABLE_FORM.intoTerm(this.cause);
      }
    }
    return null;
  }

  @Override
  public boolean isValidObject() {
    return true;
  }

  @Override
  public Object objectValue() {
    return this;
  }

  protected boolean canEqual(Object other) {
    return other instanceof LogEvent;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof LogEvent) {
      final LogEvent that = (LogEvent) other;
      return that.canEqual(this)
          && this.seq == that.seq
          && this.time.equals(that.time)
          && this.topic.equals(that.topic)
          && this.focus.equals(that.focus)
          && this.scope.equals(that.scope)
          && this.level.equals(that.level)
          && this.message.equals(that.message)
          && Objects.equals(this.detail, that.detail)
          && Objects.equals(this.cause, that.cause);
    }
    return false;
  }

  private static final int hashSeed = Murmur3.seed(LogEvent.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        LogEvent.hashSeed, Murmur3.hash(this.seq)), this.time.hashCode()),
        this.topic.hashCode()), this.focus.hashCode()),
        this.scope.hashCode()), this.level.hashCode()),
        this.message.hashCode()), Objects.hashCode(this.detail)),
        Objects.hashCode(this.cause)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvokeNew("LogEvent")
            .appendArgument(this.seq)
            .beginArgument()
            .beginInvoke("Instant", "parse")
            .appendArgument(this.time.toString())
            .endInvoke()
            .endArgument()
            .appendArgument(this.topic)
            .appendArgument(this.focus)
            .appendArgument(this.scope)
            .appendArgument(this.level)
            .appendArgument(this.message)
            .appendArgument(this.detail)
            .appendArgument(this.cause)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static LogEvent create(String topic, String focus, LogScope scope,
                                Severity level, String message,
                                @Nullable Object detail,
                                @Nullable Throwable cause) {
    return new LogEvent(LogEvent.nextSequence(), LogEvent.nextInstant(),
                        topic, focus, scope, level, message, detail, cause);
  }

  protected static long nextSequence() {
    return (long) SEQUENCE_COUNT.getAndAddAcquire(1L);
  }

  protected static Instant nextInstant() {
    return CLOCK.instant();
  }

  /**
   * Atomic log event sequence counter.
   */
  static volatile long sequenceCount = 1L;

  static final Clock CLOCK = Clock.systemUTC();

  /**
   * {@code VarHandle} for atomically accessing the static {@link #sequenceCount} field.
   */
  static final VarHandle SEQUENCE_COUNT;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      SEQUENCE_COUNT = lookup.findStaticVarHandle(LogEvent.class, "sequenceCount", Long.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

  static final TermForm<Instant> INSTANT_FORM = TermForm.forType(Instant.class);

  static final TermForm<Severity> SEVERITY_FORM = TermForm.forType(Severity.class);

  static final TermForm<Throwable> THROWABLE_FORM = TermForm.forType(Throwable.class);

}
