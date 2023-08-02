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

import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Severity;

@Public
@Since("5.0")
public interface Log {

  String topic();

  default String focus() {
    return "";
  }

  default Log withFocus(String focus) {
    Objects.requireNonNull(focus);
    if (!this.focus().equals(focus)) {
      return new LogFocus(this, focus);
    } else {
      return this;
    }
  }

  boolean handles(Severity level);

  void publish(LogEvent event);

  default void log(Severity level, String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(level)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), level, message, detail, cause));
    }
  }

  default void log(Severity level, String message, @Nullable Object detail) {
    if (this.handles(level)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), level, message, detail, null));
    }
  }

  default void log(Severity level, String message, @Nullable Throwable cause) {
    if (this.handles(level)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), level, message, null, cause));
    }
  }

  default void log(Severity level, String message) {
    if (this.handles(level)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), level, message, null, null));
    }
  }

  default void logConfig(Severity level, String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(level)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), level, message, LogConfig.of(detail, level), cause));
    }
  }

  default void logConfig(Severity level, String message, @Nullable Object detail) {
    if (this.handles(level)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), level, message, LogConfig.of(detail, level), null));
    }
  }

  default void logEntity(Severity level, String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(level)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), level, message, LogEntity.of(detail, level), cause));
    }
  }

  default void logEntity(Severity level, String message, @Nullable Object detail) {
    if (this.handles(level)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), level, message, LogEntity.of(detail, level), null));
    }
  }

  default void logStatus(Severity level, String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(level)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), level, message, LogStatus.of(detail, level), cause));
    }
  }

  default void logStatus(Severity level, String message, @Nullable Object detail) {
    if (this.handles(level)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), level, message, LogStatus.of(detail, level), null));
    }
  }

  default void trace(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.TRACE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.TRACE, message, detail, cause));
    }
  }

  default void trace(String message, @Nullable Object detail) {
    if (this.handles(Severity.TRACE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.TRACE, message, detail, null));
    }
  }

  default void trace(String message, @Nullable Throwable cause) {
    if (this.handles(Severity.TRACE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.TRACE, message, null, cause));
    }
  }

  default void trace(String message) {
    if (this.handles(Severity.TRACE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.TRACE, message, null, null));
    }
  }

  default void traceConfig(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.TRACE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.TRACE, message, LogConfig.of(detail, Severity.TRACE), cause));
    }
  }

  default void traceConfig(String message, @Nullable Object detail) {
    if (this.handles(Severity.TRACE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.TRACE, message, LogConfig.of(detail, Severity.TRACE), null));
    }
  }

  default void traceEntity(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.TRACE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.TRACE, message, LogEntity.of(detail, Severity.TRACE), cause));
    }
  }

  default void traceEntity(String message, @Nullable Object detail) {
    if (this.handles(Severity.TRACE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.TRACE, message, LogEntity.of(detail, Severity.TRACE), null));
    }
  }

  default void traceStatus(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.TRACE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.TRACE, message, LogStatus.of(detail, Severity.TRACE), cause));
    }
  }

  default void traceStatus(String message, @Nullable Object detail) {
    if (this.handles(Severity.TRACE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.TRACE, message, LogStatus.of(detail, Severity.TRACE), null));
    }
  }

  default void debug(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.DEBUG)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.DEBUG, message, detail, cause));
    }
  }

  default void debug(String message, @Nullable Object detail) {
    if (this.handles(Severity.DEBUG)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.DEBUG, message, detail, null));
    }
  }

  default void debug(String message, @Nullable Throwable cause) {
    if (this.handles(Severity.DEBUG)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.DEBUG, message, null, cause));
    }
  }

  default void debug(String message) {
    if (this.handles(Severity.DEBUG)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.DEBUG, message, null, null));
    }
  }

  default void debugConfig(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.DEBUG)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.DEBUG, message, LogConfig.of(detail, Severity.DEBUG), cause));
    }
  }

  default void debugConfig(String message, @Nullable Object detail) {
    if (this.handles(Severity.DEBUG)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.DEBUG, message, LogConfig.of(detail, Severity.DEBUG), null));
    }
  }

  default void debugEntity(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.DEBUG)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.DEBUG, message, LogEntity.of(detail, Severity.DEBUG), cause));
    }
  }

  default void debugEntity(String message, @Nullable Object detail) {
    if (this.handles(Severity.DEBUG)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.DEBUG, message, LogEntity.of(detail, Severity.DEBUG), null));
    }
  }

  default void debugStatus(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.DEBUG)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.DEBUG, message, LogStatus.of(detail, Severity.DEBUG), cause));
    }
  }

  default void debugStatus(String message, @Nullable Object detail) {
    if (this.handles(Severity.DEBUG)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.DEBUG, message, LogStatus.of(detail, Severity.DEBUG), null));
    }
  }

  default void info(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.INFO)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.INFO, message, detail, cause));
    }
  }

  default void info(String message, @Nullable Object detail) {
    if (this.handles(Severity.INFO)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.INFO, message, detail, null));
    }
  }

  default void info(String message, @Nullable Throwable cause) {
    if (this.handles(Severity.INFO)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.INFO, message, null, cause));
    }
  }

  default void info(String message) {
    if (this.handles(Severity.INFO)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.INFO, message, null, null));
    }
  }

  default void infoConfig(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.INFO)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.INFO, message, LogConfig.of(detail, Severity.INFO), cause));
    }
  }

  default void infoConfig(String message, @Nullable Object detail) {
    if (this.handles(Severity.INFO)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.INFO, message, LogConfig.of(detail, Severity.INFO), null));
    }
  }

  default void infoEntity(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.INFO)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.INFO, message, LogEntity.of(detail, Severity.INFO), cause));
    }
  }

  default void infoEntity(String message, @Nullable Object detail) {
    if (this.handles(Severity.INFO)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.INFO, message, LogEntity.of(detail, Severity.INFO), null));
    }
  }

  default void infoStatus(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.INFO)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.INFO, message, LogStatus.of(detail, Severity.INFO), cause));
    }
  }

  default void infoStatus(String message, @Nullable Object detail) {
    if (this.handles(Severity.INFO)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.INFO, message, LogStatus.of(detail, Severity.INFO), null));
    }
  }

  default void notice(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.NOTICE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.NOTICE, message, detail, cause));
    }
  }

  default void notice(String message, @Nullable Object detail) {
    if (this.handles(Severity.NOTICE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.NOTICE, message, detail, null));
    }
  }

  default void notice(String message, @Nullable Throwable cause) {
    if (this.handles(Severity.NOTICE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.NOTICE, message, null, cause));
    }
  }

  default void notice(String message) {
    if (this.handles(Severity.NOTICE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.NOTICE, message, null, null));
    }
  }

  default void noticeConfig(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.NOTICE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.NOTICE, message, LogConfig.of(detail, Severity.NOTICE), cause));
    }
  }

  default void noticeConfig(String message, @Nullable Object detail) {
    if (this.handles(Severity.NOTICE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.NOTICE, message, LogConfig.of(detail, Severity.NOTICE), null));
    }
  }

  default void noticeEntity(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.NOTICE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.NOTICE, message, LogEntity.of(detail, Severity.NOTICE), cause));
    }
  }

  default void noticeEntity(String message, @Nullable Object detail) {
    if (this.handles(Severity.NOTICE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.NOTICE, message, LogEntity.of(detail, Severity.NOTICE), null));
    }
  }

  default void noticeStatus(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.NOTICE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.NOTICE, message, LogStatus.of(detail, Severity.NOTICE), cause));
    }
  }

  default void noticeStatus(String message, @Nullable Object detail) {
    if (this.handles(Severity.NOTICE)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.NOTICE, message, LogStatus.of(detail, Severity.NOTICE), null));
    }
  }

  default void warning(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.WARNING)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.WARNING, message, detail, cause));
    }
  }

  default void warning(String message, @Nullable Object detail) {
    if (this.handles(Severity.WARNING)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.WARNING, message, detail, null));
    }
  }

  default void warning(String message, @Nullable Throwable cause) {
    if (this.handles(Severity.WARNING)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.WARNING, message, null, cause));
    }
  }

  default void warning(String message) {
    if (this.handles(Severity.WARNING)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.WARNING, message, null, null));
    }
  }

  default void warningConfig(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.WARNING)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.WARNING, message, LogConfig.of(detail, Severity.WARNING), cause));
    }
  }

  default void warningConfig(String message, @Nullable Object detail) {
    if (this.handles(Severity.WARNING)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.WARNING, message, LogConfig.of(detail, Severity.WARNING), null));
    }
  }

  default void warningEntity(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.WARNING)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.WARNING, message, LogEntity.of(detail, Severity.WARNING), cause));
    }
  }

  default void warningEntity(String message, @Nullable Object detail) {
    if (this.handles(Severity.WARNING)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.WARNING, message, LogEntity.of(detail, Severity.WARNING), null));
    }
  }

  default void warningStatus(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.WARNING)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.WARNING, message, LogStatus.of(detail, Severity.WARNING), cause));
    }
  }

  default void warningStatus(String message, @Nullable Object detail) {
    if (this.handles(Severity.WARNING)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.WARNING, message, LogStatus.of(detail, Severity.WARNING), null));
    }
  }

  default void error(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.ERROR)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.ERROR, message, detail, cause));
    }
  }

  default void error(String message, @Nullable Object detail) {
    if (this.handles(Severity.ERROR)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.ERROR, message, detail, null));
    }
  }

  default void error(String message, @Nullable Throwable cause) {
    if (this.handles(Severity.ERROR)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.ERROR, message, null, cause));
    }
  }

  default void error(String message) {
    if (this.handles(Severity.ERROR)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.ERROR, message, null, null));
    }
  }

  default void errorConfig(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.ERROR)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.ERROR, message, LogConfig.of(detail, Severity.ERROR), cause));
    }
  }

  default void errorConfig(String message, @Nullable Object detail) {
    if (this.handles(Severity.ERROR)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.ERROR, message, LogConfig.of(detail, Severity.ERROR), null));
    }
  }

  default void errorEntity(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.ERROR)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.ERROR, message, LogEntity.of(detail, Severity.ERROR), cause));
    }
  }

  default void errorEntity(String message, @Nullable Object detail) {
    if (this.handles(Severity.ERROR)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.ERROR, message, LogEntity.of(detail, Severity.ERROR), null));
    }
  }

  default void errorStatus(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.ERROR)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.ERROR, message, LogStatus.of(detail, Severity.ERROR), cause));
    }
  }

  default void errorStatus(String message, @Nullable Object detail) {
    if (this.handles(Severity.ERROR)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.ERROR, message, LogStatus.of(detail, Severity.ERROR), null));
    }
  }

  default void fatal(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.FATAL)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.FATAL, message, detail, cause));
    }
  }

  default void fatal(String message, @Nullable Object detail) {
    if (this.handles(Severity.FATAL)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.FATAL, message, detail, null));
    }
  }

  default void fatal(String message, @Nullable Throwable cause) {
    if (this.handles(Severity.FATAL)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.FATAL, message, null, cause));
    }
  }

  default void fatal(String message) {
    if (this.handles(Severity.FATAL)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.FATAL, message, null, null));
    }
  }

  default void fatalConfig(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.FATAL)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.FATAL, message, LogConfig.of(detail, Severity.FATAL), cause));
    }
  }

  default void fatalConfig(String message, @Nullable Object detail) {
    if (this.handles(Severity.FATAL)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.FATAL, message, LogConfig.of(detail, Severity.FATAL), null));
    }
  }

  default void fatalEntity(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.FATAL)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.FATAL, message, LogEntity.of(detail, Severity.FATAL), cause));
    }
  }

  default void fatalEntity(String message, @Nullable Object detail) {
    if (this.handles(Severity.FATAL)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.FATAL, message, LogEntity.of(detail, Severity.FATAL), null));
    }
  }

  default void fatalStatus(String message, @Nullable Object detail, @Nullable Throwable cause) {
    if (this.handles(Severity.FATAL)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.FATAL, message, LogStatus.of(detail, Severity.FATAL), cause));
    }
  }

  default void fatalStatus(String message, @Nullable Object detail) {
    if (this.handles(Severity.FATAL)) {
      this.publish(LogEvent.of(this.topic(), this.focus(), LogScope.current(), Severity.FATAL, message, LogStatus.of(detail, Severity.FATAL), null));
    }
  }

  /**
   * Returns the logger for the given {@code topic}.
   */
  static Logger forTopic(String topic) {
    return Logger.root().getChild(topic);
  }

  @SuppressWarnings("UnnecessaryStringBuilder")
  static String uniqueId(@Nullable Object object) {
    final int hash = Murmur3.mash(System.identityHashCode(object));
    return new StringBuilder(4) // exact string length
        .append("0123456789ABCDEF".charAt(hash >>> 12 & 0xF))
        .append("0123456789ABCDEF".charAt(hash >>> 8 & 0xF))
        .append("0123456789ABCDEF".charAt(hash >>> 4 & 0xF))
        .append("0123456789ABCDEF".charAt(hash & 0xF))
        .toString();
  }

  @SuppressWarnings("UnnecessaryStringBuilder")
  static String uniqueFocus(@Nullable Object object) {
    final int hash = Murmur3.mash(System.identityHashCode(object));
    return new StringBuilder(5) // exact string length
        .append('%')
        .append("0123456789ABCDEF".charAt(hash >>> 12 & 0xF))
        .append("0123456789ABCDEF".charAt(hash >>> 8 & 0xF))
        .append("0123456789ABCDEF".charAt(hash >>> 4 & 0xF))
        .append("0123456789ABCDEF".charAt(hash & 0xF))
        .toString();
  }

}
