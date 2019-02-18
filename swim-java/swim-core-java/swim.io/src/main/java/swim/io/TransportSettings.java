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

package swim.io;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

/**
 * {@link Transport} configuration parameters.
 */
public class TransportSettings implements Debug {
  protected final int backlog;
  protected final long idleInterval;
  protected final long idleTimeout;

  public TransportSettings(int backlog, long idleInterval, long idleTimeout) {
    this.backlog = backlog;
    this.idleInterval = idleInterval;
    this.idleTimeout = idleTimeout;
  }

  /**
   * Returns the maximum length of the queue of incoming connections.
   */
  public final int backlog() {
    return this.backlog;
  }

  /**
   * Returns a copy of these {@code TransportSettings} configured with the
   * given {@code backlog} for the maximum length of the queue of incoming
   * connections.
   */
  public TransportSettings backlog(int backlog) {
    return copy(backlog, this.idleInterval, this.idleTimeout);
  }

  /**
   * Returns the number of milliseconds between transport idle checks.
   */
  public final long idleInterval() {
    return this.idleInterval;
  }

  /**
   * Returns a copy of these {@code TransportSettings} configured with the
   * given {@code idleInterval} for transport idle checks.
   */
  public TransportSettings idleInterval(long idleInterval) {
    return copy(this.backlog, idleInterval, this.idleTimeout);
  }

  /**
   * Returns the default number of idle milliseconds after which a transport
   * should be timed out due to inactivity.
   */
  public final long idleTimeout() {
    return this.idleTimeout;
  }

  /**
   * Returns a copy of these {@code TransportSettings} configured with the
   * given {@code idleTimeout} for transport idle timeouts
   */
  public TransportSettings idleTimeout(long idleTimeout) {
    return copy(this.backlog, this.idleInterval, idleTimeout);
  }

  /**
   * Returns a new {@code TransportSettings} instance with the given options.
   * Subclasses may override this method to ensure the proper class is
   * instantiated when updating settings.
   */
  protected TransportSettings copy(int backlog, long idleInterval, long idleTimeout) {
    return new TransportSettings(backlog, idleInterval, idleTimeout);
  }

  /**
   * Returns a structural {@code Value} representing these {@code
   * TransportSettings}.
   */
  public Value toValue() {
    return form().mold(this).toValue();
  }

  /**
   * Returns {@code true} if these {@code TransportSettings} can possibly equal
   * some {@code other} object.
   */
  public boolean canEqual(Object other) {
    return other instanceof TransportSettings;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof TransportSettings) {
      final TransportSettings that = (TransportSettings) other;
      return that.canEqual(this) && this.backlog == that.backlog
          && this.idleInterval == that.idleInterval
          && this.idleTimeout == that.idleTimeout;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(TransportSettings.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed, backlog),
        Murmur3.hash(this.idleInterval)), Murmur3.hash(this.idleTimeout)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("TransportSettings").write('.').write("standard").write('(').write(')')
        .write('.').write("backlog").write('(').debug(this.backlog).write(')')
        .write('.').write("idleInterval").write('(').debug(this.idleInterval).write(')')
        .write('.').write("idleTimeout").write('(').debug(this.idleTimeout).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static TransportSettings standard;

  private static Form<TransportSettings> form;

  /**
   * Returns the default {@code TransportSettings} instance.
   */
  public static TransportSettings standard() {
    if (standard == null) {
      int backlog;
      try {
        backlog = Integer.parseInt(System.getProperty("swim.transport.backlog"));
      } catch (NumberFormatException error) {
        backlog = 0;
      }

      long idleInterval;
      try {
        idleInterval = Long.parseLong(System.getProperty("swim.transport.idle.interval"));
      } catch (NumberFormatException error) {
        idleInterval = 30000L; // 30 seconds
      }

      long idleTimeout;
      try {
        idleTimeout = Long.parseLong(System.getProperty("swim.transport.idle.timeout"));
      } catch (NumberFormatException error) {
        idleTimeout = 90000L; // 90 seconds
      }

      standard = new TransportSettings(backlog, idleInterval, idleTimeout);
    }
    return standard;
  }

  /**
   * Returns the structural {@code Form} of {@code TransportSettings}.
   */
  @Kind
  public static Form<TransportSettings> form() {
    if (form == null) {
      form = new TransportSettingsForm();
    }
    return form;
  }
}

final class TransportSettingsForm extends Form<TransportSettings> {
  @Override
  public String tag() {
    return "transport";
  }

  @Override
  public TransportSettings unit() {
    return TransportSettings.standard();
  }

  @Override
  public Class<?> type() {
    return TransportSettings.class;
  }

  @Override
  public Item mold(TransportSettings settings) {
    if (settings != null) {
      final TransportSettings standard = TransportSettings.standard();
      final Record record = Record.create(4).attr(tag());
      if (settings.backlog != standard.backlog) {
        record.slot("backlog", settings.backlog);
      }
      if (settings.idleInterval != standard.idleInterval) {
        record.slot("idleInterval", settings.idleInterval);
      }
      if (settings.idleTimeout != standard.idleTimeout) {
        record.slot("idleTimeout", settings.idleTimeout);
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public TransportSettings cast(Item item) {
    final Value value = item.toValue();
    if (value.getAttr(tag()).isDefined()) {
      final TransportSettings standard = TransportSettings.standard();
      final int backlog = value.get("backlog").intValue(standard.backlog);
      final long idleInterval = value.get("idleInterval").longValue(standard.idleInterval);
      final long idleTimeout = value.get("idleTimeout").longValue(standard.idleTimeout);
      return new TransportSettings(backlog, idleInterval, idleTimeout);
    }
    return null;
  }
}
