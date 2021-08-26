// Copyright 2015-2021 Swim Inc.
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

package swim.io.mqtt;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.io.IpSettings;
import swim.io.TcpSettings;
import swim.io.TlsSettings;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

public class MqttSettings implements Debug {

  protected final IpSettings ipSettings;
  protected final int maxPayloadSize;

  public MqttSettings(IpSettings ipSettings, int maxPayloadSize) {
    this.ipSettings = ipSettings;
    this.maxPayloadSize = maxPayloadSize;
  }

  public final IpSettings ipSettings() {
    return this.ipSettings;
  }

  public MqttSettings ipSettings(IpSettings ipSettings) {
    return this.copy(ipSettings, this.maxPayloadSize);
  }

  public final TlsSettings tlsSettings() {
    return this.ipSettings.tlsSettings();
  }

  public MqttSettings tlsSettings(TlsSettings tlsSettings) {
    return this.ipSettings(this.ipSettings.tlsSettings(tlsSettings));
  }

  public final TcpSettings tcpSettings() {
    return this.ipSettings.tcpSettings();
  }

  public MqttSettings tcpSettings(TcpSettings tcpSettings) {
    return this.ipSettings(this.ipSettings.tcpSettings(tcpSettings));
  }

  public final int maxPayloadSize() {
    return this.maxPayloadSize;
  }

  public MqttSettings maxPayloadSize(int maxPayloadSize) {
    return this.copy(this.ipSettings, maxPayloadSize);
  }

  protected MqttSettings copy(IpSettings ipSettings, int maxPayloadSize) {
    return new MqttSettings(ipSettings, maxPayloadSize);
  }

  public Value toValue() {
    return MqttSettings.form().mold(this).toValue();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttSettings) {
      final MqttSettings that = (MqttSettings) other;
      return this.ipSettings.equals(that.ipSettings)
          && this.maxPayloadSize == that.maxPayloadSize;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (MqttSettings.hashSeed == 0) {
      MqttSettings.hashSeed = Murmur3.seed(MqttSettings.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(MqttSettings.hashSeed,
        this.ipSettings.hashCode()), this.maxPayloadSize));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MqttSettings").write('.').write("standard").write('(').write(')')
                   .write('.').write("ipSettings").write('(').debug(this.ipSettings).write(')')
                   .write('.').write("maxPayloadSize").write('(').debug(this.maxPayloadSize).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static MqttSettings standard;

  public static MqttSettings standard() {
    if (MqttSettings.standard == null) {
      int maxPayloadSize;
      try {
        maxPayloadSize = Integer.parseInt(System.getProperty("swim.mqtt.max.payload.size"));
      } catch (NumberFormatException error) {
        maxPayloadSize = 16 * 1024 * 1024;
      }

      MqttSettings.standard = new MqttSettings(IpSettings.standard(), maxPayloadSize);
    }
    return MqttSettings.standard;
  }

  public static MqttSettings create(IpSettings ipSettings) {
    return MqttSettings.standard().ipSettings(ipSettings);
  }

  private static Form<MqttSettings> form;

  @Kind
  public static Form<MqttSettings> form() {
    if (MqttSettings.form == null) {
      MqttSettings.form = new MqttSettingsForm();
    }
    return MqttSettings.form;
  }

}

final class MqttSettingsForm extends Form<MqttSettings> {

  @Override
  public MqttSettings unit() {
    return MqttSettings.standard();
  }

  @Override
  public Class<?> type() {
    return MqttSettings.class;
  }

  @Override
  public Item mold(MqttSettings settings) {
    if (settings != null) {
      final MqttSettings standard = MqttSettings.standard();
      final Record mqtt = Record.create(2).attr("mqtt");
      if (settings.maxPayloadSize != standard.maxPayloadSize) {
        mqtt.slot("maxPayloadSize", settings.maxPayloadSize);
      }
      return Record.of(mqtt).concat(IpSettings.form().mold(settings.ipSettings));
    } else {
      return Item.extant();
    }
  }

  @Override
  public MqttSettings cast(Item item) {
    final Value value = item.toValue();
    final MqttSettings standard = MqttSettings.standard();
    int maxPayloadSize = standard.maxPayloadSize;
    for (Item member : value) {
      if (member.getAttr("mqtt").isDefined()) {
        maxPayloadSize = member.get("maxPayloadSize").intValue(maxPayloadSize);
      }
    }
    final IpSettings ipSettings = IpSettings.form().cast(value);
    return new MqttSettings(ipSettings, maxPayloadSize);
  }

}
