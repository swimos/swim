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

package swim.runtime.reflect;

import swim.structure.Attr;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;

public class LogEntry {
  protected final String tag;
  protected final long time;
  protected final Uri nodeUri;
  protected final Uri laneUri;
  protected final Value message;

  public LogEntry(String tag, long time, Uri nodeUri, Uri laneUri, Value message) {
    this.tag = tag;
    this.time = time;
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
    this.message = message;
  }

  public final String tag() {
    return this.tag;
  }

  public final long time() {
    return this.time;
  }

  public final Uri nodeUri() {
    return this.nodeUri;
  }

  public final Uri laneUri() {
    return this.laneUri;
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  public static LogEntry message(String tag, Uri nodeUri, Uri laneUri, Object message) {
    final long time = System.currentTimeMillis();
    return new LogEntry(tag, time, nodeUri, laneUri, Value.fromObject(message));
  }

  public static LogEntry trace(Uri nodeUri, Uri laneUri, Object message) {
    return message("trace", nodeUri, laneUri, message);
  }

  public static LogEntry trace(Uri nodeUri, Object message) {
    return message("trace", nodeUri, Uri.empty(), message);
  }

  public static LogEntry trace(Object message) {
    return message("trace", Uri.empty(), Uri.empty(), message);
  }

  public static LogEntry debug(Uri nodeUri, Uri laneUri, Object message) {
    return message("debug", nodeUri, laneUri, message);
  }

  public static LogEntry debug(Uri nodeUri, Object message) {
    return message("debug", nodeUri, Uri.empty(), message);
  }

  public static LogEntry debug(Object message) {
    return message("debug", Uri.empty(), Uri.empty(), message);
  }

  public static LogEntry info(Uri nodeUri, Uri laneUri, Object message) {
    return message("info", nodeUri, laneUri, message);
  }

  public static LogEntry info(Uri nodeUri, Object message) {
    return message("info", nodeUri, Uri.empty(), message);
  }

  public static LogEntry info(Object message) {
    return message("info", Uri.empty(), Uri.empty(), message);
  }

  public static LogEntry warn(Uri nodeUri, Uri laneUri, Object message) {
    return message("warn", nodeUri, laneUri, message);
  }

  public static LogEntry warn(Uri nodeUri, Object message) {
    return message("warn", nodeUri, Uri.empty(), message);
  }

  public static LogEntry warn(Object message) {
    return message("warn", Uri.empty(), Uri.empty(), message);
  }

  public static LogEntry error(Uri nodeUri, Uri laneUri, Object message) {
    return message("error", nodeUri, laneUri, message);
  }

  public static LogEntry error(Uri nodeUri, Object message) {
    return message("error", nodeUri, Uri.empty(), message);
  }

  public static LogEntry error(Object message) {
    return message("error", Uri.empty(), Uri.empty(), message);
  }

  public static LogEntry fail(Uri nodeUri, Uri laneUri, Object message) {
    return message("fail", nodeUri, laneUri, message instanceof Throwable ? moldException((Throwable) message) : message);
  }

  public static LogEntry fail(Uri nodeUri, Object message) {
    return message("fail", nodeUri, Uri.empty(), message instanceof Throwable ? moldException((Throwable) message) : message);
  }

  public static LogEntry fail(Object message) {
    return message("fail", Uri.empty(), Uri.empty(), message instanceof Throwable ? moldException((Throwable) message) : message);
  }

  public static final Uri TRACE_LOG_URI = Uri.parse("traceLog");
  public static final Uri DEBUG_LOG_URI = Uri.parse("debugLog");
  public static final Uri INFO_LOG_URI = Uri.parse("infoLog");
  public static final Uri WARN_LOG_URI = Uri.parse("warnLog");
  public static final Uri ERROR_LOG_URI = Uri.parse("errorLog");
  public static final Uri FAIL_LOG_URI = Uri.parse("failLog");

  private static Form<LogEntry> form;

  @Kind
  public static Form<LogEntry> form() {
    if (form == null) {
      form = new LogEntryForm();
    }
    return form;
  }

  static Value moldException(Throwable cause) {
    final StackTraceElement[] frames = cause.getStackTrace();
    final int frameCount = frames.length;
    final Record record = Record.create(1 + frameCount)
        .attr("exception", cause.getMessage());
    for (int i = 0; i < frameCount; i += 1) {
      record.item(moldStackFrame(frames[i]));
    }
    return record;
  }

  static Value moldStackFrame(StackTraceElement frame) {
    final Record header = Record.create(4)
        .slot("class", frame.getClassName())
        .slot("method", frame.getMethodName());
    if (frame.isNativeMethod()) {
      header.slot("native", true);
    }
    if (frame.getFileName() != null) {
      header.slot("file", frame.getFileName());
    }
    if (frame.getLineNumber() >= 0) {
      header.slot("line", frame.getLineNumber());
    }
    return Record.create(1).attr("at", header);
  }
}

final class LogEntryForm extends Form<LogEntry> {
  @Override
  public Class<?> type() {
    return LogEntry.class;
  }

  @Override
  public Item mold(LogEntry entry) {
    if (entry != null) {
      final Record header = Record.create(3);
      header.slot("time", entry.time);
      if (entry.nodeUri.isDefined()) {
        header.slot("node", entry.nodeUri.toString());
      }
      if (entry.laneUri.isDefined()) {
        header.slot("lane", entry.laneUri.toString());
      }
      return Attr.of(entry.tag, header).concat(entry.message);
    } else {
      return Item.extant();
    }
  }

  @Override
  public LogEntry cast(Item item) {
    final Value value = item.toValue();
    final Item head = value.head();
    if (head instanceof Attr) {
      final String tag = ((Attr) head).name();
      final Value header = ((Attr) head).value();
      final long time = header.get("time").longValue(0L);
      final Uri nodeUri = header.get("node").coerce(Uri.form());
      final Uri laneUri = header.get("lane").coerce(Uri.form());
      final Value message = value.body();
      return new LogEntry(tag, time, nodeUri, laneUri, message);
    }
    return null;
  }
}
